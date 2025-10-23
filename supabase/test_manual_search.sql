-- 🧪 בדיקה ידנית של similarity בין השאלה לתוכן
-- הרץ את זה אם הבוט עדיין לא עונה

-- ניקח את ה-embedding של התוכן ונבדוק מה ה-similarity לעצמו
WITH bot_info AS (
  SELECT bot_id 
  FROM knowledge_embeddings 
  WHERE content_text LIKE '%Example Domain%'
  LIMIT 1
),
example_embedding AS (
  SELECT embedding, content_text
  FROM knowledge_embeddings 
  WHERE bot_id = (SELECT bot_id FROM bot_info)
    AND content_text LIKE '%Example Domain%'
  LIMIT 1
)
SELECT 
  ke.id,
  LEFT(ke.content_text, 200) as content_preview,
  1 - (ke.embedding <=> (SELECT embedding FROM example_embedding)) as similarity_score,
  CASE 
    WHEN 1 - (ke.embedding <=> (SELECT embedding FROM example_embedding)) > 0.3 THEN '✅ Will be found (>0.3)'
    WHEN 1 - (ke.embedding <=> (SELECT embedding FROM example_embedding)) > 0.1 THEN '⚠️  Border case (0.1-0.3)'
    ELSE '❌ Too low (<0.1)'
  END as will_be_found
FROM knowledge_embeddings ke
WHERE ke.bot_id = (SELECT bot_id FROM bot_info)
ORDER BY ke.embedding <=> (SELECT embedding FROM example_embedding)
LIMIT 5;

-- זה בודק את ה-similarity של התוכן לעצמו
-- אם זה לא 1.0 (או קרוב) - יש בעיה!

