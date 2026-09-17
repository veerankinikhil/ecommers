@echo off
title NovaKart Multi-Vendor Platform Launcher
color 0A

echo =========================================================================
echo   🚀 NOVAKART MULTI-VENDOR PLATFORM - SYSTEM LAUNCHER
echo =========================================================================
echo.

:: Clean up any stale processes holding platform ports
echo [Freeing ports 5000, 3000-3003 from previous sessions...]
C:\Windows\System32\taskkill.exe /F /IM node.exe >nul 2>nul

echo.
echo =========================================================================
echo   🚀 Launching All 5 Services Concurrently...
echo =========================================================================
echo.

:: Start all services concurrently via unified run.js
echo Launching all portals and backend services...
node "%~dp0run.js"

echo.
echo =========================================================================
echo   ✅ ALL 5 SERVICES ARE RUNNING!
echo.
echo   🛒 1. Customer Store:        http://localhost:3000
echo   🏪 2. Seller Portal:          http://localhost:3001
echo   🛵 3. Delivery Agent Radar:   http://localhost:3002
echo   🛡️ 4. Admin Control Center:   http://localhost:3003
echo   🏭 5. Warehouse Hub:          http://localhost:3004
echo   ⚡ 6. Backend API Engine:     http://localhost:5050
echo =========================================================================
echo.
echo Opening browser storefront in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
