/**
 * OpenAI Function Calling Definitions for Bot Actions
 * These functions are provided to the AI model to enable it to perform actions
 */

export interface BotActionsConfig {
  lead_collection_enabled: boolean;
  appointments_enabled: boolean;
  email_enabled: boolean;
  pdf_enabled: boolean;
  whatsapp_enabled: boolean;
  webhooks_enabled: boolean;
}

/**
 * Get available tools based on bot configuration
 */
export function getAvailableTools(config: BotActionsConfig): any[] {
  const tools: any[] = [];

  // Save Lead Function
  if (config.lead_collection_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'save_lead',
        description:
          'Save customer lead information when they express interest in a product/service or provide their contact details. Use this when customer wants to be contacted, requests a callback, or shares their information.',
        parameters: {
          type: 'object',
          properties: {
            full_name: {
              type: 'string',
              description: "Customer's full name",
            },
            phone: {
              type: 'string',
              description: "Customer's phone number (optional)",
            },
            email: {
              type: 'string',
              description: "Customer's email address (optional)",
            },
            question: {
              type: 'string',
              description:
                "Customer's question, interest, or reason for contact",
            },
          },
          required: ['full_name'],
        },
      },
    });
  }

  // Schedule Appointment Function
  if (config.appointments_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'schedule_appointment',
        description:
          'Schedule a meeting or appointment with the customer. Use this when customer wants to book a consultation, meeting, demo, or any scheduled event.',
        parameters: {
          type: 'object',
          properties: {
            scheduled_time: {
              type: 'string',
              description:
                'Preferred date and time for the appointment in ISO format (e.g., 2024-12-15T14:00:00Z)',
            },
            duration_minutes: {
              type: 'integer',
              description: 'Duration of the appointment in minutes (default: 30)',
            },
            attendee_name: {
              type: 'string',
              description: "Customer's full name",
            },
            attendee_email: {
              type: 'string',
              description: "Customer's email address for calendar invitation",
            },
            attendee_phone: {
              type: 'string',
              description: "Customer's phone number (optional)",
            },
            location: {
              type: 'string',
              description:
                'Meeting location or address (e.g., "Office", "Zoom", or a physical address)',
            },
            notes: {
              type: 'string',
              description:
                'Any additional notes or requirements for the appointment',
            },
          },
          required: ['scheduled_time', 'attendee_name', 'attendee_email', 'attendee_phone'],
        },
      },
    });
  }

  // Send Email Function
  if (config.email_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'send_email',
        description:
          'Send an email to the customer with information, documents, or follow-up. Use this when customer requests information via email or needs documentation sent.',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: "Recipient's email address",
            },
            subject: {
              type: 'string',
              description: 'Email subject line',
            },
            content: {
              type: 'string',
              description:
                'Email body content in plain text or HTML',
            },
            template_id: {
              type: 'string',
              description:
                'Use a predefined email template (optional)',
            },
          },
          required: ['to', 'subject', 'content'],
        },
      },
    });
  }

  // Create PDF Function
  if (config.pdf_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'create_pdf',
        description:
          'Generate a PDF document (quote, proposal, invoice, report, etc.) and optionally send it to customer. Use this when customer requests a document, quote, or written information.',
        parameters: {
          type: 'object',
          properties: {
            template_id: {
              type: 'string',
              description:
                'Which PDF template to use (e.g., "quote", "proposal", "invoice")',
            },
            data: {
              type: 'object',
              description:
                'Data to populate the PDF template',
            },
            filename: {
              type: 'string',
              description: 'Name for the generated PDF file',
            },
            send_to_email: {
              type: 'string',
              description:
                'Email address to send the PDF to (optional)',
            },
          },
          required: ['template_id', 'data'],
        },
      },
    });
  }

  // Send WhatsApp Function
  if (config.whatsapp_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'send_whatsapp',
        description:
          'Send a WhatsApp message to customer. Use this when customer prefers WhatsApp communication or requests to be contacted via WhatsApp.',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description:
                "Customer's phone number in international format (e.g., +972501234567)",
            },
            message: {
              type: 'string',
              description: 'Message content to send',
            },
            template_name: {
              type: 'string',
              description:
                'WhatsApp approved template name (if using template)',
            },
          },
          required: ['to', 'message'],
        },
      },
    });
  }

  // Trigger Webhook Function
  if (config.webhooks_enabled) {
    tools.push({
      type: 'function',
      function: {
        name: 'trigger_webhook',
        description:
          'Trigger external automation or integration (e.g., Make.com, Zapier) to perform complex workflows like updating CRM, sending notifications, creating tasks, etc.',
        parameters: {
          type: 'object',
          properties: {
            event_type: {
              type: 'string',
              description:
                'Type of event to trigger (e.g., "lead_created", "appointment_scheduled", "custom_action")',
            },
            payload: {
              type: 'object',
              description:
                'Data to send to the webhook endpoint',
            },
          },
          required: ['event_type', 'payload'],
        },
      },
    });
  }

  return tools;
}

/**
 * Helper function to validate tool call results
 */
export function formatToolResult(
  toolName: string,
  success: boolean,
  data?: any,
  error?: string,
): string {
  if (success) {
    return JSON.stringify({
      success: true,
      action: toolName,
      result: data,
      message: `Successfully executed ${toolName}`,
    });
  } else {
    return JSON.stringify({
      success: false,
      action: toolName,
      error: error || 'Unknown error occurred',
      message: `Failed to execute ${toolName}`,
    });
  }
}

