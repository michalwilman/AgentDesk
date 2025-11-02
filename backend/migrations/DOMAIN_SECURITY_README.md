# 🔐 הוראות הפעלת Domain Security

## מה זה עושה?

הפיצ'ר הזה **מגביל** את השימוש בבוט רק לדומיינים מסוימים שתגדירי.

**דוגמא:** אם הטוקן של הבוט ייגנב, לא יוכלו להשתמש בו באתרים אחרים!

---

## 📋 שלבי ההתקנה:

### שלב 1: הוספת העמודה במסד הנתונים

1. היכנסי ל-**Supabase Dashboard**: https://app.supabase.com
2. בחרי בפרויקט `AgentDesk`
3. לחצי על **SQL Editor** בתפריט הצד
4. פתחי את הקובץ: `backend/migrations/add_allowed_domains.sql`
5. העתקי את כל התוכן והדביקי ב-SQL Editor
6. לחצי על **RUN** ✅

### שלב 2: הגדרת הדומיין שלך

1. באותו SQL Editor
2. פתחי את הקובץ: `backend/migrations/configure_michal_bot_domain.sql`
3. העתקי את כל התוכן והדביקי ב-SQL Editor
4. לחצי על **RUN** ✅

---

## ✅ אישור שהכל עבד:

תראי בתוצאה משהו כזה:

```
id: 0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31
name: Michal Wilman
allowed_domains: {tirufai.com, www.tirufai.com}
```

---

## 🚀 Deploy לייצור:

אחרי שהרצת את ה-SQL, צריך לעשות Deploy לבקאנד:

```bash
cd backend
git add .
git commit -m "🔐 Add domain security validation"
git push
```

**Railway יעשה Deploy אוטומטי!**

---

## 🧪 בדיקה:

1. **בדיקה 1: הבוט עובד באתר שלך** ✅
   - כנסי ל-`tirufai.com`
   - הבוט אמור לעבוד רגיל

2. **בדיקה 2: הבוט לא עובד באתרים אחרים** ✅
   - נסי לפתוח את: `https://agentdesk-widget-production.up.railway.app/?botToken=bot_e46f5111c3d0ad0bd81e7fbf6cf68856e333342c373bb6f4d7dc0af9d1e0e8cc`
   - אמור לקבל שגיאה: `Domain ... is not authorized to use this bot`

---

## 📝 כיצד להוסיף דומיינים נוספים:

אם את רוצה להוסיף דומיינים נוספים (למשל, דומיין staging):

```sql
UPDATE bots 
SET allowed_domains = ARRAY['tirufai.com', 'www.tirufai.com', 'staging.tirufai.com']
WHERE id = '0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31';
```

---

## 🆘 כיצד לכבות את ההגבלה:

אם את רוצה לאפשר לבוט לעבוד מכל דומיין:

```sql
UPDATE bots 
SET allowed_domains = NULL
WHERE id = '0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31';
```

או:

```sql
UPDATE bots 
SET allowed_domains = ARRAY['*']
WHERE id = '0e4f73fa-25a1-4b0a-9782-2ac13fbd3b31';
```

---

## ⚙️ איך זה עובד?

1. הווידג'ט שולח בקשה לבקאנד עם הטוקן
2. הבקאנד בודק מאיזה דומיין הבקשה הגיעה (מ-Origin/Referer headers)
3. אם הדומיין לא ברשימה המורשית - הבקאנד דוחה את הבקשה ❌
4. אם הדומיין מורשה - הבקשה מטופלת רגיל ✅

---

**נהנית? זה חינם בשבילך! 🎉**

