@echo off
echo.
echo ========================================
echo   Starting AgentDesk Backend
echo ========================================
echo.

cd backend
echo [1/2] Building backend...
call npm run build

echo.
echo [2/2] Starting backend server...
call npm run start:prod

pause

