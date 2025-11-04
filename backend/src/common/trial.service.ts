import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface TrialStatus {
  is_trial: boolean;
  status: 'active' | 'expired';
  trial_start?: string;
  trial_end?: string;
  days_remaining?: number;
  hours_remaining?: number;
  payment_method_added?: boolean;
  reminder_sent?: boolean;
  message?: string;
  plan?: string;
}

interface UserNeedingReminder {
  user_id: string;
  email: string;
  trial_end_date: string;
  days_remaining: number;
  subscription_tier: string;
  bots_created: number;
  conversations_used: number;
  whatsapp_messages_sent: number;
}

@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Check if user's trial has expired
   */
  async checkTrialStatus(userId: string): Promise<TrialStatus | null> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('check_trial_expired', {
        user_id_param: userId,
      });

      if (error) {
        this.logger.error(`Error checking trial status: ${error.message}`);
        return null;
      }

      return data as TrialStatus;
    } catch (error) {
      this.logger.error('Error checking trial status:', error);
      return null;
    }
  }

  /**
   * Get users needing trial reminder (runs daily)
   */
  async getUsersNeedingReminder(): Promise<UserNeedingReminder[]> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('get_users_needing_trial_reminder');

      if (error) {
        this.logger.error(`Error getting users needing reminder: ${error.message}`);
        return [];
      }

      return data as UserNeedingReminder[];
    } catch (error) {
      this.logger.error('Error getting users needing reminder:', error);
      return [];
    }
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(userId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.rpc('mark_trial_reminder_sent', {
        user_id_param: userId,
      });

      if (error) {
        this.logger.error(`Error marking reminder sent: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('Error marking reminder sent:', error);
    }
  }

  /**
   * Convert trial to paid subscription
   */
  async convertToPaid(
    userId: string,
    newTier: string,
    paymentMethodId?: string,
  ): Promise<{ success: boolean; message: string; new_tier?: string }> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('convert_trial_to_paid', {
        user_id_param: userId,
        new_tier: newTier,
        payment_method_id: paymentMethodId || null,
      });

      if (error) {
        this.logger.error(`Error converting to paid: ${error.message}`);
        return { success: false, message: error.message };
      }

      return data as { success: boolean; message: string; new_tier: string };
    } catch (error) {
      this.logger.error('Error converting to paid:', error);
      return { success: false, message: 'Failed to convert trial to paid' };
    }
  }

  /**
   * Get recommended plan based on usage
   */
  getRecommendedPlan(user: UserNeedingReminder): {
    recommended_plan: string;
    reason: string;
    savings?: string;
  } {
    const { bots_created, conversations_used, whatsapp_messages_sent } = user;

    // Heavy user → Plus Plan
    if (bots_created > 3 || conversations_used > 250 || whatsapp_messages_sent > 500) {
      return {
        recommended_plan: 'plus',
        reason: 'Based on your high usage, the Plus Plan offers unlimited bots, conversations, and WhatsApp messages.',
        savings: 'Save time and money with unlimited access!',
      };
    }

    // Medium user → Growth Plan
    if (bots_created > 1 || conversations_used > 100 || whatsapp_messages_sent > 100) {
      return {
        recommended_plan: 'growth',
        reason: 'Based on your usage, the Growth Plan is perfect for you with 3 bots, 250 conversations, and unlimited WhatsApp.',
        savings: 'Only $49.17/mo - great value for growing businesses!',
      };
    }

    // Light user → Starter Plan
    return {
      recommended_plan: 'starter',
      reason: 'Based on your current usage, the Starter Plan is a great fit with 1 bot, 100 conversations, and 500 WhatsApp messages.',
      savings: 'Just $24.17/mo - perfect for getting started!',
    };
  }

  /**
   * Cron job: Send trial reminder emails daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendTrialReminders() {
    this.logger.log('🔔 Running trial reminder cron job...');

    try {
      const users = await this.getUsersNeedingReminder();

      if (users.length === 0) {
        this.logger.log('✅ No users need trial reminders today');
        return;
      }

      this.logger.log(`📧 Found ${users.length} users needing trial reminders`);

      for (const user of users) {
        try {
          const recommendation = this.getRecommendedPlan(user);

          // TODO: Send email using email service
          this.logger.log(
            `📨 Would send reminder to ${user.email} - ${user.days_remaining} days remaining`,
          );
          this.logger.log(`   Recommended plan: ${recommendation.recommended_plan}`);
          this.logger.log(`   Reason: ${recommendation.reason}`);

          // Mark as sent
          await this.markReminderSent(user.user_id);

          this.logger.log(`✅ Marked reminder sent for ${user.email}`);
        } catch (error) {
          this.logger.error(`❌ Error sending reminder to ${user.email}:`, error);
        }
      }

      this.logger.log('🎉 Trial reminder cron job completed');
    } catch (error) {
      this.logger.error('❌ Error in trial reminder cron job:', error);
    }
  }

  /**
   * Generate trial reminder email HTML
   */
  generateReminderEmail(user: UserNeedingReminder): {
    subject: string;
    html: string;
  } {
    const recommendation = this.getRecommendedPlan(user);
    const planNames = {
      starter: 'Starter',
      growth: 'Growth',
      plus: 'Plus',
      premium: 'Premium',
    };
    const planPrices = {
      starter: '$24.17/mo',
      growth: '$49.17/mo',
      plus: '$749/mo',
      premium: 'Custom',
    };

    const subject = `⏰ Your AgentDesk Trial Ends in ${user.days_remaining} Days`;

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #00d9ff; font-size: 32px; margin: 0;">⏰ זמן הניסיון שלך עומד להסתיים</h1>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #00d9ff33;">
            <p style="font-size: 18px; line-height: 1.6; color: #e0e0e0;">
                שלום! 👋
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                תקופת הניסיון החינמית שלך ב-AgentDesk עומדת להסתיים בעוד <strong style="color: #00d9ff;">${user.days_remaining} ימים</strong>.
            </p>
            
            <!-- Usage Summary -->
            <div style="background-color: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-right: 4px solid #00d9ff;">
                <h3 style="color: #00d9ff; margin-top: 0;">📊 השימוש שלך החודש:</h3>
                <ul style="list-style: none; padding: 0; margin: 10px 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #333;">🤖 בוטים שנוצרו: <strong>${user.bots_created}</strong></li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #333;">💬 שיחות AI: <strong>${user.conversations_used}</strong></li>
                    <li style="padding: 8px 0;">📱 הודעות WhatsApp: <strong>${user.whatsapp_messages_sent}</strong></li>
                </ul>
            </div>

            <!-- Recommendation -->
            <div style="background: linear-gradient(135deg, #00d9ff22 0%, #00d9ff11 100%); border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #00d9ff;">
                <h3 style="color: #00d9ff; margin-top: 0;">💡 התוכנית המומלצת עבורך:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 10px 0;">
                    ${planNames[recommendation.recommended_plan]} Plan
                </p>
                <p style="font-size: 18px; color: #00d9ff; margin: 10px 0;">
                    ${planPrices[recommendation.recommended_plan]}
                </p>
                <p style="font-size: 14px; color: #b0b0b0; line-height: 1.6;">
                    ${recommendation.reason}
                </p>
                ${recommendation.savings ? `<p style="font-size: 14px; color: #00ff88; margin-top: 10px;">✨ ${recommendation.savings}</p>` : ''}
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://agentdesk.co.il/pricing" style="display: inline-block; background: linear-gradient(135deg, #00d9ff 0%, #00a8cc 100%); color: #000000; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
                    🚀 שדרגו עכשיו והמשיכו ליהנות!
                </a>
            </div>

            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
                לאחר סיום תקופת הניסיון, לא תוכלו להמשיך להשתמש ב-AgentDesk ללא מנוי פעיל.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #333;">
            <p>💙 תודה שאתם חלק מ-AgentDesk!</p>
            <p>יש שאלות? צרו איתנו קשר: <a href="mailto:support@agentdesk.co.il" style="color: #00d9ff; text-decoration: none;">support@agentdesk.co.il</a></p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
  }
}

