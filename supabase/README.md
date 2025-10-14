# Supabase Database Setup Guide

This guide will help you set up the Supabase database for AgentDesk.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: AgentDesk (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### 2. Enable pgvector Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for "vector"
3. Enable the **vector** extension
4. This enables semantic search capabilities

### 3. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `schema.sql` from this directory
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

The schema will create:
- All required tables with relationships
- Indexes for performance
- Row Level Security (RLS) policies
- Utility functions for search and token generation
- Initial seed data

### 4. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy these values to your `.env` file:

```env
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

⚠️ **Important**: 
- Use `SUPABASE_ANON_KEY` for client-side operations (frontend, widget)
- Use `SUPABASE_SERVICE_ROLE_KEY` only on backend (never expose to clients!)

### 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. (Optional) Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

#### Optional: Add OAuth Providers

For Google OAuth:
1. Enable **Google** provider
2. Add your Google OAuth credentials
3. Update allowed redirect URLs

### 6. Set Up Storage (Optional)

If you want users to upload files directly:

1. Go to **Storage**
2. Create a new bucket called `bot-uploads`
3. Set bucket policies:
   - **Public**: false
   - **File size limit**: 10 MB
   - **Allowed MIME types**: text/*, application/pdf, application/json

### 7. Configure Realtime (Optional)

For real-time chat updates:

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `messages` table
   - `chats` table

## 📊 Database Schema Overview

### Core Tables

#### `users`
Extended user profiles linked to Supabase Auth users.
- Fields: email, full_name, company_name, subscription_tier, api_key
- RLS: Users can only view/edit their own profile

#### `bots`
AI chatbot configurations.
- Fields: name, language, personality, appearance settings, model config
- RLS: Users can only manage their own bots
- Auto-generates unique API token on creation

#### `scraped_content`
Raw content chunks from websites or uploaded files.
- Fields: source_url, content, title, chunk_index
- Links to specific bot

#### `knowledge_embeddings`
Vector embeddings for semantic search.
- Uses pgvector extension
- Stores 1536-dimension vectors (OpenAI embeddings)
- Indexed with IVFFlat for fast similarity search

#### `chats` & `messages`
Conversation history.
- `chats`: Session-level data
- `messages`: Individual messages with role (user/assistant)

### Key Functions

#### `search_knowledge()`
Performs semantic similarity search:

```sql
SELECT * FROM search_knowledge(
  query_embedding := '[your-embedding-vector]',
  bot_uuid := 'bot-id-here',
  match_threshold := 0.7,
  match_count := 5
);
```

Returns top matching content chunks for RAG pattern.

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only access their own data
- Bots are isolated per user
- Chat history is accessible only to bot owners

### API Tokens

- **Bot API tokens**: Auto-generated, prefixed with `bot_`
- **User API keys**: Auto-generated, prefixed with `sk_`
- All tokens are unique and indexed for fast lookups

### Audit Logs

The `audit_logs` table tracks:
- User actions
- Resource access
- IP addresses and user agents
- Timestamps

## 🧪 Testing the Setup

### Test 1: Check Extensions

```sql
SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp', 'pgcrypto');
```

Should return 3 rows.

### Test 2: Verify Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show all created tables.

### Test 3: Test Vector Search Function

```sql
-- This should return the function definition
\df search_knowledge
```

## 📈 Performance Optimization

### For Production

1. **Increase IVFFlat lists** for larger datasets:
```sql
DROP INDEX idx_knowledge_embeddings_vector;
CREATE INDEX idx_knowledge_embeddings_vector ON knowledge_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);
```

2. **Monitor query performance**:
   - Use Supabase Dashboard → Database → Query Performance
   - Check slow queries
   - Add indexes as needed

3. **Set up database backups**:
   - Supabase Pro: Daily automatic backups
   - Free tier: Manual exports via Dashboard

## 🔄 Migrations

### Adding New Tables/Columns

1. Create migration file in `supabase/migrations/`
2. Run via SQL Editor or Supabase CLI
3. Test in staging before production

### Example Migration

```sql
-- migrations/001_add_bot_analytics.sql
ALTER TABLE bots ADD COLUMN total_conversations INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN avg_response_time DECIMAL(10,2);
```

## 🚨 Troubleshooting

### Issue: "extension vector does not exist"
**Solution**: Enable vector extension in Database → Extensions

### Issue: RLS policies blocking queries
**Solution**: Check if user is authenticated with Supabase client
```javascript
const { data: { user } } = await supabase.auth.getUser()
```

### Issue: Slow vector searches
**Solution**: 
1. Rebuild IVFFlat index with more lists
2. Ensure `match_threshold` isn't too low
3. Limit `match_count` to reasonable number (5-10)

### Issue: "permission denied for table"
**Solution**: Check RLS policies or use service role key for admin operations

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Vector Search Guide](https://supabase.com/docs/guides/ai/vector-search)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🔗 Connection Strings

### For Backend (Service Role)
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### For Local Development (Docker)
```
postgresql://agentdesk:agentdesk_password@localhost:5432/agentdesk_dev
```

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Enabled pgvector extension
- [ ] Ran schema.sql successfully
- [ ] Copied API keys to .env
- [ ] Configured authentication providers
- [ ] (Optional) Set up storage buckets
- [ ] (Optional) Enabled realtime for chat tables
- [ ] Tested database connection from backend
- [ ] Verified RLS policies are working

---

**Next Steps**: Configure your backend to connect to Supabase using the credentials above.

