# 🚀 הגדרת ngrok לחיבור Backend מקומי לאתר LIVE

## 📥 שלב 1: הורדה והתקנה

1. **הורדת ngrok:**
   - עברי ל: https://ngrok.com/download
   - הורידי את הגרסה ל-Windows
   - חלצי את הקובץ `ngrok.exe` לתיקייה נוחה (למשל: `C:\ngrok\`)

2. **הרשמה (חינם):**
   - הירשמי ב: https://dashboard.ngrok.com/signup
   - העתיקי את ה-Authtoken שלך

3. **הגדרת Authtoken:**
   ```powershell
   cd C:\ngrok
   .\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
   ```

---

## 🚀 שלב 2: הפעלת ngrok

### וודאי ש-Backend רץ:
```powershell
# Terminal 1: הרצת Backend
cd C:\Projects\AgentDesk\backend
npm run start:dev
```

### הריצי את ngrok:
```powershell
# Terminal 2 (חדש): הרצת ngrok
cd C:\ngrok
.\ngrok.exe http 3001
```

### תקבלי פלט כזה:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.3.5
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1234-5678-9abc-def0.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### **העתיקי את הכתובת HTTPS!**
לדוגמה: `https://1234-5678-9abc-def0.ngrok-free.app`

---

## ⚙️ שלב 3: הגדרה ב-WordPress

1. **עברי ל:** **הגדרות → AgentDesk**

2. **הזיני את הכתובות:**
   ```
   Bot Token: YOUR_BOT_TOKEN
   API URL: https://1234-5678-9abc-def0.ngrok-free.app/api
   Widget Script URL: https://1234-5678-9abc-def0.ngrok-free.app/widget-standalone.js
   ```
   
   ⚠️ **החליפי את הכתובת** בכתובת שקיבלת מ-ngrok!

3. **לחצי "שמור"**

---

## ✅ שלב 4: בדיקה

1. **עברי לאתר שלך**: https://tirufai.com
2. **התנתקי מהניהול** (או פתחי בחלון אנונימי)
3. **אמורה לראות בועת צ'אט** בפינה!
4. **לחצי על הבועה** ובדקי שהצ'אט עובד

---

## 🐛 פתרון בעיות

### ngrok לא נפתח?
```powershell
# בדקי אם פורט 4040 תפוס
netstat -ano | findstr :4040

# אם כן, עצרי את התהליך:
taskkill /PID <PID_NUMBER> /F

# נסי שוב
.\ngrok.exe http 3001
```

### Widget לא טוען?
- **בדקי** שה-Backend רץ: `http://localhost:3001/api`
- **בדקי** ש-ngrok רץ: פתחי את `http://127.0.0.1:4040` בדפדפן
- **בדקי** בקונסול בדפדפן (F12) - יש שגיאות?

### CORS Errors?
Backend שלנו כבר מוגדר לCORS, אבל אם יש בעיה:

```typescript
// בקובץ backend/src/main.ts
app.enableCors({
  origin: '*', // מאפשר לכולם (זמני!)
  credentials: true,
});
```

---

## ⚠️ חשוב לדעת על ngrok:

### יתרונות: ✅
- מהיר להתקנה
- עובד מיד
- טוב לבדיקות
- חינם (עם מגבלות)

### חסרונות: ❌
- **הכתובת משתנה בכל הרצה!** צריך לעדכן ב-WordPress בכל פעם
- לא מתאים לפרודקשן (אתר אמיתי)
- יש מגבלות על Free Plan
- יכול להיות איטי

---

## 🎯 מתי להשתמש ב-ngrok?

**טוב ל:**
- ✅ בדיקות מהירות
- ✅ פיתוח
- ✅ הדגמה למישהו
- ✅ דיבוג בעיות

**לא טוב ל:**
- ❌ אתר בפרודקשן (לקוחות אמיתיים)
- ❌ שימוש ארוך טווח
- ❌ ביצועים גבוהים

---

## 🚀 המלצה:

1. **עכשיו:** השתמשי ב-ngrok כדי לבדוק שהתוסף עובד ✅
2. **אחר כך:** העלי את ה-Backend לשרת אמיתי (Heroku/Railway/Render) 🚀
3. **ואז:** עדכני את הכתובות ב-WordPress ל-URL קבוע 🎯

---

## 📞 צריכה עזרה?

אני כאן! ספרי לי:
- האם ngrok עבד?
- מה התוצאה?
- יש שגיאות?

נפתור ביחד! 💪

