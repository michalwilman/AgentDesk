import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { PlanGuardService } from '../common/plan-guard.service';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';

@Injectable()
export class BotsService {
  constructor(
    private supabaseService: SupabaseService,
    private planGuardService: PlanGuardService,
  ) {}

  async create(userId: string, createBotDto: CreateBotDto) {
    const supabase = this.supabaseService.getClient();

    // Check plan limits before creating bot
    await this.planGuardService.guardAction(userId, 'create_bot');

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

  async updateWordPressConnection(
    apiToken: string,
    connectionData: {
      site_url: string;
      plugin_version: string;
      wp_version?: string;
      is_active: boolean;
    },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bots')
      .update({
        wordpress_connected: connectionData.is_active,
        wordpress_site_url: connectionData.site_url,
        wordpress_plugin_version: connectionData.plugin_version,
        wordpress_last_activity: new Date().toISOString(),
      })
      .eq('api_token', apiToken)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update WordPress connection');
    }

    return data;
  }
}

