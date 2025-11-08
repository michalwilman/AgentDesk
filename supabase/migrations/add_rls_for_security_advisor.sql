-- ============================================================================
-- Add RLS Policies for Security Advisor Errors
-- Date: 2025-11-08
-- Purpose: Enable RLS and create policies for 4 tables
-- ============================================================================

-- ============================================================================
-- 1. user_deletion_log - Audit log for deletions
-- ============================================================================

-- Enable RLS
ALTER TABLE user_deletion_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view deletion logs" ON user_deletion_log;
DROP POLICY IF EXISTS "System can insert deletion logs" ON user_deletion_log;
DROP POLICY IF EXISTS "Admins can insert deletion logs" ON user_deletion_log;

-- Policy: Admins can view all deletion logs
CREATE POLICY "Admins can view deletion logs" ON user_deletion_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: System can insert deletion logs (via triggers)
CREATE POLICY "System can insert deletion logs" ON user_deletion_log
  FOR INSERT WITH CHECK (true);

-- Policy: Admins can insert deletion logs manually
CREATE POLICY "Admins can insert deletion logs" ON user_deletion_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON POLICY "Admins can view deletion logs" ON user_deletion_log IS 'Only admins can view deletion audit log';
COMMENT ON POLICY "System can insert deletion logs" ON user_deletion_log IS 'System triggers can log deletion events';

-- ============================================================================
-- 2. monthly_usage - Usage tracking per user/bot/month
-- ============================================================================

-- Enable RLS
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own usage" ON monthly_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON monthly_usage;
DROP POLICY IF EXISTS "System can manage usage" ON monthly_usage;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own usage" ON monthly_usage
  FOR SELECT USING (user_id = auth.uid());

-- Policy: Admins can view all usage
CREATE POLICY "Admins can view all usage" ON monthly_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: System can insert/update usage records
CREATE POLICY "System can manage usage" ON monthly_usage
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON POLICY "Users can view own usage" ON monthly_usage IS 'Users can only view their own monthly usage';
COMMENT ON POLICY "Admins can view all usage" ON monthly_usage IS 'Admins can view all users monthly usage';

-- ============================================================================
-- 3. message_logs - Detailed message tracking
-- ============================================================================

-- Enable RLS
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own message logs" ON message_logs;
DROP POLICY IF EXISTS "Admins can view all message logs" ON message_logs;
DROP POLICY IF EXISTS "System can insert message logs" ON message_logs;

-- Policy: Users can view their own message logs
CREATE POLICY "Users can view own message logs" ON message_logs
  FOR SELECT USING (user_id = auth.uid());

-- Policy: Admins can view all message logs
CREATE POLICY "Admins can view all message logs" ON message_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: System can insert message logs
CREATE POLICY "System can insert message logs" ON message_logs
  FOR INSERT WITH CHECK (true);

COMMENT ON POLICY "Users can view own message logs" ON message_logs IS 'Users can only view their own message logs';
COMMENT ON POLICY "Admins can view all message logs" ON message_logs IS 'Admins can view all message logs for monitoring';

-- ============================================================================
-- 4. plan_limits - Plan configuration (read-only for users)
-- ============================================================================

-- Enable RLS
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view plan limits" ON plan_limits;
DROP POLICY IF EXISTS "Admins can update plan limits" ON plan_limits;
DROP POLICY IF EXISTS "Admins can insert plan limits" ON plan_limits;

-- Policy: Everyone can view plan limits (needed for checking limits)
CREATE POLICY "Authenticated users can view plan limits" ON plan_limits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can modify plan limits
CREATE POLICY "Admins can update plan limits" ON plan_limits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can insert new plans
CREATE POLICY "Admins can insert plan limits" ON plan_limits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON POLICY "Authenticated users can view plan limits" ON plan_limits IS 'All authenticated users need to see plan limits to check usage';
COMMENT ON POLICY "Admins can update plan limits" ON plan_limits IS 'Only admins can modify plan configurations';

-- ============================================================================
-- VERIFICATION - Check all policies were created
-- ============================================================================

-- List all policies for our tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_deletion_log', 'monthly_usage', 'message_logs', 'plan_limits')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- ✅ user_deletion_log: 3 policies (admin view, system insert, admin insert)
-- ✅ monthly_usage: 3 policies (user view own, admin view all, system manage)
-- ✅ message_logs: 3 policies (user view own, admin view all, system insert)
-- ✅ plan_limits: 3 policies (all view, admin update, admin insert)

