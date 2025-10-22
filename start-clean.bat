@echo off
echo ========================================
echo   AgentDesk - Clean Start Script
echo ========================================
echo.

echo [1/5] Killing all Node.js processes...
taskkill /IM node.exe /F 2>nul
timeout /t 2 >nul

echo.
echo [2/5] Verifying Redis is running...
docker ps | findstr agentdesk-redis >nul
if errorlevel 1 (
    echo Redis not running. Starting Redis...
    docker-compose up -d redis
    timeout /t 3 >nul
) else (
    echo Redis is already running!
)

echo.
echo [3/5] Starting Backend on port 3001...
cd backend
start "AgentDesk Backend" cmd /k "npm run dev"
cd ..
timeout /t 15 >nul

echo.
echo [4/5] Starting Frontend on port 3000...
cd frontend
start "AgentDesk Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [5/5] Done!
echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds then open:
echo http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop
echo ========================================
pause

