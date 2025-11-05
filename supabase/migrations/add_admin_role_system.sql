-- ============================================================================
-- Add Admin Role System
-- Date: 2025-11-05
-- Purpose: Create secure admin dashboard with role-based access control
-- ============================================================================

-- This migration adds a comprehensive role-based access system with three levels:
-- 1. user (default) - Regular customers
-- 2. admin - Support staff with read access to all data
-- 3. super_admin - Full system access, can promote/demote admins

-- ============================================================================
-- STEP 1: Add role column to users table
-- ============================================================================

-- Add role column with validation
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add timestamp for role changes (audit trail)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role_updated_at TIMESTAMP WITH TIME ZONE;

-- Add column for who changed the role (audit trail)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role_updated_by UUID REFERENCES users(id);

-- Add comments
COMMENT ON COLUMN users.role IS 'User role: user (default), admin (support staff), super_admin (full access)';
COMMENT ON COLUMN users.role_updated_at IS 'Timestamp when role was last changed';
COMMENT ON COLUMN users.role_updated_by IS 'User ID who changed the role (for audit)';

-- ============================================================================
-- STEP 2: Create function to track role changes
-- ============================================================================

CREATE OR REPLACE FUNCTION track_role_change()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_role VARCHAR(20);
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();
  
  -- Check if role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only super_admin can change roles
    IF current_user_role != 'super_admin' THEN
      RAISE EXCEPTION 'Only super admins can change user roles';
    END IF;
    
    -- Track the change
    NEW.role_updated_at := NOW();
    NEW.role_updated_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS track_role_change_trigger ON users;
CREATE TRIGGER track_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION track_role_change();

-- ============================================================================
-- STEP 3: Update existing RLS policies for users table
-- ============================================================================

-- Drop existing policies to recreate them with admin support
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Users can view their own profile OR admins can view all profiles
CREATE POLICY "Users can view own profile or admins can view all" ON users
  FOR SELECT USING (
    auth.uid() = id  -- User can see their own profile
    OR 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')  -- Admins can see all
  );

-- Users can update their own profile (but not role field directly)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    auth.uid() = id  -- User updating their own profile
  )
  WITH CHECK (
    auth.uid() = id
  );

-- Super admins can update any user
CREATE POLICY "Super admins can update any user" ON users
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- Users can create their own profile during signup
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 4: Create admin-specific views for dashboard
-- ============================================================================

-- Admin view: All users summary (only accessible to admins)
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
WHERE (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
GROUP BY u.id, u.email, u.full_name, u.company_name, u.role, 
         u.subscription_tier, u.subscription_status, u.trial_start_date,
         u.trial_end_date, u.is_active, u.created_at,
         ut.conversations_used, ut.whatsapp_messages_sent;

-- Admin view: System statistics
CREATE OR REPLACE VIEW admin_system_stats
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true) as active_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND subscription_status = 'trial') as trial_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND subscription_status = 'active') as paid_users,
  (SELECT COUNT(*) FROM bots) as total_bots,
  (SELECT COUNT(*) FROM bots WHERE is_active = true) as active_bots,
  (SELECT COUNT(*) FROM chats WHERE created_at >= NOW() - INTERVAL '24 hours') as chats_today,
  (SELECT COUNT(*) FROM messages WHERE created_at >= NOW() - INTERVAL '24 hours') as messages_today,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= NOW() - INTERVAL '7 days') as signups_this_week,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= NOW() - INTERVAL '30 days') as signups_this_month
WHERE (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin');

-- Grant permissions on admin views
GRANT SELECT ON admin_users_summary TO authenticated;
GRANT SELECT ON admin_system_stats TO authenticated;

COMMENT ON VIEW admin_users_summary IS 'Admin-only view: Complete user information with usage stats';
COMMENT ON VIEW admin_system_stats IS 'Admin-only view: System-wide statistics and metrics';

-- ============================================================================
-- STEP 5: Create function to safely promote user to admin
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_user_to_admin(
  target_user_id UUID,
  new_role VARCHAR(20)
)
RETURNS JSONB
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_role VARCHAR(20);
  target_user_email TEXT;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();
  
  -- Only super_admins can promote users
  IF current_user_role != 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can change user roles'
    );
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role. Must be: user, admin, or super_admin'
    );
  END IF;
  
  -- Update the user's role
  UPDATE users
  SET 
    role = new_role,
    role_updated_by = auth.uid(),
    role_updated_at = NOW()
  WHERE id = target_user_id
  RETURNING email INTO target_user_email;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('User %s role changed to %s', target_user_email, new_role),
    'user_id', target_user_id,
    'new_role', new_role
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION promote_user_to_admin IS 'Safely promote/demote users between roles (super_admin only)';

-- ============================================================================
-- STEP 6: Create audit log for admin actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON admin_audit_log
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Only system can insert audit logs (through backend)
CREATE POLICY "System can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE admin_audit_log IS 'Audit trail of all admin actions in the system';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- To set a user as super_admin, run:
-- UPDATE users SET role = 'super_admin', role_updated_at = NOW() 
-- WHERE email = 'your-email@example.com';

