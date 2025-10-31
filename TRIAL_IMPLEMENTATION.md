# 7-Day Free Trial Implementation Guide

This document explains the complete implementation of the 7-day free trial system in AgentDesk.

## Overview

Every new user gets automatic 7-day free trial access to AgentDesk. After 7 days, they must upgrade to a paid plan to continue using the service.

## System Components

### 1. Database Schema (`supabase/migrations/add_trial_tracking.sql`)

**New columns added to `users` table:**
- `trial_start_date` - When the trial started
- `trial_end_date` - When the trial expires (7 days after start)
- `subscription_status` - Current status: `trial`, `active`, `expired`, `cancelled`
- `subscription_start_date` - When paid subscription started
- `subscription_end_date` - When paid subscription expires

**Database Functions:**
- `check_trial_status(user_id)` - Checks if trial has expired
- `set_trial_dates()` - Auto-sets trial dates on user creation (trigger)

**Views:**
- `active_users` - Shows only users with valid access

### 2. Frontend Utilities (`frontend/lib/subscription/trial-checker.ts`)

**Functions:**
- `checkTrialStatus()` - Checks current user's trial status
- `initializeTrial(userId)` - Initialize trial for new user
- `formatTrialEndDate()` - Format dates for display

**Returns TrialStatus:**
```typescript
{
  hasAccess: boolean        // Can user access the system?
  isOnTrial: boolean        // Currently in trial period?
  trialExpired: boolean     // Has trial expired?
  daysRemaining: number     // Days left in trial
  subscriptionTier: string  // free, starter, growth, plus, premium
  subscriptionStatus: string // trial, active, expired
  trialEndDate: string      // ISO date string
}
```

### 3. UI Components (`frontend/components/subscription/trial-banner.tsx`)

**TrialBanner:**
- Shows warning when ≤2 days remain
- Displays at top of dashboard
- Links to pricing page

**TrialExpiredModal:**
- Blocks access when trial expires
- Full-screen overlay preventing usage
- Links to pricing & support

### 4. Integration Points

**Dashboard Layout** (`frontend/app/(dashboard)/dashboard/layout.tsx`):
- Automatically includes TrialBanner & TrialExpiredModal
- Checks trial status on every dashboard page load

**Auth Callback** (`frontend/app/auth/callback/route.ts`):
- Sets trial dates when creating new user
- Works for both OAuth and email authentication

**Backend Service** (`backend/src/auth/auth.service.ts`):
- Also sets trial dates when creating user profiles
- Ensures consistency across authentication methods

## Installation & Setup

### Step 1: Run Database Migration

```bash
# Using Supabase CLI
supabase migration new add_trial_tracking
# Copy contents from supabase/migrations/add_trial_tracking.sql

# Apply migration
supabase db push

# Or via SQL Editor in Supabase Dashboard:
# Copy and paste the entire add_trial_tracking.sql file
```

### Step 2: Update Environment

No new environment variables needed! The system uses existing Supabase setup.

### Step 3: Deploy Frontend Changes

```bash
cd frontend
npm install  # Install any new dependencies
npm run build
git add .
git commit -m "Implement 7-day free trial system"
git push origin main
```

Railway will auto-deploy the frontend changes.

### Step 4: Deploy Backend Changes (if needed)

```bash
cd backend
npm install
npm run build
git push origin main
```

## How It Works

### New User Registration Flow

1. **User signs up** (Google OAuth, Facebook, or Email)
2. **Callback route creates user profile** with trial dates:
   - `trial_start_date` = NOW
   - `trial_end_date` = NOW + 7 days
   - `subscription_status` = 'trial'
   - `subscription_tier` = 'free'

3. **User accesses dashboard**:
   - Trial status checked automatically
   - Banner shows if ≤2 days remaining
   - Full access granted

### Trial Expiration Flow

1. **7 days pass** since registration

2. **User accesses dashboard**:
   - `checkTrialStatus()` detects expiration
   - Updates `subscription_status` to 'expired'
   - `TrialExpiredModal` appears

3. **Modal blocks all access**:
   - User can only:
     - View pricing
     - Contact support
   - Cannot use bots or features

4. **User upgrades**:
   - After payment:
     - `subscription_tier` = 'starter' | 'growth' | 'plus' | 'premium'
     - `subscription_status` = 'active'
     - `subscription_start_date` = NOW
   - Full access restored immediately

## Testing

### Test Trial Warning (2 days remaining)

```sql
-- Set trial to expire in 2 days
UPDATE users 
SET trial_end_date = NOW() + INTERVAL '2 days'
WHERE email = 'test@example.com';
```

### Test Trial Expiration

```sql
-- Set trial as expired
UPDATE users 
SET trial_end_date = NOW() - INTERVAL '1 day',
    subscription_status = 'trial'
WHERE email = 'test@example.com';
```

### Test Paid Subscription

```sql
-- Simulate paid subscription
UPDATE users 
SET subscription_tier = 'growth',
    subscription_status = 'active',
    subscription_start_date = NOW()
WHERE email = 'test@example.com';
```

## Monitoring

### Check Trial Status for All Users

```sql
SELECT 
  email,
  subscription_tier,
  subscription_status,
  trial_start_date,
  trial_end_date,
  CASE 
    WHEN trial_end_date > NOW() THEN EXTRACT(DAY FROM trial_end_date - NOW())
    ELSE 0
  END as days_remaining
FROM users
WHERE subscription_tier = 'free'
ORDER BY trial_end_date ASC;
```

### Find Expired Trials

```sql
SELECT email, trial_end_date
FROM users
WHERE subscription_tier = 'free'
  AND trial_end_date < NOW()
  AND subscription_status = 'trial';
```

### Conversion Rate

```sql
SELECT 
  COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
  COUNT(CASE WHEN subscription_tier != 'free' THEN 1 END) as paid_users,
  ROUND(
    COUNT(CASE WHEN subscription_tier != 'free' THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as conversion_rate
FROM users;
```

## Troubleshooting

### User can access after trial expired

1. Check `subscription_status` in database
2. Verify `trial_end_date` is in the past
3. Clear browser cache
4. Check if `subscription_tier` is 'free'

### Trial dates not set for new user

1. Verify migration ran successfully
2. Check if trigger `set_trial_dates_trigger` exists
3. Manually set dates using `initializeTrial(userId)`

### Modal doesn't appear

1. Check browser console for errors
2. Verify `TrialExpiredModal` is imported in dashboard layout
3. Test `checkTrialStatus()` function directly

## Future Enhancements

- [ ] Email notifications at 3, 1, and 0 days remaining
- [ ] Grace period (e.g., 2 days after expiration)
- [ ] Trial extension for specific users
- [ ] Analytics dashboard for trial conversions
- [ ] A/B testing different trial lengths

## Support

For issues or questions:
- GitHub Issues: [repository-url]/issues
- Support Email: support@agentdesk.com
- Documentation: [docs-url]

