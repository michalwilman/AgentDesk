# External Channel Connections Setup Guide

This guide explains how to connect your AgentDesk bots to external messaging platforms (Telegram and WhatsApp).

## Overview

AgentDesk now supports connecting your bots to external messaging platforms, allowing your users to interact with your bot through:
- **Telegram** - Direct messaging through Telegram bots
- **WhatsApp** - Messaging through WhatsApp Business (via Twilio)

## Prerequisites

### Database Migration

Before using this feature, you need to apply the database migration:

```bash
# Navigate to your Supabase project and run:
psql -h your-db-host -U postgres -d postgres -f supabase/migration_add_external_channels.sql
```

Or apply directly in the Supabase SQL editor:
```sql
-- Copy and paste the contents of supabase/migration_add_external_channels.sql
```

### Backend Dependencies

Install the required dependencies:

```bash
cd backend
npm install
# This will install twilio which was added to package.json
```

## Telegram Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to create your bot:
   - Choose a name for your bot
   - Choose a username (must end with 'bot')
4. BotFather will provide you with:
   - **API Token**: e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Username**: e.g., `my_awesome_bot`

### Step 2: Configure in AgentDesk

1. Navigate to your bot management page
2. Scroll to the "Connect Channels" section
3. In the Telegram card:
   - Paste your **Bot API Token**
   - Enter your **Bot Username** (without the @ symbol)
4. Click "Save Telegram Configuration"

### Step 3: Test Your Bot

Once saved, the webhook will be automatically configured. You can:
1. Click "Open Bot" link to go directly to your Telegram bot
2. Send a message to test the connection
3. Your bot should respond using the same AI and knowledge base as your web bot

### Telegram Webhook

The webhook is automatically configured at:
```
https://your-backend-url/webhooks/telegram
```

## WhatsApp Setup (via Twilio)

### Step 1: Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up
2. Complete the verification process
3. Navigate to the Twilio Console

### Step 2: Get WhatsApp-Enabled Number

1. In Twilio Console, go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Follow the sandbox instructions OR get a production WhatsApp number
3. Note your phone number (in E.164 format, e.g., `+1234567890`)

### Step 3: Get Credentials

1. From the Twilio Console Dashboard, copy:
   - **Account SID**: Starts with `AC...`
   - **Auth Token**: Click to reveal and copy

### Step 4: Configure Webhook in Twilio

1. Go to **Messaging** > **Settings** > **WhatsApp Sandbox Settings**
2. Set the webhook URL for incoming messages:
   ```
   https://your-backend-url/webhooks/whatsapp
   ```
3. Set HTTP method to `POST`

### Step 5: Configure in AgentDesk

1. Navigate to your bot management page
2. Scroll to the "Connect Channels" section
3. In the WhatsApp card:
   - Paste your **Twilio Account SID**
   - Paste your **Twilio Auth Token**
   - Enter your **WhatsApp Phone Number** (in E.164 format)
4. Click "Save WhatsApp Configuration"

### Step 6: Test Your Bot

1. Send a WhatsApp message to your configured number
2. Your bot should respond using the same AI and knowledge base
3. Click "Open Chat" to start a conversation via WhatsApp Web

## Environment Variables

Make sure these environment variables are set:

### Backend (.env)
```env
# Already configured in your setup
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url
# OR for local development:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## How It Works

### Message Flow

1. **User sends message** on Telegram/WhatsApp
2. **Platform forwards** the message to your webhook
3. **Webhook identifies** which bot to use (via token/SID)
4. **Message is processed** through the same `ChatService` as web chat
5. **Response is sent** back to the user on their platform

### Session Management

- **Telegram**: Sessions are tracked by `telegram_{chat_id}`
- **WhatsApp**: Sessions are tracked by `whatsapp_{phone_number}`

Each platform has its own conversation history, separate from web chat sessions.

## Troubleshooting

### Telegram Bot Not Responding

1. Check the bot token is correct
2. Verify the webhook URL is accessible from the internet
3. Check backend logs for errors:
   ```bash
   cd backend
   npm run dev
   # Look for webhook logs
   ```
4. Test webhook manually:
   ```bash
   curl -X GET "https://api.telegram.org/bot{YOUR_TOKEN}/getWebhookInfo"
   ```

### WhatsApp Messages Not Being Received

1. Verify Twilio credentials are correct
2. Check webhook is configured in Twilio console
3. Ensure your backend URL is publicly accessible
4. Check Twilio debugger logs in the console
5. Verify the phone number format is E.164 (e.g., +1234567890)

### Backend Errors

Check the backend console for error messages:
```bash
cd backend
npm run dev
```

Common issues:
- Missing dependencies: Run `npm install`
- Database columns not added: Run the migration
- Environment variables not set: Check `.env` file

## Security Considerations

- **Tokens are stored securely** in the database
- **Webhook endpoints** are rate-limited
- **User authentication** is required to configure channels
- **Row Level Security (RLS)** policies ensure users can only access their own bots

## Limitations

- One Telegram bot per AgentDesk bot
- One WhatsApp number per AgentDesk bot
- WhatsApp requires Twilio account (paid service after trial)
- Telegram is free but has rate limits

## Future Enhancements

Potential improvements for future versions:
- Token validation before saving
- Connection status testing
- Message delivery analytics per platform
- Support for media messages (images, files)
- Support for additional platforms (Slack, Discord, etc.)

## Support

For issues or questions:
1. Check the backend logs
2. Verify all environment variables are set
3. Ensure database migration was applied
4. Test webhooks using platform documentation

## API Reference

### Telegram Webhook Endpoint
```
POST /webhooks/telegram
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "John"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "Hello bot!"
  }
}
```

### WhatsApp Webhook Endpoint
```
POST /webhooks/whatsapp
Content-Type: application/x-www-form-urlencoded

MessageSid=SMxxxxx
AccountSid=ACxxxxx
From=whatsapp:+1234567890
To=whatsapp:+0987654321
Body=Hello bot!
```

## Changelog

### Version 1.0.0 (2025-10-18)
- Initial release of external channel connections
- Telegram integration
- WhatsApp integration via Twilio
- Automated webhook setup
- UI for managing connections

