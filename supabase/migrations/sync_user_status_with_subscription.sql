-- ============================================================================
-- Sync User Status with Subscription
-- ============================================================================
-- This migration ensures user is_active status is automatically synced with subscription status:
-- 1. When subscription expires → is_active = false
-- 2. When trial ends → is_active = false
-- 3. When subscription is active → is_active = true
-- 4. Super admins are always active
-- ============================================================================

-- 1. Create function to sync user status with subscription
CREATE OR REPLACE FUNCTION sync_user_status_with_subscription()
RETURNS TABLE (
  updated_user_id UUID,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  old_is_active BOOLEAN,
  new_is_active BOOLEAN,
  reason TEXT
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH users_to_update AS (
    SELECT 
      u.id as user_id,
      u.email,
      u.role,
      u.is_active as current_is_active,
      CASE
        -- Super admins and admins are always active
        WHEN u.role IN ('super_admin', 'admin') THEN true
        -- User should be inactive if deleted
        WHEN u.deleted_at IS NOT NULL THEN false
        -- User should be inactive if trial expired
        WHEN u.subscription_status = 'trial' AND u.trial_end_date IS NOT NULL AND u.trial_end_date < NOW() THEN false
        -- User should be inactive if subscription is cancelled/expired
        WHEN u.subscription_status IN ('cancelled', 'expired') THEN false
        -- User should be inactive if marked as inactive manually
        WHEN u.subscription_status = 'inactive' THEN false
        -- Otherwise user should be active
        ELSE true
      END as should_be_active,
      CASE
        WHEN u.role IN ('super_admin', 'admin') THEN 'Admin user - always active'
        WHEN u.deleted_at IS NOT NULL THEN 'User marked for deletion'
        WHEN u.subscription_status = 'trial' AND u.trial_end_date IS NOT NULL AND u.trial_end_date < NOW() THEN 'Trial expired'
        WHEN u.subscription_status IN ('cancelled', 'expired') THEN 'Subscription expired'
        WHEN u.subscription_status = 'inactive' THEN 'Subscription inactive'
        ELSE 'Subscription active'
      END as status_reason
    FROM users u
    WHERE u.role != 'super_admin' AND u.role != 'admin' -- Don't check admins
  ),
  updated_users AS (
    UPDATE users
    SET is_active = users_to_update.should_be_active
    FROM users_to_update
    WHERE users.id = users_to_update.user_id
      AND users.is_active != users_to_update.should_be_active -- Only update if changed
    RETURNING 
      users.id,
      users.email,
      users.role,
      users_to_update.current_is_active,
      users.is_active,
      users_to_update.status_reason
  )
  SELECT 
    uu.id,
    uu.email,
    uu.role,
    uu.current_is_active,
    uu.is_active,
    uu.status_reason
  FROM updated_users uu
  INNER JOIN users_to_update utu ON uu.id = utu.user_id;
  
  RAISE NOTICE 'Finished sync_user_status_with_subscription.';
END;
$$;

-- 2. Create trigger function to sync user status on subscription change
CREATE OR REPLACE FUNCTION trigger_sync_user_status_on_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only run if subscription_status, trial_end_date, or deleted_at has changed
  IF OLD.subscription_status IS DISTINCT FROM NEW.subscription_status 
     OR OLD.trial_end_date IS DISTINCT FROM NEW.trial_end_date 
     OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at THEN
    
    -- Don't change admin status
    IF NEW.role IN ('super_admin', 'admin') THEN
      NEW.is_active := true;
      RETURN NEW;
    END IF;
    
    -- Update is_active based on subscription status
    IF NEW.deleted_at IS NOT NULL THEN
      NEW.is_active := false;
    ELSIF NEW.subscription_status = 'trial' AND NEW.trial_end_date IS NOT NULL AND NEW.trial_end_date < NOW() THEN
      NEW.is_active := false;
    ELSIF NEW.subscription_status IN ('cancelled', 'expired', 'inactive') THEN
      NEW.is_active := false;
    ELSE
      NEW.is_active := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Attach the trigger to the users table
DROP TRIGGER IF EXISTS update_user_status_on_subscription_change ON users;
CREATE TRIGGER update_user_status_on_subscription_change
BEFORE UPDATE OF subscription_status, trial_end_date, deleted_at ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_sync_user_status_on_subscription_change();

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION sync_user_status_with_subscription() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION trigger_sync_user_status_on_subscription_change() TO authenticated, service_role;

-- 5. Run initial sync to update all existing users
DO $$
DECLARE
  sync_result RECORD;
  total_synced INTEGER := 0;
BEGIN
  RAISE NOTICE 'Running initial user status sync...';
  
  FOR sync_result IN 
    SELECT * FROM sync_user_status_with_subscription()
  LOOP
    total_synced := total_synced + 1;
    RAISE NOTICE '✅ Updated user: % (%) - Status: % → % (Reason: %)',
      sync_result.user_email,
      sync_result.user_role,
      CASE WHEN sync_result.old_is_active THEN 'Active' ELSE 'Inactive' END,
      CASE WHEN sync_result.new_is_active THEN 'Active' ELSE 'Inactive' END,
      sync_result.reason;
  END LOOP;
  
  IF total_synced > 0 THEN
    RAISE NOTICE '✅ Synced % users', total_synced;
  ELSE
    RAISE NOTICE 'All users are already in sync';
  END IF;
END;
$$;

COMMENT ON FUNCTION sync_user_status_with_subscription() IS 'Syncs user is_active status with subscription status (trial/expired/active). Ignores admins.';
COMMENT ON FUNCTION trigger_sync_user_status_on_subscription_change() IS 'Trigger function: Automatically updates user is_active when subscription status changes';

