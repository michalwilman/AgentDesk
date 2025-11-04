-- ============================================================================
-- Trial Period System Migration
-- Run this in Supabase SQL Editor AFTER running the previous migrations
-- ============================================================================

-- Add trial-related columns (trial_start_date and trial_end_date should already exist)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method_added BOOLEAN DEFAULT false;

-- Set default trial period for existing users (7 days from account creation)
UPDATE users
SET 
  trial_start_date = COALESCE(trial_start_date, created_at),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '7 days'),
  subscription_status = CASE 
    WHEN subscription_tier IN ('growth', 'plus', 'premium') THEN 'active'
    WHEN trial_end_date IS NOT NULL AND trial_end_date > NOW() THEN 'trial'
    WHEN trial_end_date IS NOT NULL AND trial_end_date <= NOW() THEN 'expired'
    ELSE 'trial'
  END,
  trial_reminder_sent = COALESCE(trial_reminder_sent, false),
  payment_method_added = COALESCE(payment_method_added, false)
WHERE trial_start_date IS NULL OR subscription_status IS NULL;

-- Add constraint for subscription_status
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_subscription_status_check;

ALTER TABLE users 
ADD CONSTRAINT users_subscription_status_check 
CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

-- Function to check if trial has expired
CREATE OR REPLACE FUNCTION check_trial_expired(user_id_param UUID)
RETURNS JSONB AS $$
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

-- Function to get users needing trial reminder (2 days before expiry)
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
) AS $$
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
    u.subscription_status = 'trial'
    AND u.trial_reminder_sent = false
    AND u.trial_end_date > NOW()
    AND u.trial_end_date <= NOW() + INTERVAL '2 days'
  ORDER BY u.trial_end_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION mark_trial_reminder_sent(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET trial_reminder_sent = true
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to convert trial to paid
CREATE OR REPLACE FUNCTION convert_trial_to_paid(
  user_id_param UUID,
  new_tier VARCHAR(50),
  payment_method_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
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

-- Add comments
COMMENT ON COLUMN users.trial_start_date IS 'When the user started their free trial';
COMMENT ON COLUMN users.trial_end_date IS 'When the user free trial expires';
COMMENT ON COLUMN users.subscription_status IS 'User subscription status: trial, active, expired, cancelled';
COMMENT ON COLUMN users.trial_reminder_sent IS 'Whether we sent a reminder email about trial expiring';
COMMENT ON COLUMN users.payment_method_added IS 'Whether user added a payment method';

COMMENT ON FUNCTION check_trial_expired IS 'Checks if a users trial has expired and returns trial status';
COMMENT ON FUNCTION get_users_needing_trial_reminder IS 'Gets list of users who need trial expiry reminder (2 days before)';
COMMENT ON FUNCTION mark_trial_reminder_sent IS 'Marks that we sent the trial reminder email';
COMMENT ON FUNCTION convert_trial_to_paid IS 'Converts a trial user to a paid subscription';

-- ============================================================================
-- Test the functions:
-- SELECT check_trial_expired('your-user-id');
-- SELECT * FROM get_users_needing_trial_reminder();
-- ============================================================================

