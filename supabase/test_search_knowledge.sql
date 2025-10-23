-- 🧪 בדיקת פונקציית search_knowledge
-- הרץ את זה ב-Supabase SQL Editor כדי לבדוק אם החיפוש עובד

-- ============================================================================
-- בדיקה 1: האם הפונקציה search_knowledge קיימת?
-- ============================================================================
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'search_knowledge';

-- אם אין תוצאה - הפונקציה לא קיימת! ❌
-- אם יש תוצאה - הפונקציה קיימת ✅

-- ============================================================================
-- בדיקה 2: האם vector extension מותקן?
-- ============================================================================
SELECT 
  extname,
  extversion
FROM pg_extension
WHERE extname = 'vector';

-- אם אין תוצאה - pgvector לא מותקן! ❌
-- אם יש תוצאה - pgvector מותקן ✅

-- ============================================================================
-- בדיקה 3: ניסיון חיפוש ידני (דמה query)
-- ============================================================================
-- נבדוק אם נוכל לחשב cosine similarity בין 2 embeddings

-- קודם נשלוף את ה-bot_id
WITH bot_info AS (
  SELECT bot_id 
  FROM knowledge_embeddings 
  WHERE content_text LIKE '%Example Domain%'
  LIMIT 1
),
first_embedding AS (
  SELECT embedding 
  FROM knowledge_embeddings 
  WHERE bot_id = (SELECT bot_id FROM bot_info)
  LIMIT 1
)
SELECT 
  ke.id,
  LEFT(ke.content_text, 100) as preview,
  1 - (ke.embedding <=> (SELECT embedding FROM first_embedding)) as similarity
FROM knowledge_embeddings ke
WHERE ke.bot_id = (SELECT bot_id FROM bot_info)
ORDER BY ke.embedding <=> (SELECT embedding FROM first_embedding)
LIMIT 5;

-- אם מקבלים שגיאה - יש בעיה עם vector operations ❌
-- אם מקבלים תוצאות עם similarity scores - הכל עובד ✅

-- ============================================================================
-- בדיקה 4: בדיקה ישירה של search_knowledge
-- ============================================================================
-- ניצור embedding פשוט (אפסים) רק לבדיקה

WITH bot_info AS (
  SELECT bot_id 
  FROM knowledge_embeddings 
  WHERE content_text LIKE '%Example Domain%'
  LIMIT 1
),
test_embedding AS (
  -- נשתמש ב-embedding קיים במקום ליצור חדש
  SELECT embedding 
  FROM knowledge_embeddings 
  WHERE bot_id = (SELECT bot_id FROM bot_info)
  LIMIT 1
)
SELECT * FROM search_knowledge(
  (SELECT embedding FROM test_embedding),
  (SELECT bot_id FROM bot_info),
  0.0,  -- match_threshold = 0 כדי להחזיר הכל
  10    -- match_count
);

-- אם מקבלים שגיאה - הפונקציה לא עובדת ❌
-- אם מקבלים תוצאות - הפונקציה עובדת ✅

-- ============================================================================
-- 📋 פענוח תוצאות:
-- ============================================================================
-- ✅ בדיקה 1: צריך לראות 'search_knowledge' | 'FUNCTION' | 'record'
-- ✅ בדיקה 2: צריך לראות 'vector' | '0.x.x'
-- ✅ בדיקה 3: צריך לראות 2 שורות עם similarity בין 0 ל-1
-- ✅ בדיקה 4: צריך לראות 2 שורות עם id, content_text, similarity, metadata

-- ❌ אם בדיקה 1 או 2 נכשלות - צריך ליצור את הפונקציה/להתקין pgvector
-- ❌ אם בדיקה 3 או 4 נכשלות - יש בעיה עם הפונקציה או ה-embeddings

