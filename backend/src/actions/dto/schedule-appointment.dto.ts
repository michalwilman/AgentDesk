import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class ScheduleAppointmentDto {
  @IsDateString()
  scheduled_time: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duration_minutes?: number;

  @IsString()
  attendee_name: string;

  @IsOptional()
  @IsEmail()
  attendee_email?: string;

  @IsOptional()
  @IsString()
  attendee_phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  location?: string; // Meeting location/address

  @IsOptional()
  @IsString()
  lead_id?: string; // Link to lead if exists
}

