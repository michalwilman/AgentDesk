# 🚀 הפעלת כל השרתים של AgentDesk

## 📋 סדר הפעלה נכון:

---

### 1️⃣ Backend (Port 3001)

```bash
# Terminal 1
cd C:\Projects\AgentDesk\backend
npm run start:dev
```

**חכי להודעה:**
```
🚀 AgentDesk Backend running on: http://localhost:3001/api
```

---

### 2️⃣ Frontend (Port 3000)

```bash
# Terminal 2 (חדש!)
cd C:\Projects\AgentDesk\frontend
npm run dev
```

**חכי להודעה:**
```
▲ Next.js ready on http://localhost:3000
```

---

### 3️⃣ Widget (אופציונלי - רק לפיתוח)

אם רוצה לפתח את הווידג'ט בנפרד:

```bash
# Terminal 3 (חדש!)
cd C:\Projects\AgentDesk\widget
npm run dev
```

---

## ✅ בדיקה שהכל עובד:

### Backend:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api" -Method Get
```
**אמור להחזיר:** `200 OK` + `{"name":"AgentDesk API",...}`

### Frontend:
פתחי בדפדפן: **http://localhost:3000**

**אמור להראות:** דף הבית של AgentDesk

### Widget:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/widget-standalone.js" -Method Get
```
**אמור להחזיר:** `200 OK` + קוד JavaScript

---

## 🐛 שגיאות נפוצות:

### שגיאה: "Port already in use"

**פורט 3001 תפוס:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

**פורט 3000 תפוס:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### שגיאה: "Missing script"

בדקי ש-`package.json` מכיל את הscripts:

**Backend** (`backend/package.json`):
```json
"scripts": {
  "start:dev": "nest start --watch"
}
```

**Frontend** (`frontend/package.json`):
```json
"scripts": {
  "dev": "next dev"
}
```

---

## 🔧 קיצורי דרך:

### Batch File להפעלה אוטומטית:

יצרתי עבורך קובץ להפעלה מהירה:

**Windows:**
```batch
# לחצי פעמיים על:
START_ALL_SERVERS.bat
```

---

## 📊 מצב השרתים:

### נדרש להרצה:
- ✅ **Backend** (חובה!) - `http://localhost:3001`
- ✅ **Frontend** (אופציונלי) - `http://localhost:3000`
- ⚠️ **Widget** (לא נדרש) - הווידג'ט נטען מה-Backend

### לשימוש ב-WordPress:
- ✅ **Backend בלבד** (אם Backend רץ, הווידג'ט זמין!)
- ❌ Frontend לא נדרש להרצה

---

## 🎯 לשימוש עם WordPress tirufai.com:

### אם משתמשת ב-ngrok:

```bash
# Terminal 1: Backend
cd C:\Projects\AgentDesk\backend
npm run start:dev

# Terminal 2: ngrok
cd C:\ngrok
.\ngrok.exe http 3001
```

**עדכני ב-WordPress:**
- העתיקי את ה-URL מ-ngrok
- הזיני בהגדרות התוסף

---

## 💡 טיפים:

1. **Backend חייב לרוץ** כדי ש-WordPress יעבוד
2. **Frontend אופציונלי** - רק אם רוצה לראות את הדאשבורד
3. **Widget לא צריך** - נטען אוטומטית מה-Backend

---

**Status:** ✅ מוכן לשימוש  
**Next:** הפעילי Backend ואז העלי לWordPress!

