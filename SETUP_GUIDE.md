# AgentDesk Complete Setup Guide

Step-by-step guide to set up AgentDesk from scratch.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ A Supabase account (free tier works)
- ✅ An OpenAI API key
- ✅ Docker (optional, for local database)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd AgentDesk

# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### Step 2: Supabase Setup

#### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "AgentDesk"
4. Choose a strong database password
5. Select your region
6. Click "Create new project"

#### 2.2 Enable pgvector Extension

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Search for "vector"
3. Click **Enable** on the `vector` extension

#### 2.3 Run Database Schema

1. Go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/schema.sql` from the project
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for "Success" message

#### 2.4 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - Project URL
   - anon public key
   - service_role key (keep this secret!)

### Step 3: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (you won't see it again!)
6. Set up billing if you haven't already

### Step 4: Environment Configuration

#### 4.1 Root Environment

```bash
cp env.example .env
```

Edit `.env`:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-xxx...

# URLs (use these for local development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WIDGET_URL=http://localhost:3002
WIDGET_EMBED_URL=http://localhost:3002
```

#### 4.2 Backend Environment

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with same values as root `.env`.

#### 4.3 Frontend Environment

```bash
cd ../frontend
cp env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WIDGET_URL=http://localhost:3002
```

#### 4.4 Widget Environment

```bash
cd ../widget
cp env.example .env.local
```

Edit `widget/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 5: Start Development Servers

From the root directory:

```bash
# Option 1: Start all services at once
npm run dev

# Option 2: Start services individually (in separate terminals)
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
npm run dev:widget    # Terminal 3
```

Wait for all services to start:
- ✅ Backend: http://localhost:3001/api
- ✅ Frontend: http://localhost:3000
- ✅ Widget: http://localhost:3002

### Step 6: Create Your First Bot

1. Open http://localhost:3000
2. Click **Get Started** or **Sign Up**
3. Create an account:
   - Full Name
   - Company Name (optional)
   - Email
   - Password (min 6 characters)
4. Click **Create Account**
5. You'll be redirected to the dashboard
6. Click **Create Bot**
7. Fill in bot details:
   - **Name**: "Support Bot"
   - **Description**: "Customer support assistant"
   - **Language**: English
   - **Personality**: "helpful and professional"
   - **Welcome Message**: "Hi! How can I help?"
8. Click **Create Bot**

### Step 7: Add Knowledge to Your Bot

#### Method 1: Scrape a Website

Using the backend API:

```bash
# Get your session token from browser developer tools
# Application → Cookies → sb-access-token

curl -X POST http://localhost:3001/api/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://example.com",
    "botId": "YOUR_BOT_ID"
  }'
```

#### Method 2: Add Manual Content

```bash
curl -X POST http://localhost:3001/api/knowledge/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "botId": "YOUR_BOT_ID",
    "content": "Our business hours are 9 AM to 5 PM, Monday through Friday.",
    "title": "Business Hours"
  }'
```

### Step 8: Generate Embeddings

After adding content, generate embeddings:

```bash
curl -X POST http://localhost:3001/api/embeddings/generate/YOUR_BOT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This will:
- Generate OpenAI embeddings for all content
- Store vectors in database
- Mark bot as "trained"

### Step 9: Test Your Bot

#### Method 1: In Dashboard

1. Go to dashboard
2. Click **Test Chat** on your bot
3. Ask a question related to your content

#### Method 2: Use the Widget

1. Go to bot details page
2. Copy the bot API token
3. Open http://localhost:3002?botToken=YOUR_BOT_TOKEN
4. Chat with your bot!

### Step 10: Embed on Your Website

1. Get the embed code from bot details page
2. Add to your website before `</body>`:

```html
<script src="http://localhost:3002/widget.js" data-bot-token="bot_xxxxx"></script>
```

## ✅ Verification Checklist

- [ ] All services running without errors
- [ ] Can access frontend at http://localhost:3000
- [ ] Can register and login
- [ ] Can create a bot
- [ ] Can add content to bot
- [ ] Embeddings generated successfully
- [ ] Bot responds to messages
- [ ] Widget loads and works

## 🐛 Common Issues

### Issue: "Supabase configuration missing"
**Solution**: Check that all env files have correct Supabase credentials

### Issue: "OpenAI API key is not configured"
**Solution**: Verify OPENAI_API_KEY is set in backend/.env

### Issue: Port already in use
**Solution**: 
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3005 npm run dev:backend
```

### Issue: CORS errors in browser
**Solution**: Check backend CORS_ORIGIN includes frontend URL

### Issue: Database errors
**Solution**: Verify schema was run successfully in Supabase SQL Editor

### Issue: Widget not loading
**Solution**: Check bot token is correct and bot is active

## 🚀 Next Steps

### Development

- [ ] Add more content to your bot
- [ ] Test different types of questions
- [ ] Customize bot appearance
- [ ] Try different AI models (GPT-4o)

### Production Deployment

- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel
- [ ] Deploy widget to CDN
- [ ] Update environment variables for production
- [ ] Set up custom domain
- [ ] Configure production database backups

### Feature Enhancement

- [ ] Add analytics dashboard
- [ ] Implement user feedback system
- [ ] Add file upload for knowledge
- [ ] Integrate WhatsApp/Telegram
- [ ] Add multi-language support in UI

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Widget Integration](./widget/README.md)
- [Database Schema](./supabase/README.md)
- [Main README](./README.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the relevant README in each directory
2. Review error messages in terminal
3. Check browser developer console
4. Verify all environment variables are set
5. Ensure all services are running
6. Check Supabase logs in dashboard
7. Review OpenAI API usage/errors

## 🎉 Success!

You now have a fully functional AI chatbot platform! Start building, experimenting, and improving your bots.

---

**Happy Building! 🤖**

