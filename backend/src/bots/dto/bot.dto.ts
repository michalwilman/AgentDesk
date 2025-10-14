import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsIn, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateBotDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'he'])
  language?: string = 'en';

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  @IsIn(['bottom-right', 'bottom-left'])
  position?: string;

  @IsOptional()
  @IsString()
  welcome_message?: string;

  @IsOptional()
  @IsString()
  @IsIn(['gpt-4o-mini', 'gpt-4o'])
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(2000)
  max_tokens?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_domains?: string[];

  @IsOptional()
  @IsNumber()
  rate_limit_per_minute?: number;
}

export class UpdateBotDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'he'])
  language?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  @IsIn(['bottom-right', 'bottom-left'])
  position?: string;

  @IsOptional()
  @IsString()
  welcome_message?: string;

  @IsOptional()
  @IsString()
  @IsIn(['gpt-4o-mini', 'gpt-4o'])
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(2000)
  max_tokens?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_domains?: string[];

  @IsOptional()
  @IsNumber()
  rate_limit_per_minute?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_trained?: boolean;
}

