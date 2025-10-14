import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class EmbeddingsService {
  private openai: OpenAI;
  private embeddingModel: string;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({ apiKey });
    this.embeddingModel = this.configService.get<string>(
      'OPENAI_EMBEDDING_MODEL',
      'text-embedding-3-small',
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async generateEmbeddingsForContent(contentId: string, botId: string) {
    const supabase = this.supabaseService.getClient();

    // Get the scraped content
    const { data: content, error: contentError } = await supabase
      .from('scraped_content')
      .select('*')
      .eq('id', contentId)
      .eq('bot_id', botId)
      .single();

    if (contentError || !content) {
      throw new Error('Content not found');
    }

    // Generate embedding
    const embedding = await this.generateEmbedding(content.content);

    // Save embedding
    const { data, error } = await supabase
      .from('knowledge_embeddings')
      .insert([
        {
          bot_id: botId,
          content_id: contentId,
          content_text: content.content,
          embedding: embedding,
          metadata: {
            source_url: content.source_url,
            chunk_index: content.chunk_index,
          },
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save embedding: ${error.message}`);
    }

    return data;
  }

  async generateEmbeddingsForBot(botId: string) {
    const supabase = this.supabaseService.getClient();

    // Get all scraped content for this bot that doesn't have embeddings yet
    const { data: contents, error: contentsError } = await supabase
      .from('scraped_content')
      .select('id')
      .eq('bot_id', botId);

    if (contentsError) {
      throw new Error(`Failed to fetch content: ${contentsError.message}`);
    }

    // Check which content already has embeddings
    const { data: existingEmbeddings, error: embeddingsError } = await supabase
      .from('knowledge_embeddings')
      .select('content_id')
      .eq('bot_id', botId);

    if (embeddingsError) {
      throw new Error(`Failed to fetch embeddings: ${embeddingsError.message}`);
    }

    const existingContentIds = new Set(existingEmbeddings?.map((e) => e.content_id) || []);
    const contentToProcess = contents?.filter((c) => !existingContentIds.has(c.id)) || [];

    const results = [];

    for (const content of contentToProcess) {
      try {
        const embedding = await this.generateEmbeddingsForContent(content.id, botId);
        results.push(embedding);
      } catch (error) {
        console.error(`Failed to generate embedding for content ${content.id}:`, error.message);
      }
    }

    // Update bot status
    await supabase
      .from('bots')
      .update({ is_trained: true })
      .eq('id', botId);

    return {
      message: 'Embeddings generated successfully',
      count: results.length,
      data: results,
    };
  }

  async searchSimilarContent(
    query: string,
    botId: string,
    matchThreshold: number = 0.7,
    matchCount: number = 5,
  ) {
    const supabase = this.supabaseService.getClient();

    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);

    // Search for similar content using the database function
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      bot_uuid: botId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      throw new Error(`Failed to search knowledge: ${error.message}`);
    }

    return data || [];
  }

  async getEmbeddings(botId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('knowledge_embeddings')
      .select('id, content_text, metadata, created_at')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch embeddings: ${error.message}`);
    }

    return data;
  }
}

