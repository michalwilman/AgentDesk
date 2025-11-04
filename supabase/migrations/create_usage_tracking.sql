-- Create usage_tracking table to track monthly usage per user
-- This resets every month to enforce monthly limits

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
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_month_year ON usage_tracking(tracking_month, tracking_year);

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

