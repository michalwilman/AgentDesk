-- Add allowed_domains column to bots table
-- This allows restricting bot usage to specific domains for security

ALTER TABLE bots 
ADD COLUMN IF NOT EXISTS allowed_domains TEXT[] DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN bots.allowed_domains IS 'List of allowed domains that can use this bot. NULL or empty array = all domains allowed. Use "*" for wildcard.';

-- Example usage:
-- UPDATE bots SET allowed_domains = ARRAY['example.com', 'www.example.com'] WHERE id = 'bot-id';
-- UPDATE bots SET allowed_domains = ARRAY['*'] WHERE id = 'bot-id'; -- Allow all domains
-- UPDATE bots SET allowed_domains = NULL WHERE id = 'bot-id'; -- Allow all domains

