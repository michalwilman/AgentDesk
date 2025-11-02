import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class SaveLeadDto {
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

