-- Add error tracking columns to bot_actions_config
-- This allows us to track and display errors in Calendar and Email services

-- Add columns for tracking Google Calendar errors
ALTER TABLE bot_actions_config 
ADD COLUMN IF NOT EXISTS google_calendar_last_error TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_last_error_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS google_calendar_last_success_time TIMESTAMP WITH TIME ZONE;

-- Add columns for tracking Email service errors
ALTER TABLE bot_actions_config 
ADD COLUMN IF NOT EXISTS email_last_error TEXT,
ADD COLUMN IF NOT EXISTS email_last_error_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_last_success_time TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN bot_actions_config.google_calendar_last_error IS 'Last error message from Google Calendar integration';
COMMENT ON COLUMN bot_actions_config.google_calendar_last_error_time IS 'Timestamp of last Google Calendar error';
COMMENT ON COLUMN bot_actions_config.google_calendar_last_success_time IS 'Timestamp of last successful Google Calendar operation';
COMMENT ON COLUMN bot_actions_config.email_last_error IS 'Last error message from email service';
COMMENT ON COLUMN bot_actions_config.email_last_error_time IS 'Timestamp of last email error';
COMMENT ON COLUMN bot_actions_config.email_last_success_time IS 'Timestamp of last successful email send';

