-- Migration: Add site_scan_jobs table for website crawling feature
-- Date: 2025-10-22
-- Purpose: Support website crawling with login capabilities

-- Create site_scan_jobs table
CREATE TABLE IF NOT EXISTS site_scan_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  login_url TEXT,
  start_url_after_login TEXT NOT NULL,
  username_selector TEXT,
  password_selector TEXT,
  submit_selector TEXT,
  username_encrypted TEXT,
  password_encrypted TEXT,
  status VARCHAR(20) DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_site_scan_jobs_bot_id ON site_scan_jobs(bot_id);
CREATE INDEX IF NOT EXISTS idx_site_scan_jobs_status ON site_scan_jobs(status);

-- Add check constraint for status
ALTER TABLE site_scan_jobs
ADD CONSTRAINT check_site_scan_status 
CHECK (status IN ('queued', 'processing', 'completed', 'failed'));

-- Comment the table and columns
COMMENT ON TABLE site_scan_jobs IS 'Website crawling jobs with optional login support';
COMMENT ON COLUMN site_scan_jobs.login_url IS 'URL of login page (optional, for protected sites)';
COMMENT ON COLUMN site_scan_jobs.start_url_after_login IS 'URL to crawl after login (or directly if no login)';
COMMENT ON COLUMN site_scan_jobs.username_selector IS 'CSS selector for username input field';
COMMENT ON COLUMN site_scan_jobs.password_selector IS 'CSS selector for password input field';
COMMENT ON COLUMN site_scan_jobs.submit_selector IS 'CSS selector for submit button';
COMMENT ON COLUMN site_scan_jobs.username_encrypted IS 'AES-256-GCM encrypted username';
COMMENT ON COLUMN site_scan_jobs.password_encrypted IS 'AES-256-GCM encrypted password';
COMMENT ON COLUMN site_scan_jobs.status IS 'Job status: queued, processing, completed, failed';

