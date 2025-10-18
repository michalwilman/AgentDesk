# Multiple Welcome Messages Feature

## תכונת הודעות פתיחה מרובות

### סקירה כללית (Overview)

תכונה חדשה המאפשרת למשתמשים להגדיר מספר הודעות פתיחה שמוצגות ברצף כאשר המבקר פותח את הצ'אט. כל הודעה מוצגת עם אפקט הקלדה אנושי טבעי.

This new feature allows users to define multiple welcome messages that are shown sequentially when a visitor opens the chat. Each message displays with a natural human typing effect.

---

## שינויים בדאטהבייס (Database Changes)

### שדה חדש (New Field)
- **`welcome_messages`** (JSONB): מערך של מחרוזות המכיל את כל הודעות הפתיחה
- **תאימות לאחור**: השדה הקיים `welcome_message` נשמר לתמיכה לאחור

### Migration
```sql
-- Run this migration to add the new field
psql -f supabase/migration_add_welcome_messages.sql
```

או דרך Supabase Dashboard:
1. עבור ל-SQL Editor
2. העתק את תוכן הקובץ `supabase/migration_add_welcome_messages.sql`
3. הרץ את השאילתה

---

## שימוש במערכת (System Usage)

### יצירת בוט חדש (Create New Bot)
1. בעמוד "Create New Bot", תחת "Welcome Messages"
2. ברירת מחדל: שורה אחת
3. לחץ על **"➕ Add Line"** / **"הוסף שורת פתיחה"** להוספת הודעות נוספות
4. לחץ על **🗑️** למחיקת הודעה (לא ניתן למחוק אם נשארה רק אחת)

### עריכת בוט קיים (Edit Existing Bot)
1. לחץ על **"Edit Bot"** בעמוד הבוט
2. עדכן את ההודעות תחת "Welcome Messages" / "הודעות פתיחה"
3. שמור שינויים

---

## אפקט ההקלדה (Typing Effect)

### חישוב הזמן
- **0.04 שניות לכל תו** (40ms per character)
- דינמי לפי אורך ההודעה
- יוצר חוויה טבעית ואנושית

### דוגמה
```javascript
// Message 1: "Hello!" (6 characters)
// Delay before message 2: 6 × 40 = 240ms

// Message 2: "How can I help you today?" (27 characters)  
// Delay before message 3: 27 × 40 = 1,080ms (1.08 seconds)
```

---

## תמיכה ב-RTL

כל הממשק תומך ב-RTL מלא כאשר הבוט מוגדר בעברית:
- כיווניות הטפסים
- מיקום כפתורי המחיקה
- כותרות ותיאורים בעברית

---

## קבצים שעודכנו (Updated Files)

### Backend
- ✅ `supabase/schema.sql` - הוספת שדה `welcome_messages`
- ✅ `backend/src/bots/dto/bot.dto.ts` - תמיכה ב-`welcome_messages` array
- ✅ `backend/src/bots/bots.controller.ts` - החזרת `welcome_messages` ב-API

### Frontend - Dashboard
- ✅ `frontend/app/(dashboard)/dashboard/bots/new/page.tsx` - טופס יצירה עם שדות דינמיים
- ✅ `frontend/app/(dashboard)/dashboard/bots/[id]/edit/page.tsx` - טופס עריכה עם שדות דינמיים
- ✅ `frontend/app/(dashboard)/dashboard/bots/[id]/chat/page.tsx` - העברת `welcome_messages` ל-preview
- ✅ `frontend/components/dashboard/bot-chat-preview.tsx` - תצוגת הודעות עם typing effect

### Widget
- ✅ `widget/components/chat-widget.tsx` - תצוגת הודעות עם typing effect ב-widget הציבורי

---

## דוגמאות שימוש (Usage Examples)

### בוט בעברית
```json
{
  "welcome_messages": [
    "היי! 👋",
    "כאן הבוטית של מיכל,", 
    "איך אפשר לעזור?"
  ]
}
```

### English Bot
```json
{
  "welcome_messages": [
    "Hello! 👋",
    "Welcome to our support chat.",
    "How can I help you today?"
  ]
}
```

### Single Message (Backward Compatible)
```json
{
  "welcome_messages": ["Hello! How can I help you today?"]
}
```

---

## בדיקות (Testing)

### טסט מקומי
1. הרץ את ה-migration: `psql -f supabase/migration_add_welcome_messages.sql`
2. צור בוט חדש עם מספר הודעות פתיחה (למשל 2-3 הודעות)
3. בדוק בעמוד Chat Preview (`/dashboard/bots/[id]/chat`)
4. ודא שההודעות מופיעות ברצף עם אפקט הקלדה
5. בדוק שמופיעות בדיוק כמות ההודעות שהגדרת (לא כפילויות)
6. רענן את הדף ובדוק שוב - צריכות להופיע אותן הודעות פעם אחת בלבד

### טסט בפרודקשן
1. הרץ את ה-migration על בסיס הנתונים של פרודקשן
2. בדוק בוטים קיימים - צריכים לעבוד ללא שינוי
3. צור בוט חדש ובדוק את התכונה החדשה

### תיקונים שבוצעו
- ✅ תוקן באג שגרם להצגת הודעות כפולות (4 במקום 2)
- ✅ נוסף `useRef` למעקב אחר הצגת הודעות פתיחה
- ✅ נוסף cleanup function למניעת memory leaks
- ✅ תוקן חישוב הזמן המצטבר בין הודעות

---

## תאימות לאחור (Backward Compatibility)

✅ **בוטים קיימים ממשיכים לעבוד ללא שינוי**
- השדה `welcome_message` נשמר
- אם אין `welcome_messages`, המערכת משתמשת ב-`welcome_message`
- Migration מעביר אוטומטית את ההודעה הישנה למערך

---

## תמיכה טכנית (Technical Support)

אם יש בעיות:
1. ודא שה-migration רץ בהצלחה
2. בדוק console ב-browser לשגיאות
3. בדוק שהשדה `welcome_messages` קיים בטבלת `bots`

---

**תאריך עדכון**: 16 אוקטובר 2025  
**גרסה**: 1.0.0

