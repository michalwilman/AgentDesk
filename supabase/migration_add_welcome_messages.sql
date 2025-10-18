-- Migration: Add welcome_messages field to bots table
-- This migration adds support for multiple welcome messages with backward compatibility

-- Add the new welcome_messages column
ALTER TABLE bots 
ADD COLUMN IF NOT EXISTS welcome_messages JSONB DEFAULT '[]'::jsonb;

-- Migrate existing welcome_message to welcome_messages array
-- Only for rows that don't have welcome_messages set yet
UPDATE bots 
SET welcome_messages = jsonb_build_array(welcome_message)
WHERE welcome_messages = '[]'::jsonb 
  AND welcome_message IS NOT NULL;

-- Set default for rows with no welcome message
UPDATE bots 
SET welcome_messages = '["Hello! How can I help you today?"]'::jsonb
WHERE welcome_messages = '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN bots.welcome_messages IS 'Array of welcome messages shown sequentially when chat starts. First message is also stored in welcome_message for backward compatibility.';

