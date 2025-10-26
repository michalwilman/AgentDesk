import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';

@Injectable()
export class BotsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, createBotDto: CreateBotDto) {
    const supabase = this.supabaseService.getClient();

    // Check if user already has a bot
    await this.checkBotLimit(userId);

    const { data, error } = await supabase
      .from('bots')
      .insert([
        {
          user_id: userId,
          ...createBotDto,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bot: ${error.message}`);
    }

    return data;
  }

  async checkBotLimit(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to check bot limit: ${error.message}`);
    }

    if (data && data.length >= 1) {
      throw new Error(
        'You can only create one bot per account. Please delete your existing bot to create a new one.',
      );
    }
  }

  async findAll(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bots: ${error.message}`);
    }

    return data;
  }

  async findOne(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Bot not found');
    }

    return data;
  }

  async findByApiToken(apiToken: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('api_token', apiToken)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundException('Bot not found or inactive');
    }

    return data;
  }

  async update(botId: string, userId: string, updateBotDto: UpdateBotDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .update(updateBotDto)
      .eq('id', botId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Bot not found or update failed');
    }

    return data;
  }

  async delete(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', botId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete bot: ${error.message}`);
    }

    return { message: 'Bot deleted successfully' };
  }

  async getBotAnalytics(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // First verify bot ownership
    await this.findOne(botId, userId);

    const { data, error } = await supabase
      .from('bot_analytics')
      .select('*')
      .eq('bot_id', botId)
      .single();

    if (error) {
      // If no analytics yet, return empty data
      return {
        total_chats: 0,
        total_messages: 0,
        avg_satisfaction: null,
        total_content_chunks: 0,
        total_embeddings: 0,
      };
    }

    return data;
  }

  async hasKnowledge(botId: string, userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership first
    await this.findOne(botId, userId);

    // Check if there are any embeddings for this bot
    const { data, error } = await supabase
      .from('knowledge_embeddings')
      .select('id')
      .eq('bot_id', botId)
      .limit(1);

    if (error) {
      console.error(`Failed to check knowledge: ${error.message}`);
      return false;
    }

    return data && data.length > 0;
  }
}

