# AgentDesk WordPress Plugin - Installation Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Install Plugin

**Option A: Via WordPress Admin (Recommended)**
1. Download the plugin ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin"
4. Choose the ZIP file and click "Install Now"
5. Click "Activate"

**Option B: Manual FTP Upload**
1. Unzip the plugin folder
2. Upload `agentdesk-chatbot` folder to `/wp-content/plugins/`
3. Go to WordPress Admin → Plugins
4. Find "AgentDesk AI Chatbot" and click "Activate"

### Step 2: Create AgentDesk Account

1. Visit [AgentDesk.com](https://agentdesk.com/register?utm_source=wordpress)
2. Sign up for free (7-day trial, no credit card)
3. Verify your email
4. Create your first bot

### Step 3: Train Your Bot

In the AgentDesk dashboard:
1. Click "Add Knowledge"
2. Enter your website URL (automatic crawling)
3. Or upload documents (PDFs, Word files)
4. Or add manual FAQs
5. Click "Generate Embeddings" to process content

### Step 4: Get API Token

1. Go to Bot Settings in AgentDesk dashboard
2. Find "API Token" section
3. Click "Copy Token"
4. Token format: `bot_xxxxxxxxxxxxxxxx`

### Step 5: Configure WordPress Plugin

1. In WordPress, go to Settings → AgentDesk
2. Paste your API Token
3. Choose widget position (bottom-right or bottom-left)
4. Enable the chatbot
5. Click "Save Settings"

### Step 6: Test

1. Visit your website
2. You should see the chat widget in the corner
3. Click it and start chatting!

---

## 📋 Requirements

### Server Requirements

- **WordPress:** 5.8 or higher
- **PHP:** 7.4 or higher (8.0+ recommended)
- **MySQL:** 5.6 or higher
- **HTTPS:** Recommended for production

### PHP Extensions

- `curl` - For API communication
- `json` - For data processing
- `mbstring` - For multi-byte string handling

### Recommended Server Specs

- **Memory:** 128MB+ (256MB recommended)
- **Upload Limit:** 10MB+ for document uploads
- **Execution Time:** 60 seconds+

### Browser Compatibility

The chat widget works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔧 Configuration Options

### Basic Settings

**API Token** (Required)
- Format: `bot_xxxxxxxxxxxxxxxx`
- Found in: AgentDesk Dashboard → Bot Settings → API Token
- Purpose: Authenticates your WordPress site with your AgentDesk bot

**Enable/Disable Chatbot**
- Toggle to show/hide the chatbot
- Useful for testing or temporary disable
- Preserves all settings when disabled

**Widget Position**
- Bottom Right (default) - Best for LTR languages
- Bottom Left - Best for RTL languages (Hebrew, Arabic)

**Display Rules**
- All Pages (default) - Show everywhere
- Homepage Only - Show only on front page
- Posts Only - Show on blog posts
- Pages Only - Show on static pages

### Advanced Settings (Coming Soon)

- Custom CSS styling
- Display rules per page ID
- Hide on specific URLs
- Mobile-specific settings
- Custom welcome message override

---

## 🎨 Customization

### Branding

All visual customization is done in the AgentDesk dashboard:

1. **Colors**
   - Primary color (button, header)
   - Text colors
   - Background colors

2. **Logo/Avatar**
   - Upload bot avatar
   - Shows in widget header

3. **Messages**
   - Welcome message
   - Multiple rotating welcome messages
   - Bot personality/tone

4. **Language**
   - Choose bot language
   - Supports 30+ languages
   - RTL support for Hebrew/Arabic

### Custom CSS (Advanced)

If you need additional styling, add to your theme's CSS:

```css
/* Change widget z-index */
#agentdesk-widget {
    z-index: 9999 !important;
}

/* Hide on specific pages */
.page-id-123 #agentdesk-widget {
    display: none !important;
}

/* Adjust mobile position */
@media (max-width: 768px) {
    #agentdesk-widget {
        bottom: 10px !important;
        right: 10px !important;
    }
}
```

---

## 🔍 Troubleshooting

### Widget Not Showing

**1. Check API Token**
- Go to Settings → AgentDesk
- Verify token starts with `bot_`
- Copy token again from AgentDesk dashboard
- Save settings

**2. Check Enable Toggle**
- Ensure "Enable Chatbot" is checked
- Save settings

**3. Check Display Rules**
- Verify you're on the correct page type
- Try setting to "All Pages"

**4. Check Browser Console**
- Open browser DevTools (F12)
- Look for JavaScript errors
- Report errors to support

**5. Check for Conflicts**
- Disable other chat/popup plugins
- Test with default WordPress theme
- Re-enable plugins one by one to find conflict

### Widget Shows But Doesn't Respond

**1. Verify Bot Training**
- Go to AgentDesk dashboard
- Check if bot has knowledge content
- Ensure embeddings are generated
- Status should show "Trained"

**2. Check API Connection**
- In WordPress admin, re-save settings
- Look for "API token verified" success message
- If fails, token may be invalid

**3. Check Bot Status**
- In AgentDesk dashboard
- Ensure bot is "Active" (not paused)
- Check if you've exceeded conversation limits

### API Token Invalid

**Possible Causes:**
- Token copied incorrectly (check for spaces)
- Bot was deleted in AgentDesk dashboard
- Account suspended (check email)

**Solution:**
1. Log in to AgentDesk
2. Go to Bot Settings
3. Copy token again (use "Copy" button)
4. Paste in WordPress settings
5. Save

### Widget Conflicts with Theme

**Symptoms:**
- Widget appears behind other elements
- Widget is cut off or misaligned
- Widget doesn't match site design

**Solution:**
1. Add custom CSS (see Customization section)
2. Report issue to support with:
   - Theme name and version
   - Screenshot of issue
   - Link to your site

### Performance Issues

**Symptoms:**
- Site feels slower after installing
- Widget takes long to load

**Solutions:**
1. Enable caching plugin
2. Use CDN for static assets
3. Ensure server meets requirements
4. Contact AgentDesk support for optimization

---

## 🔒 Security Best Practices

### Protect Your API Token

❌ **Don't:**
- Share your token publicly
- Commit token to Git
- Use same token on multiple sites

✅ **Do:**
- Keep token in WordPress database only
- Regenerate token if compromised
- Use separate bots for test/production

### WordPress Security

1. **Keep WordPress Updated**
   - Update to latest WordPress version
   - Update plugins regularly
   - Update PHP version

2. **Use Strong Passwords**
   - For WordPress admin
   - For AgentDesk account

3. **Use HTTPS**
   - Required for secure API communication
   - Get free SSL from Let's Encrypt

4. **Backup Regularly**
   - Use backup plugin
   - Test restore process

### Data Privacy

- AgentDesk is GDPR compliant
- Conversation data stored in AgentDesk cloud
- No data sold to third parties
- Users can request data deletion

---

## 🌐 Multi-Site Setup (WordPress Multisite)

### Network Activation

1. Go to Network Admin → Plugins
2. Network Activate the plugin
3. Each site must configure their own API token

### Per-Site Configuration

- Each site has independent settings
- Each site can use different bots
- Or multiple sites can share one bot

### Recommended Setup

**Option A: Different Bots per Site**
```
Site 1 (Main): bot_token_1
Site 2 (Blog): bot_token_2
Site 3 (Shop): bot_token_3
```

**Option B: Shared Bot**
```
All Sites: bot_token_1
(Bot trained on all sites' content)
```

---

## 📊 Analytics & Tracking

### View Conversations

1. Log in to AgentDesk dashboard
2. Go to Analytics section
3. View:
   - Total conversations
   - Messages per session
   - User satisfaction
   - Popular questions
   - Conversion tracking

### Integration with Google Analytics

Coming soon! Track chatbot interactions as GA4 events.

---

## 🆙 Updating the Plugin

### Automatic Updates

1. WordPress will notify you of updates
2. Click "Update Now"
3. Plugin updates automatically
4. Settings are preserved

### Manual Update

1. Deactivate plugin (don't delete)
2. Delete old plugin folder
3. Upload new version
4. Activate plugin
5. Settings are automatically restored

### After Update

- Clear browser cache
- Visit Settings → AgentDesk
- Verify settings are intact
- Test widget on frontend

---

## ❌ Uninstalling

### Clean Uninstall

1. Go to Plugins → Installed Plugins
2. Deactivate "AgentDesk AI Chatbot"
3. Click "Delete"
4. Confirm deletion

**What Gets Deleted:**
- Plugin files
- Plugin settings in database
- Cached data

**What's NOT Deleted:**
- Your AgentDesk account (still active)
- Conversation history (in AgentDesk cloud)
- Bot training data (in AgentDesk cloud)

### Reinstalling

If you reinstall later:
1. Install plugin again
2. Enter API token
3. All bot data is still in AgentDesk dashboard
4. Widget works immediately

---

## 📞 Getting Help

### Support Channels

1. **WordPress.org Forum**
   - Community support
   - Free for all users
   - Response time: 24-48 hours

2. **AgentDesk Support**
   - Email: support@agentdesk.com
   - Live chat: agentdesk.com
   - Priority for paid plans

3. **Documentation**
   - Full docs: docs.agentdesk.com
   - Video tutorials: youtube.com/@agentdesk
   - API docs: agentdesk.com/docs/api

### Before Contacting Support

Please provide:
1. WordPress version
2. PHP version
3. Plugin version
4. Active theme name
5. Other active plugins
6. Screenshot of issue
7. Browser console errors (if any)

### Emergency Support

For urgent issues (site down, security concerns):
- Email: urgent@agentdesk.com
- Include "URGENT" in subject
- Business/Enterprise plans: 1-hour response SLA

---

## 🎓 Next Steps

After installation:

1. **Train Your Bot**
   - Add more content sources
   - Test bot responses
   - Refine personality

2. **Monitor Performance**
   - Check analytics weekly
   - Identify common questions
   - Add missing content

3. **Optimize**
   - A/B test welcome messages
   - Adjust widget position
   - Fine-tune bot personality

4. **Scale**
   - Add more channels (WhatsApp, Telegram)
   - Create multiple bots for different purposes
   - Upgrade plan as you grow

---

## 📄 Additional Resources

- [WordPress Plugin Best Practices](https://agentdesk.com/docs/wordpress-best-practices)
- [Bot Training Guide](https://agentdesk.com/docs/training)
- [API Documentation](https://agentdesk.com/docs/api)
- [Video Tutorials](https://youtube.com/@agentdesk)
- [Community Forum](https://community.agentdesk.com)

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Support:** support@agentdesk.com

