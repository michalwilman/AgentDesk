# AgentDesk Backend API

NestJS REST API for AgentDesk - AI chatbot platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account with configured database
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Update .env with your credentials
```

### Environment Variables

Required variables in `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Google OAuth (for Calendar integration)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-oauth/callback

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

### Run Development Server

```bash
npm run start:dev
```

API will be available at `http://localhost:3001/api`

### Build for Production

```bash
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication & user management
├── bots/           # Bot CRUD operations
├── chat/           # Chat handling & OpenAI integration
├── embeddings/     # Vector embeddings generation
├── knowledge/      # Knowledge base management
├── scraper/        # Web scraping (Cheerio + Puppeteer)
├── common/         # Shared services (Supabase client)
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## 🔌 API Endpoints

### Authentication

#### `GET /api/auth/me`
Get current user profile
- Headers: `Authorization: Bearer {token}`
- Response: User object with profile

#### `POST /api/auth/profile`
Create user profile
- Headers: `Authorization: Bearer {token}`
- Body: `{ full_name?, company_name? }`

### Bots

#### `POST /api/bots`
Create a new bot
- Headers: `Authorization: Bearer {token}`
- Body: CreateBotDto

#### `GET /api/bots`
Get all user's bots
- Headers: `Authorization: Bearer {token}`

#### `GET /api/bots/:id`
Get specific bot
- Headers: `Authorization: Bearer {token}`

#### `PUT /api/bots/:id`
Update bot
- Headers: `Authorization: Bearer {token}`
- Body: UpdateBotDto

#### `DELETE /api/bots/:id`
Delete bot
- Headers: `Authorization: Bearer {token}`

#### `GET /api/bots/:id/analytics`
Get bot analytics
- Headers: `Authorization: Bearer {token}`

### Scraper

#### `POST /api/scraper/scrape`
Scrape a single URL
- Headers: `Authorization: Bearer {token}`
- Body: `{ url: string, botId: string }`

#### `POST /api/scraper/scrape-multiple`
Scrape multiple URLs
- Headers: `Authorization: Bearer {token}`
- Body: `{ urls: string[], botId: string }`

#### `GET /api/scraper/content/:botId`
Get scraped content
- Headers: `Authorization: Bearer {token}`

### Embeddings

#### `POST /api/embeddings/generate/:botId`
Generate embeddings for bot's content
- Headers: `Authorization: Bearer {token}`

#### `GET /api/embeddings/:botId`
Get all embeddings for bot
- Headers: `Authorization: Bearer {token}`

#### `POST /api/embeddings/search`
Search similar content
- Headers: `Authorization: Bearer {token}`
- Body: `{ query: string, botId: string, matchThreshold?, matchCount? }`

### Knowledge

#### `POST /api/knowledge/add`
Add manual content
- Headers: `Authorization: Bearer {token}`
- Body: `{ botId: string, content: string, title?, metadata? }`

#### `GET /api/knowledge/:botId`
Get knowledge base
- Headers: `Authorization: Bearer {token}`

#### `GET /api/knowledge/:botId/stats`
Get knowledge statistics
- Headers: `Authorization: Bearer {token}`

#### `DELETE /api/knowledge/:contentId/:botId`
Delete knowledge content
- Headers: `Authorization: Bearer {token}`

### Chat

#### `POST /api/chat/message`
Send a chat message (used by widget)
- Headers: `X-Bot-Token: {bot_api_token}`
- Body: `{ sessionId: string, message: string, visitorMetadata? }`

#### `GET /api/chat/history/:botId/:sessionId`
Get chat history
- Headers: `X-Bot-Token: {bot_api_token}`

## 🧠 How It Works

### RAG (Retrieval Augmented Generation) Flow

1. **Content Ingestion**:
   - User provides URL or manual content
   - Scraper extracts and chunks text
   - Content saved to `scraped_content` table

2. **Embedding Generation**:
   - OpenAI generates vector embeddings
   - Saved to `knowledge_embeddings` with pgvector

3. **Chat Response**:
   - User asks question
   - Question converted to embedding
   - Similar content retrieved via vector search
   - Context + conversation history sent to GPT
   - Response returned and saved

### Web Scraping Strategy

1. **Cheerio First**: Fast static HTML parsing
2. **Puppeteer Fallback**: For JavaScript-rendered content
3. **Chunking**: Split into 500-word chunks with 50-word overlap
4. **Storage**: Save chunks with metadata

## 🔐 Security

### Authentication
- Supabase Auth for user authentication
- Service role key for backend operations
- Bot API tokens for widget access

### Authorization
- Row Level Security (RLS) policies
- User can only access own bots
- API token verification for chat

### Rate Limiting
- Throttler middleware (100 req/min by default)
- Configurable per bot

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚢 Deployment

### Environment Setup
1. Set production environment variables
2. Configure CORS for production domains
3. Set `NODE_ENV=production`

### Deploy to Render/Railway

```bash
# Build
npm run build

# Start
npm run start:prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

## 📊 Monitoring

### Logs
- Application logs to console
- Structured logging recommended for production
- Use tools like Datadog, LogRocket, or Sentry

### Performance
- Monitor OpenAI API usage
- Track database query performance
- Set up alerts for rate limits

## 📧 Email Service Setup (Resend)

### Getting Started with Resend

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create a free account (100 emails/day free)

2. **Get your API Key**:
   - Go to API Keys in your Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to .env file**:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Verify Domain (Optional but Recommended)**:
   - For production: Verify your domain in Resend
   - For testing: Use Resend's test domain

### Email Features

- **Appointment Confirmations**: Automatic emails when appointments are scheduled
- **Lead Notifications**: Email sent to customers when they submit contact info
- **Document Delivery**: Email documents to customers

### Email Templates

Default templates are available in `email.service.ts`:
- `appointment_confirmation` - Sent when appointment is booked
- `lead_confirmation` - Sent when lead is captured
- `document_attached` - Sent when document is shared

## 📅 Google Calendar Integration

### Setup Instructions

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project

2. **Enable Google Calendar API**:
   - In APIs & Services → Library
   - Search for "Google Calendar API"
   - Click Enable

3. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/google-oauth/callback`

4. **Add to .env**:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-oauth/callback
   ```

### Features

- Schedule appointments directly to Google Calendar
- Sync with customer's calendar
- Automatic calendar event creation
- Email invitations to attendees

## 🐛 Troubleshooting

### Issue: "Supabase configuration missing"
**Solution**: Ensure all Supabase env vars are set

### Issue: "OpenAI API key is not configured"
**Solution**: Add `OPENAI_API_KEY` to .env

### Issue: "Email service not configured"
**Solution**: Add valid `RESEND_API_KEY` to .env (get from resend.com)

### Issue: "Failed to send email: API key is invalid"
**Solution**: 
- Check that your Resend API key is correct
- Ensure it starts with `re_`
- Verify the key is active in your Resend dashboard
- Try regenerating the key

### Issue: Slow scraping
**Solution**: Use Cheerio for static sites, increase timeout for complex sites

### Issue: Vector search not working
**Solution**: Ensure pgvector extension is enabled and embeddings are generated

### Issue: Google Calendar not creating events
**Solution**: 
- Verify Google OAuth credentials are correct
- Check that Calendar API is enabled
- Reconnect your Google Calendar in the dashboard

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript)
- [Cheerio Documentation](https://cheerio.js.org)
- [Puppeteer Documentation](https://pptr.dev)

