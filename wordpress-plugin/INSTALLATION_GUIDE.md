# 📦 AgentDesk WordPress Plugin - Installation Guide

## ✅ Prerequisites Checklist

Before installing, make sure you have:

- [x] **Backend running** on `http://localhost:3001`
- [x] **Widget accessible** at `http://localhost:3001/widget-standalone.js`
- [ ] **WordPress site** (local or live)
- [ ] **Bot Token** from AgentDesk dashboard

---

## 🚀 Quick Installation (3 Steps)

### Step 1: Prepare Plugin Files

```bash
# Navigate to plugin folder
cd C:\Projects\AgentDesk\wordpress-plugin

# Check files exist
dir agentdesk-chat-widget
```

**Required files:**
```
agentdesk-chat-widget/
├── agentdesk-chat-widget.php  ✅ Main plugin file
├── readme.txt                  ✅ WordPress readme
├── assets/
│   └── icon-256x256.png       ✅ Plugin icon
└── includes/
    ├── admin-page.php         ✅ Admin panel
    └── widget-handler.php     ✅ Widget loader
```

### Step 2: Install on WordPress

#### Option A: Local WordPress (XAMPP/Local by Flywheel/WAMP)

1. **Locate WordPress plugins folder:**
   - XAMPP: `C:\xampp\htdocs\wordpress\wp-content\plugins\`
   - Local by Flywheel: `C:\Users\[YOUR_USER]\Local Sites\[SITE_NAME]\app\public\wp-content\plugins\`
   - WAMP: `C:\wamp64\www\wordpress\wp-content\plugins\`

2. **Copy plugin folder:**
   ```bash
   # Replace [PLUGINS_PATH] with your actual path
   xcopy "C:\Projects\AgentDesk\wordpress-plugin\agentdesk-chat-widget" "[PLUGINS_PATH]\agentdesk-chat-widget\" /E /I
   ```

3. **Access WordPress Admin:**
   - Go to: `http://localhost/wordpress/wp-admin` (or your local URL)
   - Username/Password: your WordPress credentials

#### Option B: Live WordPress Site

1. **Zip the plugin:**
   ```bash
   # Create ZIP file
   Compress-Archive -Path "C:\Projects\AgentDesk\wordpress-plugin\agentdesk-chat-widget" -DestinationPath "C:\Projects\AgentDesk\agentdesk-chat-widget.zip" -Force
   ```

2. **Upload via WordPress Admin:**
   - Go to: **Plugins → Add New → Upload Plugin**
   - Choose: `agentdesk-chat-widget.zip`
   - Click: **Install Now**

### Step 3: Activate & Configure

1. **Activate Plugin:**
   - Go to: **Plugins → Installed Plugins**
   - Find: **AgentDesk Chat Widget**
   - Click: **Activate**

2. **Configure Settings:**
   - Go to: **Settings → AgentDesk Chat**
   - Enter **Bot Token** (from your AgentDesk dashboard)
   - Choose **Widget Position** (default: bottom-right)
   - Click: **Save Settings**

3. **Test Widget:**
   - Visit your site's front page
   - Look for chat widget in bottom-right corner
   - Click to open and test chat

---

## 🔧 Configuration Options

### Widget Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Bot Token** | Your unique bot identifier | Required |
| **Widget Position** | Where to display widget | `bottom-right` |
| **API URL** | Backend API endpoint | `http://localhost:3001/api` |
| **Widget Script URL** | Widget JavaScript file | `http://localhost:3001/widget-standalone.js` |

### Advanced Settings (optional)

Edit `agentdesk-chat-widget.php` if you need to customize:

```php
// Change widget position
$position = get_option('agentdesk_position', 'bottom-right');

// Change API URL (for production)
$api_url = get_option('agentdesk_api_url', 'https://api.agentdesk.com/api');

// Change widget script URL (for production CDN)
$widget_url = get_option('agentdesk_widget_url', 'https://cdn.agentdesk.com/widget-standalone.js');
```

---

## ✅ Verification Checklist

After installation, verify everything works:

### 1. Plugin Activated
- [ ] Go to **Plugins → Installed Plugins**
- [ ] See **AgentDesk Chat Widget** with green "Deactivate" button

### 2. Settings Saved
- [ ] Go to **Settings → AgentDesk Chat**
- [ ] See your bot token filled in
- [ ] See "Settings saved successfully" message

### 3. Widget Loads on Front-End
- [ ] Visit your site's homepage (logged out)
- [ ] Open browser DevTools (F12)
- [ ] Check **Console** for errors
- [ ] Look for: `AgentDesk Widget initialized`

### 4. Widget Displays
- [ ] See chat bubble in corner of page
- [ ] Click bubble → chat window opens
- [ ] See bot greeting message

### 5. Chat Works
- [ ] Type a test message
- [ ] Receive bot response
- [ ] Check message history persists

---

## 🐛 Troubleshooting

### Widget Not Appearing?

**Check 1: Backend Running**
```bash
# Test backend
curl http://localhost:3001/api
# Should return: {"name":"AgentDesk API",...}
```

**Check 2: Widget Script Loads**
```bash
# Test widget
curl http://localhost:3001/widget-standalone.js
# Should return JavaScript code
```

**Check 3: WordPress Errors**
- Enable WordPress debug mode:
  ```php
  // In wp-config.php
  define('WP_DEBUG', true);
  define('WP_DEBUG_LOG', true);
  define('WP_DEBUG_DISPLAY', true);
  ```
- Check: `wp-content/debug.log`

**Check 4: Browser Console**
- Open DevTools (F12) → Console tab
- Look for errors like:
  - ❌ `Failed to load resource: net::ERR_CONNECTION_REFUSED`
  - ❌ `Uncaught ReferenceError: AgentDeskWidget is not defined`

### CORS Errors?

If you see: `Access to script at 'http://localhost:3001/widget-standalone.js' from origin 'http://localhost' has been blocked by CORS`

**Solution:**
Backend already has CORS enabled with wildcard. Make sure backend is running.

### Widget Loads But Chat Doesn't Work?

**Check Bot Token:**
```bash
# Test bot config endpoint
curl http://localhost:3001/api/bots/config/YOUR_BOT_TOKEN
# Should return bot configuration
```

If you get `404` → Bot token is invalid

**Check Chat API:**
```bash
# Test chat endpoint
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-Bot-Token: YOUR_BOT_TOKEN" \
  -d '{"message":"Hello","sessionId":"test123","source":"web"}'
```

Should return bot response.

---

## 📊 What Gets Loaded

When a user visits your WordPress site, here's what happens:

### 1. WordPress Page Loads
```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <!-- Your WordPress content -->
  
  <!-- AgentDesk Widget Script (injected by plugin) -->
  <script>
    window.agentdeskConfig = {
      botToken: 'bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6',
      apiUrl: 'http://localhost:3001/api',
      position: 'bottom-right'
    };
  </script>
  <script src="http://localhost:3001/widget-standalone.js" async defer></script>
</body>
</html>
```

### 2. Widget Initializes
```javascript
// Widget checks for configuration
const config = window.agentdeskConfig;

// Creates chat bubble
// Loads chat window
// Connects to backend API
```

### 3. User Interactions
```
User clicks bubble → Open chat window
User types message → Send to API → Get response → Display
```

---

## 🌐 Production Deployment

Once everything works locally, deploy to production:

### 1. Update API URLs

In WordPress Admin → Settings → AgentDesk Chat:

```
Bot Token: [Your production bot token]
API URL: https://api.agentdesk.com/api
Widget Script URL: https://cdn.agentdesk.com/widget-standalone.js
```

### 2. Deploy Backend

Deploy your backend to production server (e.g., Heroku, AWS, DigitalOcean)

### 3. Deploy Widget to CDN

Upload `widget-standalone.js` to CDN (e.g., Cloudflare, AWS CloudFront, Netlify)

### 4. Update CORS Settings

Make sure production backend allows your WordPress domain:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: ['https://yourwordpresssite.com', 'https://www.yourwordpresssite.com'],
  credentials: true,
});
```

---

## 📞 Need Help?

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Plugin won't activate | Check PHP version ≥7.4 |
| Widget not showing | Check backend is running |
| CORS errors | Backend CORS already configured |
| Chat not responding | Verify bot token is valid |
| Errors in console | Check backend logs |

### Debug Mode

Enable plugin debug output:

```php
// Add to wp-config.php
define('AGENTDESK_DEBUG', true);
```

This will show detailed logs in browser console.

---

## ✨ Features Included

After successful installation, you'll have:

- ✅ **Chat Widget** - Beautiful floating chat bubble
- ✅ **Admin Panel** - Easy configuration in WordPress
- ✅ **Position Control** - Choose widget placement
- ✅ **No iframe** - Direct integration, no iframe lag
- ✅ **Session Persistence** - Chat history saved
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Custom Branding** - Bot name, avatar, colors
- ✅ **Analytics Ready** - Track conversations
- ✅ **GDPR Compliant** - Privacy-focused

---

## 🎯 Next Steps

1. ✅ Install and activate plugin
2. ✅ Configure bot token
3. ✅ Test on local WordPress
4. 📦 Deploy to production
5. 🎨 Customize widget appearance
6. 📊 Monitor chat analytics

---

**Status**: 🟢 Ready for Installation  
**Last Updated**: October 28, 2025  
**Support**: Check backend logs and WordPress debug.log

