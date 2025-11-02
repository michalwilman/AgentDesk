-- Configure allowed domains for Michal's bot
-- This restricts the bot to only work on tirufai.com

-- Update the bot with allowed domains
UPDATE bots 
SET allowed_domains = ARRAY['tirufai.com', 'www.tirufai.com']
WHERE id = '0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31';

-- Verify the update
SELECT id, name, allowed_domains 
FROM bots 
WHERE id = '0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31';

