-- בדיקה מהירה - הריצי את זה ב-Supabase SQL Editor:

SELECT 
  email,
  subscription_tier,
  subscription_status,
  trial_end_date,
  EXTRACT(DAY FROM (trial_end_date - NOW()))::INTEGER as days_remaining
FROM users 
WHERE email = 'michal.vilman@gmail.com';

-- אם subscription_status הוא NULL או לא 'trial', תריצי את זה:
UPDATE users
SET subscription_status = 'trial'
WHERE email = 'michal.vilman@gmail.com' 
  AND subscription_tier = 'starter';

-- ואז בדקי שוב:
SELECT 
  email,
  subscription_tier,
  subscription_status,
  trial_end_date,
  EXTRACT(DAY FROM (trial_end_date - NOW()))::INTEGER as days_remaining
FROM users 
WHERE email = 'michal.vilman@gmail.com';

