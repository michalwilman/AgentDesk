# WordPress Integration Feature 🔗

## Overview

Starting from version **1.1.0**, the AgentDesk WordPress plugin now includes automatic integration tracking. When you install and activate the plugin on your WordPress site, it will automatically sync with your AgentDesk dashboard.

---

## What's New in v1.1.0

### ✨ Automatic Connection Tracking

- **Real-time Status**: Your AgentDesk dashboard now shows if your WordPress plugin is connected
- **Site Information**: View which WordPress site is using your bot
- **Plugin Version**: Track which version of the plugin is installed
- **Last Sync Time**: See when the plugin last communicated with AgentDesk

### 💓 Heartbeat System

The plugin sends periodic "heartbeat" signals to the AgentDesk backend every 5 minutes to maintain connection status.

**What gets sent:**
- Site URL
- Plugin version
- WordPress version
- Active/Inactive status

**Privacy Note:** No personal data or content is transmitted in heartbeat signals.

---

## How It Works

### 1. **Plugin Activation**
When you activate the plugin and save your Bot API Token:
- An immediate heartbeat is sent to AgentDesk
- Your dashboard updates to show "Connected" status

### 2. **Ongoing Sync**
Every 5 minutes, the plugin automatically:
- Sends a heartbeat to confirm it's still active
- Updates the "Last Sync" timestamp in your dashboard

### 3. **Plugin Deactivation**
When you deactivate the plugin:
- A final heartbeat is sent with `is_active: false`
- Your dashboard updates to show "Not Connected" status

---

## Dashboard Display

### When Connected ✅

```
┌─────────────────────────────────────────┐
│ WordPress Integration                   │
│ ✅ Connected                            │
│                                         │
│ Site: https://yoursite.com              │
│ Plugin version: 1.1.0                   │
│ Last sync: 2 minutes ago                │
└─────────────────────────────────────────┘
```

### When Not Connected ⚪

```
┌─────────────────────────────────────────┐
│ WordPress Integration                   │
│ ⚪ Not Connected                        │
│                                         │
│ Install the WordPress plugin to show   │
│ your chatbot on your WordPress site.   │
│                                         │
│ [Download Plugin] [View Instructions]  │
└─────────────────────────────────────────┘
```

---

## Technical Details

### Backend API Endpoint

**POST** `/api/bots/wordpress-heartbeat`

**Headers:**
```
X-Bot-Token: your_bot_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "site_url": "https://yoursite.com",
  "plugin_version": "1.1.0",
  "wp_version": "6.3.1",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "WordPress connection updated successfully"
}
```

### Database Schema

New fields added to the `bots` table:

| Field | Type | Description |
|-------|------|-------------|
| `wordpress_connected` | BOOLEAN | Whether a WordPress plugin is connected |
| `wordpress_site_url` | TEXT | URL of the connected WordPress site |
| `wordpress_plugin_version` | TEXT | Version of the installed plugin |
| `wordpress_last_activity` | TIMESTAMP | Last heartbeat timestamp |

---

## Troubleshooting

### Connection Not Showing in Dashboard

**Possible Causes:**
1. **Invalid API Token**: Make sure you've entered the correct Bot API Token
2. **Firewall/Security**: Your server might be blocking outgoing requests to AgentDesk
3. **WordPress Cron**: WordPress cron might not be running properly

**Solutions:**
1. Re-save your API token in WordPress plugin settings
2. Check your server's firewall rules
3. Test if WordPress cron is working: `wp cron test` (via WP-CLI)

### "Last Sync" Shows Old Timestamp

**Possible Causes:**
1. WordPress cron is not running
2. Plugin was deactivated
3. Server connectivity issues

**Solutions:**
1. Visit your WordPress admin dashboard (this triggers cron)
2. Check if the plugin is active
3. Check server logs for connection errors

### Manual Heartbeat Test

You can manually trigger a heartbeat by:
1. Going to WordPress Admin → Settings → AgentDesk
2. Re-saving your API token (even without changing it)
3. Check your dashboard - it should update immediately

---

## For Developers

### Cron Schedule

The heartbeat uses WordPress's cron system with a custom interval:

```php
// Runs every 5 minutes
wp_schedule_event(time(), 'five_minutes', 'agentdesk_heartbeat_event');
```

### Debugging

Enable WordPress debug mode to see heartbeat logs:

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Logs will appear in `wp-content/debug.log`:

```
AgentDesk Heartbeat Response: {"success":true,"message":"WordPress connection updated successfully"}
```

### Disable Heartbeat (Not Recommended)

If you need to disable the heartbeat for testing:

```php
// In your theme's functions.php
remove_action('agentdesk_heartbeat_event', [AgentDesk_Heartbeat::class, 'send_heartbeat']);
```

---

## Migration Guide

### Upgrading from v1.0.0 to v1.1.0

1. **Backup**: Always backup your site before updating
2. **Update Plugin**: Upload the new ZIP file
3. **Automatic Migration**: No manual steps required!
4. **Verify**: Check your AgentDesk dashboard to see the connection status

**Note:** Your existing settings (API token, position, etc.) are preserved during the update.

---

## Privacy & Security

### What Data is Collected?

- Site URL (public information)
- Plugin version (for update compatibility)
- WordPress version (for compatibility checks)
- Active/Inactive status

### What Data is NOT Collected?

- ❌ User information
- ❌ Post/page content
- ❌ Admin credentials
- ❌ Visitor data
- ❌ Chat conversations (these are already stored in AgentDesk)

### Security Measures

- All communication uses HTTPS
- Bot API Token is validated on every request
- No sensitive data is transmitted
- Heartbeat data is minimal and non-sensitive

---

## Support

Need help? Contact us:

- 📧 Email: support@agentdesk.com
- 🌐 Website: https://agentdesk.com
- 📚 Docs: https://docs.agentdesk.com
- 💬 Live Chat: Available on our website

---

## Changelog

### v1.1.0 (2025-11-01)
- ✨ Added WordPress Integration tracking
- 💓 Implemented heartbeat system
- 📊 Dashboard now shows connection status
- 🔄 Automatic sync every 5 minutes
- 📝 Added connection details (site URL, version, last sync)

### v1.0.0 (2025-10-15)
- 🎉 Initial release
- ✅ Basic bot integration
- 🎨 Customizable widget
- 🌍 Multi-language support

