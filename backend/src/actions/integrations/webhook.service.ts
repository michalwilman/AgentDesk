import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface WebhookConfig {
  url: string;
  events: string[]; // Which events to send to this webhook
  headers?: Record<string, string>;
  secret?: string; // For signature verification
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Trigger webhook with payload
   */
  async triggerWebhook(
    webhookUrl: string,
    eventType: string,
    payload: Record<string, any>,
    secret?: string,
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      const timestamp = Date.now();
      const body = JSON.stringify({
        event: eventType,
        timestamp,
        data: payload,
      });

      // Generate signature if secret provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'AgentDesk-Webhook/1.0',
        'X-AgentDesk-Event': eventType,
        'X-AgentDesk-Timestamp': String(timestamp),
      };

      if (secret) {
        const signature = this.generateSignature(body, secret);
        headers['X-AgentDesk-Signature'] = signature;
      }

      // Send webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      this.logger.log(`Webhook triggered successfully: ${eventType} to ${webhookUrl}`);
      return { success: true, statusCode: response.status };
    } catch (error) {
      this.logger.error('Webhook trigger failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger multiple webhooks for an event
   */
  async triggerWebhooks(
    webhookConfigs: WebhookConfig[],
    eventType: string,
    payload: Record<string, any>,
  ): Promise<Array<{ url: string; success: boolean; error?: string }>> {
    const results = [];

    for (const config of webhookConfigs) {
      // Check if this webhook should receive this event type
      if (config.events.includes(eventType) || config.events.includes('*')) {
        const result = await this.triggerWebhook(
          config.url,
          eventType,
          payload,
          config.secret,
        );

        results.push({
          url: config.url,
          success: result.success,
          error: result.error,
        });
      }
    }

    return results;
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Get webhook payload examples for Make.com / Zapier
   */
  getWebhookPayloadExamples(): Record<string, any> {
    return {
      lead_created: {
        event: 'lead_created',
        timestamp: 1701234567890,
        data: {
          lead_id: 'uuid-here',
          bot_id: 'uuid-here',
          bot_name: 'Customer Support Bot',
          full_name: 'John Doe',
          phone: '+972501234567',
          email: 'john@example.com',
          question: 'I want to know more about your product',
          created_at: '2024-01-15T10:30:00Z',
        },
      },
      appointment_scheduled: {
        event: 'appointment_scheduled',
        timestamp: 1701234567890,
        data: {
          appointment_id: 'uuid-here',
          bot_id: 'uuid-here',
          bot_name: 'Sales Bot',
          scheduled_time: '2024-01-20T14:00:00Z',
          duration_minutes: 30,
          attendee_name: 'Jane Smith',
          attendee_email: 'jane@example.com',
          attendee_phone: '+972501234567',
          created_at: '2024-01-15T10:30:00Z',
        },
      },
      email_sent: {
        event: 'email_sent',
        timestamp: 1701234567890,
        data: {
          bot_id: 'uuid-here',
          to: 'customer@example.com',
          subject: 'Your requested information',
          message_id: 'email-id-here',
          sent_at: '2024-01-15T10:30:00Z',
        },
      },
      pdf_generated: {
        event: 'pdf_generated',
        timestamp: 1701234567890,
        data: {
          bot_id: 'uuid-here',
          template_id: 'quote',
          filename: 'quote-2024-01-15.pdf',
          download_url: 'https://storage.example.com/pdfs/quote-2024-01-15.pdf',
          created_at: '2024-01-15T10:30:00Z',
        },
      },
      whatsapp_sent: {
        event: 'whatsapp_sent',
        timestamp: 1701234567890,
        data: {
          bot_id: 'uuid-here',
          to: '+972501234567',
          message: 'Thank you for your interest!',
          message_sid: 'twilio-sid-here',
          sent_at: '2024-01-15T10:30:00Z',
        },
      },
    };
  }
}

