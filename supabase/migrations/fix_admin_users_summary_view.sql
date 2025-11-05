-- Fix admin_users_summary view to work with service role
-- Remove the WHERE clause that filters by auth.uid()
-- Security is now handled by the AdminGuard in the backend

DROP VIEW IF EXISTS admin_users_summary CASCADE;

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
GROUP BY u.id, u.email, u.full_name, u.company_name, u.role, 
         u.subscription_tier, u.subscription_status, u.trial_start_date,
         u.trial_end_date, u.is_active, u.created_at,
         ut.conversations_used, ut.whatsapp_messages_sent;

-- Grant permissions
GRANT SELECT ON admin_users_summary TO authenticated;

