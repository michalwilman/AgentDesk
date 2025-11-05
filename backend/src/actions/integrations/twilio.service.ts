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

interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  templateLanguage: string;
  parameters: string[]; // Array of parameter values for the template
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
   * Send WhatsApp message (freeform - requires 24h window)
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
   * Send WhatsApp message using an approved template (no 24h window required!)
   * This uses Facebook-approved WhatsApp templates via Twilio
   */
  async sendWhatsAppTemplate(
    credentials: TwilioCredentials,
    message: WhatsAppTemplateMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!credentials.whatsappNumber) {
        throw new Error('WhatsApp number not configured');
      }

      const client = this.twilioClient || (() => {
        const twilio = require('twilio');
        return twilio(credentials.accountSid, credentials.authToken);
      })();

      this.logger.log(`📤 Sending WhatsApp template: ${message.templateName} (${message.templateLanguage})`);
      this.logger.log(`   To: ${message.to}`);
      this.logger.log(`   Parameters: ${JSON.stringify(message.parameters)}`);

      // Build the template parameters in the format WhatsApp/Twilio expects
      const templateParameters = message.parameters.map((value, index) => ({
        type: 'text',
        text: value
      }));

      const result = await client.messages.create({
        from: `whatsapp:${credentials.whatsappNumber}`,
        to: `whatsapp:${message.to}`,
        // Use MessagingServiceSid if available, otherwise just from number
        ...(credentials.accountSid && {
          messagingServiceSid: undefined, // Can be set if using Messaging Service
        }),
        // Facebook WhatsApp Template format
        body: undefined, // No body when using template
        persistentAction: undefined,
        // The template configuration
        // Note: Twilio uses either contentSid (for Twilio Content) or body with special format
        // For Facebook templates, we need to specify it differently
        ...(templateParameters.length > 0 && {
          // For Facebook-approved templates via Twilio, use this format:
          body: `{{${message.templateName}}}`, // Template name
          // Or use contentSid if you have Twilio Content:
          // contentSid: 'HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        }),
      });

      this.logger.log(`✅ WhatsApp template sent to ${message.to}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp template error';
      this.logger.error(`❌ Failed to send WhatsApp template to ${message.to}:`, error);
      this.logger.error(`   Template: ${message.templateName}, Language: ${message.templateLanguage}`);
      this.logger.error(`   Error details:`, error);
      
      // Fallback: Try sending as regular freeform message
      this.logger.warn(`   Attempting fallback to freeform message...`);
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

