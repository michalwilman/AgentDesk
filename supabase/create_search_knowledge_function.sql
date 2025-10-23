-- ✅ יצירת הפונקציה search_knowledge
-- הרץ את זה רק אם הפונקציה לא קיימת!

-- קודם וודא ש-pgvector מותקן
CREATE EXTENSION IF NOT EXISTS vector;

-- צור או החלף את הפונקציה
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

-- אישור
SELECT 'search_knowledge function created successfully!' as status;

