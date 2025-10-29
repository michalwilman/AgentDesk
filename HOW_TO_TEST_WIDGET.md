# 🧪 איך לבדוק את Widget - המדריך המלא

## ✅ הדרך הנכונה לבדיקת Widget

### 🎯 השלבים:

#### 1️⃣ הפעל את השרתים
```powershell
# Terminal 1 - Backend
cd C:\Projects\AgentDesk\backend
npm run start:dev

# Terminal 2 - Frontend  
cd C:\Projects\AgentDesk\frontend
npm run dev
```

#### 2️⃣ פתח את הדפדפן
```
http://localhost:3000/test-widget.html
```

**זהו! זה הכל!** 🎉

---

## 📁 איפה נמצא הקובץ?

```
C:\Projects\AgentDesk\frontend\public\test-widget.html
```

**למה את לא רואה אותו בתיקייה הראשית?**  
כי הוא בתוך `frontend/public/`!

---

## ⚠️ למה לא לפתוח בDouble-click?

### ❌ Double-click על קובץ HTML:
```
file://C:/Projects/AgentDesk/test-widget.html
```
**בעיה:** CORS חוסם גישה ל-Backend → הבוט לא מסונכרן!

### ✅ פתיחה דרך HTTP Server:
```
http://localhost:3000/test-widget.html
```
**מושלם:** אין CORS → הבוט מסונכרן עם Dashboard! 💜

---

## 🎨 מה אמור לעבוד:

✅ שם הבוט: **MichalBot**  
✅ צבע: **סגול #ce3bf7**  
✅ שפה: **עברית**  
✅ תשובות: **מבסיס הידע שלך**  
✅ הודעת פתיחה: **היי! אני יכול לעזור לך היום?**

---

## 🔍 איך לוודא שזה עובד:

1. פתח: `http://localhost:3000/test-widget.html`
2. לחץ על בועת הצ'אט (פינה ימנית למטה)
3. בדוק:
   - צבע סגול? ✅
   - שם MichalBot? ✅
   - הודעת פתיחה בעברית? ✅
4. כתוב שאלה - אמור לקבל תשובה מבסיס הידע! ✅

---

## 🛠️ אם משהו לא עובד:

### בעיה: "Cannot GET /test-widget.html"
**פתרון:** הפעל את Frontend Server:
```powershell
cd C:\Projects\AgentDesk\frontend
npm run dev
```

### בעיה: הבוט לא עונה / מציג "Sorry, I encountered an error"
**פתרון:** הפעל את Backend Server:
```powershell
cd C:\Projects\AgentDesk\backend
npm run start:dev
```

### בעיה: הבוט כחול ולא סגול
**פתרון:** 
1. לחץ Ctrl+Shift+R (מחיקת Cache)
2. רענן את הדף
3. בדוק שה-Backend רץ

---

## 🎉 סיכום:

1. ✅ מחקתי את הקבצים הישנים שלא עובדים
2. ✅ הקובץ שעובד: `frontend/public/test-widget.html`
3. ✅ פתיחה: `http://localhost:3000/test-widget.html`
4. ✅ שני השרתים חייבים לרוץ!

**זהו! עכשיו את יודעת איך לבדוק את Widget בצורה נכונה!** 💜✨

