# AgentDesk WordPress Plugin - Deployment Guide

## 📦 Package Structure

The plugin consists of:
- **PHP Backend** - WordPress integration
- **JavaScript Widget** - Standalone chat interface
- **CSS Styles** - Admin panel styling
- **Translations** - Multi-language support

---

## 🚀 Deployment Steps

### Step 1: Backend API Setup

Ensure your AgentDesk backend is deployed and accessible:

```bash
# Required endpoints:
GET  /api/bots/config/:token     # Public bot configuration
POST /api/chat/message            # Send chat messages
```

**CORS Configuration:**

Update `backend/src/main.ts` to allow WordPress domains:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://yourdomain.com',
    'https://*.wordpress.com',  // WordPress.com sites
    '*'  // Or allow all for widget (public endpoint)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Bot-Token'],
});
```

---

### Step 2: Widget CDN Setup

#### Option A: Using Cloudflare Pages (Recommended)

```bash
# Navigate to widget directory
cd widget/public

# Deploy to Cloudflare Pages
npx wrangler pages publish . --project-name=agentdesk-widget

# Your widget will be available at:
# https://agentdesk-widget.pages.dev/widget-standalone.js
```

#### Option B: Using Vercel

```bash
# Create vercel.json in widget/public/
{
  "version": 2,
  "public": true,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ]
}

# Deploy
cd widget/public
vercel --prod
```

#### Option C: Using AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 cp widget-standalone.js s3://agentdesk-cdn/widget-standalone.js \
  --acl public-read \
  --cache-control "public, max-age=31536000" \
  --content-type "application/javascript"

# Set up CloudFront distribution pointing to S3
# URL: https://cdn.agentdesk.com/widget-standalone.js
```

#### Option D: Local Testing (Development)

For local testing, you can serve the widget from your local backend:

```bash
# Copy widget to backend public folder
cp widget/public/widget-standalone.js backend/public/

# Access at: http://localhost:3001/widget-standalone.js
```

**Update plugin to use local URL:**

```php
// In agentdesk-chatbot.php
define('AGENTDESK_CDN_URL', 'http://localhost:3001/widget-standalone.js');
```

---

### Step 3: Update Plugin URLs

After deploying widget, update the plugin constants:

**File:** `wordpress-plugin/agentdesk-chatbot.php`

```php
// Production URLs
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');
```

---

### Step 4: Package Plugin

```bash
cd wordpress-plugin

# Make package script executable (Linux/Mac)
chmod +x package.sh

# Run packaging script
./package.sh

# On Windows, use Git Bash or WSL to run the script
```

**Manual packaging (if script doesn't work):**

```bash
# Create dist folder
mkdir -p dist

# Copy files
cp -r agentdesk-chatbot.php readme.txt includes assets languages dist/agentdesk-chatbot/

# Create ZIP
cd dist
zip -r agentdesk-chatbot-1.0.0.zip agentdesk-chatbot/
```

**Output:** `dist/agentdesk-chatbot-1.0.0.zip`

---

### Step 5: Test Locally

#### Install WordPress Locally

**Using Local by Flywheel (Recommended):**
1. Download [Local](https://localwp.com/)
2. Create new WordPress site
3. Go to WP Admin → Plugins → Add New → Upload Plugin
4. Upload `agentdesk-chatbot-1.0.0.zip`
5. Activate plugin

**Using Docker:**

```bash
# Run WordPress + MySQL
docker-compose up -d

# Access: http://localhost:8000
# Default credentials: admin / password
```

#### Test Plugin

1. Go to Settings → AgentDesk
2. Enter your bot API token
3. Save settings
4. Visit your site homepage
5. Verify widget appears
6. Test chat functionality

---

### Step 6: Create Plugin Assets

Before submitting to WordPress.org, create required images:

#### Required Images:

1. **Plugin Icon**
   - `icon-128x128.png` - 128x128px PNG
   - `icon-256x256.png` - 256x256px PNG (retina)
   - Should be square, simple, recognizable
   - Use AgentDesk brand color (#00E0C6)

2. **Plugin Banner**
   - `banner-772x250.png` - 772x250px PNG
   - `banner-1544x500.png` - 1544x500px PNG (retina, optional)
   - Showcase the chatbot in action
   - Professional appearance

3. **Screenshots** (at least 3)
   - `screenshot-1.png` - Chatbot widget on website
   - `screenshot-2.png` - WordPress admin settings
   - `screenshot-3.png` - Bot training dashboard
   - `screenshot-4.png` - Analytics view
   - `screenshot-5.png` - Mobile responsive view

**Design Tool Recommendations:**
- Figma (free, web-based)
- Canva (templates available)
- Photoshop / GIMP

**Tips:**
- Use actual screenshots, not mockups
- Show real chat conversations
- Highlight key features
- Keep text minimal on banners

---

### Step 7: Submit to WordPress.org

#### Prerequisites:
- [ ] WordPress.org account
- [ ] Plugin tested on WordPress 5.8+
- [ ] Plugin tested on PHP 7.4+
- [ ] All images created
- [ ] readme.txt completed
- [ ] Code follows WordPress standards

#### Submission Process:

1. **Go to Plugin Developer Portal**
   - URL: https://wordpress.org/plugins/developers/add/
   - Log in with WordPress.org account

2. **Upload Plugin ZIP**
   - Upload `agentdesk-chatbot-1.0.0.zip`
   - WordPress will scan the code

3. **Wait for Review**
   - Initial review: 2-14 days
   - Check email for feedback
   - Be prepared to answer questions

4. **Respond to Reviewers**
   - Fix any issues they report
   - Update code if needed
   - Reply promptly (within 7 days)

5. **Approval & Publication**
   - Once approved, commit to SVN repository
   - Upload assets (icons, banners, screenshots)
   - Plugin goes live!

#### SVN Repository Setup:

After approval, you'll get SVN access:

```bash
# Checkout SVN repo
svn co https://plugins.svn.wordpress.org/agentdesk-chatbot

cd agentdesk-chatbot

# Add plugin files to trunk
cp -r /path/to/plugin/* trunk/

# Add assets (icons, banners, screenshots)
cp /path/to/assets/* assets/

# Commit
svn add trunk/* assets/*
svn ci -m "Initial commit - version 1.0.0"

# Tag release
svn cp trunk tags/1.0.0
svn ci -m "Tagging version 1.0.0"
```

---

## 🔄 Updating the Plugin

### For New Versions:

1. **Update Version Numbers:**
   - `agentdesk-chatbot.php` - Plugin header
   - `readme.txt` - Stable tag
   - Update changelog

2. **Test Thoroughly**
   - Test on multiple WordPress versions
   - Test with popular themes
   - Test with popular plugins (WooCommerce, etc.)

3. **Package New Version**
   ```bash
   ./package.sh  # Creates new ZIP
   ```

4. **Update SVN Repository**
   ```bash
   # Update trunk
   svn up
   cp -r /path/to/new-files/* trunk/
   svn ci -m "Update to version 1.1.0"

   # Tag new release
   svn cp trunk tags/1.1.0
   svn ci -m "Tagging version 1.1.0"
   ```

5. **Users Get Auto-Update**
   - WordPress will show update notification
   - Users can update with one click

---

## 🔒 Security Checklist

Before deployment:

- [ ] All user inputs sanitized
- [ ] All outputs escaped
- [ ] SQL queries use prepared statements
- [ ] CSRF protection (nonces)
- [ ] File upload validation
- [ ] API token stored securely
- [ ] HTTPS enforced for API calls
- [ ] Rate limiting implemented

---

## 📊 Monitoring & Analytics

### Track Plugin Usage:

**WordPress.org Stats:**
- Active installs count
- Downloads per day
- Version breakdown
- Support forum activity

**Custom Tracking (Optional):**

Add telemetry to track:
- Plugin activations
- API calls per day
- Error rates
- Average load time

**Implementation:**

```php
// In agentdesk-chatbot.php (optional)
function agentdesk_send_telemetry() {
    if (get_option('agentdesk_allow_telemetry', false)) {
        wp_remote_post('https://api.agentdesk.com/telemetry', [
            'body' => [
                'plugin_version' => AGENTDESK_VERSION,
                'wp_version' => get_bloginfo('version'),
                'php_version' => PHP_VERSION,
                'site_url' => home_url(),
            ],
        ]);
    }
}
```

**Note:** Always get user consent for telemetry!

---

## 🐛 Troubleshooting Deployment

### Widget Not Loading

**Check:**
1. CDN URL is accessible: `curl https://cdn.agentdesk.com/widget-standalone.js`
2. CORS headers are set correctly
3. No JavaScript errors in browser console
4. API token is valid

**Fix:**
```bash
# Test widget loading
curl -I https://cdn.agentdesk.com/widget-standalone.js

# Should return:
# HTTP/2 200
# Content-Type: application/javascript
# Access-Control-Allow-Origin: *
```

### API Errors

**Check:**
1. Backend is running
2. CORS is configured
3. API token is correct
4. Endpoints exist

**Test:**
```bash
# Test bot config endpoint
curl https://api.agentdesk.com/api/bots/config/bot_xxxxx

# Should return bot configuration JSON
```

### WordPress Plugin Errors

**Check:**
1. PHP version >= 7.4
2. All required files are present
3. File permissions are correct (644 for files, 755 for directories)

**Debug Mode:**

Enable WordPress debug mode:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Check logs at: wp-content/debug.log
```

---

## 📚 Post-Deployment Checklist

- [ ] Widget loads on test site
- [ ] Chat messages send/receive correctly
- [ ] Admin panel displays properly
- [ ] Settings save correctly
- [ ] Plugin activates without errors
- [ ] Plugin deactivates cleanly
- [ ] No PHP warnings or notices
- [ ] No JavaScript console errors
- [ ] Works on mobile devices
- [ ] Works with popular themes
- [ ] Translation files work
- [ ] Documentation is complete
- [ ] Support email is monitored

---

## 📞 Support After Deployment

### Prepare Support Channels:

1. **WordPress.org Forum**
   - Monitor daily
   - Respond within 24-48 hours
   - Mark resolved threads

2. **Email Support**
   - support@agentdesk.com
   - Set up autoresponder
   - Track tickets

3. **Documentation**
   - FAQ page
   - Video tutorials
   - Troubleshooting guide

4. **Community**
   - Discord server
   - Facebook group
   - Twitter updates

---

## 🎉 Launch Checklist

Final checklist before public launch:

- [ ] Backend deployed and tested
- [ ] Widget CDN configured
- [ ] Plugin packaged correctly
- [ ] All assets created (icons, banners, screenshots)
- [ ] readme.txt complete and proofread
- [ ] Code reviewed and tested
- [ ] Security audit passed
- [ ] WordPress.org submission ready
- [ ] Support channels prepared
- [ ] Documentation published
- [ ] Marketing materials ready
- [ ] Analytics tracking set up
- [ ] Backup plan in place

**You're ready to launch! 🚀**

---

## 📧 Contact

- **Email:** support@agentdesk.com
- **Website:** https://agentdesk.com
- **WordPress:** https://wordpress.org/plugins/agentdesk-chatbot/
- **GitHub:** https://github.com/agentdesk/wordpress-plugin

**Good luck with your launch!** 🎊

