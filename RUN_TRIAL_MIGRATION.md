# 🚀 Quick Start: Run Trial Migration

## Step 1: Apply Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the **entire** contents of `supabase/migrations/add_trial_tracking.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify success: You should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
cd supabase
supabase db push
```

## Step 2: Verify Migration

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('trial_start_date', 'trial_end_date', 'subscription_status');

-- Should return 3 rows
```

## Step 3: Test on One User (Optional but Recommended)

```sql
-- Find a test user
SELECT id, email, trial_start_date, trial_end_date, subscription_status
FROM users
LIMIT 1;

-- If trial dates are NULL, they will be set automatically on next login
-- Or you can manually set them:
UPDATE users
SET 
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '7 days',
  subscription_status = 'trial'
WHERE email = 'your-test-email@example.com';
```

## Step 4: Deploy Code Changes

### Push to Git (Railway auto-deploys)

```bash
git add .
git commit -m "Implement 7-day free trial system"
git push origin main
```

**That's it!** Railway will automatically deploy both frontend and backend.

## Verify Everything Works

1. **Create new test account**
   - Go to your site and register
   - Check database: User should have trial_start_date and trial_end_date

2. **Test trial warning**
   - Set trial to expire in 2 days (see SQL below)
   - Login to dashboard
   - You should see yellow warning banner

3. **Test trial expiration**
   - Set trial to expired (see SQL below)
   - Login to dashboard
   - You should see blocking modal

### Test SQLs:

```sql
-- Set trial to expire in 2 days (to see warning banner)
UPDATE users 
SET trial_end_date = NOW() + INTERVAL '2 days'
WHERE email = 'test@example.com';

-- Set trial as expired (to see blocking modal)
UPDATE users 
SET trial_end_date = NOW() - INTERVAL '1 day',
    subscription_status = 'trial'
WHERE email = 'test@example.com';

-- Reset back to full 7 days
UPDATE users 
SET trial_start_date = NOW(),
    trial_end_date = NOW() + INTERVAL '7 days',
    subscription_status = 'trial'
WHERE email = 'test@example.com';
```

## Common Issues

### Migration fails with "column already exists"
**Solution:** That's okay! It means columns already exist. Just continue.

### New users don't get trial dates
**Solution:** 
1. Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'set_trial_dates_trigger';`
2. Re-run the trigger creation part of migration

### Trial expiration not working
**Solution:**
1. Clear browser cache
2. Check browser console for errors
3. Verify user's `subscription_tier` is 'free'

## Need Help?

Read full documentation: `TRIAL_IMPLEMENTATION.md`

