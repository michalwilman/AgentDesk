# AgentDesk Widget - CDN Setup Guide

## 🎯 Overview

The WordPress plugin needs the standalone widget to be accessible via CDN. This guide covers both local testing and production deployment.

---

## 🏠 Option 1: Local CDN (For Testing)

### Step 1: Enable Static Files in Backend

The widget is now served from your AgentDesk backend:

```
http://localhost:3001/widget-standalone.js
```

**What we configured:**
1. Created `backend/public/` directory
2. Copied `widget-standalone.js` to `backend/public/`
3. Added static file serving in `backend/src/main.ts`
4. Enabled CORS headers for widget

### Step 2: Test Widget Loading

```bash
# Start backend
cd backend
npm run start:dev

# Test widget URL (in another terminal)
curl -I http://localhost:3001/widget-standalone.js

# Should return:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: *
# Content-Type: application/javascript
```

### Step 3: Update WordPress Plugin for Local Testing

**File:** `wordpress-plugin/agentdesk-chatbot.php`

```php
// For local testing, change this line:
define('AGENTDESK_CDN_URL', 'http://localhost:3001/widget-standalone.js');
define('AGENTDESK_API_URL', 'http://localhost:3001');
```

**Important:** Change back to production URLs before deploying!

---

## 🌍 Option 2: Production CDN (Cloudflare Pages)

### Why Cloudflare Pages?

- ✅ **Free** - Unlimited bandwidth
- ✅ **Fast** - Global CDN with 300+ data centers
- ✅ **Simple** - Deploy in 5 minutes
- ✅ **Reliable** - 99.99% uptime SLA
- ✅ **Secure** - Automatic HTTPS

### Step 1: Prepare Widget for Deployment

```bash
# Create a dedicated CDN folder
mkdir -p cdn-deploy
cp widget/public/widget-standalone.js cdn-deploy/

# Create index.html for Cloudflare Pages
cat > cdn-deploy/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>AgentDesk Widget CDN</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>AgentDesk Widget CDN</h1>
    <p>This is the CDN for AgentDesk chat widgets.</p>
    <p><a href="/widget-standalone.js">widget-standalone.js</a></p>
</body>
</html>
EOF

# Create _headers file for Cloudflare Pages
cat > cdn-deploy/_headers << 'EOF'
/widget-standalone.js
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/javascript

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
EOF
```

### Step 2: Deploy to Cloudflare Pages

**Option A: Using Wrangler CLI (Recommended)**

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
cd cdn-deploy
wrangler pages deploy . --project-name=agentdesk-widget

# Output:
# ✨ Success! Uploaded 2 files
# ✨ Deployment complete!
# 🌎 https://agentdesk-widget.pages.dev
```

**Option B: Using Cloudflare Dashboard (GUI)**

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click "Create a project"
3. Choose "Direct Upload"
4. Upload `cdn-deploy` folder
5. Set project name: `agentdesk-widget`
6. Click "Deploy"

**Your widget URL:**
```
https://agentdesk-widget.pages.dev/widget-standalone.js
```

### Step 3: Custom Domain (Optional but Recommended)

#### Add Custom Domain:

1. In Cloudflare Pages, go to your project
2. Click "Custom domains"
3. Add: `cdn.agentdesk.com`
4. Cloudflare will provide DNS records
5. Add DNS records to your domain

**Result:**
```
https://cdn.agentdesk.com/widget-standalone.js
```

#### Update WordPress Plugin:

```php
// In wordpress-plugin/agentdesk-chatbot.php
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');
```

---

## 🔄 Option 3: Vercel (Alternative)

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd cdn-deploy
vercel --prod

# Output: https://agentdesk-widget.vercel.app/widget-standalone.js
```

### Vercel Configuration:

Create `cdn-deploy/vercel.json`:

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/widget-standalone.js",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## ☁️ Option 4: AWS S3 + CloudFront

### For Enterprise Deployment:

```bash
# 1. Upload to S3
aws s3 cp widget-standalone.js s3://agentdesk-cdn/ \
  --acl public-read \
  --cache-control "public, max-age=31536000" \
  --content-type "application/javascript"

# 2. Create CloudFront distribution
# Point to S3 bucket
# Enable CORS
# Custom domain: cdn.agentdesk.com

# Result: https://cdn.agentdesk.com/widget-standalone.js
```

---

## ✅ Verification Checklist

After deploying to CDN:

### Test Widget Loading:

```bash
# Test HTTPS
curl -I https://cdn.agentdesk.com/widget-standalone.js

# Should return:
# HTTP/2 200
# Access-Control-Allow-Origin: *
# Cache-Control: public, max-age=31536000
# Content-Type: application/javascript
```

### Test in Browser:

1. Open browser console
2. Run:
```javascript
fetch('https://cdn.agentdesk.com/widget-standalone.js')
  .then(r => r.text())
  .then(c => console.log('Widget size:', c.length, 'bytes'))
  .catch(e => console.error('Error:', e));
```

3. Should see: `Widget size: 25000 bytes` (approximately)

### Test with WordPress:

1. Update plugin constants with CDN URL
2. Install plugin on WordPress
3. Configure bot token
4. Visit site and check:
   - Widget bubble appears
   - Click bubble, chat opens
   - Send message, receive response
   - No console errors

---

## 🔄 Updating the Widget

When you make changes to `widget-standalone.js`:

### Step 1: Update File

```bash
# Make changes to widget/public/widget-standalone.js

# Copy to backend (for local testing)
cp widget/public/widget-standalone.js backend/public/
```

### Step 2: Redeploy to CDN

**Cloudflare Pages:**
```bash
cd cdn-deploy
cp ../widget/public/widget-standalone.js .
wrangler pages deploy . --project-name=agentdesk-widget
```

**Vercel:**
```bash
cd cdn-deploy
cp ../widget/public/widget-standalone.js .
vercel --prod
```

### Step 3: Cache Busting (if needed)

If browsers cache the old version:

**Option A: Version in filename**
```
widget-standalone-v1.0.1.js
widget-standalone-v1.0.2.js
```

**Option B: Query parameter**
```
widget-standalone.js?v=1.0.2
```

**Option C: Wait for cache expiry**
- With 1-year cache, this isn't ideal
- Use versioned URLs for major updates

---

## 📊 Monitoring

### Cloudflare Pages Analytics:

- Requests per day
- Bandwidth usage
- Error rate
- Geographic distribution

### Test Widget Performance:

```bash
# Test loading speed
curl -w "@curl-format.txt" -o /dev/null -s https://cdn.agentdesk.com/widget-standalone.js

# curl-format.txt:
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

**Target Performance:**
- Time to first byte: < 100ms
- Total download: < 500ms
- File size: < 30KB (gzipped)

---

## 🔒 Security Best Practices

### 1. Content Security Policy

If your main site uses CSP, allow CDN:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.agentdesk.com">
```

### 2. Subresource Integrity (SRI)

For extra security, use SRI hashes:

```bash
# Generate SRI hash
cat widget-standalone.js | openssl dgst -sha384 -binary | openssl base64 -A

# Use in script tag:
<script 
  src="https://cdn.agentdesk.com/widget-standalone.js" 
  integrity="sha384-HASH_HERE" 
  crossorigin="anonymous">
</script>
```

### 3. Rate Limiting

Configure Cloudflare rate limiting:
- Max 1000 requests/minute per IP
- Protects against DDoS

---

## 🐛 Troubleshooting

### Widget Not Loading:

**Check 1: CDN URL accessible**
```bash
curl -I https://cdn.agentdesk.com/widget-standalone.js
```

**Check 2: CORS headers present**
```bash
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://cdn.agentdesk.com/widget-standalone.js
```

**Check 3: Content-Type correct**
- Should be: `application/javascript`
- Not: `text/plain` or `text/html`

### Widget Loads But Doesn't Work:

**Check backend API:**
```bash
curl https://api.agentdesk.com/api/bots/config/bot_test123
```

**Check browser console:**
- Look for errors
- Check network tab
- Verify API calls succeed

### Slow Loading:

**Check file size:**
```bash
curl https://cdn.agentdesk.com/widget-standalone.js | wc -c
```

**Enable compression:**
- Gzip should reduce to ~8KB
- Cloudflare does this automatically

---

## 📞 Support

Need help with CDN setup?

- **Email**: support@agentdesk.com
- **Discord**: [AgentDesk Community](https://discord.gg/agentdesk)
- **Docs**: https://agentdesk.com/docs/cdn-setup

---

**Status**: ✅ CDN Setup Ready  
**Next Step**: Test with WordPress plugin  
**Estimated Time**: 10 minutes

