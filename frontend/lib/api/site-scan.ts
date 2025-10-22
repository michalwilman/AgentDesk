import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Site scan job status
 */
export type SiteScanStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Site scan job interface
 */
export interface SiteScanJob {
  id: string;
  botId: string;
  startUrlAfterLogin: string;
  loginUrl?: string;
  status: SiteScanStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request data for starting a site scan
 */
export interface StartSiteScanRequest {
  botId: string;
  startUrlAfterLogin: string;
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  submitSelector?: string;
  username?: string;
  password?: string;
}

/**
 * Response from starting a site scan
 */
export interface StartSiteScanResponse {
  message: string;
  job: SiteScanJob;
}

/**
 * Response from getting site scan jobs
 */
export interface SiteScanJobsListResponse {
  jobs: SiteScanJob[];
  total: number;
}

/**
 * Site scan API client
 */
export const siteScanApi = {
  /**
   * Start a new site scan
   */
  async startSiteScan(
    data: StartSiteScanRequest,
    token: string,
  ): Promise<StartSiteScanResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/scraper/scan/start`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  },

  /**
   * Get all site scan jobs for a bot
   */
  async getSiteScanJobs(
    botId: string,
    token: string,
  ): Promise<SiteScanJobsListResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/scraper/scan/jobs/${botId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  /**
   * Get a specific site scan job
   */
  async getSiteScanJob(
    jobId: string,
    botId: string,
    token: string,
  ): Promise<SiteScanJob> {
    const response = await axios.get(
      `${API_BASE_URL}/scraper/scan/job/${jobId}/${botId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};

