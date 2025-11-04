import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase.service';
import { TwilioService } from './twilio.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private supabaseService: SupabaseService,
    private twilioService: TwilioService,
  ) {}

  /**
   * Cron job that runs every day at 08:00 AM
   * Checks for appointments in the next 24 hours and sends reminders
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReminders() {
    this.logger.log('🔔 Starting daily reminder check...');

    try {
      const supabase = this.supabaseService.getClient();

      // Calculate time window: 24 hours from now (±1 hour buffer)
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const startWindow = new Date(tomorrow.getTime() - 60 * 60 * 1000); // 23 hours from now
      const endWindow = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 25 hours from now

      this.logger.log(`📅 Checking appointments between ${startWindow.toISOString()} and ${endWindow.toISOString()}`);

      // Get all confirmed appointments in the next 24 hours that haven't received a reminder
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id, bot_id, scheduled_time, duration_minutes, attendee_name, attendee_phone, bots(name)')
        .eq('status', 'confirmed')
        .eq('reminder_sent', false)
        .gte('scheduled_time', startWindow.toISOString())
        .lte('scheduled_time', endWindow.toISOString());

      if (error) {
        this.logger.error('❌ Error fetching appointments:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        this.logger.log('✅ No appointments need reminders');
        return;
      }

      this.logger.log(`📋 Found ${appointments.length} appointment(s) needing reminders`);

      // Process each appointment
      for (const appointment of appointments) {
        await this.sendReminderForAppointment(appointment);
      }

      this.logger.log('✅ Daily reminder check completed');
    } catch (error) {
      this.logger.error('❌ Error in daily reminder check:', error);
    }
  }

  /**
   * Send reminder for a specific appointment
   */
  async sendReminderForAppointment(appointment: any) {
    try {
      const supabase = this.supabaseService.getClient();

      // Get bot configuration
      const { data: config, error: configError } = await supabase
        .from('bot_actions_config')
        .select('*')
        .eq('bot_id', appointment.bot_id)
        .single();

      if (configError || !config) {
        this.logger.warn(`⚠️  No configuration found for bot ${appointment.bot_id}`);
        return;
      }

      // Check if reminders are enabled
      if (!config.reminder_enabled) {
        this.logger.log(`⏭️  Reminders disabled for bot ${appointment.bot_id}`);
        return;
      }

      // Check if phone number is available
      if (!appointment.attendee_phone) {
        this.logger.warn(`⚠️  No phone number for appointment ${appointment.id}`);
        return;
      }

      // Format phone number
      const phoneNumber = this.twilioService.formatPhoneToE164(appointment.attendee_phone);
      if (!this.twilioService.validatePhoneNumber(phoneNumber)) {
        this.logger.warn(`⚠️  Invalid phone number for appointment ${appointment.id}: ${phoneNumber}`);
        return;
      }

      // Format scheduled time
      const scheduledDate = new Date(appointment.scheduled_time);
      const formattedTime = scheduledDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jerusalem',
      });

      const templates = this.twilioService.getDefaultTemplates();
      const variables = {
        attendee_name: appointment.attendee_name,
        company_name: appointment.bots?.name || 'our company',
        scheduled_time: formattedTime,
        duration: (appointment.duration_minutes || 30).toString(),
      };

      let reminderSent = false;

      // Send WhatsApp reminder if enabled
      if (config.whatsapp_enabled && config.twilio_account_sid && config.twilio_whatsapp_number) {
        const message = this.twilioService.formatMessage(
          templates.appointment_reminder_whatsapp,
          variables,
        );

        const result = await this.twilioService.sendWhatsApp(
          {
            accountSid: config.twilio_account_sid,
            authToken: config.twilio_auth_token,
            phoneNumber: config.twilio_phone_number,
            whatsappNumber: config.twilio_whatsapp_number,
          },
          {
            to: phoneNumber,
            body: message,
          },
        );

        if (result.success) {
          this.logger.log(`✅ WhatsApp reminder sent for appointment ${appointment.id}`);
          reminderSent = true;
          
          // Track success
          await supabase
            .from('bot_actions_config')
            .update({
              sms_last_success_time: new Date().toISOString(),
              sms_last_error: null,
            })
            .eq('bot_id', appointment.bot_id);
        } else {
          this.logger.error(`❌ WhatsApp reminder failed for appointment ${appointment.id}: ${result.error}`);
          
          // Track error
          await supabase
            .from('bot_actions_config')
            .update({
              sms_last_error: result.error,
              sms_last_error_time: new Date().toISOString(),
            })
            .eq('bot_id', appointment.bot_id);
        }
      }

      // Send SMS reminder if enabled (fallback or alternative to WhatsApp)
      if (config.sms_enabled && config.twilio_account_sid && config.twilio_phone_number) {
        const message = this.twilioService.formatMessage(
          templates.appointment_reminder_sms,
          variables,
        );

        const result = await this.twilioService.sendSMS(
          {
            accountSid: config.twilio_account_sid,
            authToken: config.twilio_auth_token,
            phoneNumber: config.twilio_phone_number,
          },
          {
            to: phoneNumber,
            body: message,
          },
        );

        if (result.success) {
          this.logger.log(`✅ SMS reminder sent for appointment ${appointment.id}`);
          reminderSent = true;
          
          // Track success
          await supabase
            .from('bot_actions_config')
            .update({
              sms_last_success_time: new Date().toISOString(),
              sms_last_error: null,
            })
            .eq('bot_id', appointment.bot_id);
        } else {
          this.logger.error(`❌ SMS reminder failed for appointment ${appointment.id}: ${result.error}`);
          
          // Track error
          await supabase
            .from('bot_actions_config')
            .update({
              sms_last_error: result.error,
              sms_last_error_time: new Date().toISOString(),
            })
            .eq('bot_id', appointment.bot_id);
        }
      }

      // Mark reminder as sent
      if (reminderSent) {
        await supabase
          .from('appointments')
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString(),
          })
          .eq('id', appointment.id);

        this.logger.log(`✅ Reminder marked as sent for appointment ${appointment.id}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error sending reminder for appointment ${appointment.id}:`, error);
    }
  }

  /**
   * Manual trigger for testing reminders
   * Can be called via API endpoint if needed
   */
  async triggerRemindersManually() {
    this.logger.log('🔔 Manual reminder trigger initiated');
    await this.sendDailyReminders();
  }
}

