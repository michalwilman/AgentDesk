# 🚀 Railway Deployment Guide - AgentDesk Backend

## ✅ מה עשינו עד כה:

### קבצים שנוצרו/עודכנו:
1. ✅ `backend/railway.json` - הגדרות Railway נכונות
2. ✅ `backend/Dockerfile` - מאופטם לזמן build מהיר
3. ✅ `backend/.dockerignore` - מאופטם להעתקה מהירה

---

## 🎯 השלבים הבאים ב-Railway:

### שלב 1: Push לGitHub

```bash
cd C:\Projects\AgentDesk
git add .
git commit -m "Optimize Docker build for Railway deployment"
git push origin main
```

---

### שלב 2: הגדרות ב-Railway Dashboard

#### 2.1 Source Settings (הגדרות מקור)
1. לך ל-**Settings** → **Source**
2. וודא ש:**Root Directory** מוגדר ל: `backend`
3. וודא ש:**Branch** הוא: `main`

#### 2.2 Build Settings (לא צריך לשנות!)
Railway אמור לזהות אוטומטית:
- **Builder**: Dockerfile
- **Dockerfile Path**: `Dockerfile` (יחסי ל-backend/)

#### 2.3 Environment Variables (קריטי!)
לך ל-**Variables** tab והוסף:

```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://jnyfdbjtbywcfnewdmjd.supabase.co
SUPABASE_ANON_KEY=<העתק מקובץ .env המקומי>
SUPABASE_SERVICE_ROLE_KEY=<העתק מקובץ .env המקומי>
OPENAI_API_KEY=<העתק מקובץ .env המקומי>
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CORS_ORIGIN=*
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_DEPTH=3
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

#### 2.4 הכנס Encryption Key
צור מפתח חדש:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
העתק את התוצאה והוסף ל-Variables:
```env
ENCRYPTION_KEY=<הדבק את המפתח שיצרת>
```

---

### שלב 3: Deploy!

1. לחץ על **Deploy** (או Railway יעשה Auto-Deploy אחרי Push)
2. המתן 5-10 דקות לבנייה
3. צפה ב-**Build Logs** לוודא שהכל עובד

---

## 🧪 בדיקה אחרי Deploy:

### 1. קבל את ה-Production URL
Railway ייתן לך URL כמו:
```
https://agentdesk-backend-production-xxxx.up.railway.app
```

### 2. בדוק Endpoints:

#### בדיקת Health:
```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api
```
**תוצאה צפויה:** `{"message":"AgentDesk API is running"}`

#### בדיקת Widget:
```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/widget-standalone.js
```
**תוצאה צפויה:** קוד JavaScript של Widget

#### בדיקת Bot Config:
```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/bots/config/bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
```
**תוצאה צפויה:** JSON עם פרטי MichalBot

---

## 📝 שלבים הבאים אחרי Deploy מוצלח:

### 1. עדכן WordPress Plugin
```php
// wordpress-plugin/agentdesk-chatbot.php
define('AGENTDESK_API_URL', 'https://YOUR-RAILWAY-URL.up.railway.app');
define('AGENTDESK_CDN_URL', 'https://YOUR-RAILWAY-URL.up.railway.app/widget-standalone.js');
```

### 2. צור ZIP חדש
```powershell
cd C:\Projects\AgentDesk
Remove-Item agentdesk-chatbot.zip -ErrorAction SilentlyContinue
Compress-Archive -Path wordpress-plugin\* -DestinationPath agentdesk-chatbot-temp.zip
mkdir temp-plugin
Expand-Archive -Path agentdesk-chatbot-temp.zip -DestinationPath temp-plugin\agentdesk-chatbot
Compress-Archive -Path temp-plugin\agentdesk-chatbot -DestinationPath agentdesk-chatbot.zip
Remove-Item agentdesk-chatbot-temp.zip
Remove-Item temp-plugin -Recurse
```

### 3. העלה ל-WordPress
1. מחק את התוסף הישן (אם קיים)
2. העלה את `agentdesk-chatbot.zip` החדש
3. הפעל את התוסף
4. הכנס Bot Token: `bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6`
5. שמור הגדרות

### 4. בדוק באתר
- גלוש ל-tirufai.com
- Widget אמור להופיע עם צבע סגול ושם MichalBot
- נסה לשלוח הודעה - אמור לקבל תשובה מבסיס הידע!

---

## 🔧 Troubleshooting:

### Build נכשל?
1. בדוק ב-**Build Logs** את השגיאה המדויקת
2. וודא ש-Root Directory = `backend`
3. וודא שכל Environment Variables מוגדרים

### Deploy הצליח אבל API לא עובד?
1. בדוק **Deploy Logs** לשגיאות runtime
2. וודא שכל Environment Variables נכונים (במיוחד SUPABASE_URL)
3. בדוק CORS - אמור להיות `*` או לכלול את הדומיין שלך

### Widget לא טוען?
1. בדוק ש-`/widget-standalone.js` נגיש
2. בדוק Console בדפדפן לשגיאות CORS
3. וודא ש-Bot Token נכון ב-WordPress

---

## 💡 טיפים:

### Auto-Deploy
Railway מוגדר ל-Auto-Deploy מ-`main` branch.
כל `git push` יפעיל deployment חדש!

### Logs
- **Build Logs**: מה קרה בזמן הבנייה
- **Deploy Logs**: מה קורה כשהשרת רץ
- שניהם נגישים דרך Railway Dashboard

### Free Tier
Railway נותן:
- ✅ $5 חינם בחודש
- ✅ Unlimited builds
- ✅ Auto-deploy from GitHub
- ⚠️ אחרי $5 - צריך להוסיף כרטיס אשראי

---

## 🎉 סיכום:

1. ✅ Push לGitHub
2. ✅ הגדר Root Directory ב-Railway
3. ✅ הוסף Environment Variables
4. ✅ Deploy!
5. ✅ בדוק Endpoints
6. ✅ עדכן WordPress Plugin
7. ✅ העלה לWordPress
8. ✅ תהני מBot בלייב! 🤖💜

---

**זמן משוער:** 30-45 דקות 🚀

