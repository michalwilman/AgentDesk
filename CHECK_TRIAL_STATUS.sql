-- ============================================================================
-- בדיקת סטטוס Trial - הריצי את זה ב-Supabase SQL Editor
-- ============================================================================

-- 1. בדיקה מה הסטטוס הנוכחי שלך:
SELECT 
  id,
  email,
  subscription_tier,
  subscription_status,
  trial_start_date,
  trial_end_date,
  trial_reminder_sent,
  created_at,
  -- כמה זמן נשאר:
  CASE 
    WHEN trial_end_date IS NULL THEN 'No trial date set'
    WHEN trial_end_date > NOW() THEN 
      EXTRACT(DAY FROM (trial_end_date - NOW()))::TEXT || ' days, ' ||
      EXTRACT(HOUR FROM (trial_end_date - NOW()))::TEXT || ' hours remaining'
    ELSE 'Trial expired'
  END as time_remaining
FROM users 
WHERE email = 'michal.vilman@gmail.com';

-- 2. אם subscription_status לא קיים, צריך להריץ את זה:
-- (רק אם השדה לא קיים)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';

-- 3. אם הערכים ריקים, מלא אותם:
UPDATE users
SET 
  trial_start_date = COALESCE(trial_start_date, created_at),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '7 days'),
  subscription_status = CASE 
    WHEN subscription_tier IN ('growth', 'plus', 'premium') THEN 'active'
    WHEN subscription_tier = 'starter' AND (trial_end_date IS NULL OR trial_end_date > NOW()) THEN 'trial'
    ELSE 'trial'
  END
WHERE email = 'michal.vilman@gmail.com';

-- 4. הצג שוב אחרי העדכון:
SELECT 
  email,
  subscription_tier,
  subscription_status,
  trial_start_date,
  trial_end_date,
  EXTRACT(DAY FROM (trial_end_date - NOW()))::INTEGER as days_remaining,
  EXTRACT(HOUR FROM (trial_end_date - NOW()))::INTEGER as hours_remaining
FROM users 
WHERE email = 'michal.vilman@gmail.com';

