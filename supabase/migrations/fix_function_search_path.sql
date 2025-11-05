-- ============================================================================
-- Fix Function Search Path Mutable Warnings
-- Date: 2025-11-05
-- Purpose: Add SET search_path = public to all functions to prevent security issues
-- ============================================================================

-- This migration fixes all "Function Search Path Mutable" warnings by explicitly
-- setting search_path on all functions. This prevents potential SQL injection
-- attacks where malicious schemas could be injected.

-- ============================================================================
-- TRIAL TRACKING FUNCTIONS
-- ============================================================================

-- Fix set_trial_dates
CREATE OR REPLACE FUNCTION set_trial_dates()
RETURNS TRIGGER 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Set trial dates only if not already set
  IF NEW.trial_start_date IS NULL THEN
    NEW.trial_start_date := NOW();
    NEW.trial_end_date := NOW() + INTERVAL '7 days';
    NEW.subscription_status := 'trial';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix check_trial_status
CREATE OR REPLACE FUNCTION check_trial_status(user_id_param UUID)
RETURNS TEXT
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  result TEXT;
BEGIN
  SELECT 
    subscription_status,
    trial_end_date,
    subscription_tier
  INTO user_record
  FROM users
  WHERE id = user_id_param;
  
  -- If user doesn't exist, return error
  IF NOT FOUND THEN
    RETURN 'user_not_found';
  END IF;
  
  -- If user has paid subscription (not 'free'), they're always active
  IF user_record.subscription_tier != 'free' THEN
    RETURN 'active';
  END IF;
  
  -- Check if trial has expired
  IF user_record.subscription_status = 'trial' AND 
     user_record.trial_end_date IS NOT NULL AND 
     user_record.trial_end_date < NOW() THEN
    -- Update status to expired
    UPDATE users 
    SET subscription_status = 'expired'
    WHERE id = user_id_param;
    
    RETURN 'expired';
  END IF;
  
  -- Return current status
  RETURN user_record.subscription_status;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE TRACKING FUNCTIONS
-- ============================================================================

-- Fix get_or_create_usage_tracking
CREATE OR REPLACE FUNCTION get_or_create_usage_tracking(user_id_param UUID)
RETURNS usage_tracking
SECURITY INVOKER
SET search_path = public
AS $$
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

-- Fix increment_conversation_usage
CREATE OR REPLACE FUNCTION increment_conversation_usage(user_id_param UUID)
RETURNS VOID
SECURITY INVOKER
SET search_path = public
AS $$
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

-- Fix increment_whatsapp_usage
CREATE OR REPLACE FUNCTION increment_whatsapp_usage(user_id_param UUID, count_param INTEGER DEFAULT 1)
RETURNS VOID
SECURITY INVOKER
SET search_path = public
AS $$
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

-- Fix can_user_perform_action
CREATE OR REPLACE FUNCTION can_user_perform_action(
  user_id_param UUID,
  action_type VARCHAR(50)
)
RETURNS JSONB
SECURITY INVOKER
SET search_path = public
AS $$
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
      IF plan_limits_record.max_bots = -1 THEN
        RETURN jsonb_build_object('allowed', true);
      END IF;
      
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
      IF NOT plan_limits_record.whatsapp_notifications THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'WhatsApp notifications not available in your plan'
        );
      END IF;
      
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

-- ============================================================================
-- TRIAL PERIOD FUNCTIONS
-- ============================================================================

-- Fix check_trial_expired
CREATE OR REPLACE FUNCTION check_trial_expired(user_id_param UUID)
RETURNS JSONB
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  days_remaining INTEGER;
  hours_remaining INTEGER;
  result JSONB;
BEGIN
  SELECT * INTO user_record
  FROM users
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'User not found'
    );
  END IF;
  
  -- If not on trial (has paid subscription), return active status
  IF user_record.subscription_status = 'active' THEN
    RETURN jsonb_build_object(
      'is_trial', false,
      'status', 'active',
      'plan', user_record.subscription_tier,
      'subscription_status', 'active'
    );
  END IF;
  
  -- Calculate remaining time
  IF user_record.trial_end_date IS NOT NULL THEN
    days_remaining := EXTRACT(DAY FROM (user_record.trial_end_date - NOW()))::INTEGER;
    hours_remaining := EXTRACT(HOUR FROM (user_record.trial_end_date - NOW()))::INTEGER;
  ELSE
    days_remaining := 0;
    hours_remaining := 0;
  END IF;
  
  -- Check if trial expired
  IF user_record.subscription_status = 'expired' OR (user_record.trial_end_date IS NOT NULL AND NOW() > user_record.trial_end_date) THEN
    -- Auto-update status if needed
    IF user_record.subscription_status != 'expired' THEN
      UPDATE users SET subscription_status = 'expired' WHERE id = user_id_param;
    END IF;
    
    RETURN jsonb_build_object(
      'is_trial', true,
      'status', 'expired',
      'subscription_status', 'expired',
      'expired_at', user_record.trial_end_date,
      'days_remaining', 0,
      'hours_remaining', 0,
      'message', 'Trial period has ended. Please upgrade to continue using AgentDesk.'
    );
  END IF;
  
  -- Trial is active
  RETURN jsonb_build_object(
    'is_trial', true,
    'status', 'active',
    'subscription_status', 'trial',
    'trial_start', user_record.trial_start_date,
    'trial_end', user_record.trial_end_date,
    'days_remaining', GREATEST(days_remaining, 0),
    'hours_remaining', GREATEST(hours_remaining, 0),
    'payment_method_added', COALESCE(user_record.payment_method_added, false),
    'reminder_sent', COALESCE(user_record.trial_reminder_sent, false),
    'message', format('You have %s days remaining in your free trial', GREATEST(days_remaining, 0))
  );
END;
$$ LANGUAGE plpgsql;

-- Fix get_users_needing_trial_reminder
CREATE OR REPLACE FUNCTION get_users_needing_trial_reminder()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER,
  subscription_tier VARCHAR(50),
  bots_created INTEGER,
  conversations_used INTEGER,
  whatsapp_messages_sent INTEGER
)
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.trial_end_date,
    EXTRACT(DAY FROM (u.trial_end_date - NOW()))::INTEGER as days_remaining,
    u.subscription_tier,
    COALESCE(ut.bots_created, 0) as bots_created,
    COALESCE(ut.conversations_used, 0) as conversations_used,
    COALESCE(ut.whatsapp_messages_sent, 0) as whatsapp_messages_sent
  FROM users u
  LEFT JOIN usage_tracking ut ON ut.user_id = u.id
    AND ut.tracking_month = EXTRACT(MONTH FROM NOW())
    AND ut.tracking_year = EXTRACT(YEAR FROM NOW())
  WHERE 
    u.is_trial = true
    AND u.trial_reminder_sent = false
    AND u.trial_end_date > NOW()
    AND u.trial_end_date <= NOW() + INTERVAL '2 days'
  ORDER BY u.trial_end_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Fix mark_trial_reminder_sent
CREATE OR REPLACE FUNCTION mark_trial_reminder_sent(user_id_param UUID)
RETURNS VOID
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET trial_reminder_sent = true
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fix convert_trial_to_paid
CREATE OR REPLACE FUNCTION convert_trial_to_paid(
  user_id_param UUID,
  new_tier VARCHAR(50),
  payment_method_id TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET 
    subscription_status = 'active',
    subscription_tier = new_tier,
    payment_method_added = CASE WHEN payment_method_id IS NOT NULL THEN true ELSE COALESCE(payment_method_added, false) END,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Successfully upgraded to %s plan', new_tier),
    'new_tier', new_tier
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIAL EXPIRATION FUNCTIONS
-- ============================================================================

-- Fix get_users_trial_expired_today
CREATE OR REPLACE FUNCTION get_users_trial_expired_today()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_tier VARCHAR(50),
  bots_created INTEGER,
  conversations_used INTEGER,
  whatsapp_messages_sent INTEGER
)
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.trial_end_date,
    u.subscription_tier,
    COALESCE(ut.bots_created, 0) as bots_created,
    COALESCE(ut.conversations_used, 0) as conversations_used,
    COALESCE(ut.whatsapp_messages_sent, 0) as whatsapp_messages_sent
  FROM users u
  LEFT JOIN usage_tracking ut ON ut.user_id = u.id
    AND ut.tracking_month = EXTRACT(MONTH FROM NOW())
    AND ut.tracking_year = EXTRACT(YEAR FROM NOW())
  WHERE 
    u.subscription_status = 'expired'
    AND u.trial_expired_email_sent = false
    AND u.trial_end_date IS NOT NULL
    AND u.trial_end_date >= NOW() - INTERVAL '24 hours'
    AND u.trial_end_date <= NOW()
  ORDER BY u.trial_end_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Fix mark_trial_expired_email_sent
CREATE OR REPLACE FUNCTION mark_trial_expired_email_sent(user_id_param UUID)
RETURNS VOID
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET trial_expired_email_sent = true
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION set_trial_dates IS 'Sets trial dates for new users - SEARCH PATH SECURED';
COMMENT ON FUNCTION check_trial_status IS 'Checks trial status - SEARCH PATH SECURED';
COMMENT ON FUNCTION get_or_create_usage_tracking IS 'Gets or creates usage tracking - SEARCH PATH SECURED';
COMMENT ON FUNCTION increment_conversation_usage IS 'Increments conversation usage - SEARCH PATH SECURED';
COMMENT ON FUNCTION increment_whatsapp_usage IS 'Increments WhatsApp usage - SEARCH PATH SECURED';
COMMENT ON FUNCTION can_user_perform_action IS 'Checks if user can perform action - SEARCH PATH SECURED';
COMMENT ON FUNCTION check_trial_expired IS 'Checks if trial expired - SEARCH PATH SECURED';
COMMENT ON FUNCTION get_users_needing_trial_reminder IS 'Gets users needing trial reminder - SEARCH PATH SECURED';
COMMENT ON FUNCTION mark_trial_reminder_sent IS 'Marks trial reminder sent - SEARCH PATH SECURED';
COMMENT ON FUNCTION convert_trial_to_paid IS 'Converts trial to paid - SEARCH PATH SECURED';
COMMENT ON FUNCTION get_users_trial_expired_today IS 'Gets users whose trial expired today - SEARCH PATH SECURED';
COMMENT ON FUNCTION mark_trial_expired_email_sent IS 'Marks trial expired email sent - SEARCH PATH SECURED';

-- ============================================================================
-- MIGRATION COMPLETE!
-- All functions now have SET search_path = public for security
-- This prevents "Function Search Path Mutable" warnings
-- ============================================================================

