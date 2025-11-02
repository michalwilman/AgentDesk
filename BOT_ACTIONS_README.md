# 🚀 AgentDesk Bot Actions System

## סקירה כללית

מערכת Bot Actions הופכת את הצ'אטבוטים שלך לאג'נטים אינטליגנטיים שיכולים לבצע פעולות אוטומטיות במהלך השיחה עם לקוחות.

### יכולות מובנות:

- ✅ **שמירת לידים** - איסוף פרטי לקוחות אוטומטי (שם, טלפון, מייל, שאלה)
- 📅 **קביעת פגישות** - תזמון פגישות דרך Google Calendar
- 📧 **שליחת מיילים** - שליחת מיילים אוטומטית ללקוחות
- 🧾 **יצירת PDF** - הפקת מסמכים (הצעות מחיר, חוזים, חשבוניות)
- 🤳 **שליחת WhatsApp** - הודעות WhatsApp דרך Twilio
- ⚙️ **Webhooks** - אינטגרציה עם Make.com, Zapier, n8n

---

## 📋 מה כולל המימוש?

### Backend (NestJS)

```
backend/src/actions/
├── actions.module.ts              # Module ראשי
├── actions.service.ts             # Logic מרכזי
├── actions.controller.ts          # API endpoints
├── function-definitions.ts        # הגדרות OpenAI Functions
├── dto/                          # Data Transfer Objects
│   ├── save-lead.dto.ts
│   ├── schedule-appointment.dto.ts
│   ├── send-email.dto.ts
│   ├── create-pdf.dto.ts
│   ├── send-whatsapp.dto.ts
│   └── trigger-webhook.dto.ts
└── integrations/                 # שירותי אינטגרציה
    ├── email.service.ts          # Resend
    ├── calendar.service.ts       # Google Calendar
    ├── pdf.service.ts            # Puppeteer
    └── webhook.service.ts        # Webhooks
```

### Frontend (Next.js)

```
frontend/
├── app/(dashboard)/dashboard/
│   ├── bots/[id]/actions/       # הגדרות Actions לבוט
│   ├── leads/                   # דף לידים
│   └── appointments/            # דף פגישות
└── components/dashboard/
    ├── actions-config-form.tsx  # טופס הגדרות
    ├── leads-table.tsx          # טבלת לידים
    └── appointments-table.tsx   # טבלת פגישות
```

### Database

```sql
-- טבלאות חדשות:
- leads                  # לידים
- appointments           # פגישות
- bot_actions_config     # הגדרות Actions לכל בוט
- action_logs           # לוג פעולות (audit trail)
```

---

## ⚙️ התקנה והגדרה

### 1. התקנת Dependencies

```bash
# Backend
cd backend
npm install resend googleapis puppeteer twilio

# או עם yarn
yarn add resend googleapis puppeteer twilio
```

### 2. הרצת Migration

#### אופציה א': דרך Supabase Dashboard
1. היכנס ל-Supabase Dashboard
2. עבור ל-SQL Editor
3. העתק את התוכן מ-`backend/migrations/add_actions_system.sql`
4. הפעל את ה-query

#### אופציה ב': דרך Supabase CLI
```bash
supabase db push backend/migrations/add_actions_system.sql
```

### 3. הגדרת Environment Variables

עדכן את `backend/.env`:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxx

# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID=your-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# PDF Generation
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Default Email
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### 4. הפעלת השרתים

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

---

## 🎯 איך זה עובד?

### תהליך בסיסי:

1. **לקוח מדבר עם הבוט** במהלך הצ'אט
2. **הבוט (GPT-4o-mini) מזהה** שהלקוח רוצה לבצע פעולה (למשל: "אני רוצה שתחזרו אליי")
3. **OpenAI Function Calling** - המודל מחליט לקרוא לפונקציה `save_lead`
4. **הבקאנד מבצע** את הפעולה (שומר ליד במסד נתונים)
5. **הבוט מקבל אישור** ומשיב ללקוח: "שמרתי את הפרטים שלך! נחזור אליך בקרוב"

### דוגמה טכנית:

```typescript
// OpenAI מחליט לקרוא לפונקציה
{
  "function": "save_lead",
  "arguments": {
    "full_name": "יוסי כהן",
    "phone": "0501234567",
    "email": "yossi@example.com",
    "question": "רוצה לשמוע על מחירים"
  }
}

// הבקאנד מבצע
await actionsService.saveLead(botId, chatId, {
  full_name: "יוסי כהן",
  phone: "0501234567",
  email: "yossi@example.com",
  question: "רוצה לשמוע על מחירים"
});

// התוצאה חוזרת ל-AI
{
  "success": true,
  "lead_id": "uuid-here",
  "message": "Lead saved successfully"
}
```

---

## 🔧 שימוש במערכת

### 1. הפעלת Actions לבוט

1. היכנס לדשבורד
2. בחר בוט
3. עבור ל-**Actions** בתפריט
4. הפעל את ה-Actions הרצויים:
   - Toggle ON/OFF לכל Action
   - הזן API Keys נדרשים
   - שמור הגדרות

### 2. לידים

**איך זה עובד:**
- הבוט מזהה אוטומטית כשלקוח נותן פרטים
- שומר שם, טלפון, מייל, שאלה
- ניתן לצפות ב-Dashboard → Leads

**דוגמת שיחה:**
```
לקוח: אני מעוניין במידע נוסף
בוט: בשמחה! מה שמך המלא?
לקוח: יוסי כהן
בוט: תודה יוסי! מה הטלפון שלך?
לקוח: 050-1234567
בוט: מצוין! מה האימייל?
לקוח: yossi@example.com
בוט: ✅ שמרתי את הפרטים שלך! נחזור אליך בקרוב
```

### 3. פגישות

**דרישות:**
- חיבור Google Calendar (OAuth)
- הגדרת שעות זמינות

**דוגמת שיחה:**
```
לקוח: אני רוצה לקבוע פגישה
בוט: בשמחה! מתי נוח לך? למשל מחר ב-14:00?
לקוח: כן, מושלם
בוט: 📅 קבעתי לך פגישה למחר (15 בנובמבר) בשעה 14:00
     שלחתי לך אישור למייל עם קישור לזום
```

### 4. מיילים

**דרישות:**
- Resend API Key
- כתובת מייל מאומתת

**שימוש:**
```
לקוח: תוכל לשלוח לי את המחירון?
בוט: כמובן! מה האימייל שלך?
לקוח: yossi@example.com
בוט: 📧 שלחתי לך את המחירון המלא למייל!
```

### 5. PDF

**תבניות זמינות:**
- `quote` - הצעת מחיר
- `proposal` - הצעה עסקית
- `invoice` - חשבונית

**שימוש:**
```
לקוח: אני צריך הצעת מחיר
בוט: אין בעיה! מה הפרטים?
[הבוט אוסף מידע]
בוט: 🧾 הכנתי לך הצעת מחיר
     [קישור להורדה]
     רוצה שאשלח גם למייל?
```

### 6. WhatsApp

**דרישות:**
- Twilio Account SID
- Twilio Auth Token
- WhatsApp Business Number

**שימוש:**
```
לקוח: תשלח לי את הפרטים לוואטסאפ
בוט: מה המספר שלך?
לקוח: 050-1234567
בוט: 🤳 שלחתי לך הודעה ב-WhatsApp!
```

### 7. Webhooks (Make.com / Zapier)

**הגדרה:**
1. צור Scenario/Zap ב-Make.com או Zapier
2. העתק את ה-Webhook URL
3. הדבק ב-Actions → Webhooks
4. שמור

**Events שנשלחים:**
- `lead_created` - ליד חדש נוצר
- `appointment_scheduled` - פגישה נקבעה
- `email_sent` - מייל נשלח
- `pdf_generated` - PDF נוצר
- `whatsapp_sent` - WhatsApp נשלח

**דוגמת Payload:**
```json
{
  "event": "lead_created",
  "timestamp": 1701234567890,
  "data": {
    "lead_id": "uuid",
    "bot_id": "uuid",
    "bot_name": "Support Bot",
    "full_name": "יוסי כהן",
    "phone": "+972501234567",
    "email": "yossi@example.com",
    "question": "רוצה לשמוע על מחירים",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔒 אבטחה

- ✅ כל API Keys מוצפנים במסד הנתונים
- ✅ Row Level Security (RLS) על כל הטבלאות
- ✅ אימות משתמש לכל בקשה
- ✅ Webhook Signatures עם HMAC SHA256
- ✅ Rate Limiting על API calls

---

## 📊 ניטור ולוגים

כל פעולה מתועדת ב-`action_logs`:

```sql
SELECT 
  action_type,
  status,
  execution_time_ms,
  created_at
FROM action_logs
WHERE bot_id = 'your-bot-id'
ORDER BY created_at DESC;
```

**צפייה בדשבורד:**
- Dashboard → Bots → [Bot Name] → Logs

---

## 🐛 Troubleshooting

### הבוט לא מבצע Actions

**בדוק:**
1. ✅ ה-Action מופעל בהגדרות (`lead_collection_enabled = true`)
2. ✅ יש API Keys נדרשים
3. ✅ הבקאנד רץ ללא שגיאות
4. ✅ check logs: `action_logs` table

### שגיאת PDF Generation

```bash
# Install Chromium
apt-get install chromium-browser

# או
npm install puppeteer --save
```

### שגיאת Email

```bash
# ודא ש-Resend API Key תקין
curl -X POST https://api.resend.com/emails/send \
  -H "Authorization: Bearer re_xxxxx" \
  -H "Content-Type: application/json"
```

### שגיאת Calendar

- ודא שיש OAuth Credentials מ-Google Cloud Console
- בדוק שה-Redirect URI תואם
- Calendar API חייב להיות מופעל ב-Google Cloud

---

## 📈 Performance

- **Average Action Time**: 200-500ms
- **OpenAI Function Calling**: +100-200ms
- **Database Writes**: <50ms
- **External APIs**: תלוי בספק

**אופטימיזציות:**
- Caching של bot configs
- Async webhook calls
- Batch operations
- Connection pooling

---

## 🔄 Update & Maintenance

### הוספת Action חדש:

1. צור DTO ב-`actions/dto/`
2. הוסף function definition ב-`function-definitions.ts`
3. מימוש ב-`actions.service.ts`
4. הוסף case ב-`chat.service.ts → executeAction()`
5. עדכן UI ב-`actions-config-form.tsx`

### עדכון תבניות:

**Email Templates:**
```typescript
// backend/src/actions/integrations/email.service.ts
getDefaultTemplates() {
  return {
    my_custom_template: {
      subject: 'Custom Subject',
      html: '<html>...</html>'
    }
  }
}
```

**PDF Templates:**
```typescript
// backend/src/actions/integrations/pdf.service.ts
getDefaultTemplates() {
  return {
    my_custom_pdf: {
      name: 'Custom PDF',
      html: '<html>...</html>',
      styles: 'body { ... }'
    }
  }
}
```

---

## 💡 Best Practices

1. **תמיד הפעל Lead Collection** - זה הבסיס
2. **הגדר email notifications** - קבל התראות על לידים חדשים
3. **השתמש ב-Webhooks** - לאוטומציות מורכבות
4. **בדוק logs בקביעות** - זהה בעיות מוקדם
5. **תבניות PDF מותאמות** - שפר את חוויית המשתמש

---

## 🤝 תמיכה

יש בעיה? צריך עזרה?

1. בדוק את ה-logs ב-`action_logs`
2. בדוק את ה-console של הבקאנד
3. ודא שכל ה-API Keys תקינים
4. פתח Issue ב-GitHub

---

## 📚 משאבים נוספים

- [OpenAI Function Calling Docs](https://platform.openai.com/docs/guides/function-calling)
- [Resend API Docs](https://resend.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [Puppeteer Docs](https://pptr.dev/)
- [Make.com Webhooks](https://www.make.com/en/help/tools/webhooks)

---

## 🎉 מזל טוב!

המערכת שלך כעת תומכת ב-Bot Actions! הבוטים שלך יכולים:
- לאסוף לידים אוטומטית
- לקבוע פגישות
- לשלוח מיילים
- ליצור מסמכים
- להפעיל אוטומציות

**הבוט שלך הפך לאג'נט מכירות מלא! 🚀**

