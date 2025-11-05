-- ============================================================================
-- User Deletion System
-- ============================================================================
-- This migration adds a comprehensive user deletion system with:
-- 1. Fix Super Admin subscription
-- 2. Soft delete (30 days retention)
-- 3. Automatic marking for deletion (3 days after trial expiry)
-- 4. Permanent deletion after 30 days
-- ============================================================================

-- 1. Fix Super Admin subscription
-- Update admin@agentdesk.system to have premium subscription without trial
UPDATE users
SET 
  subscription_status = 'active',
  subscription_tier = 'premium',
  trial_start_date = NULL,
  trial_end_date = NULL
WHERE email = 'admin@agentdesk.system' AND role = 'super_admin';

-- 2. Add deleted_at column for soft delete
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for efficient queries on deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- 3. Create function to mark expired trial users for deletion
-- This runs 3 days after trial expiry
CREATE OR REPLACE FUNCTION mark_expired_users_for_deletion()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  trial_expired_date TIMESTAMPTZ
) 
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH marked_users AS (
    UPDATE users
    SET 
      deleted_at = NOW(),
      is_active = false
    WHERE 
      role = 'user'
      AND subscription_status = 'trial'
      AND trial_end_date IS NOT NULL
      AND trial_end_date < NOW() - INTERVAL '3 days'
      AND deleted_at IS NULL
      AND is_active = true
    RETURNING id, email, trial_end_date
  )
  SELECT 
    id,
    email,
    trial_end_date
  FROM marked_users;
END;
$$;

-- 4. Create function to permanently delete users
-- This runs 30 days after soft delete
CREATE OR REPLACE FUNCTION permanently_delete_users()
RETURNS TABLE (
  deleted_user_id UUID,
  deleted_email TEXT,
  deletion_date TIMESTAMPTZ
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH users_to_delete AS (
    SELECT id, email, deleted_at
    FROM users
    WHERE 
      role = 'user'
      AND deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days'
  ),
  deleted_bots AS (
    -- Delete user's bots and related data
    DELETE FROM bots
    WHERE user_id IN (SELECT id FROM users_to_delete)
    RETURNING user_id
  ),
  deleted_usage AS (
    -- Delete usage tracking
    DELETE FROM usage_tracking
    WHERE user_id IN (SELECT id FROM users_to_delete)
    RETURNING user_id
  ),
  deleted_users AS (
    -- Finally delete the user
    DELETE FROM users
    WHERE id IN (SELECT id FROM users_to_delete)
    RETURNING id, email, deleted_at
  )
  SELECT 
    id,
    email,
    deleted_at
  FROM deleted_users;
END;
$$;

-- 5. Create function to get users pending deletion
-- This helps admins see who's about to be deleted
CREATE OR REPLACE FUNCTION get_users_pending_deletion()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  deleted_at TIMESTAMPTZ,
  days_until_permanent_deletion INTEGER
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    users.email,
    users.full_name,
    users.deleted_at,
    30 - EXTRACT(DAY FROM (NOW() - users.deleted_at))::INTEGER as days_until_permanent_deletion
  FROM users
  WHERE 
    role = 'user'
    AND deleted_at IS NOT NULL
    AND deleted_at > NOW() - INTERVAL '30 days'
  ORDER BY deleted_at ASC;
END;
$$;

-- 6. Create helper function to restore a soft-deleted user
CREATE OR REPLACE FUNCTION restore_deleted_user(user_email TEXT)
RETURNS TABLE (
  restored_user_id UUID,
  restored_email TEXT,
  message TEXT
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Update the user to restore them
  UPDATE users
  SET 
    deleted_at = NULL,
    is_active = true,
    subscription_status = 'trial',
    trial_start_date = NOW(),
    trial_end_date = NOW() + INTERVAL '7 days'
  WHERE 
    email = user_email
    AND deleted_at IS NOT NULL
    AND deleted_at > NOW() - INTERVAL '30 days'
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found or already permanently deleted';
  END IF;

  RETURN QUERY
  SELECT 
    v_user_id,
    user_email,
    'User restored successfully with 7-day trial'::TEXT;
END;
$$;

-- 7. Update admin_users_summary view to include deletion status
DROP VIEW IF EXISTS admin_users_summary CASCADE;

CREATE OR REPLACE VIEW admin_users_summary
WITH (security_invoker = true) AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.company_name,
  u.role,
  u.subscription_tier,
  u.subscription_status,
  u.trial_start_date,
  u.trial_end_date,
  u.is_active,
  u.created_at,
  u.deleted_at,
  -- Calculate user status
  CASE
    WHEN u.deleted_at IS NOT NULL THEN 'pending_deletion'
    WHEN u.subscription_status = 'active' AND u.subscription_tier != 'trial' THEN 'active'
    WHEN u.subscription_status = 'trial' AND u.trial_end_date > NOW() THEN 'trial'
    WHEN u.subscription_status = 'trial' AND u.trial_end_date <= NOW() THEN 'expired'
    ELSE 'inactive'
  END as user_status,
  -- Days until permanent deletion (if soft deleted)
  CASE
    WHEN u.deleted_at IS NOT NULL THEN 
      30 - EXTRACT(DAY FROM (NOW() - u.deleted_at))::INTEGER
    ELSE NULL
  END as days_until_deletion,
  COUNT(DISTINCT b.id) as total_bots,
  COUNT(DISTINCT c.id) as total_chats,
  COALESCE(ut.conversations_used, 0) as conversations_this_month,
  COALESCE(ut.whatsapp_messages_sent, 0) as whatsapp_messages_this_month
FROM users u
LEFT JOIN bots b ON b.user_id = u.id
LEFT JOIN chats c ON c.bot_id = b.id
LEFT JOIN usage_tracking ut ON ut.user_id = u.id
  AND ut.tracking_month = EXTRACT(MONTH FROM NOW())
  AND ut.tracking_year = EXTRACT(YEAR FROM NOW())
GROUP BY u.id, u.email, u.full_name, u.company_name, u.role, 
         u.subscription_tier, u.subscription_status, u.trial_start_date,
         u.trial_end_date, u.is_active, u.created_at, u.deleted_at,
         ut.conversations_used, ut.whatsapp_messages_sent;

-- Grant permissions
GRANT SELECT ON admin_users_summary TO authenticated;

-- 8. Create a tracking table for deletion events (for audit)
CREATE TABLE IF NOT EXISTS user_deletion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  deletion_type TEXT NOT NULL CHECK (deletion_type IN ('soft_delete', 'permanent_delete', 'restored')),
  reason TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  performed_by UUID REFERENCES users(id)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_deletion_log_user_id ON user_deletion_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deletion_log_performed_at ON user_deletion_log(performed_at);

-- Grant permissions
GRANT SELECT, INSERT ON user_deletion_log TO authenticated;

-- 9. Add trigger to log deletion events
CREATE OR REPLACE FUNCTION log_user_deletion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log soft delete
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO user_deletion_log (user_id, user_email, deletion_type, reason)
    VALUES (
      NEW.id,
      NEW.email,
      'soft_delete',
      'User marked for deletion after trial expiry'
    );
  END IF;
  
  -- Log restore
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    INSERT INTO user_deletion_log (user_id, user_email, deletion_type, reason)
    VALUES (
      NEW.id,
      NEW.email,
      'restored',
      'User account restored'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_user_deletion ON users;
CREATE TRIGGER trigger_log_user_deletion
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
  EXECUTE FUNCTION log_user_deletion();

COMMENT ON TABLE user_deletion_log IS 'Audit log for user deletion and restoration events';
COMMENT ON FUNCTION mark_expired_users_for_deletion IS 'Marks users for deletion 3 days after trial expiry';
COMMENT ON FUNCTION permanently_delete_users IS 'Permanently deletes users 30 days after soft delete';
COMMENT ON FUNCTION get_users_pending_deletion IS 'Returns list of users pending permanent deletion';
COMMENT ON FUNCTION restore_deleted_user IS 'Restores a soft-deleted user with a new 7-day trial';

