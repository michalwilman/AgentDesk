-- Fix admin_system_stats view to show only active bots in total_bots
-- Update total_bots to count only active bots

DROP VIEW IF EXISTS admin_system_stats CASCADE;

CREATE OR REPLACE VIEW admin_system_stats
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true) as active_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND subscription_status = 'trial') as trial_users,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND subscription_status = 'active') as paid_users,
  (SELECT COUNT(*) FROM bots WHERE is_active = true) as total_bots,  -- Changed to count only active bots
  (SELECT COUNT(*) FROM bots WHERE is_active = true) as active_bots,
  (SELECT COUNT(*) FROM chats WHERE created_at >= NOW() - INTERVAL '24 hours') as chats_today,
  (SELECT COUNT(*) FROM messages WHERE created_at >= NOW() - INTERVAL '24 hours') as messages_today,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= NOW() - INTERVAL '7 days') as signups_this_week,
  (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= NOW() - INTERVAL '30 days') as signups_this_month;

-- Grant permissions
GRANT SELECT ON admin_system_stats TO service_role;

COMMENT ON VIEW admin_system_stats IS 'Admin-only view: System-wide statistics - total_bots shows only active bots';

