import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export interface PlanLimits {
  plan_name: string;
  max_bots: number;
  max_conversations: number;
  max_whatsapp_messages: number;
  email_notifications: boolean;
  google_calendar_sync: boolean;
  whatsapp_notifications: boolean;
  appointment_reminders: boolean;
  lead_collection: boolean;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  remove_branding: boolean;
  priority_support: boolean;
  webhook_integrations: boolean;
  custom_branding: boolean;
  bring_own_twilio: boolean;
  multiple_team_members: boolean;
  api_access: boolean;
  sla_guarantee: boolean;
}

export interface UsageStats {
  user_id: string;
  tracking_month: number;
  tracking_year: number;
  bots_created: number;
  conversations_used: number;
  whatsapp_messages_sent: number;
  sms_messages_sent: number;
}

@Injectable()
export class PlanGuardService {
  private readonly logger = new Logger(PlanGuardService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Check if user can perform an action based on their plan limits
   */
  async checkAction(
    userId: string,
    actionType: 'create_bot' | 'send_message' | 'send_whatsapp',
  ): Promise<PlanCheckResult> {
    try {
      const supabase = this.supabaseService.getClient();

      // Call the database function to check limits
      const { data, error } = await supabase.rpc('can_user_perform_action', {
        user_id_param: userId,
        action_type: actionType,
      });

      if (error) {
        this.logger.error(`Error checking plan limits: ${error.message}`);
        throw new ForbiddenException('Failed to verify plan limits');
      }

      return data as PlanCheckResult;
    } catch (error) {
      this.logger.error('Error in checkAction:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform action, throw exception if not allowed
   */
  async guardAction(
    userId: string,
    actionType: 'create_bot' | 'send_message' | 'send_whatsapp',
  ): Promise<void> {
    const result = await this.checkAction(userId, actionType);

    if (!result.allowed) {
      throw new ForbiddenException(
        result.reason || 'Action not allowed for your subscription plan',
      );
    }
  }

  /**
   * Get user's plan limits
   */
  async getPlanLimits(userId: string): Promise<PlanLimits | null> {
    try {
      const supabase = this.supabaseService.getClient();

      // Get user's subscription tier
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        this.logger.error(`Error fetching user: ${userError?.message}`);
        return null;
      }

      // Get plan limits
      const { data: limits, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_name', user.subscription_tier)
        .single();

      if (limitsError || !limits) {
        this.logger.error(`Error fetching plan limits: ${limitsError?.message}`);
        return null;
      }

      return limits as PlanLimits;
    } catch (error) {
      this.logger.error('Error in getPlanLimits:', error);
      return null;
    }
  }

  /**
   * Get user's current usage stats for current month
   */
  async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const supabase = this.supabaseService.getClient();

      const currentMonth = new Date().getMonth() + 1; // JS months are 0-indexed
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tracking_month', currentMonth)
        .eq('tracking_year', currentYear)
        .maybeSingle();

      if (error) {
        this.logger.error(`Error fetching usage stats: ${error.message}`);
        return null;
      }

      // Count ACTUAL total active bots (not just created this month)
      const { count: actualBotsCount, error: botsError } = await supabase
        .from('bots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (botsError) {
        this.logger.error(`Error counting bots: ${botsError.message}`);
      }

      // If no record exists, return zero usage (but with actual bots count)
      if (!data) {
        return {
          user_id: userId,
          tracking_month: currentMonth,
          tracking_year: currentYear,
          bots_created: actualBotsCount || 0,
          conversations_used: 0,
          whatsapp_messages_sent: 0,
          sms_messages_sent: 0,
        };
      }

      // Override bots_created with actual count
      return {
        ...data,
        bots_created: actualBotsCount || 0,
      } as UsageStats;
    } catch (error) {
      this.logger.error('Error in getUsageStats:', error);
      return null;
    }
  }

  /**
   * Increment conversation usage counter
   */
  async incrementConversationUsage(userId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.rpc('increment_conversation_usage', {
        user_id_param: userId,
      });

      if (error) {
        this.logger.error(`Error incrementing conversation usage: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('Error in incrementConversationUsage:', error);
    }
  }

  /**
   * Increment WhatsApp usage counter
   */
  async incrementWhatsAppUsage(userId: string, count: number = 1): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.rpc('increment_whatsapp_usage', {
        user_id_param: userId,
        count_param: count,
      });

      if (error) {
        this.logger.error(`Error incrementing WhatsApp usage: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('Error in incrementWhatsAppUsage:', error);
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeature(userId: string, feature: keyof PlanLimits): Promise<boolean> {
    const limits = await this.getPlanLimits(userId);
    if (!limits) return false;
    return limits[feature] === true;
  }

  /**
   * Get user's plan name
   */
  async getUserPlan(userId: string): Promise<string | null> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (error || !data) {
        this.logger.error(`Error fetching user plan: ${error?.message}`);
        return null;
      }

      return data.subscription_tier;
    } catch (error) {
      this.logger.error('Error in getUserPlan:', error);
      return null;
    }
  }
}

