-- Add trial tracking fields to users table
-- This migration adds the ability to track 7-day free trial period

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, expired, cancelled
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on subscription status
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_end_date ON users(trial_end_date);

-- Function to check if user's trial has expired
CREATE OR REPLACE FUNCTION check_trial_status(user_id_param UUID)
RETURNS TEXT AS $$
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

-- Function to automatically set trial dates when user is created
CREATE OR REPLACE FUNCTION set_trial_dates()
RETURNS TRIGGER AS $$
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

-- Create trigger to automatically set trial dates on user creation
DROP TRIGGER IF EXISTS set_trial_dates_trigger ON users;
CREATE TRIGGER set_trial_dates_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_dates();

-- Update existing users to have trial dates (set from their created_at date)
UPDATE users
SET 
  trial_start_date = COALESCE(trial_start_date, created_at),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '7 days'),
  subscription_status = CASE 
    WHEN subscription_tier != 'free' THEN 'active'
    WHEN created_at + INTERVAL '7 days' > NOW() THEN 'trial'
    ELSE 'expired'
  END
WHERE trial_start_date IS NULL;

-- Create a view for active users (trial not expired or has paid subscription)
CREATE OR REPLACE VIEW active_users AS
SELECT 
  u.*,
  CASE 
    WHEN u.subscription_tier != 'free' THEN true
    WHEN u.subscription_status = 'trial' AND u.trial_end_date > NOW() THEN true
    WHEN u.subscription_status = 'active' THEN true
    ELSE false
  END AS has_access
FROM users u;

COMMENT ON COLUMN users.trial_start_date IS 'Date when the user started their free trial';
COMMENT ON COLUMN users.trial_end_date IS 'Date when the user free trial expires (7 days after start)';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: trial, active, expired, cancelled';
COMMENT ON COLUMN users.subscription_start_date IS 'Date when paid subscription started';
COMMENT ON COLUMN users.subscription_end_date IS 'Date when paid subscription expires';

