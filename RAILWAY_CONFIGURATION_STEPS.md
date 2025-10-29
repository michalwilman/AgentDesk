# 🚂 Railway Configuration - Step by Step Guide

## 🎯 Problem Summary

Railway is trying to build from the project root using npm workspaces with `--workspace=agentdesk-backend`, but the workspace name in `package.json` is `"backend"`, causing the build to fail.

**Error:**
```
npm error No workspaces found:
npm error   --workspace=agentdesk-backend
```

---

## ✅ Solution: Configure Railway Root Directory

Instead of changing code, we configure Railway to work directly with the `backend/` folder where your Dockerfile already exists and works perfectly.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Navigate to your project: **angelic-radiance**
3. Click on the **agentdesk-backend** service

### Step 2: Configure Root Directory

1. Click on **Settings** tab (in the service view)
2. Scroll down to **Source** section
3. Find **Root Directory** field
4. Change it from empty or `/` to: **`backend`**
5. Ensure **Branch** is set to: **`main`**
6. Click **Save** or the setting saves automatically

**Screenshot Guide:**
```
Settings → Source
├── Repository: [Your GitHub Repo]
├── Branch: main
└── Root Directory: backend  ← Change this!
```

### Step 3: Verify Build Configuration

1. Still in **Settings**, scroll to **Build** section
2. Verify these settings:
   - **Builder**: Should auto-detect as **Dockerfile** (after saving root directory)
   - **Dockerfile Path**: Should be **`Dockerfile`** (relative to backend/)
   - **Build Command**: Should be empty (Docker handles everything)

If not auto-detected:
- Click **Configure**
- Select **Dockerfile** as builder
- Set path to: `Dockerfile`

### Step 4: Environment Variables

1. Click on **Variables** tab
2. Verify all required variables exist:

**Required Variables:**

```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://jnyfdbjtbywcfnewdmjd.supabase.co
SUPABASE_ANON_KEY=[Your Supabase anon key]
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase service role key]
OPENAI_API_KEY=[Your OpenAI API key]
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CORS_ORIGIN=*
ENCRYPTION_KEY=[Generate new key - see below]
```

**Optional Variables (with defaults):**
```env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_DEPTH=3
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

#### Generate Encryption Key

Open a terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it as `ENCRYPTION_KEY` in Railway.

### Step 5: Trigger New Deployment

**Option A - Automatic (Recommended):**
- Railway will automatically redeploy when it detects the Root Directory change
- Watch the **Deployments** tab for the new build

**Option B - Manual:**
1. Go to **Deployments** tab
2. Click **Deploy** button (top right)
3. Select **Deploy latest commit**

### Step 6: Monitor Build Progress

1. Click on the new deployment (in Deployments tab)
2. Click **View Logs** → **Build Logs**
3. Watch for successful steps:

**Expected Build Logs:**
```
✅ #1 [internal] load .dockerignore
✅ #2 [internal] load build definition from Dockerfile
✅ #3 [internal] load metadata for docker.io/library/node:18-alpine
✅ #4 [builder 1/7] FROM node:18-alpine
✅ #5 [builder 2/7] WORKDIR /app
✅ #6 [builder 3/7] RUN apk add --no-cache python3 make g++
✅ #7 [builder 4/7] COPY package*.json ./
✅ #8 [builder 5/7] RUN npm install
✅ #9 [builder 6/7] COPY tsconfig*.json nest-cli.json ./
✅ #10 [builder 7/7] COPY src ./src
✅ #11 [builder] RUN npm run build
✅ #12 [production 1/8] FROM node:18-alpine
...
✅ Build completed successfully!
```

**Build Time:** ~2-3 minutes for first build

---

## 🧪 Verification Steps

### 1. Get Your Production URL

After successful deployment, Railway provides a URL:
```
https://agentdesk-backend-production-xxxx.up.railway.app
```

Find it in:
- **Settings** → **Domains** section
- Or top of the deployment page

### 2. Test API Health Endpoint

```bash
curl https://YOUR-RAILWAY-URL.railway.app/api
```

**Expected Response:**
```json
{"message":"AgentDesk API is running"}
```

### 3. Test Widget Script

Open in browser:
```
https://YOUR-RAILWAY-URL.railway.app/widget-standalone.js
```

**Expected:** JavaScript code for the widget loads

### 4. Test Bot Config

```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/bots/config/bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
```

**Expected:** JSON with MichalBot configuration

---

## 🎯 Why This Solution Works

### Before (Broken):
```
Railway Root (/)
├── package.json (workspaces: ["backend", "frontend", "widget"])
├── backend/
│   └── package.json (name: "agentdesk-backend")  ← Name mismatch!
└── Railway tries: npm run build --workspace=agentdesk-backend  ❌
```

### After (Fixed):
```
Railway Root (/backend)
├── package.json (name: "agentdesk-backend")
├── Dockerfile  ← Railway uses this directly!
└── No npm workspace confusion!  ✅
```

---

## 🔧 Troubleshooting

### Issue: Root Directory setting doesn't save
**Solution:** 
- Make sure you have write access to the Railway project
- Try refreshing the page and setting it again

### Issue: Build still fails with same error
**Solution:**
- Verify Root Directory is exactly: `backend` (no leading/trailing slashes)
- Check Deployments tab to ensure a new build was triggered
- Force a new deployment manually

### Issue: Dockerfile not detected
**Solution:**
- After setting Root Directory, wait a few seconds
- Refresh the Settings page
- Railway should auto-detect the Dockerfile
- If not, manually select Dockerfile in Build settings

### Issue: Environment variables missing
**Solution:**
- Copy from your local `backend/.env` file
- Generate new ENCRYPTION_KEY (don't use local one in production)
- Double-check SUPABASE_URL has no trailing slash

### Issue: Build succeeds but deployment fails
**Solution:**
- Check Deploy Logs (not Build Logs)
- Common issues:
  - Missing environment variables
  - Invalid SUPABASE_URL or keys
  - CORS_ORIGIN misconfiguration

---

## 📝 Checklist

Use this checklist when configuring:

- [ ] Settings → Source → Root Directory = `backend`
- [ ] Settings → Source → Branch = `main`
- [ ] Settings → Build → Builder = Dockerfile (auto-detected)
- [ ] Variables tab → All required variables added
- [ ] Variables tab → ENCRYPTION_KEY generated and added
- [ ] Deployment triggered (automatic or manual)
- [ ] Build Logs show successful Docker build
- [ ] Deploy Logs show container running
- [ ] Test: `/api` endpoint returns success
- [ ] Test: `/widget-standalone.js` loads
- [ ] Test: Bot config endpoint works

---

## 🎉 Success Indicators

When everything works, you'll see:

✅ **In Railway Dashboard:**
- 🟢 Deployment status: Active
- 🟢 Build: Successful
- 🟢 Container: Running

✅ **In Build Logs:**
- All Dockerfile steps completed
- No npm workspace errors
- "Build completed successfully"

✅ **In Deploy Logs:**
- Container started
- Health check passing
- No error messages

✅ **In Tests:**
- API endpoint responds
- Widget script loads
- Bot config returns data

---

## 🚀 Next Steps After Successful Deployment

1. **Update WordPress Plugin** with the new Railway URL
2. **Test the widget** on tirufai.com
3. **Configure custom domain** (optional) in Railway settings
4. **Set up monitoring** and alerts if needed

---

## 💡 Pro Tips

1. **Auto-Deploy:** Railway automatically deploys on every push to `main` branch
2. **Rollback:** You can rollback to previous deployments from the Deployments tab
3. **Logs:** Real-time logs available in Deploy Logs tab
4. **Resource Usage:** Monitor in Metrics tab to stay within free tier
5. **Custom Domain:** Add in Settings → Domains for production use

---

**Need Help?** Check Railway logs first - they show exactly what's happening!

**Estimated Time:** 5-10 minutes to configure ⏱️

