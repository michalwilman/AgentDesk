-- Add plan_type and usage tracking system
-- This enables multi-tier billing with starter/pro/enterprise plans

-- Add plan_type column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'starter' 
CHECK (plan_type IN ('starter', 'pro', 'enterprise'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);

-- Update existing users to have plan_type based on subscription_tier
-- This is a one-time migration to set initial values
UPDATE users 
SET plan_type = CASE 
  WHEN subscription_tier IN ('starter') THEN 'starter'
  WHEN subscription_tier IN ('growth', 'plus') THEN 'pro'
  WHEN subscription_tier = 'premium' THEN 'enterprise'
  ELSE 'starter'
END
WHERE plan_type IS NULL OR plan_type = 'starter';

-- Drop existing tables if they exist (to ensure clean migration)
DROP TABLE IF EXISTS message_logs;
DROP TABLE IF EXISTS monthly_usage;

-- Create monthly usage tracking table
CREATE TABLE monthly_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL, -- First day of month (e.g., 2025-11-01)
  
  -- Message counters
  sms_sent INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  email_sent INTEGER DEFAULT 0,
  
  -- Plan limits (snapshot from time of usage)
  sms_limit INTEGER,
  whatsapp_limit INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, bot_id, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_bot_month ON monthly_usage(bot_id, month);

-- Create message_logs table for detailed tracking
CREATE TABLE message_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('sms', 'whatsapp', 'email')),
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  twilio_sid TEXT,
  error_message TEXT,
  cost_estimate DECIMAL(10, 4), -- Estimated cost in USD
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_logs_user_sent ON message_logs(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_message_logs_bot_sent ON message_logs(bot_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_message_logs_type_sent ON message_logs(message_type, sent_at);

-- Add comments for documentation
COMMENT ON COLUMN users.plan_type IS 'User plan type: starter (email only), pro (shared Twilio), enterprise (BYOT)';
COMMENT ON TABLE monthly_usage IS 'Aggregated monthly message usage per user/bot for billing and limits';
COMMENT ON TABLE message_logs IS 'Detailed log of every message sent (SMS, WhatsApp, Email) with status and cost';

