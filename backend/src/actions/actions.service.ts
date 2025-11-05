import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { PlanGuardService } from '../common/plan-guard.service';
import { EmailService } from './integrations/email.service';
import { CalendarService } from './integrations/calendar.service';
import { PdfService } from './integrations/pdf.service';
import { WebhookService } from './integrations/webhook.service';
import { TwilioService } from './integrations/twilio.service';
import { SaveLeadDto } from './dto/save-lead.dto';
import { ScheduleAppointmentDto } from './dto/schedule-appointment.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { TriggerWebhookDto } from './dto/trigger-webhook.dto';
import { UpdateBotActionsConfigDto } from './dto/bot-actions-config.dto';

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private planGuardService: PlanGuardService,
    private emailService: EmailService,
    private calendarService: CalendarService,
    private pdfService: PdfService,
    private webhookService: WebhookService,
    private twilioService: TwilioService,
  ) {}

  /**
   * Get bot actions configuration
   */
  async getBotActionsConfig(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    // Get or create actions config
    let { data: config } = await supabase
      .from('bot_actions_config')
      .select('*')
      .eq('bot_id', botId)
      .single();

    if (!config) {
      // Create default config
      const { data: newConfig } = await supabase
        .from('bot_actions_config')
        .insert([{ bot_id: botId }])
        .select()
        .single();
      config = newConfig;
    }

    return config;
  }

  /**
   * Update bot actions configuration
   */
  async updateBotActionsConfig(
    botId: string,
    userId: string,
    updateDto: UpdateBotActionsConfigDto,
  ) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    // Update or create config
    const { data, error } = await supabase
      .from('bot_actions_config')
      .upsert([{ bot_id: botId, ...updateDto }], { onConflict: 'bot_id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update config: ${error.message}`);
    }

    this.logger.log(`Bot actions config updated for bot ${botId}`);
    return data;
  }

  /**
   * Save lead
   */
  async saveLead(
    botId: string,
    chatId: string,
    leadDto: SaveLeadDto,
  ): Promise<{ success: boolean; lead_id?: string; error?: string }> {
    const startTime = Date.now();

    try {
      const supabase = this.supabaseService.getClient();

      // Create lead
      const { data: lead, error } = await supabase
        .from('leads')
        .insert([
          {
            bot_id: botId,
            chat_id: chatId,
            full_name: leadDto.full_name,
            phone: leadDto.phone,
            email: leadDto.email,
            question: leadDto.question,
            metadata: leadDto.metadata || {},
            status: 'new',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Log action
      await this.logAction(
        botId,
        chatId,
        'save_lead',
        leadDto,
        { lead_id: lead.id },
        'success',
        null,
        Date.now() - startTime,
      );

      // Trigger webhooks
      await this.triggerWebhooksForEvent(botId, 'lead_created', {
        ...lead,
        bot_name: await this.getBotName(botId),
      });

      this.logger.log(`Lead saved: ${lead.id}`);
      return { success: true, lead_id: lead.id };
    } catch (error) {
      await this.logAction(
        botId,
        chatId,
        'save_lead',
        leadDto,
        {},
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime,
      );

      this.logger.error('Failed to save lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule appointment
   */
  async scheduleAppointment(
    botId: string,
    chatId: string,
    appointmentDto: ScheduleAppointmentDto,
  ): Promise<{
    success: boolean;
    appointment_id?: string;
    calendar_event_id?: string;
    event_link?: string;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const supabase = this.supabaseService.getClient();

      // Get bot info (needed for user_id and plan checking)
      const { data: bot } = await supabase
        .from('bots')
        .select('user_id')
        .eq('id', botId)
        .single();

      if (!bot) throw new Error('Bot not found');

      // Get bot actions config
      const { data: config } = await supabase
        .from('bot_actions_config')
        .select('*')
        .eq('bot_id', botId)
        .single();

      // Auto-create lead from appointment
      const leadResult = await this.saveLead(botId, chatId, {
        full_name: appointmentDto.attendee_name,
        email: appointmentDto.attendee_email,
        phone: appointmentDto.attendee_phone,
        question: `Appointment request: ${appointmentDto.notes || 'Meeting scheduled'}`,
      });

      const leadId = leadResult.lead_id;

      // Parse the time string sent by the bot as Israel time
      // If it doesn't have timezone info, add Israel timezone offset (+02:00 or +03:00)
      let timeString = appointmentDto.scheduled_time;
      if (!timeString.includes('+') && !timeString.includes('Z')) {
        // Israel is UTC+2 in winter (Oct-Mar), UTC+3 in summer (Mar-Oct) during DST
        // For simplicity, add +02:00 (can be enhanced to detect DST)
        timeString = timeString + '+02:00';
      }

      // Create appointment record with corrected timezone
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([
          {
            bot_id: botId,
            chat_id: chatId,
            lead_id: leadId || appointmentDto.lead_id,
            scheduled_time: timeString, // Use timeString with offset
            duration_minutes: appointmentDto.duration_minutes || 30,
            attendee_name: appointmentDto.attendee_name,
            attendee_email: appointmentDto.attendee_email,
            attendee_phone: appointmentDto.attendee_phone,
            notes: appointmentDto.notes,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      let calendarEventId: string | undefined;
      let eventLink: string | undefined;
      let calendarSuccess = false;
      let emailSuccess = false;
      let smsSuccess = false;

      // Create calendar event if calendar is configured
      if (config?.google_calendar_access_token && config?.google_calendar_refresh_token) {
        try {
          // Use the same timeString that we saved to DB
          const startTime = new Date(timeString);
          const endTime = new Date(
            startTime.getTime() + (appointmentDto.duration_minutes || 30) * 60000,
          );

          const calendarResult = await this.calendarService.createEvent(
            {
              access_token: config.google_calendar_access_token,
              refresh_token: config.google_calendar_refresh_token,
            },
            config.google_calendar_id || 'primary',
            {
              summary: `Meeting with ${appointmentDto.attendee_name}`,
              description: appointmentDto.notes,
              startTime,
              endTime,
              attendees: appointmentDto.attendee_email
                ? [appointmentDto.attendee_email]
                : [],
            },
          );

          if (calendarResult.success) {
            calendarEventId = calendarResult.eventId;
            eventLink = calendarResult.eventLink;
            calendarSuccess = true;

            this.logger.log(`✅ Calendar event created successfully: ${calendarEventId}`);

            // Just update the calendar event ID (not status yet)
            await supabase
              .from('appointments')
              .update({ calendar_event_id: calendarEventId })
              .eq('id', appointment.id);

            // Track success
            await supabase
              .from('bot_actions_config')
              .update({
                google_calendar_last_success_time: new Date().toISOString(),
                google_calendar_last_error: null,
              })
              .eq('bot_id', botId);
          } else {
            // Track calendar error
            await supabase
              .from('bot_actions_config')
              .update({
                google_calendar_last_error: calendarResult.error || 'Unknown calendar error',
                google_calendar_last_error_time: new Date().toISOString(),
              })
              .eq('bot_id', botId);
            
            this.logger.error(`❌ Calendar error for bot ${botId}: ${calendarResult.error}`);
          }
        } catch (calendarError) {
          // Track unexpected calendar error
          const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unexpected calendar error';
          await supabase
            .from('bot_actions_config')
            .update({
              google_calendar_last_error: errorMessage,
              google_calendar_last_error_time: new Date().toISOString(),
            })
            .eq('bot_id', botId);
          
          this.logger.error(`❌ Calendar exception for bot ${botId}:`, calendarError);
        }
      } else {
        // Calendar not configured - mark as success (not required)
        calendarSuccess = true;
        this.logger.log('⚠️ Calendar not configured - skipping');
      }

      // Use the same timeString that we saved to DB (already has timezone offset)
      const scheduledDate = new Date(timeString);
      
      // Format date in Israel timezone
      const formattedDate = scheduledDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jerusalem',
      });

      // Send confirmation email if email service is available
      if (appointmentDto.attendee_email) {
        try {
          this.logger.log(`📧 Attempting to send confirmation email to ${appointmentDto.attendee_email}`);
          
          const templates = this.emailService.getDefaultTemplates();

          const emailResult = await this.emailService.sendEmailWithTemplate(
            appointmentDto.attendee_email,
            templates.appointment_confirmation,
            {
              attendee_name: appointmentDto.attendee_name,
              scheduled_time: formattedDate,
              duration: (appointmentDto.duration_minutes || 30).toString(),
              company_name: await this.getBotName(botId),
            },
            config?.email_from_address, // Use configured email if available
            config?.email_from_name,
          );

          if (emailResult.success) {
            emailSuccess = true;
            this.logger.log(`✅ Email sent successfully to ${appointmentDto.attendee_email}`);
            // Track email success
            await supabase
              .from('bot_actions_config')
              .update({
                email_last_success_time: new Date().toISOString(),
                email_last_error: null,
              })
              .eq('bot_id', botId);
          } else {
            throw new Error(emailResult.error || 'Email send failed');
          }
        } catch (emailError) {
          // Track email error
          const errorMessage = emailError instanceof Error ? emailError.message : 'Failed to send email';
          this.logger.error(`❌ Email error for bot ${botId}: ${errorMessage}`);
          
          await supabase
            .from('bot_actions_config')
            .update({
              email_last_error: errorMessage,
              email_last_error_time: new Date().toISOString(),
            })
            .eq('bot_id', botId);
        }
      } else {
        // No email to send - mark as success (not required)
        emailSuccess = true;
        this.logger.log('⚠️ Email sending skipped - no attendee email provided');
      }

      // Send SMS/WhatsApp confirmation if enabled and phone number is available
      this.logger.log(`📱 Checking SMS/WhatsApp conditions:
        - Phone: ${appointmentDto.attendee_phone ? 'YES (' + appointmentDto.attendee_phone + ')' : 'NO'}
        - SMS Enabled: ${config?.sms_enabled || false}
        - WhatsApp Enabled: ${config?.whatsapp_enabled || false}
        - Config exists: ${config ? 'YES' : 'NO'}`);
      
      if (appointmentDto.attendee_phone && (config?.sms_enabled || config?.whatsapp_enabled)) {
        try {
          this.logger.log('📱 === WhatsApp/SMS Sending Process Started ===');
          
          // Check plan limits for WhatsApp/SMS
          const canSendWhatsApp = await this.planGuardService.checkAction(bot.user_id, 'send_whatsapp');
          if (!canSendWhatsApp.allowed) {
            this.logger.warn(`⚠️ WhatsApp/SMS sending skipped: ${canSendWhatsApp.reason}`);
            // Don't throw error, just log and continue without sending
            throw new Error(canSendWhatsApp.reason);
          }
          
          this.logger.log(`📞 Original phone number: ${appointmentDto.attendee_phone}`);
          this.logger.log(`🔧 SMS Enabled: ${config.sms_enabled}, WhatsApp Enabled: ${config.whatsapp_enabled}`);
          
          const twilioTemplates = this.twilioService.getDefaultTemplates();
          const variables = {
            attendee_name: appointmentDto.attendee_name,
            company_name: await this.getBotName(botId),
            scheduled_time: formattedDate,
            duration: (appointmentDto.duration_minutes || 30).toString(),
          };

          // Format phone number to E.164
          const phoneNumber = this.twilioService.formatPhoneToE164(appointmentDto.attendee_phone);
          this.logger.log(`📞 Formatted phone number (E.164): ${phoneNumber}`);
          
          // Validate phone number
          if (!this.twilioService.validatePhoneNumber(phoneNumber)) {
            this.logger.error(`❌ Phone validation failed: ${appointmentDto.attendee_phone} -> ${phoneNumber}`);
            throw new Error(`Invalid phone number: ${appointmentDto.attendee_phone}`);
          }
          this.logger.log('✅ Phone number validation passed');

          let whatsappSuccess = false;
          let smsAttempted = false;

          // Send WhatsApp confirmation if enabled  
          if (config.whatsapp_enabled && config.twilio_account_sid && config.twilio_whatsapp_number) {
            this.logger.log('📲 Attempting to send WhatsApp message...');
            this.logger.log(`📋 Twilio Config:
              - Account SID: ${config.twilio_account_sid?.substring(0, 10)}...
              - WhatsApp Number: ${config.twilio_whatsapp_number}
              - To: ${phoneNumber}`);
            
            let result: { success: boolean; messageId?: string; error?: string };
            
            // Try to use WhatsApp Template if configured (no 24h window restriction!)
            if (config.whatsapp_template_name) {
              this.logger.log(`✨ Using WhatsApp Template: ${config.whatsapp_template_name}`);
              
              // Prepare template parameters
              // {{1}} = attendee name
              // {{2}} = scheduled time
              // {{3}} = duration
              const templateParams = [
                appointmentDto.attendee_name,
                formattedDate,
                (appointmentDto.duration_minutes || 30).toString(),
              ];
              
              this.logger.log(`📋 Template parameters: ${JSON.stringify(templateParams)}`);
              
              result = await this.twilioService.sendWhatsAppTemplate(
                {
                  accountSid: config.twilio_account_sid,
                  authToken: config.twilio_auth_token,
                  phoneNumber: config.twilio_phone_number,
                  whatsappNumber: config.twilio_whatsapp_number,
                },
                {
                  to: phoneNumber,
                  templateName: config.whatsapp_template_name,
                  templateLanguage: config.whatsapp_template_language || 'en',
                  parameters: templateParams,
                },
              );
              
              this.logger.log(`📤 WhatsApp Template send result: ${JSON.stringify(result)}`);
            } else {
              // Fallback to freeform message (requires 24h window)
              this.logger.log('⚠️ No template configured, using freeform message (requires 24h window)');
              
              const message = this.twilioService.formatMessage(
                twilioTemplates.appointment_confirmation_whatsapp,
                variables,
              );
              this.logger.log(`💬 Message content: ${message.substring(0, 100)}...`);

              result = await this.twilioService.sendWhatsApp(
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

              this.logger.log(`📤 WhatsApp send result: ${JSON.stringify(result)}`);
            }
            
            if (result.success) {
              whatsappSuccess = true;
              this.logger.log(`✅ WhatsApp confirmation sent successfully for appointment ${appointment.id}`);
            } else {
              this.logger.error(`❌ WhatsApp send failed: ${result.error}`);
              
              // Check if it's the 24-hour window error (Error 63016)
              const isWindowError = result.error?.includes('63016') || 
                                   result.error?.includes('outside the allowed window') ||
                                   result.error?.includes('freeform message');
              
              if (isWindowError) {
                this.logger.warn(`⚠️ WhatsApp failed due to 24-hour window restriction (Error 63016)`);
                this.logger.warn(`🔄 Will attempt to send SMS as fallback...`);
                // Don't throw error - we'll try SMS instead
              } else {
                // Other WhatsApp errors - still throw
                throw new Error(result.error || 'WhatsApp send failed');
              }
            }
          } else {
            this.logger.log('⚠️ WhatsApp not sent - missing configuration:');
            this.logger.log(`  - whatsapp_enabled: ${config.whatsapp_enabled}`);
            this.logger.log(`  - twilio_account_sid: ${config.twilio_account_sid ? 'Set' : 'Missing'}`);
            this.logger.log(`  - twilio_whatsapp_number: ${config.twilio_whatsapp_number || 'Missing'}`);
          }

          // Send SMS confirmation if:
          // 1. SMS is explicitly enabled, OR
          // 2. WhatsApp failed due to 24-hour window (fallback)
          const shouldSendSMS = (config.sms_enabled || !whatsappSuccess) && 
                               config.twilio_account_sid && 
                               config.twilio_phone_number;

          if (shouldSendSMS) {
            smsAttempted = true;
            
            if (!whatsappSuccess) {
              this.logger.log('📲 Sending SMS as fallback for failed WhatsApp...');
            } else {
              this.logger.log('📲 Attempting to send SMS message...');
            }
            
            this.logger.log(`📋 SMS Config:
              - Account SID: ${config.twilio_account_sid?.substring(0, 10)}...
              - SMS Number: ${config.twilio_phone_number}
              - To: ${phoneNumber}`);
            
            const message = this.twilioService.formatMessage(
              twilioTemplates.appointment_confirmation_sms,
              variables,
            );
            this.logger.log(`💬 SMS content: ${message.substring(0, 100)}...`);

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

            this.logger.log(`📤 SMS send result: ${JSON.stringify(result)}`);

            if (result.success) {
              this.logger.log(`✅ SMS confirmation sent successfully for appointment ${appointment.id}`);
              // Mark as success - either WhatsApp or SMS worked
              smsSuccess = true;
            } else {
              this.logger.error(`❌ SMS send failed: ${result.error}`);
              // If SMS also failed, throw error
              throw new Error(result.error || 'SMS send failed');
            }
          } else {
            // If WhatsApp succeeded, mark as success even without SMS
            if (whatsappSuccess) {
              smsSuccess = true;
              this.logger.log('✅ WhatsApp sent successfully, SMS not needed');
            } else {
              this.logger.log('⚠️ SMS not sent - missing configuration:');
              this.logger.log(`  - sms_enabled: ${config.sms_enabled}`);
              this.logger.log(`  - whatsapp_success: ${whatsappSuccess}`);
              this.logger.log(`  - twilio_account_sid: ${config.twilio_account_sid ? 'Set' : 'Missing'}`);
              this.logger.log(`  - twilio_phone_number: ${config.twilio_phone_number || 'Missing'}`);
            }
          }

          // Track SMS/WhatsApp success only if one of them worked
          if (smsSuccess) {
            this.logger.log('✅ Tracking SMS/WhatsApp success in database');
            await supabase
              .from('bot_actions_config')
              .update({
                sms_last_success_time: new Date().toISOString(),
                sms_last_error: null,
              })
              .eq('bot_id', botId);
            
            // Increment WhatsApp usage counter
            await this.planGuardService.incrementWhatsAppUsage(bot.user_id, 1);
            
            this.logger.log('📱 === WhatsApp/SMS Sending Process Completed Successfully ===');
          }
        } catch (smsError) {
          // Track SMS/WhatsApp error
          const errorMessage = smsError instanceof Error ? smsError.message : 'Failed to send SMS/WhatsApp';
          this.logger.error('❌ === WhatsApp/SMS Sending Process FAILED ===');
          this.logger.error(`❌ Error details: ${errorMessage}`);
          this.logger.error('Full error object:', smsError);
          
          await supabase
            .from('bot_actions_config')
            .update({
              sms_last_error: errorMessage,
              sms_last_error_time: new Date().toISOString(),
            })
            .eq('bot_id', botId);
          
          this.logger.error(`❌ SMS/WhatsApp error for bot ${botId}:`, smsError);
        }
      } else {
        // No SMS/WhatsApp to send - mark as success (not required)
        smsSuccess = true;
        this.logger.log('⚠️ SMS/WhatsApp sending skipped:');
        this.logger.log(`  - Phone number provided: ${!!appointmentDto.attendee_phone}`);
        this.logger.log(`  - SMS enabled: ${config?.sms_enabled}`);
        this.logger.log(`  - WhatsApp enabled: ${config?.whatsapp_enabled}`);
      }

      // Determine final appointment status based on all operations
      let finalStatus = 'pending'; // Default
      const notificationResults: string[] = [];

      if (calendarSuccess) {
        notificationResults.push('✅ Calendar');
      } else {
        notificationResults.push('❌ Calendar');
      }

      if (emailSuccess) {
        notificationResults.push('✅ Email');
      } else if (appointmentDto.attendee_email) {
        notificationResults.push('❌ Email');
      }

      if (smsSuccess) {
        notificationResults.push('✅ SMS/WhatsApp');
      } else if (appointmentDto.attendee_phone && (config?.sms_enabled || config?.whatsapp_enabled)) {
        notificationResults.push('❌ SMS/WhatsApp');
      }

      // Mark as confirmed only if all required notifications succeeded
      if (calendarSuccess && emailSuccess && smsSuccess) {
        finalStatus = 'confirmed';
        this.logger.log(`🎉 All notifications sent successfully! Status: CONFIRMED`);
      } else {
        this.logger.warn(`⚠️ Some notifications failed. Status remains: PENDING`);
        this.logger.warn(`Results: ${notificationResults.join(', ')}`);
      }

      // Update appointment status
      await supabase
        .from('appointments')
        .update({ status: finalStatus })
        .eq('id', appointment.id);

      this.logger.log(`📋 Appointment ${appointment.id} final status: ${finalStatus}`);

      // Log action
      await this.logAction(
        botId,
        chatId,
        'schedule_appointment',
        appointmentDto,
        { 
          appointment_id: appointment.id, 
          calendar_event_id: calendarEventId,
          final_status: finalStatus,
          notifications: notificationResults.join(', '),
        },
        'success',
        null,
        Date.now() - startTime,
      );

      // Trigger webhooks
      await this.triggerWebhooksForEvent(botId, 'appointment_scheduled', {
        ...appointment,
        bot_name: await this.getBotName(botId),
        event_link: eventLink,
      });

      this.logger.log(`Appointment scheduled: ${appointment.id}`);
      return {
        success: true,
        appointment_id: appointment.id,
        calendar_event_id: calendarEventId,
        event_link: eventLink,
      };
    } catch (error) {
      await this.logAction(
        botId,
        chatId,
        'schedule_appointment',
        appointmentDto,
        {},
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime,
      );

      this.logger.error('Failed to schedule appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email
   */
  async sendEmail(
    botId: string,
    chatId: string,
    emailDto: SendEmailDto,
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const startTime = Date.now();

    try {
      const supabase = this.supabaseService.getClient();

      // Get bot actions config
      const { data: config } = await supabase
        .from('bot_actions_config')
        .select('*')
        .eq('bot_id', botId)
        .single();

      let result;

      // Send with template if specified
      if (emailDto.template_id && config?.email_templates?.[emailDto.template_id]) {
        const template = config.email_templates[emailDto.template_id];
        result = await this.emailService.sendEmailWithTemplate(
          emailDto.to,
          template,
          emailDto.template_variables || {},
          config.email_from_address,
          config.email_from_name,
        );
      } else {
        // Send direct email
        result = await this.emailService.sendEmail(
          emailDto.to,
          emailDto.subject,
          emailDto.content,
          config?.email_from_address,
          config?.email_from_name,
          emailDto.reply_to,
        );
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      // Log action
      await this.logAction(
        botId,
        chatId,
        'send_email',
        emailDto,
        { message_id: result.messageId },
        'success',
        null,
        Date.now() - startTime,
      );

      // Trigger webhooks
      await this.triggerWebhooksForEvent(botId, 'email_sent', {
        to: emailDto.to,
        subject: emailDto.subject,
        message_id: result.messageId,
        sent_at: new Date().toISOString(),
      });

      this.logger.log(`Email sent to ${emailDto.to}`);
      return { success: true, message_id: result.messageId };
    } catch (error) {
      await this.logAction(
        botId,
        chatId,
        'send_email',
        emailDto,
        {},
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime,
      );

      this.logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create PDF
   */
  async createPdf(
    botId: string,
    chatId: string,
    pdfDto: CreatePdfDto,
  ): Promise<{
    success: boolean;
    pdf_url?: string;
    filename?: string;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const supabase = this.supabaseService.getClient();

      // Get bot actions config
      const { data: config } = await supabase
        .from('bot_actions_config')
        .select('*')
        .eq('bot_id', botId)
        .single();

      // Get template
      const template =
        config?.pdf_templates?.[pdfDto.template_id] ||
        this.pdfService.getDefaultTemplates()[pdfDto.template_id];

      if (!template) {
        throw new Error(`PDF template not found: ${pdfDto.template_id}`);
      }

      // Generate PDF
      const pdfResult = await this.pdfService.generatePdf(template, pdfDto.data);

      if (!pdfResult.success || !pdfResult.pdf) {
        throw new Error(pdfResult.error);
      }

      // Upload to Supabase Storage
      const filename =
        pdfDto.filename || `${pdfDto.template_id}-${Date.now()}.pdf`;
      const bucketName = config?.pdf_storage_bucket || 'bot-documents';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`${botId}/${filename}`, pdfResult.pdf, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

      // Optionally send via email
      if (pdfDto.send_to_email) {
        await this.sendEmail(botId, chatId, {
          to: pdfDto.send_to_email,
          subject: `Your ${pdfDto.template_id} is ready`,
          content: `Please find your ${pdfDto.template_id} attached. You can also download it from: ${urlData.publicUrl}`,
        });
      }

      // Log action
      await this.logAction(
        botId,
        chatId,
        'create_pdf',
        pdfDto,
        { pdf_url: urlData.publicUrl, filename },
        'success',
        null,
        Date.now() - startTime,
      );

      // Trigger webhooks
      await this.triggerWebhooksForEvent(botId, 'pdf_generated', {
        template_id: pdfDto.template_id,
        filename,
        download_url: urlData.publicUrl,
        created_at: new Date().toISOString(),
      });

      this.logger.log(`PDF created: ${filename}`);
      return { success: true, pdf_url: urlData.publicUrl, filename };
    } catch (error) {
      await this.logAction(
        botId,
        chatId,
        'create_pdf',
        pdfDto,
        {},
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime,
      );

      this.logger.error('Failed to create PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    botId: string,
    chatId: string,
    whatsappDto: SendWhatsAppDto,
  ): Promise<{ success: boolean; message_sid?: string; error?: string }> {
    const startTime = Date.now();

    try {
      const supabase = this.supabaseService.getClient();

      // Get bot with WhatsApp credentials
      const { data: bot } = await supabase
        .from('bots')
        .select('whatsapp_sid, whatsapp_auth_token, whatsapp_phone_number')
        .eq('id', botId)
        .single();

      if (!bot?.whatsapp_sid || !bot?.whatsapp_auth_token) {
        throw new Error('WhatsApp not configured for this bot');
      }

      // Send WhatsApp message using Twilio (from existing webhooks service)
      const accountSid = bot.whatsapp_sid;
      const authToken = bot.whatsapp_auth_token;
      const fromNumber = bot.whatsapp_phone_number;

      const twilio = require('twilio')(accountSid, authToken);

      const message = await twilio.messages.create({
        body: whatsappDto.message,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${whatsappDto.to}`,
      });

      // Log action
      await this.logAction(
        botId,
        chatId,
        'send_whatsapp',
        whatsappDto,
        { message_sid: message.sid },
        'success',
        null,
        Date.now() - startTime,
      );

      // Trigger webhooks
      await this.triggerWebhooksForEvent(botId, 'whatsapp_sent', {
        to: whatsappDto.to,
        message: whatsappDto.message,
        message_sid: message.sid,
        sent_at: new Date().toISOString(),
      });

      this.logger.log(`WhatsApp sent to ${whatsappDto.to}: ${message.sid}`);
      return { success: true, message_sid: message.sid };
    } catch (error) {
      await this.logAction(
        botId,
        chatId,
        'send_whatsapp',
        whatsappDto,
        {},
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime,
      );

      this.logger.error('Failed to send WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(
    botId: string,
    chatId: string,
    webhookDto: TriggerWebhookDto,
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      // Use specific webhook URL or get from config
      let webhookUrl = webhookDto.webhook_url;

      if (!webhookUrl) {
        const supabase = this.supabaseService.getClient();
        const { data: config } = await supabase
          .from('bot_actions_config')
          .select('webhook_urls, webhook_secret')
          .eq('bot_id', botId)
          .single();

        if (!config?.webhook_urls || config.webhook_urls.length === 0) {
          throw new Error('No webhooks configured');
        }

        // Use first webhook URL (can be enhanced to support multiple)
        webhookUrl = config.webhook_urls[0].url;
      }

      // Trigger webhook
      const result = await this.webhookService.triggerWebhook(
        webhookUrl,
        webhookDto.event_type,
        webhookDto.payload,
      );

      // Log action
      await this.logAction(
        botId,
        chatId,
        'trigger_webhook',
        webhookDto,
        { webhook_url: webhookUrl },
        result.success ? 'success' : 'failed',
        result.error,
        Date.now() - startTime,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      this.logger.log(`Webhook triggered: ${webhookDto.event_type}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to trigger webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Helper: Log action to database
   */
  private async logAction(
    botId: string,
    chatId: string,
    actionType: string,
    actionData: any,
    resultData: any,
    status: string,
    errorMessage: string | null,
    executionTimeMs: number,
  ) {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.from('action_logs').insert([
        {
          bot_id: botId,
          chat_id: chatId,
          action_type: actionType,
          action_data: actionData,
          result_data: resultData,
          status,
          error_message: errorMessage,
          execution_time_ms: executionTimeMs,
        },
      ]);
    } catch (error) {
      this.logger.error('Failed to log action:', error);
    }
  }

  /**
   * Helper: Trigger webhooks for event
   */
  private async triggerWebhooksForEvent(
    botId: string,
    eventType: string,
    payload: any,
  ) {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: config } = await supabase
        .from('bot_actions_config')
        .select('webhook_urls, webhook_secret, webhooks_enabled')
        .eq('bot_id', botId)
        .single();

      if (config?.webhooks_enabled && config.webhook_urls) {
        await this.webhookService.triggerWebhooks(
          config.webhook_urls,
          eventType,
          payload,
        );
      }
    } catch (error) {
      this.logger.error('Failed to trigger webhooks:', error);
    }
  }

  /**
   * Helper: Get bot name
   */
  private async getBotName(botId: string): Promise<string> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data } = await supabase
        .from('bots')
        .select('name')
        .eq('id', botId)
        .single();
      return data?.name || 'Unknown Bot';
    } catch {
      return 'Unknown Bot';
    }
  }

  /**
   * Get leads for bot
   */
  async getLeads(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    return data;
  }

  /**
   * Get appointments for bot
   */
  async getAppointments(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('bot_id', botId)
      .order('scheduled_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return data;
  }

  /**
   * Get action logs for bot
   */
  async getActionLogs(botId: string, userId: string, limit: number = 50) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    const { data, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch action logs: ${error.message}`);
    }

    return data;
  }
}

