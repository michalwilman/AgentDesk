import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from './supabase.service';

/**
 * User Deletion Service
 * 
 * Handles automatic user deletion in stages:
 * 1. Soft delete: 3 days after trial expiry
 * 2. Permanent delete: 30 days after soft delete
 */
@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Mark expired trial users for deletion
   * Runs daily at 2:00 AM
   * 
   * Users are marked for deletion 3 days after their trial expires
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async markExpiredUsersForDeletion() {
    this.logger.log('Running: Mark expired users for deletion');

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('mark_expired_users_for_deletion');

      if (error) {
        this.logger.error('Error marking users for deletion:', error);
        return;
      }

      if (data && data.length > 0) {
        this.logger.log(`✅ Marked ${data.length} users for deletion`);
        data.forEach((user: any) => {
          this.logger.log(
            `  - ${user.email} (trial expired: ${user.trial_expired_date})`,
          );
        });
      } else {
        this.logger.log('No users to mark for deletion');
      }
    } catch (error) {
      this.logger.error('Error in markExpiredUsersForDeletion:', error);
    }
  }

  /**
   * Permanently delete users
   * Runs daily at 3:00 AM
   * 
   * Users are permanently deleted 30 days after soft delete
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async permanentlyDeleteUsers() {
    this.logger.log('Running: Permanently delete users');

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('permanently_delete_users');

      if (error) {
        this.logger.error('Error permanently deleting users:', error);
        return;
      }

      if (data && data.length > 0) {
        this.logger.log(`✅ Permanently deleted ${data.length} users`);
        data.forEach((user: any) => {
          this.logger.log(
            `  - ${user.deleted_email} (deleted: ${user.deletion_date})`,
          );
        });
      } else {
        this.logger.log('No users to permanently delete');
      }
    } catch (error) {
      this.logger.error('Error in permanentlyDeleteUsers:', error);
    }
  }

  /**
   * Log users pending deletion (for monitoring)
   * Runs daily at 9:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async logUsersPendingDeletion() {
    this.logger.log('Checking users pending deletion...');

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('get_users_pending_deletion');

      if (error) {
        this.logger.error('Error getting pending deletions:', error);
        return;
      }

      if (data && data.length > 0) {
        this.logger.warn(`⚠️  ${data.length} users pending deletion:`);
        data.forEach((user: any) => {
          this.logger.warn(
            `  - ${user.email} (${user.days_until_permanent_deletion} days remaining)`,
          );
        });
      } else {
        this.logger.log('No users pending deletion');
      }
    } catch (error) {
      this.logger.error('Error in logUsersPendingDeletion:', error);
    }
  }

  /**
   * Sync bot status with user subscriptions
   * Runs daily at 1:00 AM
   * 
   * Sets bots to inactive if their owner's subscription is expired
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncBotStatusWithSubscriptions() {
    this.logger.log('Running: Sync bot status with subscriptions');

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.rpc('sync_bot_status_with_user_subscription');

      if (error) {
        this.logger.error('Error syncing bot status:', error);
        return;
      }

      if (data && data.length > 0) {
        this.logger.log(`✅ Synced ${data.length} bots with subscription status`);
        data.forEach((bot: any) => {
          this.logger.log(
            `  - ${bot.bot_name} (${bot.user_email}): ${bot.old_status ? 'Active' : 'Inactive'} → ${bot.new_status ? 'Active' : 'Inactive'} (${bot.reason})`,
          );
        });
      } else {
        this.logger.log('All bots are already in sync with user subscriptions');
      }
    } catch (error) {
      this.logger.error('Error in syncBotStatusWithSubscriptions:', error);
    }
  }

  /**
   * Manually mark a user for deletion
   * Can be called from admin panel
   */
  async markUserForDeletion(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to mark user for deletion: ${error.message}`);
    }

    this.logger.log(`User ${userId} marked for deletion`);
  }

  /**
   * Restore a soft-deleted user
   * Can be called from admin panel
   */
  async restoreUser(userEmail: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('restore_deleted_user', {
      user_email: userEmail,
    });

    if (error) {
      throw new Error(`Failed to restore user: ${error.message}`);
    }

    this.logger.log(`User ${userEmail} restored successfully`);
    return data;
  }
}

