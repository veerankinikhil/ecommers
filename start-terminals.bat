@echo off
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;%PATH%"
title NovaKart Multi-Vendor Platform Terminals Launcher
echo =========================================================================
echo   Launching NovaKart Multi-Vendor Services into Dedicated Terminals
echo =========================================================================

echo 1. Starting Backend API Engine on Port 5050...
start "Backend API Engine (Port 5050)" cmd /k "title Backend API Engine (Port 5050) && cd /d "%~dp0backend" && npm start"
timeout /t 3 /nobreak >nul

echo 2. Starting Customer Storefront on Port 3000...
start "Customer Storefront (Port 3000)" cmd /k "title Customer Storefront (Port 3000) && cd /d "%~dp0customer-frontend" && npm run dev"

echo 3. Starting Seller Business Portal on Port 3001...
start "Seller Portal (Port 3001)" cmd /k "title Seller Portal (Port 3001) && cd /d "%~dp0seller-frontend" && npm run dev"

echo 4. Starting Delivery Agent Radar on Port 3002...
start "Delivery Agent Radar (Port 3002)" cmd /k "title Delivery Agent Radar (Port 3002) && cd /d "%~dp0delivery-frontend" && npm run dev"

echo 5. Starting Admin Control Center on Port 3003...
start "Admin Control Center (Port 3003)" cmd /k "title Admin Control Center (Port 3003) && cd /d "%~dp0admin-frontend" && npm run dev"

echo 6. Starting Warehouse Hub Logistics on Port 3004...
start "Warehouse Hub Logistics (Port 3004)" cmd /k "title Warehouse Hub Logistics (Port 3004) && cd /d "%~dp0warehouse-frontend" && npm run dev"

echo.
echo =========================================================================
echo   All 6 Terminal Windows Have Been Launched!
echo   1. Customer Web Store:       http://localhost:3000
echo   2. Seller Business Portal:   http://localhost:3001
echo   3. Delivery Agent Radar:     http://localhost:3002
echo   4. Admin Master Control:     http://localhost:3003
echo   5. Warehouse Hub Logistics:  http://localhost:3004
echo   6. Backend API Engine:       http://localhost:5050
echo =========================================================================
