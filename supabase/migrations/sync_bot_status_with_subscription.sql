-- ============================================================================
-- Sync Bot Status with User Subscription
-- ============================================================================
-- This migration ensures bots are automatically set to inactive when:
-- 1. User's subscription expires (trial or paid)
-- 2. User is marked for deletion
-- 3. User becomes inactive
-- ============================================================================

-- 1. Create function to sync bot status with user subscription
CREATE OR REPLACE FUNCTION sync_bot_status_with_user_subscription()
RETURNS TABLE (
  updated_bot_id UUID,
  bot_name TEXT,
  user_email TEXT,
  old_status BOOLEAN,
  new_status BOOLEAN,
  reason TEXT
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH bots_to_update AS (
    SELECT 
      b.id as bot_id,
      b.name as bot_name,
      b.is_active as current_status,
      u.email as owner_email,
      CASE
        -- Bot should be inactive if user is deleted
        WHEN u.deleted_at IS NOT NULL THEN false
        -- Bot should be inactive if user is inactive
        WHEN u.is_active = false THEN false
        -- Bot should be inactive if trial expired
        WHEN u.subscription_status = 'trial' AND u.trial_end_date < NOW() THEN false
        -- Bot should be inactive if subscription is cancelled/expired
        WHEN u.subscription_status IN ('cancelled', 'expired') THEN false
        -- Otherwise bot can be active
        ELSE true
      END as should_be_active,
      CASE
        WHEN u.deleted_at IS NOT NULL THEN 'User marked for deletion'
        WHEN u.is_active = false THEN 'User account inactive'
        WHEN u.subscription_status = 'trial' AND u.trial_end_date < NOW() THEN 'Trial expired'
        WHEN u.subscription_status IN ('cancelled', 'expired') THEN 'Subscription expired'
        ELSE 'Subscription active'
      END as status_reason
    FROM bots b
    INNER JOIN users u ON u.id = b.user_id
    WHERE b.is_active != CASE
      WHEN u.deleted_at IS NOT NULL THEN false
      WHEN u.is_active = false THEN false
      WHEN u.subscription_status = 'trial' AND u.trial_end_date < NOW() THEN false
      WHEN u.subscription_status IN ('cancelled', 'expired') THEN false
      ELSE true
    END
  ),
  updated_bots AS (
    UPDATE bots
    SET is_active = bots_to_update.should_be_active
    FROM bots_to_update
    WHERE bots.id = bots_to_update.bot_id
    RETURNING bots.id, bots.name, bots.is_active
  )
  SELECT 
    ub.id,
    ub.name,
    btu.owner_email,
    btu.current_status,
    ub.is_active,
    btu.status_reason
  FROM updated_bots ub
  INNER JOIN bots_to_update btu ON btu.bot_id = ub.id;
END;
$$;

-- 2. Create trigger function to sync bots when user subscription changes
CREATE OR REPLACE FUNCTION trigger_sync_bots_on_user_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if subscription-related fields changed
  IF (
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
    OLD.trial_end_date IS DISTINCT FROM NEW.trial_end_date OR
    OLD.is_active IS DISTINCT FROM NEW.is_active OR
    OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
  ) THEN
    -- Update all bots for this user
    UPDATE bots
    SET is_active = CASE
      -- Bot should be inactive if user is deleted
      WHEN NEW.deleted_at IS NOT NULL THEN false
      -- Bot should be inactive if user is inactive
      WHEN NEW.is_active = false THEN false
      -- Bot should be inactive if trial expired
      WHEN NEW.subscription_status = 'trial' AND NEW.trial_end_date < NOW() THEN false
      -- Bot should be inactive if subscription is cancelled/expired
      WHEN NEW.subscription_status IN ('cancelled', 'expired') THEN false
      -- Otherwise keep current status or set to true
      ELSE is_active
    END
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Create trigger on users table
DROP TRIGGER IF EXISTS trigger_sync_bots_on_user_subscription_change ON users;
CREATE TRIGGER trigger_sync_bots_on_user_subscription_change
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
    OLD.trial_end_date IS DISTINCT FROM NEW.trial_end_date OR
    OLD.is_active IS DISTINCT FROM NEW.is_active OR
    OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
  )
  EXECUTE FUNCTION trigger_sync_bots_on_user_change();

-- 4. Run initial sync for all existing bots
-- This will set bots to inactive if their owner's subscription is expired
DO $$
DECLARE
  sync_result RECORD;
  total_synced INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting initial bot status sync...';
  
  FOR sync_result IN 
    SELECT * FROM sync_bot_status_with_user_subscription()
  LOOP
    total_synced := total_synced + 1;
    RAISE NOTICE 'Updated bot: % (%) - Owner: % - Status: % -> % (Reason: %)',
      sync_result.bot_name,
      sync_result.updated_bot_id,
      sync_result.user_email,
      sync_result.old_status,
      sync_result.new_status,
      sync_result.reason;
  END LOOP;
  
  RAISE NOTICE 'Initial sync complete: % bots updated', total_synced;
END $$;

COMMENT ON FUNCTION sync_bot_status_with_user_subscription IS 'Syncs bot active status based on user subscription status';
COMMENT ON FUNCTION trigger_sync_bots_on_user_change IS 'Trigger function to automatically sync bots when user subscription changes';

