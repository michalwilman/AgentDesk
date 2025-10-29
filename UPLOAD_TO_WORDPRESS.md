# 🚀 העלאת התוסף AgentDesk לאתר WordPress שלך

## ✅ מה הכנו בשבילך:

1. ✅ **תיקיית תוסף מאורגנת**: `C:\Projects\AgentDesk\agentdesk-chatbot`
2. ✅ **קובץ ZIP מוכן**: `C:\Projects\AgentDesk\agentdesk-chatbot.zip`
3. ✅ **Backend רץ**: `http://localhost:3001`
4. ✅ **Widget זמין**: `http://localhost:3001/widget-standalone.js`

---

## 📤 שלב 1: העלאת התוסף לאתר

### דרך A: העלאה דרך פאנל הניהול של WordPress (מומלץ!)

1. **היכנסי לפאנל הניהול:**
   - עברי לכתובת: https://tirufai.com/wp-admin
   - התחברי עם שם המשתמש והסיסמה שלך

2. **עברי לעמוד התוספים:**
   - לחצי על **תוספים** בתפריט הצד
   - לחצי על **הוסף חדש** (Add New)

3. **העלי את התוסף:**
   - לחצי על כפתור **העלה תוסף** (Upload Plugin) בראש העמוד
   - לחצי על **בחר קובץ** (Choose File)
   - בחרי את הקובץ: `C:\Projects\AgentDesk\agentdesk-chatbot.zip`
   - לחצי על **התקן עכשיו** (Install Now)

4. **המתיני להתקנה:**
   - WordPress יעלה את הקובץ
   - יופיע הודעה: "התוסף הותקן בהצלחה"

5. **הפעילי את התוסף:**
   - לחצי על **הפעל תוסף** (Activate Plugin)
   - התוסף יופעל!

---

### דרך B: העלאה דרך FTP/cPanel (אם אין גישה לפאנל)

1. **התחברי ל-cPanel או FTP:**
   - cPanel: `https://tirufai.com:2083` (או הכתובת שקיבלת מהאחסון)
   - FTP: השתמשי ב-FileZilla או WinSCP

2. **עברי לתיקיית התוספים:**
   ```
   public_html/wp-content/plugins/
   ```

3. **העלי את התיקייה:**
   - העלי את **כל התיקייה** `agentdesk-chatbot` (לא את ה-ZIP!)
   - וודאי שהמבנה הוא:
     ```
     public_html/
     └── wp-content/
         └── plugins/
             └── agentdesk-chatbot/
                 ├── agentdesk-chatbot.php
                 ├── readme.txt
                 ├── assets/
                 ├── includes/
                 └── languages/
     ```

4. **הפעילי את התוסף:**
   - עברי לפאנל WordPress: **תוספים → תוספים מותקנים**
   - מצאי את **AgentDesk AI Chatbot**
   - לחצי **הפעל**

---

## ⚙️ שלב 2: הגדרת התוסף

אחרי שהתוסף מופעל:

1. **עברי להגדרות:**
   - בתפריט הצד, לחצי על: **הגדרות → AgentDesk**
   - או חפשי "AgentDesk" בחיפוש

2. **הזיני את ה-Bot Token:**
   ```
   Bot Token: bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
   ```
   (זה הטוקן לדוגמה - תקבלי את הטוקן האמיתי מהדאשבורד)

3. **הגדר URLs לפיתוח לוקאלי:**
   
   **חשוב!** מכיוון שה-Backend שלך רץ לוקאלית, צריך להגדיר:
   
   ```
   API URL: http://localhost:3001/api
   Widget Script URL: http://localhost:3001/widget-standalone.js
   ```

   **⚠️ בעיה: האתר שלך הוא LIVE, אבל ה-Backend לוקאלי!**
   
   זה לא יעבוד! האתר שלך ב-Internet לא יכול להתחבר ל-`localhost`.
   
   **פתרון:**
   יש לך 2 אופציות:

---

## 🔧 פתרונות לבעיית Local Backend

### אופציה 1: חשיפת Backend המקומי לאינטרנט (זמני - לבדיקות)

השתמשי ב-**ngrok** כדי לחשוף את ה-Backend שלך:

```powershell
# הורדת ngrok
# קישור: https://ngrok.com/download

# התקנה והפעלה
.\ngrok.exe http 3001
```

תקבלי כתובת כמו:
```
https://1234-5678-9abc.ngrok-free.app
```

**אז בהגדרות WordPress:**
```
API URL: https://1234-5678-9abc.ngrok-free.app/api
Widget Script URL: https://1234-5678-9abc.ngrok-free.app/widget-standalone.js
```

**יתרונות:**
- ✅ עובד מיד
- ✅ טוב לבדיקות
- ✅ בחינם (עם מגבלות)

**חסרונות:**
- ❌ זמני (כל פעם כתובת חדשה)
- ❌ איטי יותר
- ❌ לא מתאים לפרודקשן

---

### אופציה 2: העלאת Backend לפרודקשן (מומלץ!)

העלי את ה-Backend לשרת אמיתי:

**אפשרויות:**

#### A. Heroku (חינם לזמן מוגבל)
```bash
# התקנת Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

cd C:\Projects\AgentDesk\backend
heroku create agentdesk-backend
git push heroku main
```

#### B. Railway (חינם ל-500 שעות/חודש)
```bash
# https://railway.app
# 1. צרי חשבון
# 2. הורדת Railway CLI
# 3. העלי Backend
```

#### C. Render (חינם עם מגבלות)
```bash
# https://render.com
# העלאה דרך ממשק Web
```

#### D. VPS שלך (אם יש לך)
```bash
# העלאה לשרת עם nginx/apache
```

**אחרי העלאה:**
```
API URL: https://agentdesk-backend.herokuapp.com/api
Widget Script URL: https://agentdesk-backend.herokuapp.com/widget-standalone.js
```

---

## 🎯 שלב 3: בדיקה

אחרי שהכל מוגדר:

1. **בדיקה בעמוד ניהול:**
   - עברי לעמוד הגדרות התוסף
   - תראי הודעה: "✅ Bot Token תקין"

2. **בדיקה באתר:**
   - עברי לעמוד הבית של האתר: https://tirufai.com
   - התנתקי מהניהול (או פתחי בחלון אנונימי)
   - אמורה לראות בועת צ'אט בפינה

3. **בדיקת הצ'אט:**
   - לחצי על הבועה
   - חלון הצ'אט נפתח
   - כתבי הודעה
   - קבלי תשובה מהבוט

4. **בדיקת Console (לדיבוג):**
   - פתחי DevTools (F12)
   - עברי ל-Console
   - בדקי שאין שגיאות אדומות

---

## ✅ רשימת ווידוא

לפני ההעלאה:
- [x] קובץ ZIP נוצר: `agentdesk-chatbot.zip`
- [x] Backend רץ: `http://localhost:3001`
- [x] Widget נגיש: `http://localhost:3001/widget-standalone.js`
- [ ] יש גישה לפאנל WordPress: `https://tirufai.com/wp-admin`
- [ ] יש Bot Token תקין

אחרי ההעלאה:
- [ ] התוסף הותקן בלי שגיאות
- [ ] התוסף מופעל (ירוק)
- [ ] הגדרות נשמרו
- [ ] Widget מופיע באתר
- [ ] צ'אט עובד

---

## 🐛 פתרון בעיות

### שגיאה: "Installation failed"
- **בדקי:** גרסת PHP (צריך 7.4+)
- **בדקי:** הרשאות תיקייה (775)
- **פתרון:** נסי העלאה דרך FTP

### שגיאה: "Widget not loading"
- **בדקי:** האם Backend רץ?
- **בדקי:** האם יש CORS errors בקונסול?
- **פתרון:** השתמשי ב-ngrok או העלי Backend לפרודקשן

### שגיאה: "Bot Token invalid"
- **בדקי:** הטוקן נכון?
- **בדקי:** Backend מגיב ל: `/api/bots/config/YOUR_TOKEN`
- **פתרון:** קבלי טוקן חדש מהדאשבורד

### Widget לא נראה באתר
- **בדקי:** אתה מחובר לניהול? (התנתק!)
- **בדקי:** Console בדפדפן (F12)
- **בדקי:** Backend URLs נכונים בהגדרות

---

## 📊 מה קורה אחרי ההעלאה?

```
גולש מבקר באתר שלך (tirufai.com)
        ↓
WordPress טוען את העמוד
        ↓
התוסף מוסיף את קוד הווידג'ט
        ↓
הווידג'ט מתחבר ל-Backend שלך
        ↓
גולש רואה בועת צ'אט
        ↓
גולש לוחץ ומתחיל לשוחח
        ↓
הודעות נשלחות ל-Backend
        ↓
הבוט מגיב
        ↓
😊 הצלחה!
```

---

## 🎯 המלצה שלי:

**לבדיקה מהירה (עכשיו):**
1. העלי התוסף ל-WordPress ✅
2. השתמשי ב-**ngrok** כדי לחשוף את ה-Backend ⚡
3. בדקי שהכל עובד 🧪
4. אחרי זה תעלי Backend לפרודקשן 🚀

**רוצה שאעזור לך עם ngrok?** 
או להעלות את ה-Backend לפרודקשן? 

**ספרי לי מה את רוצה לעשות!** 😊

---

## 📞 צריכה עזרה?

אני כאן! 💬

תגידי לי:
- איפה את תקועה? 
- איזה שגיאות את רואה?
- מה עובד ומה לא?

נפתור ביחד! 💪

