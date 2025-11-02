-- ============================================================================
-- Add Google Calendar OAuth columns to bot_actions_config
-- ============================================================================

-- Add Google Calendar OAuth columns if they don't exist
DO $$ 
BEGIN
    -- Add google_calendar_access_token if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bot_actions_config' 
        AND column_name = 'google_calendar_access_token'
    ) THEN
        ALTER TABLE bot_actions_config 
        ADD COLUMN google_calendar_access_token TEXT;
    END IF;

    -- Add google_calendar_refresh_token if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bot_actions_config' 
        AND column_name = 'google_calendar_refresh_token'
    ) THEN
        ALTER TABLE bot_actions_config 
        ADD COLUMN google_calendar_refresh_token TEXT;
    END IF;

    -- Add google_calendar_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bot_actions_config' 
        AND column_name = 'google_calendar_id'
    ) THEN
        ALTER TABLE bot_actions_config 
        ADD COLUMN google_calendar_id TEXT;
    END IF;

    -- Add google_calendar_email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bot_actions_config' 
        AND column_name = 'google_calendar_email'
    ) THEN
        ALTER TABLE bot_actions_config 
        ADD COLUMN google_calendar_email TEXT;
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN bot_actions_config.google_calendar_access_token IS 'Google Calendar OAuth access token';
COMMENT ON COLUMN bot_actions_config.google_calendar_refresh_token IS 'Google Calendar OAuth refresh token';
COMMENT ON COLUMN bot_actions_config.google_calendar_id IS 'Google Calendar ID to use for appointments';
COMMENT ON COLUMN bot_actions_config.google_calendar_email IS 'Email address of connected Google Calendar account';

