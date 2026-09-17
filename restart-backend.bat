@echo off
title NovaKart Backend API Server
color 0B

echo =========================================================================
echo   ⚡ RESTARTING NOVAKART BACKEND API SERVER (PORT 5050)
echo =========================================================================
echo.

:: 1. Auto-Detect Node.js in common paths if not in PATH
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    )
)

:: 2. Terminate any stale process currently holding Port 5050
echo [1/2] Freeing Port 5050 from old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050 ^| findstr LISTENING') do (
    echo Stopping stale process PID %%a...
    taskkill /F /PID %%a >nul 2>nul
)

:: 3. Start Backend Server with fresh code
echo [2/2] Launching Backend Server...
cd /d "%~dp0backend"
echo.
echo =========================================================================
echo   🚀 Backend API is starting now...
echo =========================================================================
node server.js

pause
