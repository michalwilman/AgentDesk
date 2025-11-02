import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured - email service disabled');
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    fromAddress?: string,
    fromName?: string,
    replyTo?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.resend) {
        throw new Error('Email service not configured');
      }

      const from = fromAddress
        ? `${fromName || 'AgentDesk'} <${fromAddress}>`
        : this.configService.get<string>('DEFAULT_FROM_EMAIL') ||
          'noreply@agentdesk.com';

      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html: content,
        replyTo: replyTo,
      });

      if (error) {
        this.logger.error('Failed to send email:', error);
        return { success: false, error: error.message };
      }

      this.logger.log(`Email sent successfully to ${to}: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      this.logger.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendEmailWithTemplate(
    to: string,
    template: EmailTemplate,
    variables: Record<string, any> = {},
    fromAddress?: string,
    fromName?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Replace variables in template
      let html = template.html;
      let subject = template.subject;

      Object.keys(variables).forEach((key) => {
        const value = variables[key];
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      return await this.sendEmail(to, subject, html, fromAddress, fromName);
    } catch (error) {
      this.logger.error('Template email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get default email templates
   */
  getDefaultTemplates(): Record<string, EmailTemplate> {
    return {
      lead_confirmation: {
        subject: 'Thank you for your interest!',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi {{name}},</h2>
              <p>Thank you for contacting us! We've received your inquiry and will get back to you soon.</p>
              <p><strong>Your message:</strong><br>{{question}}</p>
              <p>Best regards,<br>{{company_name}}</p>
            </body>
          </html>
        `,
      },
      appointment_confirmation: {
        subject: 'Your Appointment is Confirmed',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Appointment Confirmed!</h2>
              <p>Hi {{attendee_name}},</p>
              <p>Your appointment has been scheduled:</p>
              <ul>
                <li><strong>Date & Time:</strong> {{scheduled_time}}</li>
                <li><strong>Duration:</strong> {{duration}} minutes</li>
              </ul>
              <p>We look forward to meeting with you!</p>
              <p>Best regards,<br>{{company_name}}</p>
            </body>
          </html>
        `,
      },
      document_attached: {
        subject: 'Your Requested Document',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi {{name}},</h2>
              <p>As requested, please find the attached document.</p>
              <p>{{additional_message}}</p>
              <p>Best regards,<br>{{company_name}}</p>
            </body>
          </html>
        `,
      },
    };
  }
}

