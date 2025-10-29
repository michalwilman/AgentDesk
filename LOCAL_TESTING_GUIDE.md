# 🧪 מדריך בדיקה לוקאלית - AgentDesk

## ✅ סטטוס כל השרתים:

| שירות | URL | סטטוס |
|-------|-----|-------|
| **Backend** | `http://localhost:3001/api` | ✅ רץ |
| **Frontend** | `http://localhost:3000` | ✅ רץ |
| **Widget** | `http://localhost:3001/widget-standalone.js` | ✅ זמין |

---

## 🎯 מה לבדוק לפני התקנה ב-WordPress

### בדיקה 1: Frontend Dashboard ✅

**פתחי בדפדפן:**
```
http://localhost:3000
```

**מה אמורה לראות:**
- ✅ עמוד התחברות / דאשבורד
- ✅ אפשרות ליצור בוט חדש
- ✅ רשימת בוטים (אם יש)

**בדיקה:**
1. נסי להתחבר עם המשתמש שלך
2. אם אין משתמש - צרי חשבון חדש
3. עברי לעמוד Bots

---

### בדיקה 2: יצירת בוט ✅

**בדאשבורד (localhost:3000):**

1. **לחצי על "New Bot"** או "Create Bot"
2. **מלאי פרטים:**
   - שם: "Test Bot"
   - תיאור: "בוט לבדיקות"
   - הוראות: "אתה עוזר וידידותי"
3. **שמרי**
4. **העתיקי את ה-Bot Token** - זה חשוב!

**Bot Token נראה כך:**
```
bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6
```

---

### בדיקה 3: Backend API ✅

**בדיקה ידנית (PowerShell):**

```powershell
# 1. בדיקת API Health
Invoke-WebRequest -Uri "http://localhost:3001/api"
# צריך להחזיר: 200 OK

# 2. בדיקת Bot Config (החליפי YOUR_BOT_TOKEN בטוקן שלך!)
Invoke-WebRequest -Uri "http://localhost:3001/api/bots/config/YOUR_BOT_TOKEN"
# צריך להחזיר: 200 OK + פרטי הבוט

# 3. בדיקת Widget
Invoke-WebRequest -Uri "http://localhost:3001/widget-standalone.js"
# צריך להחזיר: 200 OK + קוד JavaScript
```

---

### בדיקה 4: Widget Standalone ✅

**בדיקת Widget מקומית:**

צרי קובץ HTML זמני לבדיקה:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>AgentDesk Widget Test</h1>
    
    <script>
        window.agentdeskConfig = {
            botToken: 'YOUR_BOT_TOKEN', // החליפי בטוקן שלך!
            apiUrl: 'http://localhost:3001/api',
            position: 'bottom-right'
        };
    </script>
    <script src="http://localhost:3001/widget-standalone.js" async defer></script>
</body>
</html>
```

**איך לבדוק:**
1. שמרי את הקובץ: `C:\Projects\AgentDesk\test-widget.html`
2. פתחי בדפדפן
3. **אמורה לראות:** בועת צ'אט בפינה!
4. לחצי עליה
5. כתבי הודעה
6. קבלי תשובה מהבוט

---

### בדיקה 5: Chat API ✅

**בדיקת Chat (PowerShell):**

```powershell
# החליפי YOUR_BOT_TOKEN!
$botToken = "YOUR_BOT_TOKEN"

$body = @{
    message = "שלום"
    sessionId = "test-session-123"
    source = "web"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/chat/message" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "X-Bot-Token" = $botToken
    } `
    -Body $body

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

**תוצאה צפויה:**
```json
{
  "response": "שלום! איך אני יכול לעזור לך?",
  "sessionId": "test-session-123"
}
```

---

## ✅ רשימת ווידוא לפני WordPress:

אחרי כל הבדיקות, תסמני:

- [ ] Backend רץ ומגיב (200 OK)
- [ ] Frontend רץ ומציג דאשבורד
- [ ] יצרת בוט ויש לך Bot Token
- [ ] Bot Config API עובד (מחזיר פרטי בוט)
- [ ] Widget Script נגיש (19KB JavaScript)
- [ ] Chat API עובד (מחזיר תשובה)
- [ ] Widget מקומי עובד (בדקת בHTML)

**אם הכל מסומן ✅ → מוכן ל-WordPress!**

---

## 🎯 מה צפוי לקרות ב-WordPress:

אחרי שהכל עובד לוקאלית:

### שלב 1: התקנת תוסף
- מחקי ZIP ישן
- העלי ZIP חדש
- הפעילי

### שלב 2: הגדרות
- מלאי Bot Token (מהבדיקה #2)
- סמני "Enable Chatbot"
- בחרי Position
- שמרי

### שלב 3: הבעיה - Backend URL

**כאן הבעיה:** האתר שלך (`tirufai.com`) לא יכול להגיע ל-`localhost:3001`!

**הפתרון:**

**אופציה A: ngrok (מהיר - לבדיקות)**
```powershell
# הורידי ngrok
# הריצי:
ngrok http 3001

# תקבלי: https://1234-abcd.ngrok-free.app
# עדכני בקוד התוסף
```

**אופציה B: Railway (קבוע - לפרודקשן)**
- העלי Backend ל-Railway.app
- קבלי URL קבוע
- עדכני בקוד התוסף

---

## 📝 קובץ HTML לבדיקה מהירה:

יצרתי לך קובץ לבדיקה:

```powershell
# צרי את הקובץ:
$html = @"
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>בדיקת Widget AgentDesk</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .status {
            padding: 20px;
            margin: 20px 0;
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            border-radius: 4px;
        }
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 בדיקת Widget מקומית</h1>
        
        <div class="status">
            <strong>✅ סטטוס:</strong> Widget אמור להיטען בפינה הימנית למטה
        </div>
        
        <div class="instructions">
            <h3>📋 הוראות:</h3>
            <ol>
                <li>בדקי שיש בועת צ'אט בפינה</li>
                <li>לחצי עליה</li>
                <li>כתבי הודעה</li>
                <li>וודאי שקיבלת תשובה</li>
            </ol>
        </div>
        
        <h2>📊 מידע טכני:</h2>
        <ul>
            <li><strong>Backend:</strong> http://localhost:3001/api</li>
            <li><strong>Widget:</strong> http://localhost:3001/widget-standalone.js</li>
            <li><strong>Bot Token:</strong> <span id="token-display">טען...</span></li>
        </ul>
    </div>
    
    <script>
        // הגדרות Widget
        window.agentdeskConfig = {
            botToken: 'bot_test123',  // ⚠️ החליפי בטוקן האמיתי שלך!
            apiUrl: 'http://localhost:3001/api',
            position: 'bottom-right',
            metadata: {
                source: 'local-test',
                pageTitle: 'Local Widget Test'
            }
        };
        
        // הצגת הטוקן בעמוד
        document.getElementById('token-display').textContent = window.agentdeskConfig.botToken;
    </script>
    
    <!-- טעינת Widget -->
    <script src="http://localhost:3001/widget-standalone.js" async defer></script>
</body>
</html>
"@

$html | Out-File -FilePath "C:\Projects\AgentDesk\test-widget.html" -Encoding UTF8

Write-Host "`n✅ קובץ נוצר: C:\Projects\AgentDesk\test-widget.html" -ForegroundColor Green
Write-Host "📂 פתחי אותו בדפדפן כדי לבדוק את הWidget!" -ForegroundColor Cyan
```

---

## 🎯 סיכום התהליך:

```
1. Backend רץ          ✅ (port 3001)
   ↓
2. Frontend רץ         ✅ (port 3000)
   ↓
3. יצירת בוט           ⏳ (צריכה לעשות)
   ↓
4. קבלת Bot Token      ⏳ (צריכה לעשות)
   ↓
5. בדיקת Widget מקומי  ⏳ (test-widget.html)
   ↓
6. הכל עובד?           
   ↓
7. התקנה ב-WordPress!  ⏳ (הצעד הבא)
```

---

## 📞 מה עכשיו?

**אמרי לי:**

1. **האם Frontend פתוח?** `http://localhost:3000`
2. **האם יש לך משתמש?** או צריך ליצור?
3. **האם יש בוט?** או צריך ליצור?
4. **רוצה לבדוק Widget מקומי קודם?**

**אני כאן לעזור בכל שלב!** 😊

---

**Status:** 🟢 All Services Running!  
**Next:** Create Bot → Get Token → Test Widget → Install WordPress Plugin

