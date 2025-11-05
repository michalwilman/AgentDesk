-- ============================================================================
-- FINAL FIX: Remove ALL Security Definer Views and Recreate Properly
-- Date: 2025-11-05
-- Purpose: Complete removal of SECURITY DEFINER from all analytics views
-- ============================================================================

-- Step 1: Drop ALL related objects completely
DROP VIEW IF EXISTS bot_analytics CASCADE;
DROP VIEW IF EXISTS user_statistics CASCADE;
DROP VIEW IF EXISTS appointments_summary CASCADE;
DROP VIEW IF EXISTS leads_summary CASCADE;
DROP VIEW IF EXISTS action_logs_summary CASCADE;
DROP VIEW IF EXISTS active_users CASCADE;

-- Step 2: Recreate as SIMPLE views with security_invoker = true (explicit)
-- This is the OPPOSITE of security_invoker = false which causes the error

-- 1. bot_analytics
CREATE VIEW bot_analytics 
WITH (security_invoker = true) AS
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
WHERE b.user_id = auth.uid()
GROUP BY b.id, b.name, b.user_id, b.created_at;

-- 2. user_statistics
CREATE VIEW user_statistics
WITH (security_invoker = true) AS
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
WHERE u.id = auth.uid()
GROUP BY u.id, u.email, u.company_name, u.subscription_tier, u.created_at;

-- 3. appointments_summary
CREATE VIEW appointments_summary
WITH (security_invoker = true) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  COUNT(a.id) AS total_appointments,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) AS confirmed_appointments,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_appointments,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments
FROM bots b
LEFT JOIN appointments a ON a.bot_id = b.id
WHERE b.user_id = auth.uid()
GROUP BY b.id, b.user_id;

-- 4. leads_summary
CREATE VIEW leads_summary
WITH (security_invoker = true) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  COUNT(l.id) AS total_leads,
  COUNT(CASE WHEN l.status = 'new' THEN 1 END) AS new_leads,
  COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) AS contacted_leads,
  COUNT(CASE WHEN l.status = 'converted' THEN 1 END) AS converted_leads
FROM bots b
LEFT JOIN leads l ON l.bot_id = b.id
WHERE b.user_id = auth.uid()
GROUP BY b.id, b.user_id;

-- 5. action_logs_summary
CREATE VIEW action_logs_summary
WITH (security_invoker = true) AS
SELECT
  b.id AS bot_id,
  b.user_id,
  al.action_type,
  COUNT(*) AS action_count,
  MAX(al.created_at) AS last_action_at
FROM bots b
LEFT JOIN action_logs al ON al.bot_id = b.id
WHERE b.user_id = auth.uid()
GROUP BY b.id, b.user_id, al.action_type;

-- 6. active_users
CREATE VIEW active_users
WITH (security_invoker = true) AS
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
WHERE u.is_active = true AND u.id = auth.uid()
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, u.is_active;

-- Grant permissions
GRANT SELECT ON bot_analytics TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;
GRANT SELECT ON appointments_summary TO authenticated;
GRANT SELECT ON leads_summary TO authenticated;
GRANT SELECT ON action_logs_summary TO authenticated;
GRANT SELECT ON active_users TO authenticated;

-- Add comments
COMMENT ON VIEW bot_analytics IS 'Bot analytics - SECURITY INVOKER (user sees only their own data)';
COMMENT ON VIEW user_statistics IS 'User statistics - SECURITY INVOKER (user sees only their own data)';
COMMENT ON VIEW appointments_summary IS 'Appointments summary - SECURITY INVOKER (user sees only their own data)';
COMMENT ON VIEW leads_summary IS 'Leads summary - SECURITY INVOKER (user sees only their own data)';
COMMENT ON VIEW action_logs_summary IS 'Action logs summary - SECURITY INVOKER (user sees only their own data)';
COMMENT ON VIEW active_users IS 'Active users - SECURITY INVOKER (user sees only their own data)';

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

-- After running this, verify with:
-- SELECT table_name, security_invoker 
-- FROM information_schema.views 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('bot_analytics', 'user_statistics', 'appointments_summary', 'leads_summary', 'action_logs_summary', 'active_users');

-- ============================================================================
-- MIGRATION COMPLETE!
-- All views now have security_invoker = TRUE (not SECURITY DEFINER)
-- ============================================================================

