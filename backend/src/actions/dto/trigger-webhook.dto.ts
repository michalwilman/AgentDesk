import { IsString, IsObject, IsOptional } from 'class-validator';

export class TriggerWebhookDto {
  @IsString()
  event_type: string; // lead_created, appointment_scheduled, etc.

  @IsObject()
  payload: Record<string, any>;

  @IsOptional()
  @IsString()
  webhook_url?: string; // Override default webhook URL
}

