import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

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
      const { data: notifications, error: notifError } = await supabase
        .from('appointment_notifications')
        .select('id, dismissed, created_at, appointment_id')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false });

      if (notifError) {
        this.logger.error(
          `Error fetching notifications for user ${userId}:`,
          notifError,
        );
        throw notifError;
      }

      if (!notifications || notifications.length === 0) {
        return { notifications: [], count: 0 };
      }

      // Get appointment details separately
      const appointmentIds = notifications.map((n) => n.appointment_id);
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('id, scheduled_time, attendee_name, attendee_email, attendee_phone, lead_id, bot_id')
        .in('id', appointmentIds)
        .gte('scheduled_time', new Date().toISOString());

      if (apptError) {
        this.logger.error(`Error fetching appointments:`, apptError);
        throw apptError;
      }

      // Get bot details separately
      const botIds = [...new Set(appointments?.map((a) => a.bot_id) || [])];
      const { data: bots, error: botError } = await supabase
        .from('bots')
        .select('id, name')
        .in('id', botIds);

      if (botError) {
        this.logger.error(`Error fetching bots:`, botError);
        throw botError;
      }

      // Combine data
      const botsMap = new Map(bots?.map((b) => [b.id, b]) || []);
      const appointmentsMap = new Map(
        appointments?.map((a) => [
          a.id,
          {
            ...a,
            bots: botsMap.get(a.bot_id) || { id: a.bot_id, name: 'Unknown Bot' },
          },
        ]) || [],
      );

      const validNotifications = notifications
        .filter((n) => appointmentsMap.has(n.appointment_id))
        .map((n) => ({
          id: n.id,
          dismissed: n.dismissed,
          created_at: n.created_at,
          appointments: appointmentsMap.get(n.appointment_id),
        }));

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

