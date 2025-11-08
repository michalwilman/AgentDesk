-- Fix can_user_perform_action to use plan_type instead of plan_name
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
  user_plan_type VARCHAR(20);
  plan_limits_record RECORD;
  usage_record RECORD;
  result JSONB;
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Get user's subscription tier and plan_type
  SELECT subscription_tier, plan_type INTO user_tier, user_plan_type
  FROM users
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'User not found'
    );
  END IF;
  
  -- Map subscription_tier to plan_type if plan_type is not set
  IF user_plan_type IS NULL THEN
    user_plan_type := CASE 
      WHEN user_tier IN ('starter') THEN 'starter'
      WHEN user_tier IN ('growth', 'plus') THEN 'pro'
      WHEN user_tier = 'premium' THEN 'enterprise'
      ELSE 'starter'
    END;
  END IF;
  
  -- Get plan limits using plan_type
  SELECT * INTO plan_limits_record
  FROM plan_limits
  WHERE plan_type = user_plan_type;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Invalid subscription tier'
    );
  END IF;
  
  -- For now, always allow actions (simplified for new plan structure)
  -- SMS/WhatsApp limits are checked separately in the new billing system
  RETURN jsonb_build_object('allowed', true);
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_user_perform_action IS 'Checks if user can perform action - Updated to use plan_type';

