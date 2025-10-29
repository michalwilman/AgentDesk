@echo off
echo ========================================
echo   Starting Simple HTTP Server
echo ========================================
echo.
echo This will serve test-widget-FINAL.html on:
echo http://localhost:8080/test-widget-FINAL.html
echo.
echo Press Ctrl+C to stop
echo.
cd /d C:\Projects\AgentDesk
python -m http.server 8080

