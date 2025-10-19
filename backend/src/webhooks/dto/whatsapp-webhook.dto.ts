export class WhatsAppWebhookDto {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string; // Phone number with whatsapp: prefix
  To: string;
  Body: string;
  NumMedia?: string;
  MediaContentType0?: string;
  MediaUrl0?: string;
  FromCity?: string;
  FromState?: string;
  FromCountry?: string;
  SmsStatus?: string;
  ApiVersion?: string;
}

