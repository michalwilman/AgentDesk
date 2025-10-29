# Testing AgentDesk WordPress Plugin Locally

## 🎯 Goal

Test the WordPress plugin on your local machine before deploying to production.

---

## 🛠️ Prerequisites

- [x] Backend running on `http://localhost:3001`
- [x] Widget served from `http://localhost:3001/widget-standalone.js`
- [ ] WordPress installed locally
- [ ] Plugin ZIP file created

---

## ⚙️ Option 1: Local by Flywheel (Easiest - Recommended for Windows)

### Step 1: Install Local

1. Download: https://localwp.com/
2. Install and open Local
3. Click "+" to create new site

### Step 2: Create WordPress Site

**Site Details:**
- Site name: `agentdesk-test`
- Environment: PHP 8.0, WordPress Latest
- Username: `admin`
- Password: `admin`

Click "Add Site" → Wait ~2 minutes

### Step 3: Start Site

1. Click your site in Local
2. Click "Start site"
3. Click "WP Admin" → Opens WordPress dashboard
4. OR visit: `http://agentdesk-test.local/wp-admin`

### Step 4: Install Plugin

**Method A: Upload ZIP**
1. In WP Admin, go to Plugins → Add New
2. Click "Upload Plugin"
3. Choose `agentdesk-chatbot-1.0.0.zip`
4. Click "Install Now"
5. Click "Activate"

**Method B: Manual Install**
1. In Local, click "Go to site folder"
2. Navigate to `app/public/wp-content/plugins/`
3. Create folder `agentdesk-chatbot`
4. Copy all plugin files there
5. In WP Admin → Plugins → Activate "AgentDesk AI Chatbot"

### Step 5: Configure Plugin

1. Go to Settings → AgentDesk
2. You'll see setup wizard
3. Create a bot at https://agentdesk.com or use existing
4. Copy Bot API Token
5. Paste in WordPress
6. **Important**: For local testing:
   - Position: Bottom Right
   - Enable: ✅ Checked
   - Display: All Pages

7. Click "Save Settings"

### Step 6: Update Plugin for Local URLs

**TEMPORARY FIX (for local testing only):**

Edit plugin file directly in Local:

1. Click site → "Go to site folder"
2. Navigate to `app/public/wp-content/plugins/agentdesk-chatbot/`
3. Open `agentdesk-chatbot.php` in text editor
4. Change lines 26-27:

```php
// BEFORE (production):
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');

// AFTER (local testing):
define('AGENTDESK_CDN_URL', 'http://localhost:3001/widget-standalone.js');
define('AGENTDESK_API_URL', 'http://localhost:3001');
```

5. Save file
6. **Remember to change back before production!**

### Step 7: Test the Widget

1. Visit: `http://agentdesk-test.local`
2. You should see the chat bubble in bottom-right corner
3. Click the bubble
4. Chat window opens
5. Type a message
6. You should get a response from the bot

---

## 🐳 Option 2: Docker WordPress (Cross-platform)

### Step 1: Create Docker Compose File

Create `wordpress-test/docker-compose.yml`:

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
      - ./plugins:/var/www/html/wp-content/plugins

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: somewordpress
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
```

### Step 2: Start WordPress

```bash
cd wordpress-test
docker-compose up -d

# Wait 30 seconds for MySQL to initialize
# Then visit: http://localhost:8000
```

### Step 3: WordPress Setup

1. Visit: http://localhost:8000
2. Select language: English
3. Click "Continue"
4. Fill in:
   - Site Title: AgentDesk Test
   - Username: admin
   - Password: admin
   - Email: your@email.com
5. Click "Install WordPress"
6. Login with admin/admin

### Step 4: Install Plugin

1. Extract `agentdesk-chatbot-1.0.0.zip`
2. Copy `agentdesk-chatbot` folder to `wordpress-test/plugins/`
3. In WP Admin → Plugins → Activate

### Step 5: Configure & Test

Follow same steps as Option 1 (Steps 5-7)

---

## 💻 Option 3: XAMPP (Windows)

### Step 1: Install XAMPP

1. Download: https://www.apachefriends.org/
2. Install to `C:\xampp`
3. Start Apache and MySQL from XAMPP Control Panel

### Step 2: Download WordPress

1. Download: https://wordpress.org/latest.zip
2. Extract to `C:\xampp\htdocs\wordpress`

### Step 3: Create Database

1. Visit: http://localhost/phpmyadmin
2. Click "Databases"
3. Create database: `wordpress`

### Step 4: Install WordPress

1. Visit: http://localhost/wordpress
2. Click "Let's go!"
3. Database settings:
   - Database Name: wordpress
   - Username: root
   - Password: (leave empty)
   - Database Host: localhost
   - Table Prefix: wp_
4. Click "Submit"
5. Click "Run the installation"
6. Fill in site details
7. Click "Install WordPress"

### Step 5: Install Plugin

1. Copy plugin folder to:  
   `C:\xampp\htdocs\wordpress\wp-content\plugins\agentdesk-chatbot\`
2. In WP Admin → Plugins → Activate

### Step 6: Configure & Test

Follow same steps as Option 1 (Steps 5-7)

---

## ✅ Testing Checklist

### Admin Panel Tests:

- [ ] Settings page loads without errors
- [ ] Can enter API token
- [ ] Token validation works (shows success/error message)
- [ ] Can change widget position
- [ ] Can enable/disable chatbot
- [ ] Can change display rules
- [ ] Settings save correctly
- [ ] Status indicators work
- [ ] Help links are correct

### Frontend Tests:

- [ ] Widget bubble appears on homepage
- [ ] Widget bubble appears on posts
- [ ] Widget bubble appears on pages
- [ ] Widget respects display rules
- [ ] Bubble has correct position (right/left)
- [ ] Bubble color matches bot settings
- [ ] Clicking bubble opens chat window
- [ ] Chat window displays correctly
- [ ] Bot name shows correctly
- [ ] Welcome message displays
- [ ] Can type in input field
- [ ] Send button works
- [ ] Messages send to backend
- [ ] Bot responds with messages
- [ ] Typing indicator shows while waiting
- [ ] Messages display in correct order
- [ ] Scroll works in chat window
- [ ] Close button closes chat
- [ ] Bubble reappears after closing
- [ ] Chat history persists during session

### Mobile Tests:

- [ ] Widget works on mobile viewport (< 768px)
- [ ] Chat is full-screen on mobile
- [ ] Input field accessible on mobile keyboard
- [ ] All buttons work on touch devices

### Browser Tests:

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)

### Performance Tests:

- [ ] Widget loads in < 2 seconds
- [ ] No JavaScript errors in console
- [ ] No PHP errors in WordPress debug.log
- [ ] Page speed not significantly impacted
- [ ] Widget doesn't block page rendering

### Error Handling Tests:

- [ ] Invalid API token → Shows error message
- [ ] Empty API token → Shows setup notice
- [ ] Backend offline → Shows friendly error
- [ ] Network error → Shows retry option

---

## 🐛 Common Issues & Fixes

### Issue: Widget Bubble Not Appearing

**Causes:**
1. Plugin not activated
2. Chatbot disabled in settings
3. Wrong display rules
4. JavaScript error

**Fix:**
1. Check Plugins → Ensure "AgentDesk" is activated
2. Settings → AgentDesk → Ensure "Enable Chatbot" is checked
3. Set Display to "All Pages"
4. Open browser console (F12) → Check for errors

### Issue: Widget Loads But No Response

**Causes:**
1. Backend not running
2. Invalid API token
3. Bot not trained
4. CORS error

**Fix:**
```bash
# 1. Check backend is running
curl http://localhost:3001/api/health

# 2. Check widget loads
curl -I http://localhost:3001/widget-standalone.js

# 3. Check bot config
curl http://localhost:3001/api/bots/config/YOUR_TOKEN_HERE

# 4. Check browser console for CORS errors
```

### Issue: "Token validation failed"

**Fix:**
1. Go to AgentDesk dashboard
2. Navigate to Bot Settings
3. Copy API token again (use Copy button)
4. Paste in WordPress
5. Save settings

### Issue: Widget Styling Broken

**Causes:**
1. Theme CSS conflicts
2. Cache issue

**Fix:**
1. Try different theme (Twenty Twenty-Four)
2. Clear browser cache (Ctrl+Shift+Del)
3. Hard reload (Ctrl+F5)

### Issue: Mixed Content Warning (HTTP/HTTPS)

**Cause:**
- WordPress on HTTPS but widget on HTTP

**Fix:**
1. Use HTTPS for backend
2. Or use HTTP for WordPress (local testing only)

---

## 📊 Debug Mode

Enable WordPress debug mode to see detailed errors:

### Edit `wp-config.php`:

```php
// Add these lines before "That's all, stop editing!"
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
@ini_set('display_errors', 0);
```

### View Logs:

- Location: `wp-content/debug.log`
- Check for PHP errors related to AgentDesk

---

## 🎬 Test Scenarios

### Scenario 1: Fresh Install

1. Install WordPress
2. Install plugin
3. Configure with valid token
4. Visit site
5. Verify widget works

### Scenario 2: Disable/Enable

1. Uncheck "Enable Chatbot"
2. Save
3. Visit site → Widget should NOT appear
4. Re-enable
5. Visit site → Widget should reappear

### Scenario 3: Change Position

1. Change position to "Bottom Left"
2. Save
3. Visit site → Bubble should be on left

### Scenario 4: Display Rules

1. Set display to "Homepage Only"
2. Visit homepage → Widget appears
3. Visit post → Widget should NOT appear

### Scenario 5: Invalid Token

1. Enter invalid token (e.g., "bot_invalid123")
2. Save
3. Should see error: "Token is invalid"

---

## 📹 Recording Test Results

### Take Screenshots:

1. Admin settings page (configured)
2. Widget bubble on homepage
3. Chat window open with conversation
4. Mobile view
5. Browser console (no errors)

### Record Video (optional):

1. Screen record entire flow
2. From WordPress login → Configure → Test chat
3. ~2-3 minutes
4. Upload to YouTube (unlisted)
5. Add to plugin documentation

---

## ✅ Sign-Off Checklist

Before moving to production:

- [ ] All tests passed
- [ ] No console errors
- [ ] No PHP errors
- [ ] Works on 3+ browsers
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Error messages helpful
- [ ] Documentation updated
- [ ] Screenshots taken
- [ ] Ready for WordPress.org submission

---

## 📞 Need Help?

- Check `STATUS.md` for known issues
- Email: support@agentdesk.com
- Discord: AgentDesk Community

---

**Next Step:** After successful testing, package for WordPress.org submission!

