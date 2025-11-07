import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase.service';

export interface UsageLimitCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  percentage: number;
  planType: string;
}

export interface MonthlyUsage {
  sms_sent: number;
  whatsapp_sent: number;
  email_sent: number;
  sms_limit: number | null;
  whatsapp_limit: number | null;
  email_limit: number | null;
}

@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Check if user has remaining quota for a specific message type
   */
  async checkUsageLimit(
    userId: string,
    botId: string,
    messageType: 'sms' | 'whatsapp' | 'email',
  ): Promise<UsageLimitCheck> {
    try {
      const supabase = this.supabaseService.getClient();

      // Get user's plan type
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        this.logger.error(`Failed to fetch user plan: ${userError?.message}`);
        throw new Error('User not found');
      }

      const planType = user.plan_type || 'starter';

      // Get plan limits
      const { data: planLimits, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_type', planType)
        .single();

      if (limitsError || !planLimits) {
        this.logger.error(`Failed to fetch plan limits: ${limitsError?.message}`);
        // Default to no limit if plan limits not found
        return {
          allowed: true,
          current: 0,
          limit: null,
          percentage: 0,
          planType,
        };
      }

      // Get current month's usage
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of month
      currentMonth.setHours(0, 0, 0, 0);

      const { data: usage, error: usageError } = await supabase
        .from('monthly_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('bot_id', botId)
        .eq('month', currentMonth.toISOString().split('T')[0])
        .single();

      // Determine limit and current usage based on message type
      let limit: number | null = null;
      let current = 0;

      switch (messageType) {
        case 'sms':
          limit = planLimits.sms_monthly_limit;
          current = usage?.sms_sent || 0;
          break;
        case 'whatsapp':
          limit = planLimits.whatsapp_monthly_limit;
          current = usage?.whatsapp_sent || 0;
          break;
        case 'email':
          limit = planLimits.email_monthly_limit;
          current = usage?.email_sent || 0;
          break;
      }

      // NULL limit means unlimited
      if (limit === null) {
        return {
          allowed: true,
          current,
          limit: null,
          percentage: 0,
          planType,
        };
      }

      // Check if limit exceeded
      const allowed = current < limit;
      const percentage = limit > 0 ? (current / limit) * 100 : 0;

      this.logger.log(
        `Usage check for ${userId} (${planType}): ${messageType} ${current}/${limit} (${percentage.toFixed(1)}%)`,
      );

      return {
        allowed,
        current,
        limit,
        percentage,
        planType,
      };
    } catch (error) {
      this.logger.error(`Error checking usage limit: ${error.message}`, error.stack);
      // Fail open - allow sending if check fails to avoid service disruption
      return {
        allowed: true,
        current: 0,
        limit: null,
        percentage: 0,
        planType: 'unknown',
      };
    }
  }

  /**
   * Increment usage counter and log the message
   */
  async incrementUsage(
    userId: string,
    botId: string,
    messageType: 'sms' | 'whatsapp' | 'email',
    recipient: string,
    status: 'sent' | 'failed' | 'pending',
    twilioSid?: string,
    errorMessage?: string,
    costEstimate?: number,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      // Log the message
      const { error: logError } = await supabase.from('message_logs').insert([
        {
          user_id: userId,
          bot_id: botId,
          message_type: messageType,
          recipient,
          status,
          twilio_sid: twilioSid,
          error_message: errorMessage,
          cost_estimate: costEstimate,
          sent_at: new Date().toISOString(),
        },
      ]);

      if (logError) {
        this.logger.error(`Failed to log message: ${logError.message}`);
      }

      // Only increment counter if message was actually sent (not failed)
      if (status === 'sent') {
        await this.incrementMonthlyUsage(userId, botId, messageType);
      }

      this.logger.log(
        `Logged ${messageType} message to ${recipient}: ${status} (SID: ${twilioSid || 'N/A'})`,
      );
    } catch (error) {
      this.logger.error(`Error incrementing usage: ${error.message}`, error.stack);
      // Don't throw - logging failures shouldn't block message sending
    }
  }

  /**
   * Increment monthly usage counter (upsert)
   */
  private async incrementMonthlyUsage(
    userId: string,
    botId: string,
    messageType: 'sms' | 'whatsapp' | 'email',
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthKey = currentMonth.toISOString().split('T')[0];

    // Get plan limits for this user
    const { data: user } = await supabase
      .from('users')
      .select('plan_type')
      .eq('id', userId)
      .single();

    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('sms_monthly_limit, whatsapp_monthly_limit, email_monthly_limit')
      .eq('plan_type', user?.plan_type || 'starter')
      .single();

    // Try to fetch existing record
    const { data: existing } = await supabase
      .from('monthly_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('bot_id', botId)
      .eq('month', monthKey)
      .single();

    if (existing) {
      // Update existing record
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      switch (messageType) {
        case 'sms':
          updates.sms_sent = (existing.sms_sent || 0) + 1;
          break;
        case 'whatsapp':
          updates.whatsapp_sent = (existing.whatsapp_sent || 0) + 1;
          break;
        case 'email':
          updates.email_sent = (existing.email_sent || 0) + 1;
          break;
      }

      await supabase
        .from('monthly_usage')
        .update(updates)
        .eq('id', existing.id);
    } else {
      // Create new record
      const newRecord: any = {
        user_id: userId,
        bot_id: botId,
        month: monthKey,
        sms_sent: 0,
        whatsapp_sent: 0,
        email_sent: 0,
        sms_limit: planLimits?.sms_monthly_limit,
        whatsapp_limit: planLimits?.whatsapp_monthly_limit,
      };

      switch (messageType) {
        case 'sms':
          newRecord.sms_sent = 1;
          break;
        case 'whatsapp':
          newRecord.whatsapp_sent = 1;
          break;
        case 'email':
          newRecord.email_sent = 1;
          break;
      }

      await supabase.from('monthly_usage').insert([newRecord]);
    }
  }

  /**
   * Get monthly usage for a user/bot
   */
  async getMonthlyUsage(
    userId: string,
    botId: string,
    month?: Date,
  ): Promise<MonthlyUsage> {
    const supabase = this.supabaseService.getClient();

    const targetMonth = month || new Date();
    targetMonth.setDate(1);
    targetMonth.setHours(0, 0, 0, 0);
    const monthKey = targetMonth.toISOString().split('T')[0];

    const { data: usage } = await supabase
      .from('monthly_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('bot_id', botId)
      .eq('month', monthKey)
      .single();

    return {
      sms_sent: usage?.sms_sent || 0,
      whatsapp_sent: usage?.whatsapp_sent || 0,
      email_sent: usage?.email_sent || 0,
      sms_limit: usage?.sms_limit || null,
      whatsapp_limit: usage?.whatsapp_limit || null,
      email_limit: null,
    };
  }

  /**
   * Get usage statistics for admin dashboard
   */
  async getUsageStats(month?: string, planType?: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('monthly_usage')
      .select(
        `
        *,
        users!inner(email, full_name, plan_type),
        bots!inner(name)
      `,
      );

    if (month) {
      query = query.eq('month', month);
    }

    if (planType) {
      query = query.eq('users.plan_type', planType);
    }

    const { data: usageData, error } = await query;

    if (error) {
      this.logger.error(`Failed to fetch usage stats: ${error.message}`);
      return [];
    }

    return usageData;
  }
}

