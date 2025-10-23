import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

/**
 * DTO for starting a new site scan job
 */
export class StartSiteScanDto {
  @IsString()
  @IsNotEmpty()
  botId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, { message: 'startUrlAfterLogin must be a valid URL starting with http:// or https://' })
  startUrlAfterLogin: string;

  // Optional fields for protected sites requiring login
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'loginUrl must be a valid URL starting with http:// or https://' })
  loginUrl?: string;

  @IsOptional()
  @IsString()
  usernameSelector?: string;

  @IsOptional()
  @IsString()
  passwordSelector?: string;

  @IsOptional()
  @IsString()
  submitSelector?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

/**
 * Response DTO for site scan job creation
 */
export interface SiteScanJobResponse {
  id: string;
  botId: string;
  startUrlAfterLogin: string;
  loginUrl?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response DTO for listing site scan jobs
 */
export interface SiteScanJobsListResponse {
  jobs: SiteScanJobResponse[];
  total: number;
}

/**
 * Job data structure passed to BullMQ worker
 */
export interface SiteCrawlerJobData {
  jobId: string;
  botId: string;
  startUrlAfterLogin: string;
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  submitSelector?: string;
  usernameEncrypted?: string;
  passwordEncrypted?: string;
}

