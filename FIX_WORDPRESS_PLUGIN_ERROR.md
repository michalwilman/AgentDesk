# 🔧 תיקון שגיאת התוסף WordPress

## 🎯 הבעיה:
"לא ניתן להפעיל תוסף זה. יש בו שגיאה חמורה."

זו שגיאת PHP Fatal Error - צריך לראות מה השגיאה המדויקת.

---

## 📋 שלב 1: הפעלת Debug Mode ב-WordPress

### איך לעשות זאת:

1. **חברי לאתר דרך FTP או cPanel File Manager**

2. **ערכי את הקובץ `wp-config.php`** (בתיקייה הראשית של WordPress)

3. **חפשי את השורות:**
   ```php
   define('WP_DEBUG', false);
   ```

4. **החליפי ב:**
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   @ini_set('display_errors', 0);
   ```

5. **שמרי את הקובץ**

---

## 📝 שלב 2: נסי להפעיל את התוסף שוב

1. חזרי לWordPress Admin → תוספים
2. לחצי שוב על **Activate** ליד AgentDesk
3. תקבלי שוב שגיאה (זה צפוי!)

---

## 🔍 שלב 3: קריאת לוג השגיאות

### איפה הלוג:

הלוג נמצא ב: `wp-content/debug.log`

### איך לקרוא:

**דרך cPanel:**
1. File Manager → `public_html/wp-content/`
2. מצאי `debug.log`
3. לחצי ימני → View/Edit
4. העתיקי את **5 השורות האחרונות**

**דרך FTP:**
1. הורידי את `wp-content/debug.log`
2. פתחי בNotepad
3. גללי לסוף
4. העתיקי את השגיאה האחרונה

---

## 🎯 שגיאות נפוצות ופתרונות:

### שגיאה 1: "Class not found"
```
Fatal error: Class 'AgentDesk_Admin' not found
```
**פתרון:** קובץ class חסר או נתיב שגוי

### שגיאה 2: "Syntax error"
```
Parse error: syntax error, unexpected 'something' in agentdesk-chatbot.php
```
**פתרון:** שגיאת תחביר ב-PHP

### שגיאה 3: "Cannot redeclare function"
```
Fatal error: Cannot redeclare function_name()
```
**פתרון:** פונקציה מוגדרת פעמיים

### שגיאה 4: "File not found"
```
Warning: require_once(...): failed to open stream
```
**פתרון:** נתיב לקובץ שגוי

---

## 🚨 בינתיים - פתרון זמני:

אם את צריכה שהאתר יעבוד **עכשיו**, עצרי את Debug Mode:

```php
define('WP_DEBUG', false);
```

ומחקי את התוסף זמנית.

---

## 📞 העתיקי לי את השגיאה!

אחרי שתפעילי Debug ותנסי להפעיל שוב, **העתיקי לי את השגיאה מה-debug.log** ואני אתקן את הקוד!

---

**Status:** 🔍 Waiting for error log  
**Next:** Fix the exact PHP error

