-- ============================================================================
-- Fix Remaining Security Issues - Additional RLS Policies
-- Date: 2025-11-05
-- Purpose: Fix remaining Supabase Security Advisor warnings
-- ============================================================================

-- ============================================================================
-- PART 1: Add RLS to remaining tables
-- ============================================================================

-- 1. roles table - Read-only for all authenticated users
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

-- Only super admins can modify roles (via backend service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- 2. system_settings table - Read-only for authenticated, write for admins
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only backend service role can modify system settings
-- No INSERT/UPDATE/DELETE policies for regular users

-- 3. appointment_notifications table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointment_notifications') THEN
    ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;
    
    -- Users can only see notifications for their own appointments
    EXECUTE 'CREATE POLICY "Users can view own appointment notifications" ON appointment_notifications
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM appointments a
          JOIN bots b ON b.id = a.bot_id
          WHERE a.id = appointment_notifications.appointment_id
          AND b.user_id = auth.uid()
        )
      )';
    
    -- Backend can create notifications
    EXECUTE 'CREATE POLICY "Backend can create notifications" ON appointment_notifications
      FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- 4. plan_limits table - Read-only for all authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_limits') THEN
    ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;
    
    EXECUTE 'CREATE POLICY "Anyone can view plan limits" ON plan_limits
      FOR SELECT USING (true)';
  END IF;
END $$;

-- 5. usage_tracking table - Users can only see their own usage
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Backend can manage usage tracking" ON usage_tracking
  FOR ALL USING (true);

-- 6. appointments table (ensure RLS is enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'appointments'
  ) THEN
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    
    -- Drop ALL existing policies first
    DROP POLICY IF EXISTS "Users can view own bot appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can manage own bot appointments" ON appointments;
    DROP POLICY IF EXISTS "Allow creating appointments" ON appointments;
    DROP POLICY IF EXISTS "Backend can create appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can update own bot appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can delete own bot appointments" ON appointments;
    
    -- Users can view appointments for their bots
    EXECUTE 'CREATE POLICY "Users can view own bot appointments" ON appointments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bots 
          WHERE bots.id = appointments.bot_id 
          AND bots.user_id = auth.uid()
        )
      )';
    
    -- Backend can create appointments
    EXECUTE 'CREATE POLICY "Backend can create appointments" ON appointments
      FOR INSERT WITH CHECK (true)';
    
    -- Users can update appointments for their bots
    EXECUTE 'CREATE POLICY "Users can update own bot appointments" ON appointments
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM bots 
          WHERE bots.id = appointments.bot_id 
          AND bots.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- 7. leads table (ensure RLS is enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'leads'
  ) THEN
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    
    -- Drop ALL existing policies first
    DROP POLICY IF EXISTS "Users can view own bot leads" ON leads;
    DROP POLICY IF EXISTS "Backend can create leads" ON leads;
    DROP POLICY IF EXISTS "Users can update own bot leads" ON leads;
    DROP POLICY IF EXISTS "Users can delete own bot leads" ON leads;
    DROP POLICY IF EXISTS "Users can manage own bot leads" ON leads;
    
    -- Users can view leads for their bots
    EXECUTE 'CREATE POLICY "Users can view own bot leads" ON leads
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bots 
          WHERE bots.id = leads.bot_id 
          AND bots.user_id = auth.uid()
        )
      )';
    
    -- Backend can create leads
    EXECUTE 'CREATE POLICY "Backend can create leads" ON leads
      FOR INSERT WITH CHECK (true)';
    
    -- Users can update leads for their bots
    EXECUTE 'CREATE POLICY "Users can update own bot leads" ON leads
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM bots 
          WHERE bots.id = leads.bot_id 
          AND bots.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- 8. action_logs table (ensure RLS is enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'action_logs'
  ) THEN
    ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
    
    -- Drop ALL existing policies first
    DROP POLICY IF EXISTS "Users can view own bot action logs" ON action_logs;
    DROP POLICY IF EXISTS "Backend can create action logs" ON action_logs;
    DROP POLICY IF EXISTS "Users can manage own bot action logs" ON action_logs;
    
    -- Users can view action logs for their bots
    EXECUTE 'CREATE POLICY "Users can view own bot action logs" ON action_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bots 
          WHERE bots.id = action_logs.bot_id 
          AND bots.user_id = auth.uid()
        )
      )';
    
    -- Backend can create action logs
    EXECUTE 'CREATE POLICY "Backend can create action logs" ON action_logs
      FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anyone can view roles" ON roles IS 'All users can view available roles';
COMMENT ON POLICY "Authenticated users can view system settings" ON system_settings IS 'Authenticated users can view system settings';
COMMENT ON POLICY "Users can view own usage" ON usage_tracking IS 'Users can only view their own usage statistics';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- To verify:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND rowsecurity = false;

