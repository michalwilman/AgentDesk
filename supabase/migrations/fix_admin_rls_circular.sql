-- ============================================================================
-- Fix Admin RLS Circular Reference
-- Date: 2025-11-05
-- Purpose: Fix circular dependency in admin RLS policy
-- ============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Super admins can update any user" ON users;

-- Create a simpler policy: Users can always view their own profile (including role)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create a separate policy: Admins can view all users
-- This uses a helper function to avoid circular reference
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql;

-- Now admins can see everyone
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Super admins can update any user
CREATE POLICY "Super admins can update any user" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

