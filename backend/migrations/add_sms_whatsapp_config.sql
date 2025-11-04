-- Add SMS/WhatsApp notification configuration to bot_actions_config
-- This allows bots to send appointment confirmations and reminders via SMS and WhatsApp

-- Add columns for SMS/WhatsApp configuration
ALTER TABLE bot_actions_config 
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT,
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT,
ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT,
ADD COLUMN IF NOT EXISTS twilio_whatsapp_number TEXT;

-- Add columns for tracking SMS/WhatsApp service errors
ALTER TABLE bot_actions_config 
ADD COLUMN IF NOT EXISTS sms_last_error TEXT,
ADD COLUMN IF NOT EXISTS sms_last_error_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sms_last_success_time TIMESTAMP WITH TIME ZONE;

-- Add column to appointments to track if reminder was sent
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN bot_actions_config.sms_enabled IS 'Enable SMS notifications for appointments';
COMMENT ON COLUMN bot_actions_config.whatsapp_enabled IS 'Enable WhatsApp notifications for appointments';
COMMENT ON COLUMN bot_actions_config.reminder_enabled IS 'Enable reminder 24 hours before appointment';
COMMENT ON COLUMN bot_actions_config.twilio_account_sid IS 'Twilio Account SID for SMS/WhatsApp';
COMMENT ON COLUMN bot_actions_config.twilio_auth_token IS 'Twilio Auth Token (encrypted)';
COMMENT ON COLUMN bot_actions_config.twilio_phone_number IS 'Twilio phone number for SMS (E.164 format)';
COMMENT ON COLUMN bot_actions_config.twilio_whatsapp_number IS 'Twilio WhatsApp number (E.164 format with whatsapp: prefix)';
COMMENT ON COLUMN bot_actions_config.sms_last_error IS 'Last error message from SMS/WhatsApp service';
COMMENT ON COLUMN bot_actions_config.sms_last_error_time IS 'Timestamp of last SMS/WhatsApp error';
COMMENT ON COLUMN bot_actions_config.sms_last_success_time IS 'Timestamp of last successful SMS/WhatsApp send';
COMMENT ON COLUMN appointments.reminder_sent IS 'Whether a reminder was sent 24h before the appointment';
COMMENT ON COLUMN appointments.reminder_sent_at IS 'Timestamp when reminder was sent';

