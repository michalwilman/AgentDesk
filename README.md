# 🤖 AgentDesk

AI-powered customer service agent platform for small and medium businesses (SMBs).

## 🎯 Overview

AgentDesk enables businesses to create custom AI chatbots that:
- Learn from website content or uploaded documents
- Provide accurate, real-time responses to customer questions
- Can be embedded on any website via simple iframe/script
- Support multiple languages (English & Hebrew)
- Maintain conversation history and analytics

## 🏗️ Architecture

This is a monorepo containing three main applications:

### 1. **Backend** (`/backend`)
NestJS REST API handling:
- User authentication (Supabase Auth)
- Bot management
- Web scraping (Cheerio + Puppeteer)
- AI embeddings generation (OpenAI)
- Chat conversations with RAG pattern
- Knowledge base management

### 2. **Frontend** (`/frontend`)
Next.js dashboard for:
- User registration/login
- Bot creation and configuration
- Knowledge base management
- Analytics and statistics
- Embed code generation

### 3. **Widget** (`/widget`)
Standalone chat widget:
- Embeddable floating chat interface
- Real-time messaging
- Customizable appearance
- Multi-language support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)
- Supabase account (free tier works)
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd AgentDesk
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Database Setup

#### Option A: Using Supabase (Recommended for Production)

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema from `supabase/schema.sql` in the SQL editor
3. Enable pgvector extension
4. Configure authentication providers
5. Update `.env` with your Supabase credentials

See detailed instructions in `supabase/README.md`

#### Option B: Using Local Docker (Development)

```bash
docker-compose up -d
```

This starts PostgreSQL with pgvector extension on port 5432.

### 4. Install Dependencies

```bash
# Install all workspace dependencies
npm run install:all
```

### 5. Run Development Servers

```bash
# Run all services concurrently
npm run dev

# Or run individually:
npm run dev:backend   # Backend API on port 3001
npm run dev:frontend  # Frontend dashboard on port 3000
npm run dev:widget    # Chat widget on port 3002
```

## 📦 Project Structure

```
AgentDesk/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── bots/        # Bot management
│   │   ├── chat/        # Chat handling
│   │   ├── embeddings/  # OpenAI embeddings
│   │   ├── knowledge/   # Knowledge base
│   │   └── scraper/     # Web scraping
│   └── package.json
│
├── frontend/            # Next.js Dashboard
│   ├── app/
│   │   ├── (auth)/     # Auth pages
│   │   └── (dashboard)/ # Protected routes
│   ├── components/
│   │   ├── ui/         # Base components
│   │   └── dashboard/  # Dashboard components
│   └── lib/            # Utilities
│
├── widget/             # Chat Widget
│   ├── src/
│   │   ├── components/ # Widget UI
│   │   └── lib/        # Widget logic
│   └── public/
│
├── supabase/           # Database
│   ├── schema.sql      # Database schema
│   └── README.md       # Setup guide
│
├── docker-compose.yml  # Local DB setup
├── package.json        # Root workspace
└── README.md          # This file
```

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI (GPT-4o-mini, text-embedding-3-small)
- **Auth**: Supabase Auth
- **Scraping**: Cheerio, Puppeteer
- **Deployment**: Vercel (Frontend), Render (Backend)

## 🔐 Security Features

- Row Level Security (RLS) policies
- API token authentication per bot
- Domain whitelist for widgets
- Rate limiting
- TLS 1.3 encryption in transit
- AES-256 encryption at rest

## 📚 Documentation

- [Supabase Setup Guide](./supabase/README.md)
- [Backend API Documentation](./backend/README.md)
- [Frontend Development Guide](./frontend/README.md)
- [Widget Integration Guide](./widget/README.md)

## 🧪 Development Workflow

### Building for Production

```bash
npm run build
```

### Environment-Specific Configs

Each workspace has its own `.env` file:
- `backend/.env` - Backend configuration
- `frontend/.env.local` - Frontend configuration
- `widget/.env.local` - Widget configuration

## 🚢 Deployment

### Backend (NestJS)
- Deploy to Render, Railway, or any Node.js hosting
- Set environment variables
- Enable CORS for frontend and widget domains

### Frontend (Next.js)
- Deploy to Vercel (recommended)
- Set `NEXT_PUBLIC_API_URL` to backend URL

### Widget
- Build and serve as static files
- CDN distribution recommended
- Update embed code with production URL

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📧 Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@agentdesk.com
- Documentation: [docs-url]

---
✅ Git test successful 


Built with ❤️ for SMBs worldwide

