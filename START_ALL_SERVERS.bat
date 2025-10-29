@echo off
echo.
echo ========================================
echo   Starting AgentDesk Servers
echo ========================================
echo.

REM Start Backend
start "AgentDesk Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 5 /nobreak >nul

echo Backend starting on http://localhost:3001
echo.

REM Start Frontend
start "AgentDesk Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo   All servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

