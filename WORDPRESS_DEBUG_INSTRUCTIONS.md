# 🔍 מדריך דיבוג שגיאת WordPress Plugin

## 🎯 השגיאה שקיבלת:
"לא ניתן להפעיל תוסף זה. יש בו שגיאה חמורה."

זו שגיאת PHP מצד השרת. F12 לא מראה כלום כי זו שגיאת server-side.

---

## 📋 שלב 1: בדיקה מהירה - גרסת PHP

### איך לבדוק:

#### דרך A: cPanel
1. היכנסי ל-cPanel
2. חפשי "PHP Version" או "Select PHP Version"
3. בדקי מה הגרסה

#### דרך B: WordPress
1. היכנסי ל: **כלים → בריאות האתר** (Tools → Site Health)
2| עברי לטאב "מידע" (Info)
3. פתחי את "שרת" (Server)
4. תראי "PHP Version"

**נדרש:** PHP 7.4 ומעלה (התוסף שלנו דורש זאת)

---

## 📋 שלב 2: הפעלת Debug Mode

### מה זה עושה:
מציג את השגיאות המדויקות במקום הודעה כללית.

### איך לעשות:

#### 1. חיברי לאתר דרך FTP או cPanel File Manager

#### 2. מצאי את הקובץ `wp-config.php`
נמצא בתיקייה הראשית של WordPress (לא ב-wp-content!)

#### 3. ערכי את הקובץ

**חפשי את השורה:**
```php
define('WP_DEBUG', false);
```

**החליפי ב:**
```php
// Enable WordPress debug mode
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
@ini_set('display_errors', 0);
```

#### 4. שמרי את הקובץ

---

## 📋 שלב 3: נסי להפעיל את התוסף שוב

1. חזרי ל-WordPress Admin → תוספים
2. לחצי **Activate** ליד AgentDesk AI Chatbot
3. תקבלי שוב שגיאה (זה צפוי!)

---

## 📋 שלב 4: קריאת קובץ הלוג

### איפה הלוג:
```
wp-content/debug.log
```

### איך לקרוא:

#### דרך cPanel File Manager:
1. File Manager → `public_html/wp-content/`
2. מצאי `debug.log`
3. לחצי ימני → **View** או **Edit**
4. **גללי לסוף הקובץ**
5. **העתיקי את 10 השורות האחרונות**

#### דרך FTP (FileZilla):
1. התחברי לFTP
2. נווטי ל: `public_html/wp-content/`
3. הורידי את `debug.log`
4. פתחי בNotepad
5. גללי לסוף
6. **העתיקי את השגיאה האחרונה**

---

## 🔍 שלב 5: זיהוי הבעיה

### שגיאות נפוצות:

#### שגיאה 1: Class not found
```
Fatal error: Uncaught Error: Class 'AgentDesk_Admin' not found in /path/to/agentdesk-chatbot.php
```

**משמעות:** קובץ class חסר  
**פתרון:** הקובץ ZIP לא הועלה נכון או חסרים קבצים

#### שגיאה 2: Syntax error
```
Parse error: syntax error, unexpected '=>' (T_DOUBLE_ARROW) in agentdesk-chatbot.php on line 31
```

**משמעות:** גרסת PHP נמוכה מדי (< 5.4)  
**פתרון:** שדרגי את PHP ל-7.4 או יותר

#### שגיאה 3: Cannot redeclare
```
Fatal error: Cannot redeclare agentdesk_init()
```

**משמעות:** התוסף מותקן פעמיים או יש conflict  
**פתרון:** מחקי ווודאי שאין שני עותקים

#### שגיאה 4: File not found
```
Warning: require_once(/path/includes/class-agentdesk-admin.php): failed to open stream: No such file or directory
```

**משמעות:** הקבצים לא הועלו למיקום הנכון  
**פתרון:** מחקי והעלי מחדש את ה-ZIP

---

## ✅ שלב 6: תיקון בהתאם לשגיאה

### אם הבעיה: PHP Version

**שדרוג PHP:**

1. **cPanel:**
   - MultiPHP Manager → בחרי את הדומיין → בחרי PHP 7.4 או 8.0

2. **אם אין גישה:**
   - צרי קובץ `.htaccess` בתיקייה הראשית:
     ```
     AddHandler application/x-httpd-php74 .php
     ```

---

### אם הבעיה: חסרים קבצים

**מחיקה והעלאה מחדש:**

1. **מחקי את התוסף הישן:**
   - WordPress Admin → תוספים → AgentDesk → **מחק**

2. **העלי את הZIP החדש:**
   - הורידי את: `C:\Projects\AgentDesk\agentdesk-chatbot.zip` (יצרתי גרסה מתוקנת!)
   - WordPress Admin → תוספים → הוסף חדש → העלה תוסף
   - בחרי ZIP → התקן → הפעל

---

### אם הבעיה: הרשאות

**תקן הרשאות:**

דרך FTP או cPanel File Manager:
- תיקיות: `755`
- קבצים: `644`

```bash
# דרך SSH (אם יש גישה):
cd /path/to/wp-content/plugins/agentdesk-chatbot
chmod 755 .
chmod 644 *.php
chmod 755 includes
chmod 644 includes/*.php
```

---

## 📞 שלב 7: שילחי לי את השגיאה!

אחרי ששמת Debug Mode והרצת שוב את Activate:

1. פתחי את `wp-content/debug.log`
2. גללי לסוף
3. **העתיקי את השגיאה האחרונה** (5-10 שורות)
4. **שלחי לי!**

אני אזהה בדיוק מה הבעיה ואתקן את הקוד!

---

## 🎯 סיכום מהיר:

```
1. בדקי גרסת PHP (צריך 7.4+)         → כלים → בריאות האתר
2. הפעילי Debug Mode                 → ערכי wp-config.php
3. נסי Activate שוב                  → תוספים → Activate
4. קראי את debug.log                 → wp-content/debug.log
5. שלחי לי את השגיאה!                → אני אתקן!
```

---

## 💡 טיפים נוספים:

### אם אין debug.log:
לפעמים הקובץ לא נוצר אוטומטית. אז:

#### דרך PHP errors:
ערכי `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', true); // הצג שגיאות על המסך
```

**אזהרה:** אל תעזבי את זה פעיל בפרודקשן! רק לדיבוג.

---

## 🚨 אם שום דבר לא עובד:

### פתרון חלופי - התקנה ידנית:

1. **חלצי את ה-ZIP במחשב שלך:**
   ```
   C:\Projects\AgentDesk\agentdesk-chatbot\
   ```

2. **העלי את התיקייה דרך FTP:**
   - העלי את **כל התיקייה** `agentdesk-chatbot`
   - ל: `wp-content/plugins/`
   - אמור להיות: `wp-content/plugins/agentdesk-chatbot/agentdesk-chatbot.php`

3. **הפעילי:**
   - WordPress Admin → תוספים
   - מצאי AgentDesk AI Chatbot
   - לחצי Activate

---

**אני מחכה לשגיאה שלך!** 📋  
**העתיקי את debug.log ואני אפתור את זה מיד!** 💪

**Status:** 🔍 Waiting for debug.log  
**Next:** Fix the exact error

