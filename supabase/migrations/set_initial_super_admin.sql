-- ============================================================================
-- Set Initial Super Admin
-- Date: 2025-11-05
-- Purpose: Set the initial super admin user for the system
-- ============================================================================

-- Set Michal as the initial super admin
UPDATE users 
SET 
  role = 'super_admin',
  role_updated_at = NOW(),
  role_updated_by = id  -- Self-promoted (initial setup)
WHERE email = 'michal.vilman@gmail.com'
  AND role != 'super_admin';  -- Only if not already super_admin

-- Verify the update
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM users
  WHERE email = 'michal.vilman@gmail.com' AND role = 'super_admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'SUCCESS: Super admin set for michal.vilman@gmail.com';
  ELSE
    RAISE WARNING 'WARNING: Could not find user with email michal.vilman@gmail.com';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

