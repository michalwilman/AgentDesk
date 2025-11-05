-- ============================================================================
-- Fix Remaining Function Search Path Mutable Warnings
-- Date: 2025-11-05
-- Purpose: Fix the last 5 functions with search_path warnings
-- ============================================================================

-- This migration fixes the remaining "Function Search Path Mutable" warnings
-- by adding SET search_path = public to all remaining functions.

-- ============================================================================
-- API KEY GENERATION FUNCTIONS
-- ============================================================================

-- Fix generate_user_api_key
CREATE OR REPLACE FUNCTION generate_user_api_key()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := 'sk_' || encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix generate_bot_api_token
CREATE OR REPLACE FUNCTION generate_bot_api_token()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.api_token IS NULL THEN
    NEW.api_token := 'bot_' || encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTIFICATION FUNCTION
-- ============================================================================

-- Fix create_appointment_notification
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only create notification for confirmed appointments
  IF NEW.status = 'confirmed' THEN
    INSERT INTO appointment_notifications (appointment_id, user_id, dismissed)
    SELECT NEW.id, bots.user_id, false
    FROM bots
    WHERE bots.id = NEW.bot_id
    ON CONFLICT (appointment_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- KNOWLEDGE SEARCH FUNCTION
-- ============================================================================

-- Fix search_knowledge
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
)
SECURITY INVOKER
SET search_path = public
AS $$
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

-- ============================================================================
-- UTILITY FUNCTION
-- ============================================================================

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION generate_user_api_key IS 'Generates unique API key for users - SEARCH PATH SECURED';
COMMENT ON FUNCTION generate_bot_api_token IS 'Generates unique API token for bots - SEARCH PATH SECURED';
COMMENT ON FUNCTION create_appointment_notification IS 'Creates notification for confirmed appointments - SEARCH PATH SECURED';
COMMENT ON FUNCTION search_knowledge IS 'Searches knowledge base using vector similarity - SEARCH PATH SECURED';
COMMENT ON FUNCTION update_updated_at_column IS 'Updates updated_at timestamp - SEARCH PATH SECURED';

-- ============================================================================
-- MIGRATION COMPLETE!
-- All functions now have SET search_path = public for security
-- This should eliminate all "Function Search Path Mutable" warnings
-- ============================================================================

-- ============================================================================
-- REMAINING WARNINGS (Non-critical and cannot be fixed via SQL)
-- ============================================================================

-- 1. Extension in Public (public.vector)
--    This is the pgvector extension. It's safe but Supabase recommends
--    installing extensions in the 'extensions' schema. This cannot be
--    changed after installation without recreating the database.
--    SEVERITY: Low - Safe to ignore in production

-- 2. Leaked Password Protection Disabled (Auth)
--    This is a Supabase Auth configuration setting, not an SQL issue.
--    To fix: Go to Authentication > Settings > Enable "Check for leaked passwords"
--    This will check user passwords against HaveIBeenPwned database.
--    SEVERITY: Medium - Recommended to enable for production

-- ============================================================================

