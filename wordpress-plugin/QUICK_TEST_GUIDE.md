# 🧪 Quick Test Guide - WordPress Plugin

## 🎯 Goal
Test the AgentDesk WordPress plugin on a local WordPress installation.

---

## ✅ Pre-Test Checklist

Before testing, confirm:

- [x] **Backend is running**: `http://localhost:3001/api` returns status
- [x] **Widget is accessible**: `http://localhost:3001/widget-standalone.js` returns JavaScript
- [ ] **WordPress is installed** locally (XAMPP/Local/WAMP)
- [ ] **You have a valid bot token** (from dashboard or database)

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Get Your Bot Token (2 ways)

#### Option A: From Dashboard
1. Go to: `http://localhost:3000` (frontend)
2. Login to your AgentDesk account
3. Navigate to **Bots** section
4. Copy the bot token

#### Option B: From Database
```bash
# In terminal
cd C:\Projects\AgentDesk

# If using Supabase, check your .env file:
# The bot token starts with "bot_" followed by a long hash
```

**Example bot token:**
```
bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
```

### Step 2: Test Bot Token Works

```powershell
# In PowerShell, test the bot config endpoint:
$botToken = "bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6"
Invoke-WebRequest -Uri "http://localhost:3001/api/bots/config/$botToken" -Method Get
```

**Expected response:**
```json
{
  "id": "...",
  "name": "My Bot",
  "token": "bot_...",
  "config": { ... }
}
```

If you get **404**: Bot token is invalid, get a new one.

### Step 3: Install Plugin on WordPress

#### If You Have WordPress Locally:

**Quick Copy Method:**

```powershell
# Copy plugin to WordPress plugins folder
# (Replace [YOUR_WORDPRESS_PATH] with actual path)

$source = "C:\Projects\AgentDesk\wordpress-plugin\agentdesk-chat-widget"
$destination = "C:\xampp\htdocs\wordpress\wp-content\plugins\agentdesk-chat-widget"

Copy-Item -Path $source -Destination $destination -Recurse -Force

Write-Host "✅ Plugin copied to WordPress!" -ForegroundColor Green
```

**Common WordPress Paths:**
- XAMPP: `C:\xampp\htdocs\wordpress\wp-content\plugins\`
- Local by Flywheel: `C:\Users\[USER]\Local Sites\[SITE]\app\public\wp-content\plugins\`
- WAMP: `C:\wamp64\www\wordpress\wp-content\plugins\`

#### If You Don't Have WordPress:

**Option 1: Install Local by Flywheel** (Recommended - Easiest)
1. Download: https://localwp.com/
2. Install and create new WordPress site
3. Copy plugin to plugins folder
4. Access site via Local's "Open Site" button

**Option 2: Use Docker**
```powershell
# Quick WordPress setup with Docker
docker run -d -p 8080:80 -e WORDPRESS_DB_HOST=host.docker.internal:3306 -e WORDPRESS_DB_USER=root -e WORDPRESS_DB_PASSWORD=root wordpress:latest

# Access: http://localhost:8080
# Complete WordPress installation
# Then copy plugin files
```

### Step 4: Activate Plugin

1. Go to WordPress Admin: `http://localhost/wordpress/wp-admin`
2. Navigate to: **Plugins → Installed Plugins**
3. Find: **AgentDesk Chat Widget**
4. Click: **Activate**

### Step 5: Configure Plugin

1. Go to: **Settings → AgentDesk Chat**
2. Enter your **Bot Token**
3. Keep default **Position**: `bottom-right`
4. Click: **Save Settings**

### Step 6: Test Widget

1. **Visit Front-End:**
   - Go to your site's homepage: `http://localhost/wordpress`
   - **Important**: Log out of WordPress admin or open in incognito mode

2. **Check Widget Appears:**
   - Look in bottom-right corner
   - Should see a chat bubble

3. **Open DevTools (F12):**
   - Go to **Console** tab
   - Look for initialization message:
     ```
     AgentDesk Widget initialized
     ```
   - Check for any errors (should be none)

4. **Test Chat:**
   - Click the chat bubble
   - Chat window should open
   - Type: "Hello"
   - Should receive bot response

---

## 🎬 Visual Testing Checklist

### What You Should See:

#### 1. WordPress Admin Panel
```
╔══════════════════════════════════════╗
║   Settings > AgentDesk Chat          ║
║                                      ║
║   Bot Token:                         ║
║   [bot_234dad3b62cd...] ✓            ║
║                                      ║
║   Widget Position:                   ║
║   ( ) Top Left   ( ) Top Right       ║
║   ( ) Bottom Left (●) Bottom Right   ║
║                                      ║
║   [ Save Settings ]                  ║
╚══════════════════════════════════════╝
```

#### 2. Front-End Widget
```
╔══════════════════════════════════════╗
║                                      ║
║   Your WordPress Site Content        ║
║                                      ║
║                                      ║
║                               ⚫ 💬   ║  ← Chat Bubble
╚══════════════════════════════════════╝
```

#### 3. Open Chat Window
```
╔══════════════════════════════════════╗
║   🤖 AgentDesk           [ - ]  [ × ]║
║─────────────────────────────────────║
║                                      ║
║   Bot: Hi! How can I help you?       ║
║                                      ║
║                         You: Hello   ║
║                                      ║
║   Bot: Hello! What can I do for you? ║
║                                      ║
║─────────────────────────────────────║
║   Type a message...         [Send]   ║
╚══════════════════════════════════════╝
```

---

## 🐛 Quick Troubleshooting

### Issue: Widget Not Showing

**Check 1: Backend Running?**
```powershell
curl http://localhost:3001/api
```
If fails → Start backend: `cd backend; npm run start:dev`

**Check 2: Script Loading?**
- Open DevTools (F12) → Network tab
- Refresh page
- Look for: `widget-standalone.js`
- Should be status `200 OK`

**Check 3: JavaScript Errors?**
- Open DevTools (F12) → Console tab
- Look for red error messages
- Common errors:
  - `botToken is required` → Check token in settings
  - `Failed to fetch` → Backend not running
  - `CORS error` → Backend CORS should be fixed

### Issue: Chat Not Responding

**Check 1: Bot Token Valid?**
```powershell
$token = "YOUR_BOT_TOKEN"
Invoke-WebRequest -Uri "http://localhost:3001/api/bots/config/$token"
```

**Check 2: Chat API Working?**
```powershell
# Test chat endpoint
$body = @{
  message = "Hello"
  sessionId = "test123"
  source = "web"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/chat/message" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"; "X-Bot-Token"="YOUR_BOT_TOKEN"} `
  -Body $body
```

### Issue: CORS Errors

Backend should already have CORS enabled. If you still see CORS errors:

**Check backend is running on port 3001:**
```powershell
netstat -ano | findstr :3001
```

**Restart backend:**
```bash
cd backend
npm run start:dev
```

---

## ✅ Success Criteria

Your test is successful if:

- [x] Plugin activates without errors
- [x] Settings page shows and saves
- [x] Widget appears on front-end
- [x] Chat bubble is clickable
- [x] Chat window opens
- [x] Can type and send messages
- [x] Bot responds to messages
- [x] No console errors
- [x] Widget persists across page reloads

---

## 📊 Test Results Template

After testing, fill this out:

```
✅ Backend Status: Running on http://localhost:3001
✅ Widget Accessible: http://localhost:3001/widget-standalone.js
✅ Bot Token Valid: bot_234dad3b...
✅ Plugin Installed: Version 1.0.0
✅ Plugin Activated: No errors
✅ Settings Saved: Bot token configured
✅ Widget Displays: Bottom-right corner
✅ Chat Opens: Click bubble works
✅ Chat Works: Send/receive messages
✅ No Console Errors: Clean console

Overall Status: ✅ PASSED / ❌ FAILED

Notes:
- [Any observations]
- [Any issues encountered]
- [Performance notes]
```

---

## 🎯 What's Next?

Once local testing passes:

1. ✅ **Local test passed** ← You are here
2. 📦 **Create plugin ZIP** for distribution
3. 🌐 **Deploy backend** to production
4. 📤 **Upload widget** to CDN
5. 🚀 **Deploy to live WordPress** site
6. 📈 **Monitor and optimize**

---

## 🆘 Still Stuck?

### Debug Checklist:

```bash
# 1. Check backend
curl http://localhost:3001/api

# 2. Check widget
curl http://localhost:3001/widget-standalone.js

# 3. Check bot config
curl http://localhost:3001/api/bots/config/YOUR_BOT_TOKEN

# 4. Check WordPress
- Visit: http://localhost/wordpress/wp-admin
- Go to: Plugins → Installed Plugins
- Verify: AgentDesk Chat Widget is active

# 5. Check browser console
- Open: DevTools (F12)
- Tab: Console
- Look: For errors or initialization message
```

### Common Fixes:

| Problem | Solution |
|---------|----------|
| Backend not starting | Check `npm install` completed, check port 3001 free |
| Widget 404 | Check file exists: `backend/public/widget-standalone.js` |
| Plugin won't activate | Check WordPress version ≥5.0, PHP ≥7.4 |
| Widget not visible | Check you're logged out or in incognito mode |
| No bot response | Check bot token is valid and backend is running |

---

**Ready to test?** Follow steps above! 🚀
**Questions?** Check WordPress debug.log and backend console! 🔍

