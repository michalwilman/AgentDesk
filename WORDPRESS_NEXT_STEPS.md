# 🎉 התוסף הותקן בהצלחה! מה עכשיו?

## ✅ מה שכבר עשית:
- ✅ העלית את התוסף ל-WordPress
- ✅ הפעלת את התוסף (Activate)
- ✅ התוסף רץ ללא שגיאות!

---

## 🎯 מה לעשות עכשיו - מדריך צעד אחר צעד:

### שלב 1: כניסה להגדרות התוסף ✅

**איך להגיע להגדרות:**

#### אופציה A: דרך תפריט הגדרות
1. בתפריט הצד (שמאלי) → **הגדרות** (Settings)
2. בתפריט המשנה → **AgentDesk**

#### אופציה B: דרך תפריט ישיר
1. בתפריט הצד (שמאלי) → **AgentDesk** (יש אייקון צ'אט 💬)

**זה ייקח אותך לעמוד ההגדרות של התוסף!**

---

### שלב 2: הבנת מה שתראי בעמוד ההגדרות 📋

בעמוד ההגדרות תראי טופס עם השדות הבאים:

#### 1. **Bot API Token** (חובה!)
```
שדה טקסט ריק: bot_xxxxxxxxxxxxxxxx
```

**מה זה?** הטוקן הייחודי של הבוט שלך.

**איפה מקבלים אותו?**
- Frontend Dashboard: `http://localhost:3000`
- עמוד Bots → בחרי בוט → העתיקי את ה-Token

**דוגמה:**
```
bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
```

#### 2. **Enable Chatbot** (אופציונלי)
```
☑️ Show chatbot on your website
```

**מה זה?** הפעל/כבה את הווידג'ט

#### 3. **Widget Position** (אופציונלי)
```
תפריט נפתח: Bottom Right / Bottom Left
```

**מה זה?** איפה הווידג'ט מופיע על המסך

#### 4. **Display On** (אופציונלי)
```
תפריט נפתח: All Pages / Homepage Only / Posts Only / Pages Only
```

**מה זה?** באילו עמודים להציג את הווידג'ט

---

### שלב 3: קבלת Bot Token 🔑

**יש לך 2 אופציות:**

#### אופציה A: אם יש לך בוט קיים (מהדאשבורד)

1. **וודאי שהFrontend רץ:**
   ```bash
   cd C:\Projects\AgentDesk\frontend
   npm run dev
   ```

2. **פתחי בדפדפן:**
   ```
   http://localhost:3000
   ```

3. **היכנסי לדאשבורד:**
   - התחברי עם המשתמש שלך
   - עברי ל: **Bots**
   - בחרי בוט
   - **העתיקי את ה-Token**

#### אופציה B: יצירת בוט חדש (מהירה!)

אם אין לך בוט או רוצה ליצור חדש:

```bash
# בטרמינל
cd C:\Projects\AgentDesk\backend
node -e "console.log('bot_' + require('crypto').randomBytes(32).toString('hex'))"
```

זה ייצור טוקן דמה לבדיקות.

**או פשוט השתמשי בזה לבדיקות:**
```
bot_test123456789abcdef
```

---

### שלב 4: הגדרת Backend URL 🔧

**⚠️ נקודה חשובה מאוד!**

ה-Backend שלך רץ **לוקאלית** (`localhost:3001`), אבל האתר שלך הוא **LIVE** באינטרנט.

**הבעיה:** האתר לא יכול להתחבר ל-`localhost` שלך!

**יש לך 2 פתרונות:**

---

## 🔥 פתרון 1: ngrok (מהיר - לבדיקות) ⚡

**מה זה:** חושף את ה-Backend המקומי לאינטרנט באמצעות tunnel.

### צעדים:

#### 1. הורדת ngrok
- עברי ל: https://ngrok.com/download
- הורידי Windows version
- חלצי ל: `C:\ngrok\`

#### 2. הרשמה (חינם!)
- עברי ל: https://dashboard.ngrok.com/signup
- הירשמי
- העתיקי את ה-Authtoken

#### 3. הגדרת Authtoken
```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

#### 4. הפעלת ngrok
```powershell
# וודאי שהBackend רץ
cd C:\Projects\AgentDesk\backend
npm run start:prod

# בטרמינל חדש:
cd C:\ngrok
.\ngrok.exe http 3001
```

#### 5. קבלת ה-URL
תראי משהו כזה:
```
Forwarding  https://1234-5678-abcd.ngrok-free.app -> http://localhost:3001
```

**העתיקי את ה-URL:** `https://1234-5678-abcd.ngrok-free.app`

#### 6. עדכון בWordPress

עכשיו צריך לעדכן את URLs בקוד התוסף!

**ערכי את הקובץ:** `wp-content/plugins/agentdesk-chatbot/agentdesk-chatbot.php`

**שני את השורות:**
```php
// מ:
define('AGENTDESK_CDN_URL', 'https://cdn.agentdesk.com/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://api.agentdesk.com');

// ל:
define('AGENTDESK_CDN_URL', 'https://YOUR-NGROK-URL.ngrok-free.app/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://YOUR-NGROK-URL.ngrok-free.app/api');
```

**החליפי** `YOUR-NGROK-URL` ב-URL שקיבלת מngrok!

**יתרונות:**
- ✅ מהיר (5 דקות)
- ✅ עובד מיד
- ✅ טוב לבדיקות

**חסרונות:**
- ❌ ה-URL משתנה בכל הרצה
- ❌ לא מתאים לפרודקשן

---

## 🚀 פתרון 2: Railway.app (קבוע - לפרודקשן) 

**מה זה:** מעלה את ה-Backend לשרת אמיתי.

### צעדים מהירים:

#### 1. הירשמי ל-Railway
- עברי ל: https://railway.app
- לחצי "Start a New Project"
- התחברי עם GitHub

#### 2. העלי את הקוד ל-GitHub
```bash
cd C:\Projects\AgentDesk
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/agentdesk.git
git push -u origin main
```

#### 3. פרוסי ל-Railway
- Railway → "Deploy from GitHub repo"
- בחרי `agentdesk`
- בחרי תיקייה: `backend`
- Railway יבנה אוטומטית!

#### 4. הגדר Environment Variables
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://tirufai.com,https://www.tirufai.com
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

#### 5. קבלי URL קבוע
```
https://agentdesk-backend.up.railway.app
```

#### 6. עדכני בWordPress
**ערכי:** `wp-content/plugins/agentdesk-chatbot/agentdesk-chatbot.php`

```php
define('AGENTDESK_CDN_URL', 'https://agentdesk-backend.up.railway.app/widget-standalone.js');
define('AGENTDESK_API_URL', 'https://agentdesk-backend.up.railway.app/api');
```

**יתרונות:**
- ✅ URL קבוע
- ✅ לא נרדם
- ✅ חינם ל-500 שעות/חודש
- ✅ מתאים לפרודקשן

---

## 📝 שלב 5: מילוי ההגדרות בWordPress

אחרי שבחרת פתרון (ngrok או Railway):

### בעמוד הגדרות התוסף:

1. **Bot API Token:**
   ```
   bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
   ```
   (או הטוקן שיצרת)

2. **Enable Chatbot:**
   ```
   ☑️ מסומן
   ```

3. **Widget Position:**
   ```
   Bottom Right
   ```

4. **Display On:**
   ```
   All Pages
   ```

5. **לחצי:** **Save Settings**

---

## ✅ שלב 6: בדיקה שהכל עובד!

### 1. בדוק שהBackend רץ:
```powershell
# אם ngrok:
Invoke-WebRequest -Uri "https://YOUR-NGROK-URL.ngrok-free.app/api"

# אם Railway:
Invoke-WebRequest -Uri "https://agentdesk-backend.up.railway.app/api"
```

**אמור להחזיר:** `200 OK`

### 2. בדוק את הווידג'ט:
```powershell
# אם ngrok:
Invoke-WebRequest -Uri "https://YOUR-NGROK-URL.ngrok-free.app/widget-standalone.js"

# אם Railway:
Invoke-WebRequest -Uri "https://agentdesk-backend.up.railway.app/widget-standalone.js"
```

**אמור להחזיר:** קוד JavaScript (19KB)

### 3. בקרי באתר:
1. פתחי: `https://tirufai.com`
2. **התנתקי** מWordPress Admin (או פתחי incognito)
3. **אמורה לראות בועת צ'אט** בפינה!
4. לחצי על הבועה
5. חלון צ'אט נפתח
6. כתבי הודעה ובדקי שהבוט מגיב

### 4. בדיקת DevTools:
1. פתחי F12 → Console
2. בדקי שאין שגיאות אדומות
3. אמור להיות: `AgentDesk Widget initialized`

---

## 🐛 פתרון בעיות נפוצות

### Widget לא מופיע?

**בדיקה 1:** Backend רץ?
```powershell
Invoke-WebRequest -Uri "YOUR_BACKEND_URL/api"
```

**בדיקה 2:** Console errors?
- F12 → Console
- יש שגיאות CORS? → Backend צריך CORS enabled
- יש 404? → URLs לא נכונים בקוד

**בדיקה 3:** התנתקת מAdmin?
לפעמים הווידג'ט לא מופיע למשתמשים מחוברים.

### Widget מופיע אבל לא עובד?

**בדיקה 1:** Bot Token נכון?
```powershell
curl YOUR_BACKEND_URL/api/bots/config/YOUR_BOT_TOKEN
```

**בדיקה 2:** Backend עונה ל-chat?
```powershell
curl -X POST YOUR_BACKEND_URL/api/chat/message `
  -H "Content-Type: application/json" `
  -H "X-Bot-Token: YOUR_TOKEN" `
  -d '{"message":"Hello","sessionId":"test","source":"web"}'
```

---

## 📊 סיכום מהיר

### מה עשית עד עכשיו:
- ✅ הת וסף מותקן ופעיל

### מה צריך לעשות:
1. ⏳ לבחור פתרון Backend (ngrok או Railway)
2. ⏳ לעדכן URLs בקוד התוסף
3. ⏳ לקבל Bot Token
4. ⏳ למלא הגדרות בWordPress
5. ⏳ לבדוק באתר!

---

## 🎯 ההמלצה שלי:

### לבדיקה מהירה (עכשיו):
1. **השתמשי ב-ngrok** (15 דקות)
2. בדקי שהכל עובד
3. אם עובד → שדרגי ל-Railway

### לפרודקשן (השבוע):
1. **העלי ל-Railway** (30 דקות)
2. URL קבוע
3. אין צורך לטפל ב-ngrok כל פעם

---

## 📞 צריכה עזרה?

**ספרי לי:**
- איזה פתרון בחרת? (ngrok / Railway)
- איפה את תקועה?
- מה השגיאות?

**אני כאן לעזור בכל שלב!** 💬

---

**Status:** 🟢 Plugin Activated Successfully!  
**Next:** Configure Backend URLs and Bot Token  
**Goal:** Get widget working on tirufai.com! 🎉

