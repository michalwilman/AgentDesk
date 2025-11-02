import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

export interface PdfTemplate {
  name: string;
  html: string;
  styles?: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate PDF from HTML template
   */
  async generatePdf(
    template: PdfTemplate,
    data: Record<string, any>,
    options?: {
      format?: 'A4' | 'Letter';
      margin?: { top?: string; right?: string; bottom?: string; left?: string };
    },
  ): Promise<{ success: boolean; pdf?: Buffer; error?: string }> {
    let browser: puppeteer.Browser | null = null;

    try {
      // Replace template variables with data
      let html = template.html;
      Object.keys(data).forEach((key) => {
        const value = data[key];
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      // Add styles
      if (template.styles) {
        html = `<style>${template.styles}</style>${html}`;
      }

      // Launch Puppeteer
      const executablePath = this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH');
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: executablePath || undefined,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdf = await page.pdf({
        format: options?.format || 'A4',
        margin: options?.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        printBackground: true,
      });

      await browser.close();

      this.logger.log(`PDF generated successfully: ${template.name}`);
      return { success: true, pdf: Buffer.from(pdf) };
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      this.logger.error('Failed to generate PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get default PDF templates
   */
  getDefaultTemplates(): Record<string, PdfTemplate> {
    return {
      quote: {
        name: 'Quote',
        html: `
          <html>
            <body>
              <h1>Price Quote</h1>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>For:</strong> {{customer_name}}</p>
              <hr>
              <h2>Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {{items_rows}}
                </tbody>
              </table>
              <h3 style="text-align: right;">Total: {{total_amount}}</h3>
              <hr>
              <p>{{additional_notes}}</p>
              <p style="font-size: 12px; color: #666;">{{company_name}} | {{company_contact}}</p>
            </body>
          </html>
        `,
        styles: `
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; }
          table { margin: 20px 0; }
        `,
      },
      proposal: {
        name: 'Business Proposal',
        html: `
          <html>
            <body>
              <div style="text-align: center; margin-bottom: 40px;">
                <h1>{{proposal_title}}</h1>
                <p style="font-size: 18px; color: #666;">{{proposal_subtitle}}</p>
              </div>
              
              <h2>Introduction</h2>
              <p>{{introduction}}</p>
              
              <h2>Objectives</h2>
              <p>{{objectives}}</p>
              
              <h2>Services Offered</h2>
              <p>{{services}}</p>
              
              <h2>Investment</h2>
              <p>{{investment_details}}</p>
              
              <h2>Timeline</h2>
              <p>{{timeline}}</p>
              
              <hr style="margin: 40px 0;">
              <p style="text-align: center; font-size: 12px; color: #666;">
                {{company_name}}<br>
                {{company_address}}<br>
                {{company_contact}}
              </p>
            </body>
          </html>
        `,
        styles: `
          body { font-family: 'Georgia', serif; padding: 60px; line-height: 1.6; }
          h1 { color: #2c3e50; font-size: 32px; }
          h2 { color: #34495e; margin-top: 30px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          p { color: #555; font-size: 14px; }
        `,
      },
      invoice: {
        name: 'Invoice',
        html: `
          <html>
            <body>
              <div style="text-align: right; margin-bottom: 40px;">
                <h1 style="color: #e74c3c;">INVOICE</h1>
                <p><strong>Invoice #:</strong> {{invoice_number}}</p>
                <p><strong>Date:</strong> {{invoice_date}}</p>
                <p><strong>Due Date:</strong> {{due_date}}</p>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                <div>
                  <h3>From:</h3>
                  <p>{{company_name}}<br>{{company_address}}<br>{{company_contact}}</p>
                </div>
                <div>
                  <h3>Bill To:</h3>
                  <p>{{customer_name}}<br>{{customer_address}}<br>{{customer_contact}}</p>
                </div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #34495e; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">Rate</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {{invoice_items}}
                </tbody>
                <tfoot>
                  <tr style="background: #ecf0f1;">
                    <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="border: 1px solid #ddd; padding: 12px;">{{subtotal}}</td>
                  </tr>
                  <tr style="background: #ecf0f1;">
                    <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>Tax ({{tax_rate}}%):</strong></td>
                    <td style="border: 1px solid #ddd; padding: 12px;">{{tax_amount}}</td>
                  </tr>
                  <tr style="background: #34495e; color: white; font-size: 18px;">
                    <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>TOTAL:</strong></td>
                    <td style="border: 1px solid #ddd; padding: 12px;"><strong>{{total}}</strong></td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="margin-top: 40px;">
                <h3>Payment Terms:</h3>
                <p>{{payment_terms}}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <p style="font-size: 12px; color: #7f8c8d;">{{notes}}</p>
              </div>
            </body>
          </html>
        `,
        styles: `
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { font-size: 36px; margin: 0; }
          h3 { color: #34495e; margin-bottom: 10px; }
        `,
      },
    };
  }
}

