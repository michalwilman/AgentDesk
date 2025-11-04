-- Update subscription tier values to match pricing page
-- Change from (free, pro, enterprise) to (starter, growth, plus, premium)

-- First, update the default value
ALTER TABLE users 
ALTER COLUMN subscription_tier SET DEFAULT 'starter';

-- Update existing users
-- Map old values to new values
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

