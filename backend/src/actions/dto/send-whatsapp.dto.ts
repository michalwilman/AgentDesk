import { IsString, IsOptional } from 'class-validator';

export class SendWhatsAppDto {
  @IsString()
  to: string; // Phone number in E.164 format

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  template_name?: string; // WhatsApp approved template

  @IsOptional()
  @IsString()
  lead_id?: string; // Link to lead if exists
}

