import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../common/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async createChat(botId: string, sessionId: string, visitorMetadata?: any) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          bot_id: botId,
          session_id: sessionId,
          visitor_metadata: visitorMetadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }

    return data;
  }

  async getChatBySession(botId: string, sessionId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('bot_id', botId)
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to fetch chat: ${error.message}`);
    }

    return data;
  }

  async saveMessage(chatId: string, role: 'user' | 'assistant', content: string, contextUsed?: string[], tokensUsed?: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          role,
          content,
          context_used: contextUsed || [],
          tokens_used: tokensUsed,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    // Update message count
    await supabase.rpc('increment', {
      table_name: 'chats',
      row_id: chatId,
      column_name: 'message_count',
    });

    return data;
  }

  async getConversationHistory(chatId: string, limit: number = 10) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch conversation history: ${error.message}`);
    }

    return data || [];
  }

  async getResponse(
    botId: string,
    sessionId: string,
    userMessage: string,
    visitorMetadata?: any,
  ) {
    const supabase = this.supabaseService.getClient();

    // Get bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('is_active', true)
      .single();

    if (botError || !bot) {
      throw new BadRequestException('Bot not found or inactive');
    }

    // Get or create chat
    let chat = await this.getChatBySession(botId, sessionId);
    if (!chat) {
      chat = await this.createChat(botId, sessionId, visitorMetadata);
    }

    // Get conversation history
    const history = await this.getConversationHistory(chat.id);

    // Save user message
    await this.saveMessage(chat.id, 'user', userMessage);

    // Search for relevant context using RAG
    // Lower threshold for better recall (0.1 = more results, 0.7 = only very similar)
    const context = await this.embeddingsService.searchSimilarContent(
      userMessage,
      botId,
      0.1, // Lowered to 0.1 to catch more potential matches
      5,
    );

    const contextText = context
      .map((c) => c.content_text)
      .join('\n\n');

    // Debug: Log retrieved context for monitoring
    console.log(`📚 Retrieved ${context.length} context chunks for query: "${userMessage.substring(0, 50)}..."`);
    if (context.length > 0) {
      console.log(`✅ Context preview: ${contextText.substring(0, 200)}...`);
    } else {
      console.log('⚠️  No relevant context found in knowledge base');
    }

    // Build conversation messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(bot, contextText),
      },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Get response from OpenAI
    const completion = await this.openai.chat.completions.create({
      model: bot.model || 'gpt-4o-mini',
      messages,
      temperature: bot.temperature || 0.7,
      max_tokens: bot.max_tokens || 500,
    });

    const assistantMessage = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Save assistant message
    await this.saveMessage(
      chat.id,
      'assistant',
      assistantMessage,
      context.map((c) => c.id),
      tokensUsed,
    );

    return {
      message: assistantMessage,
      chatId: chat.id,
      sessionId: chat.session_id,
      tokensUsed,
    };
  }

  private buildSystemPrompt(bot: any, context: string): string {
    const basePrompt = `You are ${bot.name}, an AI assistant for a business.
Your personality: ${bot.personality || 'helpful and professional'}
Language: ${bot.language === 'he' ? 'Hebrew' : 'English'}

${context ? `Here is relevant information from the knowledge base to help answer questions:\n\n${context}\n\n` : ''}

Instructions:
- Answer questions based on the provided context when available
- If you don't know the answer based on the context, say so politely
- Be helpful, friendly, and maintain the specified personality
- Keep responses concise and relevant
- Respond in ${bot.language === 'he' ? 'Hebrew' : 'English'}`;

    return basePrompt;
  }

  async getChatHistory(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new BadRequestException('Bot not found or access denied');
    }

    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (
          role,
          content,
          created_at
        )
      `)
      .eq('bot_id', botId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return data;
  }
}

