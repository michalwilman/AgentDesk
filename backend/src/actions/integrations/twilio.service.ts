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

      // For Facebook-approved WhatsApp templates via Twilio, use ContentSid or ContentVariables
      // The template must be approved in Facebook Business Manager first
      
      const messagePayload: any = {
        from: `whatsapp:${credentials.whatsappNumber}`,
        to: `whatsapp:${message.to}`,
      };

      // Facebook WhatsApp Template format using ContentVariables
      // This requires the template to be synced from Facebook to Twilio
      // For now, we'll use the direct approach with body and contentVariables
      
      // Format: We need to send the template with variables
      // Twilio supports this via contentSid (if template is in Twilio Content API)
      // Or via body with special formatting for Facebook templates
      
      // Since we're using Facebook templates directly, we use this format:
      messagePayload.contentSid = undefined; // Not using Twilio Content API
      
      // Alternative: Use body with template format
      // For Facebook templates, format is: template name + variables as JSON
      messagePayload.body = undefined; // Templates don't use body
      
      // Use contentVariables to pass template parameters
      // Format the parameters as Twilio expects for WhatsApp templates
      const contentVariables: Record<string, string> = {};
      message.parameters.forEach((value, index) => {
        contentVariables[`${index + 1}`] = value;
      });
      
      messagePayload.contentVariables = JSON.stringify(contentVariables);
      
      // For Facebook templates, we also need to specify the template
      // This is done via messagingServiceSid or by using the template name in body
      // Since Facebook templates are managed in Facebook Business Manager,
      // we need to use the template name directly
      
      // Actually, the correct way for Facebook WhatsApp templates via Twilio is:
      // Use the Twilio Content API or send via MessagingServiceSid
      // But for direct Facebook templates, use this format:
      
      // Clear approach: Send with template name and variables
      delete messagePayload.contentVariables;
      
      // For Facebook WhatsApp Business templates, use this structure:
      messagePayload.body = JSON.stringify({
        type: 'template',
        template: {
          name: message.templateName,
          language: {
            code: message.templateLanguage,
          },
          components: [
            {
              type: 'body',
              parameters: message.parameters.map(value => ({
                type: 'text',
                text: value,
              })),
            },
          ],
        },
      });

      this.logger.log(`📋 Message payload: ${JSON.stringify(messagePayload, null, 2)}`);

      const result = await client.messages.create(messagePayload);

      this.logger.log(`✅ WhatsApp template sent to ${message.to}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp template error';
      this.logger.error(`❌ Failed to send WhatsApp template to ${message.to}:`, error);
      this.logger.error(`   Template: ${message.templateName}, Language: ${message.templateLanguage}`);
      this.logger.error(`   Error details:`, error);
      
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

