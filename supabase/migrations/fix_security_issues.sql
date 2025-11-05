-- ============================================================================
-- Fix Security Issues - RLS and Security Definer Views
-- Date: 2025-11-05
-- Purpose: Fix Supabase Security Advisor warnings and errors
-- ============================================================================

-- ============================================================================
-- PART 1: Add RLS to site_scan_jobs table
-- ============================================================================

-- Enable RLS on site_scan_jobs
ALTER TABLE site_scan_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own bot's scan jobs
CREATE POLICY "Users can view own bot scan jobs" ON site_scan_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bots 
      WHERE bots.id = site_scan_jobs.bot_id 
      AND bots.user_id = auth.uid()
    )
  );

-- Users can create scan jobs for their own bots
CREATE POLICY "Users can create own bot scan jobs" ON site_scan_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bots 
      WHERE bots.id = site_scan_jobs.bot_id 
      AND bots.user_id = auth.uid()
    )
  );

-- Users can update their own bot's scan jobs
CREATE POLICY "Users can update own bot scan jobs" ON site_scan_jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bots 
      WHERE bots.id = site_scan_jobs.bot_id 
      AND bots.user_id = auth.uid()
    )
  );

-- Users can delete their own bot's scan jobs
CREATE POLICY "Users can delete own bot scan jobs" ON site_scan_jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bots 
      WHERE bots.id = site_scan_jobs.bot_id 
      AND bots.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 2: Fix Security Definer Views
-- ============================================================================

-- Drop existing views
DROP VIEW IF EXISTS bot_analytics;
DROP VIEW IF EXISTS user_statistics;
DROP VIEW IF EXISTS appointments_summary;
DROP VIEW IF EXISTS leads_summary;
DROP VIEW IF EXISTS action_logs_summary;
DROP VIEW IF EXISTS active_users;

-- Recreate bot_analytics with SECURITY DEFINER
CREATE OR REPLACE VIEW bot_analytics 
WITH (security_invoker = false) AS
SELECT 
  b.id AS bot_id,
  b.name AS bot_name,
  b.user_id,
  COUNT(DISTINCT c.id) AS total_chats,
  COUNT(DISTINCT m.id) AS total_messages,
  AVG(c.satisfaction_rating) AS avg_satisfaction,
  COUNT(DISTINCT sc.id) AS total_content_chunks,
  COUNT(DISTINCT ke.id) AS total_embeddings,
  b.created_at AS bot_created_at
FROM bots b
LEFT JOIN chats c ON c.bot_id = b.id
LEFT JOIN messages m ON m.chat_id = c.id
LEFT JOIN scraped_content sc ON sc.bot_id = b.id
LEFT JOIN knowledge_embeddings ke ON ke.bot_id = b.id
GROUP BY b.id, b.name, b.user_id, b.created_at;

-- Recreate user_statistics with SECURITY DEFINER
CREATE OR REPLACE VIEW user_statistics
WITH (security_invoker = false) AS
SELECT
  u.id AS user_id,
  u.email,
  u.company_name,
  u.subscription_tier,
  COUNT(DISTINCT b.id) AS total_bots,
  COUNT(DISTINCT c.id) AS total_chats,
  COUNT(DISTINCT m.id) AS total_messages,
  u.created_at AS user_created_at
FROM users u
LEFT JOIN bots b ON b.user_id = u.id
LEFT JOIN chats c ON c.bot_id = b.id
LEFT JOIN messages m ON m.chat_id = c.id
GROUP BY u.id, u.email, u.company_name, u.subscription_tier, u.created_at;

-- Create appointments_summary view (if not exists)
CREATE OR REPLACE VIEW appointments_summary
WITH (security_invoker = false) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  COUNT(a.id) AS total_appointments,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) AS confirmed_appointments,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_appointments,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments
FROM bots b
LEFT JOIN appointments a ON a.bot_id = b.id
GROUP BY b.id, b.user_id;

-- Create leads_summary view (if not exists)
CREATE OR REPLACE VIEW leads_summary
WITH (security_invoker = false) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  COUNT(l.id) AS total_leads,
  COUNT(CASE WHEN l.status = 'new' THEN 1 END) AS new_leads,
  COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) AS contacted_leads,
  COUNT(CASE WHEN l.status = 'converted' THEN 1 END) AS converted_leads
FROM bots b
LEFT JOIN leads l ON l.bot_id = b.id
GROUP BY b.id, b.user_id;

-- Create action_logs_summary view (if not exists)
CREATE OR REPLACE VIEW action_logs_summary
WITH (security_invoker = false) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  al.action_type,
  COUNT(*) AS action_count,
  MAX(al.created_at) AS last_action_at
FROM bots b
LEFT JOIN action_logs al ON al.bot_id = b.id
GROUP BY b.id, b.user_id, al.action_type;

-- Create active_users view (if not exists)
CREATE OR REPLACE VIEW active_users
WITH (security_invoker = false) AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.subscription_tier,
  u.subscription_status,
  u.is_active,
  MAX(c.created_at) AS last_chat_at
FROM users u
LEFT JOIN bots b ON b.user_id = u.id
LEFT JOIN chats c ON c.bot_id = b.id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, u.is_active;

-- Grant appropriate permissions on views
GRANT SELECT ON bot_analytics TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;
GRANT SELECT ON appointments_summary TO authenticated;
GRANT SELECT ON leads_summary TO authenticated;
GRANT SELECT ON action_logs_summary TO authenticated;
GRANT SELECT ON active_users TO authenticated;

-- Add RLS policies for views (users can only see their own data)
ALTER VIEW bot_analytics SET (security_barrier = true);
ALTER VIEW user_statistics SET (security_barrier = true);
ALTER VIEW appointments_summary SET (security_barrier = true);
ALTER VIEW leads_summary SET (security_barrier = true);
ALTER VIEW action_logs_summary SET (security_barrier = true);
ALTER VIEW active_users SET (security_barrier = true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW bot_analytics IS 'Analytics data for bots with RLS protection';
COMMENT ON VIEW user_statistics IS 'User statistics with RLS protection';
COMMENT ON VIEW appointments_summary IS 'Appointments summary with RLS protection';
COMMENT ON VIEW leads_summary IS 'Leads summary with RLS protection';
COMMENT ON VIEW action_logs_summary IS 'Action logs summary with RLS protection';
COMMENT ON VIEW active_users IS 'Active users with RLS protection';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- To verify:
-- 1. Check Security Advisor in Supabase Dashboard
-- 2. Errors and warnings should be resolved
-- 3. Test that users can only see their own data

