# WordPress Integration - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AgentDesk System                            │
│                     WordPress Integration v1.1.0                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   WordPress      │◄────────┤    Backend       │◄────────┤    Frontend      │
│   Plugin         │ HTTP    │    (NestJS)      │ HTTP    │    (Next.js)     │
│   (PHP)          │         │                  │         │                  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                            │
        │                            │                            │
        │                            ▼                            │
        │                    ┌──────────────────┐                │
        │                    │                  │                │
        │                    │    Supabase      │                │
        └───────────────────►│    PostgreSQL    │◄───────────────┘
         Heartbeat           │                  │    Query
         Every 5min          └──────────────────┘    Bot Data
```

---

## Data Flow

### 1. Initial Connection

```
┌─────────────┐
│ WordPress   │
│ Admin       │
└──────┬──────┘
       │ 1. Enter Bot API Token
       │ 2. Click "Save Settings"
       ▼
┌─────────────────────────────────────────────────────────┐
│ WordPress Plugin                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ class-agentdesk-admin.php                       │   │
│ │ - Validates token                               │   │
│ │ - Saves to wp_options                           │   │
│ └──────────────────┬──────────────────────────────┘   │
│                    │                                   │
│                    │ 3. Trigger immediate heartbeat    │
│                    ▼                                   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ class-agentdesk-heartbeat.php                   │   │
│ │ - Prepare heartbeat data                        │   │
│ │ - Send POST request                             │   │
│ └──────────────────┬──────────────────────────────┘   │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ 4. POST /api/bots/wordpress-heartbeat
                     │    Headers: X-Bot-Token: bot_xxxxx
                     │    Body: {site_url, plugin_version, ...}
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Backend (NestJS)                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ bots.controller.ts                              │   │
│ │ @Post('wordpress-heartbeat')                    │   │
│ │ - Validate bot token                            │   │
│ └──────────────────┬──────────────────────────────┘   │
│                    │                                   │
│                    │ 5. Call service method            │
│                    ▼                                   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ bots.service.ts                                 │   │
│ │ updateWordPressConnection()                     │   │
│ │ - Update bot record                             │   │
│ └──────────────────┬──────────────────────────────┘   │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ 6. UPDATE bots SET
                     │    wordpress_connected = true,
                     │    wordpress_site_url = '...',
                     │    wordpress_plugin_version = '...',
                     │    wordpress_last_activity = NOW()
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL                                     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ bots table                                      │   │
│ │ ┌─────────────────────────────────────────┐    │   │
│ │ │ id                                      │    │   │
│ │ │ user_id                                 │    │   │
│ │ │ name                                    │    │   │
│ │ │ api_token                               │    │   │
│ │ │ ...                                     │    │   │
│ │ │ wordpress_connected ✨ NEW              │    │   │
│ │ │ wordpress_site_url ✨ NEW               │    │   │
│ │ │ wordpress_plugin_version ✨ NEW         │    │   │
│ │ │ wordpress_last_activity ✨ NEW          │    │   │
│ │ └─────────────────────────────────────────┘    │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                     │
                     │ 7. User visits dashboard
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (Next.js)                                      │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ bots/[id]/page.tsx                              │   │
│ │ - Fetch bot data from Supabase                  │   │
│ │ - Render WordPress Integration section          │   │
│ │                                                 │   │
│ │ {bot.wordpress_connected ? (                    │   │
│ │   <div>✅ Connected</div>                       │   │
│ │   <div>Site: {bot.wordpress_site_url}</div>     │   │
│ │   <div>Version: {bot.wordpress_plugin_version}</div>│
│ │   <div>Last sync: {formatTimeAgo(...)}</div>    │   │
│ │ ) : (                                           │   │
│ │   <div>⚪ Not Connected</div>                   │   │
│ │ )}                                              │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Ongoing Heartbeat (Every 5 Minutes)

```
┌─────────────────────────────────────────────────────────┐
│ WordPress Cron System                                   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ wp_schedule_event()                             │   │
│ │ - Interval: 5 minutes                           │   │
│ │ - Hook: 'agentdesk_heartbeat_event'             │   │
│ └──────────────────┬──────────────────────────────┘   │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ Triggers every 5 minutes
                     ▼
┌─────────────────────────────────────────────────────────┐
│ class-agentdesk-heartbeat.php                           │
│                                                         │
│ public function send_heartbeat() {                      │
│   $api_token = get_option('agentdesk_api_token');      │
│   $heartbeat_data = [                                   │
│     'site_url' => home_url(),                           │
│     'plugin_version' => AGENTDESK_VERSION,              │
│     'wp_version' => get_bloginfo('version'),            │
│     'is_active' => true,                                │
│   ];                                                    │
│                                                         │
│   wp_remote_post(                                       │
│     AGENTDESK_API_URL . '/bots/wordpress-heartbeat',    │
│     [                                                   │
│       'headers' => ['X-Bot-Token' => $api_token],       │
│       'body' => json_encode($heartbeat_data),           │
│     ]                                                   │
│   );                                                    │
│                                                         │
│   update_option('agentdesk_last_heartbeat',             │
│                 current_time('mysql'));                 │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                     │
                     │ POST request
                     ▼
                [Backend processes]
                     │
                     ▼
            [Database updates]
                     │
                     ▼
        [Dashboard shows updated "Last sync"]
```

---

## Component Breakdown

### WordPress Plugin Components

```
wordpress-plugin/
│
├── agentdesk-chatbot.php ⭐ Main plugin file
│   ├── Define constants
│   ├── Load dependencies
│   ├── Initialize classes
│   └── Register hooks
│
├── includes/
│   │
│   ├── class-agentdesk-admin.php
│   │   ├── Render admin page
│   │   ├── Handle settings save
│   │   └── Display connection status
│   │
│   ├── class-agentdesk-validator.php
│   │   └── validate_token() → POST /api/bots/validate
│   │
│   ├── class-agentdesk-heartbeat.php ✨ NEW
│   │   ├── Schedule cron (every 5 min)
│   │   ├── send_heartbeat() → POST /api/bots/wordpress-heartbeat
│   │   ├── send_immediate_heartbeat() (on save)
│   │   └── clear_scheduled_event() (on deactivate)
│   │
│   ├── class-agentdesk-widget.php
│   │   └── Embed chat widget on frontend
│   │
│   ├── class-agentdesk-updater.php
│   │   └── Check for plugin updates
│   │
│   └── class-agentdesk-api.php
│       └── API helper functions
│
└── languages/
    └── Translation files
```

---

### Backend Components

```
backend/src/
│
├── bots/
│   │
│   ├── bots.controller.ts ⭐ API endpoints
│   │   ├── @Post('validate')
│   │   │   └── Validate bot token
│   │   │
│   │   └── @Post('wordpress-heartbeat') ✨ NEW
│   │       ├── Extract X-Bot-Token header
│   │       ├── Validate token
│   │       └── Call updateWordPressConnection()
│   │
│   └── bots.service.ts ⭐ Business logic
│       ├── findByApiToken()
│       │   └── Query bot by API token
│       │
│       └── updateWordPressConnection() ✨ NEW
│           └── UPDATE bots SET
│               wordpress_connected,
│               wordpress_site_url,
│               wordpress_plugin_version,
│               wordpress_last_activity
│
└── migrations/
    └── add_wordpress_integration.sql ✨ NEW
        ├── ALTER TABLE bots ADD COLUMN ...
        └── CREATE INDEX ...
```

---

### Frontend Components

```
frontend/app/(dashboard)/dashboard/bots/[id]/
│
└── page.tsx ⭐ Bot details page
    │
    ├── Fetch bot data from Supabase
    │   └── SELECT * FROM bots WHERE id = ...
    │
    ├── Render Bot Configuration card
    │   ├── Language, Model, Status, Trained
    │   ├── Personality, Welcome Message
    │   │
    │   └── WordPress Integration section ✨ NEW
    │       │
    │       ├── if (bot.wordpress_connected)
    │       │   ├── ✅ Connected badge
    │       │   ├── Site URL (clickable)
    │       │   ├── Plugin version
    │       │   └── Last sync (formatted)
    │       │
    │       └── else
    │           ├── ⚪ Not Connected badge
    │           ├── Helpful message
    │           └── Action buttons
    │
    └── Helper: formatTimeAgo() ✨ NEW
        └── Convert timestamp to "X minutes ago"
```

---

## Database Schema

### Before (v1.0.0)

```sql
CREATE TABLE bots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  api_token TEXT UNIQUE,
  language TEXT,
  model TEXT,
  personality TEXT,
  welcome_message TEXT,
  is_active BOOLEAN,
  is_trained BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### After (v1.1.0)

```sql
CREATE TABLE bots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  api_token TEXT UNIQUE,
  language TEXT,
  model TEXT,
  personality TEXT,
  welcome_message TEXT,
  is_active BOOLEAN,
  is_trained BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- ✨ NEW WordPress Integration fields
  wordpress_connected BOOLEAN DEFAULT false,
  wordpress_site_url TEXT,
  wordpress_plugin_version TEXT,
  wordpress_last_activity TIMESTAMP WITH TIME ZONE
);

-- ✨ NEW Indexes
CREATE INDEX idx_bots_wordpress_connected 
ON bots(wordpress_connected) 
WHERE wordpress_connected = true;

CREATE INDEX idx_bots_wordpress_last_activity 
ON bots(wordpress_last_activity DESC);
```

---

## API Endpoints

### Existing Endpoints

- `GET /api/bots` - List all bots
- `POST /api/bots` - Create new bot
- `GET /api/bots/:id` - Get bot details
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot
- `POST /api/bots/validate` - Validate bot token
- `GET /api/bots/config/:token` - Get public bot config

### New Endpoint ✨

```
POST /api/bots/wordpress-heartbeat

Headers:
  X-Bot-Token: bot_xxxxx
  Content-Type: application/json

Body:
  {
    "site_url": "https://example.com",
    "plugin_version": "1.1.0",
    "wp_version": "6.3.1",
    "is_active": true
  }

Response (Success):
  {
    "success": true,
    "message": "WordPress connection updated successfully"
  }

Response (Error):
  {
    "success": false,
    "message": "Failed to update WordPress connection"
  }
```

---

## Security Considerations

### Authentication

```
WordPress Plugin
      │
      │ Includes Bot API Token in header
      │ X-Bot-Token: bot_xxxxx
      ▼
Backend
      │
      │ Validates token exists in database
      │ Checks bot is active
      ▼
Database
      │
      │ Only updates if token is valid
      ▼
Success/Error Response
```

### Data Privacy

**What is transmitted:**
- ✅ Site URL (public information)
- ✅ Plugin version (public information)
- ✅ WordPress version (public information)
- ✅ Active status (boolean)

**What is NOT transmitted:**
- ❌ User data
- ❌ Post/page content
- ❌ Admin credentials
- ❌ Visitor information
- ❌ Chat conversations

---

## Performance Considerations

### Heartbeat Frequency

- **Interval:** 5 minutes
- **Requests per day:** 288 per plugin
- **For 1000 plugins:** 288,000 requests/day
- **Average:** 3.3 requests/second

### Database Impact

- **Storage:** ~100 bytes per bot (4 new fields)
- **Indexes:** Minimal overhead for small datasets
- **Queries:** Simple UPDATE (< 1ms)

### Caching

- Frontend fetches bot data on page load
- No real-time updates needed
- User refreshes page to see latest status

---

## Monitoring & Alerts

### What to Monitor

1. **Heartbeat Endpoint**
   - Response time
   - Error rate
   - Request volume

2. **Database**
   - `wordpress_last_activity` timestamps
   - Stale connections (> 10 minutes)

3. **WordPress Cron**
   - Ensure cron is running
   - Check for failed heartbeats

### Future Enhancements

- Email alerts for stale connections
- Dashboard for all WordPress connections
- Plugin usage analytics
- Automatic version update notifications

---

## Summary

This architecture provides:

✅ **Automatic tracking** of WordPress plugin connections  
✅ **Real-time status** display in dashboard  
✅ **Minimal overhead** (5-minute heartbeat)  
✅ **Secure** (token-based authentication)  
✅ **Scalable** (efficient database queries)  
✅ **User-friendly** (no manual configuration)  

The system is production-ready and can handle thousands of concurrent WordPress installations! 🚀

