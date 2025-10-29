@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   בדיקת מערכת AgentDesk
echo ========================================
echo.

echo [1/5] בודק אם Backend רץ...
curl -s http://localhost:3001/api >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend רץ
) else (
    echo ❌ Backend לא רץ! הפעל: npm run start:dev
    goto :end
)

echo.
echo [2/5] בודק Widget Script...
curl -s -o nul -w "%%{http_code}" http://localhost:3001/widget-standalone.js > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt
if "%STATUS%"=="200" (
    echo ✅ Widget Script זמין
) else (
    echo ❌ Widget Script לא זמין (Status: %STATUS%^)
)

echo.
echo [3/5] בודק Bot Configuration...
curl -s -o nul -w "%%{http_code}" http://localhost:3001/api/bots/config/bot_234dad3b62cd057fd9c4a88def5aea257672ccb3fa532be52df2d5e5078489f6 > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt
if "%STATUS%"=="200" (
    echo ✅ Bot Config זמין
) else (
    echo ❌ Bot Config לא זמין (Status: %STATUS%^)
)

echo.
echo [4/5] בודק אם קובץ Widget קיים...
if exist "backend\dist\widget-standalone.js" (
    echo ✅ Widget קיים ב-dist
) else (
    echo ❌ Widget לא קיים ב-dist!
)

echo.
echo [5/5] בודק Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend רץ
) else (
    echo ⚠️  Frontend לא רץ (אופציונלי)
)

echo.
echo ========================================
echo   סיימתי בדיקה!
echo ========================================
echo.
echo עכשיו פתחי: test-widget.html
echo.

:end
pause

