-- ============================================================================
-- AgentDesk Plan Limits & Usage Tracking System
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Update Subscription Tiers
-- ============================================================================

-- Update subscription tier values to match pricing page
-- Change from (free, pro, enterprise) to (starter, growth, plus, premium)

-- First, update the default value
ALTER TABLE users 
ALTER COLUMN subscription_tier SET DEFAULT 'starter';

-- Update existing users - Map old values to new values
UPDATE users SET subscription_tier = 
  CASE subscription_tier
    WHEN 'free' THEN 'starter'  -- Free users get starter (with trial)
    WHEN 'pro' THEN 'growth'    -- Pro maps to growth
    WHEN 'enterprise' THEN 'plus' -- Enterprise maps to plus
    ELSE 'starter'               -- Any other value defaults to starter
  END;

-- Add check constraint to ensure only valid tier values
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'growth', 'plus', 'premium'));

-- Update comments
COMMENT ON COLUMN users.subscription_tier IS 'Subscription plan: starter ($24.17/mo), growth ($49.17/mo), plus ($749/mo), premium (custom)';


-- ============================================================================
-- MIGRATION 2: Create Plan Limits Table
-- ============================================================================

-- Create plan_limits table to define limits for each subscription tier
CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  
  -- Bot limits
  max_bots INTEGER NOT NULL,
  
  -- Conversation limits (per month)
  max_conversations INTEGER NOT NULL,
  
  -- WhatsApp limits (per month, -1 means unlimited)
  max_whatsapp_messages INTEGER NOT NULL,
  
  -- Feature flags
  email_notifications BOOLEAN DEFAULT TRUE,
  google_calendar_sync BOOLEAN DEFAULT TRUE,
  whatsapp_notifications BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  lead_collection BOOLEAN DEFAULT TRUE,
  basic_analytics BOOLEAN DEFAULT TRUE,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  remove_branding BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  webhook_integrations BOOLEAN DEFAULT FALSE,
  custom_branding BOOLEAN DEFAULT FALSE,
  bring_own_twilio BOOLEAN DEFAULT FALSE,
  multiple_team_members BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  sla_guarantee BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert plan limits matching the pricing page
INSERT INTO plan_limits (
  plan_name,
  max_bots,
  max_conversations,
  max_whatsapp_messages,
  email_notifications,
  google_calendar_sync,
  whatsapp_notifications,
  appointment_reminders,
  lead_collection,
  basic_analytics,
  advanced_analytics,
  remove_branding,
  priority_support,
  webhook_integrations,
  custom_branding,
  bring_own_twilio,
  multiple_team_members,
  api_access,
  sla_guarantee
) VALUES 
  -- Starter Plan ($24.17/mo)
  (
    'starter',
    1,      -- 1 AI Bot
    100,    -- 100 AI conversations/month
    500,    -- WhatsApp notifications (up to 500/mo)
    true,   -- Email notifications (included)
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection & management
    true,   -- Basic analytics
    false,  -- No advanced analytics
    false,  -- Keep branding
    false,  -- No priority support
    false,  -- No webhook integrations
    false,  -- No custom branding
    false,  -- No bring own Twilio
    false,  -- No multiple team members
    false,  -- No API access
    false   -- No SLA guarantee
  ),
  
  -- Growth Plan ($49.17/mo)
  (
    'growth',
    3,      -- 3 AI Bots
    250,    -- 250 AI conversations/month
    -1,     -- Unlimited WhatsApp notifications
    true,   -- Email notifications
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection
    true,   -- Basic analytics
    true,   -- Advanced analytics
    true,   -- Remove AgentDesk branding
    true,   -- Priority support
    true,   -- Webhook integrations
    false,  -- No custom branding (just remove branding)
    false,  -- No bring own Twilio
    false,  -- No multiple team members
    false,  -- No API access
    false   -- No SLA guarantee
  ),
  
  -- Plus Plan ($749/mo)
  (
    'plus',
    -1,     -- Unlimited AI Bots
    -1,     -- Custom AI conversation quota (unlimited)
    -1,     -- Unlimited WhatsApp notifications
    true,   -- Email notifications
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection
    true,   -- Basic analytics
    true,   -- Advanced analytics
    true,   -- Remove branding
    true,   -- Priority support
    true,   -- Webhook integrations
    true,   -- Custom branding & white label
    true,   -- Bring your own Twilio (optional)
    true,   -- Multiple team members
    true,   -- API access (OpenAPI)
    true    -- SLA guarantee
  ),
  
  -- Premium Plan (Custom pricing)
  (
    'premium',
    -1,     -- Unlimited AI Bots
    -1,     -- Unlimited AI conversations
    -1,     -- Unlimited WhatsApp
    true,   -- All features enabled
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  )
ON CONFLICT (plan_name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_plan_limits_plan_name ON plan_limits(plan_name);

-- Add comments
COMMENT ON TABLE plan_limits IS 'Defines limits and features for each subscription plan';
COMMENT ON COLUMN plan_limits.max_bots IS 'Maximum number of bots allowed (-1 = unlimited)';
COMMENT ON COLUMN plan_limits.max_conversations IS 'Maximum AI conversations per month (-1 = unlimited)';
COMMENT ON COLUMN plan_limits.max_whatsapp_messages IS 'Maximum WhatsApp messages per month (-1 = unlimited)';


-- ============================================================================
-- MIGRATION 3: Create Usage Tracking Table & Functions
-- ============================================================================

-- Create usage_tracking table to track monthly usage per user
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Current month/year being tracked
  tracking_month INTEGER NOT NULL, -- 1-12
  tracking_year INTEGER NOT NULL,  -- e.g., 2025
  
  -- Usage counters
  bots_created INTEGER DEFAULT 0,
  conversations_used INTEGER DEFAULT 0,
  whatsapp_messages_sent INTEGER DEFAULT 0,
  sms_messages_sent INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one row per user per month
  UNIQUE(user_id, tracking_month, tracking_year)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON usage_tracking(tracking_month, tracking_year);

-- Function to get or create current month's usage tracking
CREATE OR REPLACE FUNCTION get_or_create_usage_tracking(user_id_param UUID)
RETURNS usage_tracking AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  usage_record usage_tracking;
BEGIN
  -- Get current month and year
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Try to get existing record
  SELECT * INTO usage_record
  FROM usage_tracking
  WHERE user_id = user_id_param
    AND tracking_month = current_month
    AND tracking_year = current_year;
  
  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO usage_tracking (user_id, tracking_month, tracking_year)
    VALUES (user_id_param, current_month, current_year)
    RETURNING * INTO usage_record;
  END IF;
  
  RETURN usage_record;
END;
$$ LANGUAGE plpgsql;

-- Function to increment conversation usage
CREATE OR REPLACE FUNCTION increment_conversation_usage(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  INSERT INTO usage_tracking (user_id, tracking_month, tracking_year, conversations_used)
  VALUES (user_id_param, current_month, current_year, 1)
  ON CONFLICT (user_id, tracking_month, tracking_year)
  DO UPDATE SET 
    conversations_used = usage_tracking.conversations_used + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment WhatsApp usage
CREATE OR REPLACE FUNCTION increment_whatsapp_usage(user_id_param UUID, count_param INTEGER DEFAULT 1)
RETURNS VOID AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  INSERT INTO usage_tracking (user_id, tracking_month, tracking_year, whatsapp_messages_sent)
  VALUES (user_id_param, current_month, current_year, count_param)
  ON CONFLICT (user_id, tracking_month, tracking_year)
  DO UPDATE SET 
    whatsapp_messages_sent = usage_tracking.whatsapp_messages_sent + count_param,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can perform action based on their plan limits
CREATE OR REPLACE FUNCTION can_user_perform_action(
  user_id_param UUID,
  action_type VARCHAR(50) -- 'create_bot', 'send_message', 'send_whatsapp'
)
RETURNS JSONB AS $$
DECLARE
  user_tier VARCHAR(50);
  plan_limits_record RECORD;
  usage_record RECORD;
  result JSONB;
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'User not found'
    );
  END IF;
  
  -- Get plan limits
  SELECT * INTO plan_limits_record
  FROM plan_limits
  WHERE plan_name = user_tier;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Invalid subscription tier'
    );
  END IF;
  
  -- Get current usage
  SELECT * INTO usage_record
  FROM usage_tracking
  WHERE user_id = user_id_param
    AND tracking_month = current_month
    AND tracking_year = current_year;
  
  -- If no usage record, create one
  IF NOT FOUND THEN
    usage_record := row(
      gen_random_uuid(), user_id_param, current_month, current_year,
      0, 0, 0, 0, NOW(), NOW()
    )::usage_tracking;
  END IF;
  
  -- Check specific action
  CASE action_type
    WHEN 'create_bot' THEN
      -- Check bot limit (-1 means unlimited)
      IF plan_limits_record.max_bots = -1 THEN
        RETURN jsonb_build_object('allowed', true);
      END IF;
      
      -- Count user's bots
      IF (SELECT COUNT(*) FROM bots WHERE user_id = user_id_param) >= plan_limits_record.max_bots THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', format('Bot limit reached. Your plan allows %s bot(s).', plan_limits_record.max_bots),
          'limit', plan_limits_record.max_bots,
          'current', (SELECT COUNT(*) FROM bots WHERE user_id = user_id_param)
        );
      END IF;
      
      RETURN jsonb_build_object('allowed', true);
      
    WHEN 'send_message' THEN
      -- Check conversation limit
      IF plan_limits_record.max_conversations = -1 THEN
        RETURN jsonb_build_object('allowed', true);
      END IF;
      
      IF usage_record.conversations_used >= plan_limits_record.max_conversations THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', format('Monthly conversation limit reached. Your plan allows %s conversations/month.', plan_limits_record.max_conversations),
          'limit', plan_limits_record.max_conversations,
          'current', usage_record.conversations_used
        );
      END IF;
      
      RETURN jsonb_build_object('allowed', true);
      
    WHEN 'send_whatsapp' THEN
      -- Check WhatsApp feature
      IF NOT plan_limits_record.whatsapp_notifications THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'WhatsApp notifications not available in your plan'
        );
      END IF;
      
      -- Check WhatsApp limit
      IF plan_limits_record.max_whatsapp_messages = -1 THEN
        RETURN jsonb_build_object('allowed', true);
      END IF;
      
      IF usage_record.whatsapp_messages_sent >= plan_limits_record.max_whatsapp_messages THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', format('Monthly WhatsApp limit reached. Your plan allows %s messages/month.', plan_limits_record.max_whatsapp_messages),
          'limit', plan_limits_record.max_whatsapp_messages,
          'current', usage_record.whatsapp_messages_sent
        );
      END IF;
      
      RETURN jsonb_build_object('allowed', true);
      
    ELSE
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Unknown action type'
      );
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE usage_tracking IS 'Tracks monthly usage per user to enforce plan limits';
COMMENT ON FUNCTION get_or_create_usage_tracking IS 'Gets or creates usage tracking record for current month';
COMMENT ON FUNCTION increment_conversation_usage IS 'Increments conversation counter for current month';
COMMENT ON FUNCTION increment_whatsapp_usage IS 'Increments WhatsApp message counter for current month';
COMMENT ON FUNCTION can_user_perform_action IS 'Checks if user can perform action based on their plan and current usage';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- You can now test the system:
-- SELECT * FROM plan_limits;
-- SELECT * FROM usage_tracking;
-- SELECT can_user_perform_action('your-user-id', 'create_bot');
-- ============================================================================

