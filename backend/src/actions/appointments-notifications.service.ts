import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AppointmentsNotificationsService {
  private readonly logger = new Logger(AppointmentsNotificationsService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all undismissed notifications for upcoming appointments
   */
  async getNotifications(userId: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Get undismissed notifications for upcoming appointments
      const { data, error } = await supabase
        .from('appointment_notifications')
        .select(
          `
          id,
          dismissed,
          created_at,
          appointments (
            id,
            scheduled_time,
            attendee_name,
            attendee_email,
            attendee_phone,
            lead_id,
            bot_id,
            bots (
              id,
              name
            )
          )
        `,
        )
        .eq('user_id', userId)
        .eq('dismissed', false)
        .gte('appointments.scheduled_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(
          `Error fetching notifications for user ${userId}:`,
          error,
        );
        throw error;
      }

      // Filter out notifications with null appointments (edge case)
      const validNotifications = (data || []).filter(
        (notification) => notification.appointments,
      );

      this.logger.log(
        `Found ${validNotifications.length} notifications for user ${userId}`,
      );

      return {
        notifications: validNotifications,
        count: validNotifications.length,
      };
    } catch (error) {
      this.logger.error('Error in getNotifications:', error);
      throw error;
    }
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId: string, userId: string) {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase
        .from('appointment_notifications')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error(
          `Error dismissing notification ${notificationId}:`,
          error,
        );
        throw error;
      }

      this.logger.log(
        `Notification ${notificationId} dismissed by user ${userId}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error in dismissNotification:', error);
      throw error;
    }
  }
}

