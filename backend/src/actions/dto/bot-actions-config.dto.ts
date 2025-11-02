import { IsBoolean, IsOptional, IsString, IsObject, IsArray } from 'class-validator';

export class UpdateBotActionsConfigDto {
  // Lead Collection
  @IsOptional()
  @IsBoolean()
  lead_collection_enabled?: boolean;

  @IsOptional()
  @IsArray()
  lead_form_fields?: string[];

  @IsOptional()
  @IsString()
  lead_notification_email?: string;

  // Appointments
  @IsOptional()
  @IsBoolean()
  appointments_enabled?: boolean;

  @IsOptional()
  @IsString()
  calendar_provider?: string;

  @IsOptional()
  @IsObject()
  calendar_credentials?: Record<string, any>;

  @IsOptional()
  @IsString()
  calendar_id?: string;

  @IsOptional()
  @IsObject()
  available_hours?: Record<string, string[]>;

  // Email
  @IsOptional()
  @IsBoolean()
  email_enabled?: boolean;

  @IsOptional()
  @IsString()
  email_provider?: string;

  @IsOptional()
  @IsString()
  email_api_key?: string;

  @IsOptional()
  @IsString()
  email_from_address?: string;

  @IsOptional()
  @IsString()
  email_from_name?: string;

  @IsOptional()
  @IsObject()
  email_templates?: Record<string, any>;

  // PDF
  @IsOptional()
  @IsBoolean()
  pdf_enabled?: boolean;

  @IsOptional()
  @IsObject()
  pdf_templates?: Record<string, any>;

  // WhatsApp
  @IsOptional()
  @IsBoolean()
  whatsapp_enabled?: boolean;

  @IsOptional()
  @IsArray()
  whatsapp_template_messages?: any[];

  // Webhooks
  @IsOptional()
  @IsBoolean()
  webhooks_enabled?: boolean;

  @IsOptional()
  @IsArray()
  webhook_urls?: any[];

  @IsOptional()
  @IsString()
  webhook_secret?: string;
}

