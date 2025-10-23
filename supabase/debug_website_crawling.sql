-- 🔍 סקריפט בדיקה לפיצ'ר Website Crawling
-- הרץ את זה ב-Supabase SQL Editor כדי לבדוק מה קורה

-- ============================================================================
-- בדיקה 1: האם יש משימות סריקה?
-- ============================================================================
SELECT 
  id,
  bot_id,
  start_url_after_login,
  status,
  error_message,
  created_at
FROM site_scan_jobs
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- בדיקה 2: האם יש תוכן סרוק?
-- ============================================================================
SELECT 
  id,
  bot_id,
  source_url,
  chunk_index,
  LEFT(content, 100) as content_preview,
  word_count,
  processing_status,
  created_at
FROM scraped_content
WHERE source_url LIKE '%example.com%'
ORDER BY created_at DESC, chunk_index ASC
LIMIT 10;

-- ============================================================================
-- בדיקה 3: האם יש embeddings?
-- ============================================================================
SELECT 
  ke.id,
  ke.bot_id,
  LEFT(ke.content_text, 100) as content_preview,
  ke.metadata,
  ke.created_at,
  CASE 
    WHEN ke.embedding IS NULL THEN 'NULL ❌'
    ELSE 'EXISTS ✅'
  END as embedding_status
FROM knowledge_embeddings ke
JOIN scraped_content sc ON ke.content_id = sc.id
WHERE sc.source_url LIKE '%example.com%'
ORDER BY ke.created_at DESC
LIMIT 10;

-- ============================================================================
-- בדיקה 4: האם פונקציית search_knowledge קיימת?
-- ============================================================================
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'search_knowledge';

-- ============================================================================
-- בדיקה 5: האם vector extension מותקן?
-- ============================================================================
SELECT 
  extname,
  extversion
FROM pg_extension
WHERE extname = 'vector';

-- ============================================================================
-- בדיקה 6: ספירת רשומות לפי bot_id
-- ============================================================================
-- החלף 'YOUR_BOT_ID' ב-UUID של הבוט שלך מטבלת site_scan_jobs
WITH bot_stats AS (
  SELECT bot_id FROM site_scan_jobs 
  WHERE start_url_after_login LIKE '%example.com%'
  ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'Scan Jobs' as table_name,
  COUNT(*) as record_count
FROM site_scan_jobs
WHERE bot_id = (SELECT bot_id FROM bot_stats)
UNION ALL
SELECT 
  'Scraped Content' as table_name,
  COUNT(*) as record_count
FROM scraped_content
WHERE bot_id = (SELECT bot_id FROM bot_stats)
UNION ALL
SELECT 
  'Knowledge Embeddings' as table_name,
  COUNT(*) as record_count
FROM knowledge_embeddings
WHERE bot_id = (SELECT bot_id FROM bot_stats);

-- ============================================================================
-- 📋 פענוח תוצאות:
-- ============================================================================
-- ✅ בדיקה 1: אם status='completed' - הסריקה הושלמה
-- ✅ בדיקה 2: צריך לראות שורות עם chunk_index (0,1,2...) - זה אומר שה-chunking עבד
-- ✅ בדיקה 3: צריך לראות 'EXISTS ✅' בעמודת embedding_status
-- ✅ בדיקה 4: צריך לראות שורה אחת עם routine_name='search_knowledge'
-- ✅ בדיקה 5: צריך לראות 'vector' extension
-- ✅ בדיקה 6: צריך לראות מספרים זהים בכל 3 הטבלאות (אם סרקת פעם אחת)

-- ❌ אם אין תוצאות בבדיקה 2 או 3 - התוכן לא נשמר או ה-embeddings לא נוצרו!

