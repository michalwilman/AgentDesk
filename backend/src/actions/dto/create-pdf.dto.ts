import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePdfDto {
  @IsString()
  template_id: string; // Which template to use

  @IsObject()
  data: Record<string, any>; // Data to populate the template

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  send_to_email?: string; // Optionally email the PDF

  @IsOptional()
  @IsString()
  lead_id?: string; // Link to lead if exists
}

