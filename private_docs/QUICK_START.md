# AgentDesk Quick Start

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

## 1. Install Dependencies

```bash
npm install && npm run install:all
```

## 2. Configure Supabase

1. Create project at supabase.com
2. Enable `vector` extension
3. Run `supabase/schema.sql` in SQL Editor
4. Copy API keys from Settings → API

## 3. Set Environment Variables

Create `.env` in root:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
```

Copy to backend, frontend, and widget:

```bash
# Backend
cp .env backend/.env

# Frontend (rename to .env.local)
cp .env frontend/.env.local

# Widget (rename to .env.local)
cp .env widget/.env.local
```

## 4. Start Services

```bash
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Widget: http://localhost:3002

## 5. Create Your Bot

1. Go to http://localhost:3000
2. Register new account
3. Create a bot
4. Add knowledge (via API or dashboard)
5. Generate embeddings
6. Test chat!

## API Examples

### Add Content

```bash
curl -X POST http://localhost:3001/api/knowledge/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"botId":"BOT_ID","content":"Your content here"}'
```

### Generate Embeddings

```bash
curl -X POST http://localhost:3001/api/embeddings/generate/BOT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Chat

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-Bot-Token: bot_xxxxx" \
  -d '{"sessionId":"session_123","message":"Hello!"}'
```

## Project Structure

```
AgentDesk/
├── backend/        # NestJS API
├── frontend/       # Next.js Dashboard  
├── widget/         # Chat Widget
├── supabase/       # Database Schema
└── README.md       # Documentation
```

## Common Commands

```bash
# Development
npm run dev              # All services
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run dev:widget       # Widget only

# Build
npm run build            # Build all
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only
npm run build:widget     # Widget only
```

## Troubleshooting

**Services not starting?**
- Check all .env files are configured
- Verify ports 3000, 3001, 3002 are free
- Ensure Supabase schema is loaded

**Bot not responding?**
- Verify bot is active
- Check embeddings are generated
- Ensure OpenAI API key is valid
- Check backend logs for errors

## Next Steps

✅ Add more content to your bot
✅ Customize bot appearance
✅ Deploy to production
✅ Embed on your website

## Full Documentation

- [Complete Setup Guide](./SETUP_GUIDE.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Widget README](./widget/README.md)
- [Supabase Setup](./supabase/README.md)

---

Need help? Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

