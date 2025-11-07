-- AgentDesk Database Schema
-- PostgreSQL with pgvector extension for semantic search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Roles Table
CREATE TABLE roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Administrative access'),
  ('user', 'Regular user access');

-- Extended User Profiles Table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  role_id UUID REFERENCES roles(id) DEFAULT (SELECT id FROM roles WHERE name = 'user'),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier VARCHAR(50) DEFAULT 'starter', -- starter, growth, plus, premium
  api_key VARCHAR(255) UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bots Configuration Table
CREATE TABLE bots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(10) DEFAULT 'en', -- en, he
  personality TEXT DEFAULT 'helpful and professional',
  
  -- Appearance
  avatar_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  position VARCHAR(20) DEFAULT 'bottom-right', -- bottom-right, bottom-left
  welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
  welcome_messages JSONB DEFAULT '["Hello! How can I help you today?"]'::jsonb, -- Array of welcome messages
  
  -- Configuration
  model VARCHAR(50) DEFAULT 'gpt-4o-mini', -- gpt-4o-mini, gpt-4o
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  
  -- Security
  api_token VARCHAR(255) UNIQUE NOT NULL,
  allowed_domains TEXT[], -- Array of allowed domains
  rate_limit_per_minute INTEGER DEFAULT 10,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_trained BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped Content Table (raw chunks from websites)
CREATE TABLE scraped_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  source_url TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'webpage', -- webpage, pdf, text, file
  title TEXT,
  content TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  word_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Embeddings Table (vector storage for semantic search)
CREATE TABLE knowledge_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE NOT NULL,
  content_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats Table (conversation sessions)
CREATE TABLE chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(255) NOT NULL, -- Frontend-generated session ID
  visitor_id VARCHAR(255), -- Optional visitor identifier
  visitor_metadata JSONB DEFAULT '{}', -- Browser info, location, etc.
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table (individual chat messages)
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  context_used TEXT[], -- Array of content_ids used for context
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table (Payment Records)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan VARCHAR(50) NOT NULL, -- starter, pro, business
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, cancelled
  paypal_order_id TEXT,
  full_name VARCHAR(255),
  email VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_bots_api_token ON bots(api_token);
CREATE INDEX idx_scraped_content_bot_id ON scraped_content(bot_id);
CREATE INDEX idx_knowledge_embeddings_bot_id ON knowledge_embeddings(bot_id);
CREATE INDEX idx_knowledge_embeddings_content_id ON knowledge_embeddings(content_id);
CREATE INDEX idx_chats_bot_id ON chats(bot_id);
CREATE INDEX idx_chats_session_id ON chats(session_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Vector similarity search index (IVFFlat for faster similarity search)
CREATE INDEX idx_knowledge_embeddings_vector ON knowledge_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search similar content using embeddings
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  bot_uuid UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content_text TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.content_text,
    1 - (ke.embedding <=> query_embedding) AS similarity,
    ke.metadata
  FROM knowledge_embeddings ke
  WHERE ke.bot_id = bot_uuid
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique API token for bots
CREATE OR REPLACE FUNCTION generate_bot_api_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_token IS NULL THEN
    NEW.api_token := 'bot_' || encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique API key for users
CREATE OR REPLACE FUNCTION generate_user_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := 'sk_' || encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON bots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate API tokens
CREATE TRIGGER generate_bot_token BEFORE INSERT ON bots
  FOR EACH ROW EXECUTE FUNCTION generate_bot_api_token();

CREATE TRIGGER generate_user_key BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_user_api_key();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Bots table policies
CREATE POLICY "Users can view own bots" ON bots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bots" ON bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bots" ON bots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bots" ON bots
  FOR DELETE USING (auth.uid() = user_id);

-- Scraped content policies
CREATE POLICY "Users can view own bot content" ON scraped_content
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = scraped_content.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own bot content" ON scraped_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = scraped_content.bot_id AND bots.user_id = auth.uid())
  );

-- Knowledge embeddings policies
CREATE POLICY "Users can view own bot embeddings" ON knowledge_embeddings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = knowledge_embeddings.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own bot embeddings" ON knowledge_embeddings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = knowledge_embeddings.bot_id AND bots.user_id = auth.uid())
  );

-- Chats policies (users can view chats for their bots)
CREATE POLICY "Users can view own bot chats" ON chats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = chats.bot_id AND bots.user_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view own bot messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      JOIN bots ON bots.id = chats.bot_id 
      WHERE chats.id = messages.chat_id AND bots.user_id = auth.uid()
    )
  );

-- Audit logs policies (users can only view their own logs)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('max_bots_per_user_free', '1', 'Maximum bots allowed for free tier users'),
  ('max_bots_per_user_pro', '10', 'Maximum bots allowed for pro tier users'),
  ('max_bots_per_user_enterprise', '999', 'Maximum bots allowed for enterprise tier users'),
  ('demo_message_limit', '7', 'Maximum messages for demo bot'),
  ('default_rate_limit', '100', 'Default API rate limit per minute');

-- ============================================================================
-- VIEWS (Optional - for analytics)
-- ============================================================================

-- Bot analytics view
CREATE OR REPLACE VIEW bot_analytics AS
SELECT 
  b.id AS bot_id,
  b.name AS bot_name,
  b.user_id,
  COUNT(DISTINCT c.id) AS total_chats,
  COUNT(DISTINCT m.id) AS total_messages,
  AVG(c.satisfaction_rating) AS avg_satisfaction,
  COUNT(DISTINCT sc.id) AS total_content_chunks,
  COUNT(DISTINCT ke.id) AS total_embeddings,
  b.created_at AS bot_created_at
FROM bots b
LEFT JOIN chats c ON c.bot_id = b.id
LEFT JOIN messages m ON m.chat_id = c.id
LEFT JOIN scraped_content sc ON sc.bot_id = b.id
LEFT JOIN knowledge_embeddings ke ON ke.bot_id = b.id
GROUP BY b.id, b.name, b.user_id, b.created_at;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id AS user_id,
  u.email,
  u.company_name,
  u.subscription_tier,
  COUNT(DISTINCT b.id) AS total_bots,
  COUNT(DISTINCT c.id) AS total_chats,
  COUNT(DISTINCT m.id) AS total_messages,
  u.created_at AS user_created_at
FROM users u
LEFT JOIN bots b ON b.user_id = u.id
LEFT JOIN chats c ON c.bot_id = b.id
LEFT JOIN messages m ON m.chat_id = c.id
GROUP BY u.id, u.email, u.company_name, u.subscription_tier, u.created_at;

-- Grant permissions on views
GRANT SELECT ON bot_analytics TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON TABLE bots IS 'AI chatbot configurations and settings';
COMMENT ON TABLE scraped_content IS 'Raw content chunks from scraped websites or uploaded files';
COMMENT ON TABLE knowledge_embeddings IS 'Vector embeddings for semantic search using OpenAI';
COMMENT ON TABLE chats IS 'Chat conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages within chat sessions';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';

COMMENT ON FUNCTION search_knowledge IS 'Performs semantic similarity search on knowledge embeddings';

