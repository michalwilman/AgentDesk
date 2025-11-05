import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  whatsappNumber?: string;
}

interface SMSMessage {
  to: string;
  body: string;
}

interface WhatsAppMessage {
  to: string;
  body: string;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    // Initialize Twilio client if credentials are available
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      try {
        // Dynamically import twilio to avoid requiring it if not used
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('✅ Twilio service initialized');
      } catch (error) {
        this.logger.warn('⚠️  Twilio package not installed. SMS/WhatsApp features disabled.');
      }
    } else {
      this.logger.warn('⚠️  Twilio credentials not configured. SMS/WhatsApp features disabled.');
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(
    credentials: TwilioCredentials,
    message: SMSMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        // Try to initialize with provided credentials
        const twilio = require('twilio');
        const client = twilio(credentials.accountSid, credentials.authToken);
        
        const result = await client.messages.create({
          body: message.body,
          from: credentials.phoneNumber,
          to: message.to,
        });

        this.logger.log(`✅ SMS sent to ${message.to}: ${result.sid}`);
        return { success: true, messageId: result.sid };
      }

      const result = await this.twilioClient.messages.create({
        body: message.body,
        from: credentials.phoneNumber,
        to: message.to,
      });

      this.logger.log(`✅ SMS sent to ${message.to}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown SMS error';
      this.logger.error(`❌ Failed to send SMS to ${message.to}:`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    credentials: TwilioCredentials,
    message: WhatsAppMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!credentials.whatsappNumber) {
        throw new Error('WhatsApp number not configured');
      }

      if (!this.twilioClient) {
        // Try to initialize with provided credentials
        const twilio = require('twilio');
        const client = twilio(credentials.accountSid, credentials.authToken);
        
        const result = await client.messages.create({
          body: message.body,
          from: `whatsapp:${credentials.whatsappNumber}`,
          to: `whatsapp:${message.to}`,
        });

        this.logger.log(`✅ WhatsApp sent to ${message.to}: ${result.sid}`);
        return { success: true, messageId: result.sid };
      }

      const result = await this.twilioClient.messages.create({
        body: message.body,
        from: `whatsapp:${credentials.whatsappNumber}`,
        to: `whatsapp:${message.to}`,
      });

      this.logger.log(`✅ WhatsApp sent to ${message.to}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp error';
      this.logger.error(`❌ Failed to send WhatsApp to ${message.to}:`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get default message templates
   */
  getDefaultTemplates() {
    return {
      appointment_confirmation_sms: `Hello {{attendee_name}}! Your appointment with {{company_name}} is confirmed for {{scheduled_time}}. Duration: {{duration}} minutes.`,
      
      appointment_confirmation_whatsapp: `Hello {{attendee_name}}! 👋\n\nYour appointment with {{company_name}} is confirmed:\n📅 {{scheduled_time}}\n⏱️ Duration: {{duration}} minutes\n\nSee you soon!`,
      
      appointment_reminder_sms: `Reminder: You have an appointment with {{company_name}} tomorrow at {{scheduled_time}}. Duration: {{duration}} minutes.`,
      
      appointment_reminder_whatsapp: `⏰ Reminder!\n\nYou have an appointment with {{company_name}} tomorrow:\n📅 {{scheduled_time}}\n⏱️ Duration: {{duration}} minutes\n\nLooking forward to seeing you!`,
    };
  }

  /**
   * Format message with variables (supports both {{var}} and {var} formats for backward compatibility)
   */
  formatMessage(template: string, variables: Record<string, string>): string {
    let message = template;
    Object.keys(variables).forEach((key) => {
      // Support both {{var}} and {var} formats
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), variables[key]);
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), variables[key]);
    });
    return message;
  }

  /**
   * Validate phone number (basic E.164 format check)
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // E.164 format: +[country code][number]
    // Example: +972501234567 (Israel), +14155552671 (US)
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 (basic Israel formatting)
   */
  formatPhoneToE164(phoneNumber: string, defaultCountryCode: string = '+972'): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, remove it (Israeli format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't start with country code, add default
    if (!cleaned.startsWith(defaultCountryCode.substring(1))) {
      cleaned = defaultCountryCode + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

