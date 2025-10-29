# 🚀 Quick Start - Test WordPress Plugin in 15 Minutes

## ✅ What's Ready

- [x] WordPress plugin fully developed
- [x] Standalone widget created  
- [x] Backend serves widget locally
- [x] All documentation complete

---

## 🎯 Your Mission (15 minutes)

Test the plugin on local WordPress before production deployment.

---

## 📋 Quick Setup (Choose One)

### Option A: Local by Flywheel (Easiest for Windows) ⭐

**Step 1** - Install Local (2 min)
```
1. Download: https://localwp.com/
2. Install and run
3. Click "+" → Create new site
   - Name: agentdesk-test  
   - PHP: 8.0
   - WordPress: Latest
4. Click "Add Site" → Wait 2 min
```

**Step 2** - Start Backend (1 min)
```bash
# Terminal 1: Start AgentDesk backend
cd backend
npm run start:dev

# Should see: 🚀 AgentDesk Backend running on: http://localhost:3001/api
# Widget now available at: http://localhost:3001/widget-standalone.js
```

**Step 3** - Install Plugin (3 min)
```
1. In Local, click "WP Admin" button
2. Login (user: admin, pass: admin)
3. Go to: Plugins → Add New → Upload Plugin
4. Upload: wordpress-plugin.zip (need to create first!)
5. Click "Install Now" → "Activate"
```

**Step 4** - Package Plugin First (2 min)
```bash
# Terminal 2: Package the plugin
cd wordpress-plugin

# Windows (use Git Bash):
bash package.sh

# Or manually create ZIP:
zip -r agentdesk-chatbot-1.0.0.zip agentdesk-chatbot.php readme.txt includes/ assets/ languages/

# Output: dist/agentdesk-chatbot-1.0.0.zip
```

**Step 5** - Configure (2 min)
```
1. Go to: Settings → AgentDesk
2. Get API token from: https://agentdesk.com/dashboard
3. Paste token
4. Set position: Bottom Right
5. Enable: ✅ Check
6. Display: All Pages
7. Click "Save Settings"
```

**Step 6** - Test! (5 min)
```
1. Click "View Site" in Local
2. Look for chat bubble in bottom-right
3. Click bubble → Chat opens
4. Type message → Get response
5. ✅ Success!
```

---

### Option B: Docker (Cross-platform)

**Quick Docker Setup:**

```bash
# Create test folder
mkdir wordpress-test
cd wordpress-test

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./plugins:/var/www/html/wp-content/plugins

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: somewordpress
EOF

# Start WordPress
docker-compose up -d

# Wait 30 seconds
# Visit: http://localhost:8000
# Install WordPress → Install plugin → Test!
```

---

## ⚠️ Important: Update Plugin URLs for Local Testing

**Before testing**, edit `agentdesk-chatbot.php`:

```php
// Line 26-27 - CHANGE TO:
define('AGENTDESK_CDN_URL', 'http://localhost:3001/widget-standalone.js');
define('AGENTDESK_API_URL', 'http://localhost:3001');

// ⚠️ REMEMBER TO CHANGE BACK before production:
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');
```

---

## ✅ Test Checklist (5 min)

Quick tests:

- [ ] Widget bubble appears
- [ ] Bubble color matches bot
- [ ] Click opens chat window
- [ ] Bot name shows correctly
- [ ] Can send message
- [ ] Bot responds
- [ ] Close button works
- [ ] No console errors (F12)

---

## 🐛 Troubleshooting (If something fails)

### Widget Not Appearing?

```bash
# 1. Check backend is running
curl http://localhost:3001/widget-standalone.js

# 2. Check browser console (F12)
# Look for errors

# 3. Check plugin is activated
# WordPress → Plugins → Ensure "AgentDesk" is active

# 4. Check settings
# Settings → AgentDesk → "Enable Chatbot" must be checked
```

### Bot Not Responding?

```bash
# Check backend logs
# Should see: POST /api/chat/message

# Check API token is correct
curl http://localhost:3001/api/bots/config/YOUR_TOKEN
```

---

## 📸 Take Screenshots (for WordPress.org)

While testing, capture:

1. Admin settings page (configured)
2. Widget bubble on site
3. Chat window with conversation
4. Mobile view (resize browser)

Save to: `wordpress-plugin/assets/images/screenshots/`

---

## 🎉 Success! What's Next?

After successful local testing:

1. **Production CDN Setup** (20 min)
   - Deploy widget to Cloudflare Pages
   - Get URL: https://cdn.agentdesk.com/widget-standalone.js
   - Update plugin constants

2. **Create Assets** (2-3 hours)
   - Design icon (128x128)
   - Design banner (772x250)
   - Finalize screenshots

3. **WordPress.org Submission** (1 week)
   - Submit plugin ZIP
   - Wait for review (7-14 days)
   - Respond to feedback
   - Launch! 🚀

---

## 📞 Need Help?

- Full guide: `TESTING_WORDPRESS_LOCALLY.md`
- CDN setup: `CDN_SETUP_GUIDE.md`
- Deployment: `DEPLOYMENT.md`
- Email: support@agentdesk.com

---

**Time to complete**: 15-30 minutes  
**Difficulty**: Easy  
**Prerequisites**: Node.js, Docker OR Local by Flywheel

**Let's do this! 💪**

