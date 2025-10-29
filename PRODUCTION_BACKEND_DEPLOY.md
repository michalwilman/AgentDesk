# 🚀 העלאת Backend לפרודקשן - מדריך מלא

## 🎯 למה להעלות לפרודקשן?

כרגע ה-Backend שלך רץ **לוקאלית** על המחשב שלך.
כדי שהאתר **tirufai.com** יוכל להתחבר, צריך להעלות את ה-Backend לשרת באינטרנט.

---

## 🏆 אופציות העלאה (מומלצות)

### 1. Railway.app ⭐ (המומלץ ביותר!)

**למה Railway?**
- ✅ התקנה סופר קלה (5 דקות!)
- ✅ חינם ל-500 שעות חודש
- ✅ תמיכה בNestJS out-of-the-box
- ✅ PostgreSQL מובנה (אם צריך)
- ✅ Automatic deployments מ-Git

#### הוראות:

1. **הירשמי ל-Railway:**
   - עברי ל: https://railway.app
   - לחצי "Start a New Project"
   - התחברי עם GitHub

2. **חברי את GitHub:**
   ```bash
   # אם עוד לא עשית, העלי את הקוד ל-GitHub
   cd C:\Projects\AgentDesk
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/agentdesk.git
   git push -u origin main
   ```

3. **פרוס ל-Railway:**
   - ב-Railway, לחצי "Deploy from GitHub repo"
   - בחרי את הrepo שלך: `agentdesk`
   - בחרי את התיקייה: `backend`
   - Railway יזהה אוטומטית שזה NestJS

4. **הגדר Environment Variables:**
   
   ב-Railway, עברי ל-Settings → Variables והוסיפי:
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://tirufai.com,https://www.tirufai.com
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   ```

5. **קבלי את ה-URL:**
   - Railway ייתן לך כתובת כמו:
   ```
   https://agentdesk-backend-production.up.railway.app
   ```

6. **בדקי שזה עובד:**
   ```powershell
   curl https://agentdesk-backend-production.up.railway.app/api
   # אמור להחזיר: {"name":"AgentDesk API",...}
   ```

7. **עדכני ב-WordPress:**
   ```
   API URL: https://agentdesk-backend-production.up.railway.app/api
   Widget Script URL: https://agentdesk-backend-production.up.railway.app/widget-standalone.js
   ```

---

### 2. Render.com 🎨

**למה Render?**
- ✅ חינם לזמן בלתי מוגבל (עם מגבלות)
- ✅ Auto-sleep אחרי 15 דק' (Free tier)
- ✅ קל לשימוש
- ✅ תמיכה Docker

#### הוראות:

1. **הירשמי ל-Render:**
   - עברי ל: https://render.com
   - לחצי "Get Started for Free"
   - התחברי עם GitHub

2. **צרי Web Service חדש:**
   - לחצי "New +" → "Web Service"
   - חברי את GitHub repo שלך
   - בחרי את `agentdesk`

3. **הגדרות:**
   ```
   Name: agentdesk-backend
   Region: Frankfurt (קרוב לישראל)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://tirufai.com
   SUPABASE_URL=...
   SUPABASE_KEY=...
   OPENAI_API_KEY=...
   ```

5. **Deploy!**
   - לחצי "Create Web Service"
   - Render יבנה ויעלה אוטומטית
   - תקבלי URL: `https://agentdesk-backend.onrender.com`

⚠️ **שימי לב:** ב-Free tier, השרת נרדם אחרי 15 דקות ללא שימוש!

---

### 3. Heroku ☁️

**למה Heroku?**
- ✅ קלאסי ומוכר
- ✅ דוקומנטציה מצוינת
- ⚠️ לא חינם יותר (צריך כרטיס אשראי)

#### הוראות:

1. **הירשמי ל-Heroku:**
   - עברי ל: https://heroku.com
   - צרי חשבון חינם

2. **התקיני Heroku CLI:**
   ```powershell
   # הורידי מ: https://devcenter.heroku.com/articles/heroku-cli
   # או דרך Chocolatey:
   choco install heroku-cli
   ```

3. **התחברי:**
   ```bash
   heroku login
   ```

4. **צרי אפליקציה:**
   ```bash
   cd C:\Projects\AgentDesk\backend
   heroku create agentdesk-backend
   ```

5. **הגדר Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://tirufai.com
   heroku config:set SUPABASE_URL=...
   heroku config:set SUPABASE_KEY=...
   ```

6. **פרוס:**
   ```bash
   git push heroku main
   ```

7. **קבלי URL:**
   ```
   https://agentdesk-backend.herokuapp.com
   ```

---

### 4. DigitalOcean / VPS 🖥️

**למה VPS?**
- ✅ שליטה מלאה
- ✅ ביצועים גבוהים
- ✅ לא נרדם
- ⚠️ דורש ידע טכני יותר
- 💰 עולה כסף ($5-10/חודש)

#### הוראות (בקצרה):

1. **צרי Droplet:**
   - עברי ל: https://digitalocean.com
   - צרי Ubuntu 22.04 droplet

2. **התחברי דרך SSH:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

3. **התקיני Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **התקיני PM2:**
   ```bash
   npm install -g pm2
   ```

5. **העלי את הקוד:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agentdesk.git
   cd agentdesk/backend
   npm install
   npm run build
   ```

6. **הריצי עם PM2:**
   ```bash
   pm2 start dist/main.js --name agentdesk-backend
   pm2 save
   pm2 startup
   ```

7. **הגדר Nginx:**
   ```bash
   sudo apt install nginx
   # הגדר reverse proxy
   ```

---

## 🎯 המלצה שלי:

### לבדיקות ופיתוח:
1. **ngrok** - מהיר ליישום, טוב לבדיקות ⚡

### לאתר אמיתי (פרודקשן):
1. **Railway** - הכי קל, חינם מספיק ⭐
2. **Render** - חלופה טובה
3. **VPS** - אם יש לך תקציב וידע טכני

---

## ✅ אחרי ההעלאה

1. **בדקי ש-Backend עובד:**
   ```powershell
   curl https://YOUR_BACKEND_URL/api
   ```

2. **בדקי ש-Widget זמין:**
   ```powershell
   curl https://YOUR_BACKEND_URL/widget-standalone.js
   ```

3. **עדכני ב-WordPress:**
   - עברי ל: **הגדרות → AgentDesk**
   - עדכני את הURLs:
     ```
     API URL: https://YOUR_BACKEND_URL/api
     Widget Script URL: https://YOUR_BACKEND_URL/widget-standalone.js
     ```

4. **בדקי באתר:**
   - עברי ל: https://tirufai.com
   - אמורה לראות את הווידג'ט
   - בדקי שהצ'אט עובד!

---

## 🔒 אבטחה חשובה!

### עדכני CORS:

בקובץ `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://tirufai.com', 'https://www.tirufai.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});
```

### הגדר HTTPS:

רוב השירותים (Railway, Render, Heroku) נותנים HTTPS אוטומטית ✅

---

## 📊 כמה עולה כל אופציה?

| שירות | מחיר חינם | מגבלות | מחיר בתשלום |
|-------|-----------|--------|-------------|
| **Railway** | 500 שעות/חודש | לא נרדם | $5/חודש |
| **Render** | לא מוגבל | נרדם אחרי 15 דק' | $7/חודש |
| **Heroku** | ❌ לא זמין | - | $7/חודש |
| **DigitalOcean** | $200 קרדיט | - | $5-10/חודש |
| **ngrok** | זמני | כתובת משתנה | $8/חודש |

---

## 🤔 איזו אופציה לבחור?

**אם את מתחילה:**
→ **Railway** ⭐

**אם יש לך תקציב קטן:**
→ **Render** (Free tier)

**אם את רוצה ביצועים:**
→ **DigitalOcean VPS**

**לבדיקה מהירה:**
→ **ngrok**

---

## 📞 צריכה עזרה?

ספרי לי:
- איזו אופציה בחרת?
- איפה את תקועה?
- מה השגיאות?

אני כאן לעזור! 💪

