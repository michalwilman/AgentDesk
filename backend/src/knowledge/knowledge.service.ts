import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class KnowledgeService {
  constructor(
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
  ) {}

  async addManualContent(botId: string, content: string, title?: string, metadata?: any) {
    const supabase = this.supabaseService.getClient();

    // Save content
    const { data: savedContent, error } = await supabase
      .from('scraped_content')
      .insert([
        {
          bot_id: botId,
          source_url: 'manual',
          content_type: 'text',
          title: title || 'Manual Entry',
          content,
          word_count: content.split(' ').length,
          metadata: metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add content: ${error.message}`);
    }

    // Generate embedding for the content
    try {
      await this.embeddingsService.generateEmbeddingsForContent(savedContent.id, botId);
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError);
      // Content is saved, but embedding failed - not critical
    }

    return savedContent;
  }

  async getKnowledgeBase(botId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('scraped_content')
      .select('id, source_url, content_type, title, content, word_count, created_at')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch knowledge base: ${error.message}`);
    }

    return data;
  }

  async deleteKnowledge(contentId: string, botId: string) {
    const supabase = this.supabaseService.getClient();

    // Delete embeddings first (cascade should handle this, but being explicit)
    await supabase
      .from('knowledge_embeddings')
      .delete()
      .eq('content_id', contentId)
      .eq('bot_id', botId);

    // Delete content
    const { error } = await supabase
      .from('scraped_content')
      .delete()
      .eq('id', contentId)
      .eq('bot_id', botId);

    if (error) {
      throw new Error(`Failed to delete knowledge: ${error.message}`);
    }

    return { message: 'Knowledge deleted successfully' };
  }

  async getKnowledgeStats(botId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: contentData } = await supabase
      .from('scraped_content')
      .select('id, word_count')
      .eq('bot_id', botId);

    const { data: embeddingsData } = await supabase
      .from('knowledge_embeddings')
      .select('id')
      .eq('bot_id', botId);

    return {
      totalChunks: contentData?.length || 0,
      totalWords: contentData?.reduce((sum, item) => sum + (item.word_count || 0), 0) || 0,
      totalEmbeddings: embeddingsData?.length || 0,
    };
  }
}

