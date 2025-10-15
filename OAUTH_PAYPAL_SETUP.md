# OAuth & PayPal Integration Setup Guide

This guide will walk you through setting up Google OAuth, Facebook OAuth, and PayPal Sandbox integration for AgentDesk.

## 📋 Prerequisites

- Supabase project set up and running
- PayPal Developer account (free)
- Google Cloud account (free)
- Facebook Developer account (free)

---

## 1️⃣ Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Name your project (e.g., "AgentDesk") and click **Create**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "AgentDesk"
   - Add your email as support email
   - Add authorized domains (your domain)
   - Click **Save and Continue**
4. Choose **Web application** as application type
5. Name it "AgentDesk Web Client"
6. Add **Authorized redirect URIs**:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
   Replace `<your-supabase-project-ref>` with your actual Supabase project reference
7. Click **Create**
8. **Copy the Client ID and Client Secret** — you'll need these next

### Step 4: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and toggle it on
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

---

## 2️⃣ Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as the app type
4. Click **Next**

### Step 2: Configure App

1. Fill in the app details:
   - **App Name**: AgentDesk
   - **App Contact Email**: your email
2. Click **Create App**
3. You may need to complete a security check

### Step 3: Add Facebook Login

1. From the app dashboard, find **Add a Product**
2. Look for **Facebook Login** and click **Set Up**
3. Choose **Web** as the platform
4. You can skip the quickstart

### Step 4: Configure OAuth Redirect URIs

1. In the left sidebar, go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
3. Click **Save Changes**

### Step 5: Get App Credentials

1. Go to **Settings** → **Basic** in the left sidebar
2. **Copy your App ID and App Secret** — you'll need these next
3. At the top of the page, toggle the app from **Development** to **Live** mode (when ready for production)

### Step 6: Configure in Supabase

1. Go to your Supabase Dashboard
2. Go to **Authentication** → **Providers**
3. Find **Facebook** and toggle it on
4. Paste your **App ID** (as Client ID) and **App Secret** (as Client Secret)
5. Click **Save**

---

## 3️⃣ PayPal Sandbox Setup

### Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal account (or create one)
3. Click **Dashboard**

### Step 2: Create Sandbox App

1. Make sure you're in **Sandbox** mode (toggle at the top)
2. Go to **Apps & Credentials**
3. Click **Create App**
4. Enter app details:
   - **App Name**: AgentDesk Checkout
   - **App Type**: Merchant
5. Click **Create App**

### Step 3: Get API Credentials

1. Once created, you'll see your app details page
2. **Copy the Client ID** from the "Client ID" section
3. Click **Show** under "Secret" and **copy the Secret**

### Step 4: Create Test Accounts (Optional)

1. Go to **Sandbox** → **Accounts** in the left menu
2. PayPal automatically creates test accounts for you:
   - **Business Account**: For receiving payments
   - **Personal Account**: For making test purchases
3. Click on an account to view credentials (email/password)
4. Use these to test transactions

### Step 5: Configure Environment Variables

1. Open `frontend/.env.local` (create if it doesn't exist)
2. Add your PayPal credentials:
   ```bash
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_SECRET=your_sandbox_secret_here
   ```
3. Replace with your actual credentials from Step 3

---

## 4️⃣ Update Database Schema

Run the updated schema in your Supabase SQL Editor:

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase/schema.sql` from your project
3. Find the new `transactions` table section
4. Run the SQL to create the table, indexes, and RLS policies:

```sql
-- Transactions Table (Payment Records)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paypal_order_id TEXT,
  full_name VARCHAR(255),
  email VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 5️⃣ Install Dependencies

Run in the `frontend` directory:

```bash
cd frontend
npm install
```

This will install the new dependencies:
- `@paypal/react-paypal-js` (PayPal integration)
- `react-icons` (OAuth button icons)

---

## 6️⃣ Testing

### Test OAuth Login

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000/register`
3. Click **Continue with Google** or **Continue with Facebook**
4. Complete the OAuth flow
5. You should be redirected back to your app and logged in

### Test PayPal Checkout

1. Make sure you have PayPal credentials in `.env.local`
2. Go to `http://localhost:3000/pricing`
3. Click **Get Started** on Pro or Business plan
4. You'll be redirected to the checkout page
5. Click the **PayPal** button
6. Log in with your **Sandbox Personal Account** credentials
7. Complete the payment
8. You should be redirected to the success page

**Sandbox Test Credentials:**
- Go to PayPal Developer Dashboard → Sandbox → Accounts
- Use the email/password of the Personal account for testing purchases

---

## 7️⃣ Important Notes

### Security

- ✅ **Never commit** `.env.local` to version control
- ✅ Keep your OAuth secrets and PayPal Secret secure
- ✅ Use environment variables for all sensitive data
- ✅ The `PAYPAL_SECRET` is prefixed without `NEXT_PUBLIC_` to keep it server-side only

### Production Deployment

When deploying to production:

1. **OAuth Providers**: Add your production domain to authorized redirect URIs
2. **PayPal**: Switch from Sandbox to Live mode in PayPal Developer Dashboard
3. **Environment Variables**: Update all credentials in your hosting platform (Vercel, Netlify, etc.)
4. **Facebook App**: Switch app from Development to Live mode
5. **Supabase**: Update redirect URLs in Supabase Authentication settings

### RTL Support

All pages are fully RTL-compatible. To test:
1. Add `dir="rtl"` to the `<html>` tag in `frontend/app/layout.tsx`
2. The UI will automatically flip for right-to-left languages

---

## 🎉 You're All Set!

Your AgentDesk application now supports:

✅ Google OAuth Authentication  
✅ Facebook OAuth Authentication  
✅ PayPal Sandbox Payments  
✅ Transaction Recording  
✅ Beautiful Success/Cancel Pages  

### Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [PayPal Developer Dashboard](https://developer.paypal.com/)
- [Supabase Dashboard](https://app.supabase.com/)

### Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify all redirect URIs match exactly
3. Ensure environment variables are loaded (restart dev server after changes)
4. Check Supabase logs for authentication errors

---

**Happy Building! 🚀**

