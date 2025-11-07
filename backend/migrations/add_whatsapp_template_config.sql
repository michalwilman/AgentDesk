-- Add WhatsApp Template configuration to bot_actions_config
-- This allows bots to use approved Meta/Facebook WhatsApp templates

-- Add columns for WhatsApp Template configuration
ALTER TABLE bot_actions_config 
ADD COLUMN IF NOT EXISTS whatsapp_template_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_template_language VARCHAR(10) DEFAULT 'he';

-- Add comments for documentation
COMMENT ON COLUMN bot_actions_config.whatsapp_template_name IS 'Name of approved WhatsApp template from Meta/Facebook Business';
COMMENT ON COLUMN bot_actions_config.whatsapp_template_language IS 'Language code of WhatsApp template (e.g., he, en, ar)';

