-- Migration: Add External Channel Connections
-- Add support for Telegram and WhatsApp (Twilio) integrations

ALTER TABLE bots
ADD COLUMN IF NOT EXISTS telegram_token TEXT NULL,
ADD COLUMN IF NOT EXISTS telegram_bot_username TEXT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_sid TEXT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_auth_token TEXT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT NULL;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_bots_telegram_token ON bots(telegram_token) WHERE telegram_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bots_whatsapp_sid ON bots(whatsapp_sid) WHERE whatsapp_sid IS NOT NULL;

COMMENT ON COLUMN bots.telegram_token IS 'Telegram Bot API token for webhook integration';
COMMENT ON COLUMN bots.telegram_bot_username IS 'Telegram bot username (without @)';
COMMENT ON COLUMN bots.whatsapp_sid IS 'Twilio Account SID for WhatsApp integration';
COMMENT ON COLUMN bots.whatsapp_auth_token IS 'Twilio Auth Token for WhatsApp integration';
COMMENT ON COLUMN bots.whatsapp_phone_number IS 'WhatsApp phone number in E.164 format';

