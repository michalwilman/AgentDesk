-- ============================================================================
-- Add Trial Expired Notification Function
-- ============================================================================

-- Add column to track if trial expired email was sent
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_expired_email_sent BOOLEAN DEFAULT false;

-- Function to get users whose trial expired today (for sending email)
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
) AS $$
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

-- Function to mark trial expired email as sent
CREATE OR REPLACE FUNCTION mark_trial_expired_email_sent(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET trial_expired_email_sent = true
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON COLUMN users.trial_expired_email_sent IS 'Whether we sent the trial expired email';
COMMENT ON FUNCTION get_users_trial_expired_today IS 'Gets users whose trial expired in the last 24 hours for sending notification email';
COMMENT ON FUNCTION mark_trial_expired_email_sent IS 'Marks that we sent the trial expired email';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

