import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  template_id?: string; // Use predefined template

  @IsOptional()
  @IsObject()
  template_variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  reply_to?: string;

  @IsOptional()
  @IsString()
  lead_id?: string; // Link to lead if exists
}

