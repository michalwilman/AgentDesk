#!/bin/bash

# 🧪 בדיקת Chat API - האם הבוט מחפש בבסיס הידע?

# החלף את הערכים האלה:
BOT_ID="ce75ab41-4031-430f-ab96-62851fea815b"  # מה-screenshot שלך
API_TOKEN="bot_YOUR_TOKEN_HERE"  # תחליף עם ה-API token של הבוט
SESSION_ID="test-session-$(date +%s)"

echo "🚀 שולח שאלה לבוט..."
echo "Bot ID: $BOT_ID"
echo "Session: $SESSION_ID"
echo ""

curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-Bot-Token: $API_TOKEN" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"message\": \"מהי פסקת הפתיחה באתר example.com?\",
    \"visitorMetadata\": {
      \"userAgent\": \"Test\",
      \"ip\": \"127.0.0.1\"
    }
  }"

echo ""
echo ""
echo "✅ בדוק את הטרמינל של הבעקאנד!"
echo "צריך לראות:"
echo "  📚 Retrieved X context chunks..."

