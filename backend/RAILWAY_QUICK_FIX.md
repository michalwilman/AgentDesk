# ⚡ Railway Quick Fix - Backend Build Failing

## 🔴 Error You're Seeing

```
npm error No workspaces found:
npm error   --workspace=agentdesk-backend
```

## ✅ One-Line Solution

**Set Root Directory to `backend` in Railway Settings → Source**

---

## 📋 Quick Steps (2 minutes)

### 1. Railway Dashboard
- Go to your Railway project → **agentdesk-backend** service
- Click **Settings** tab
- Find **Source** section

### 2. Change Root Directory
```
Root Directory: backend
```
(Type exactly: `backend` - no slashes, no spaces)

### 3. Save & Wait
- Setting saves automatically
- Railway will trigger a new build (~2-3 minutes)
- Watch the Deployments tab

---

## 🧪 Quick Test After Deploy

Your Railway URL: `https://agentdesk-backend-production-xxxx.up.railway.app`

Test in browser:
```
https://YOUR-URL/api
```

Should return:
```json
{"message":"AgentDesk API is running"}
```

---

## ❓ Why This Works

**Problem:** Railway tries to build from project root using npm workspaces, but workspace name doesn't match.

**Solution:** Point Railway directly to `backend/` folder where your Dockerfile lives.

---

## 🚨 Still Not Working?

### Check #1: Root Directory is exactly `backend`
- No leading slash: ❌ `/backend`
- No trailing slash: ❌ `backend/`
- Just: ✅ `backend`

### Check #2: Environment Variables
Go to Variables tab, ensure you have:
- ✅ `PORT=3001`
- ✅ `NODE_ENV=production`
- ✅ `SUPABASE_URL=...`
- ✅ `SUPABASE_ANON_KEY=...`
- ✅ `SUPABASE_SERVICE_ROLE_KEY=...`
- ✅ `OPENAI_API_KEY=...`
- ✅ `ENCRYPTION_KEY=...` (generate new!)

Generate ENCRYPTION_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check #3: Builder is Dockerfile
Settings → Build → Builder should be **Dockerfile** (auto-detected)

---

## 📚 Need Detailed Guide?

See: `../RAILWAY_CONFIGURATION_STEPS.md` for complete walkthrough

---

**That's it! Your backend should now deploy successfully!** 🚀

