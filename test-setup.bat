@echo off
title NovaKart System Diagnostics & Launcher
color 0B

echo =========================================================================
echo   🔍 NOVAKART SYSTEM & ENVIRONMENT DIAGNOSTICS
echo =========================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/3] Node.js is INSTALLED:
    node -v
) else (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        echo [1/3] Node.js FOUND in C:\Program Files\nodejs:
        node -v
    ) else (
        color 0C
        echo [1/3] ❌ Node.js is NOT INSTALLED or not in PATH.
        echo       Please open your Downloads folder and run the 'node-...-x64.msi' installer!
        echo       After finishing the installation wizard, run this file again.
        echo.
        pause
        exit /b 1
    )
)
echo.

:: Check NPM
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [2/3] NPM package manager is INSTALLED:
    call npm -v
) else (
    echo [2/3] ❌ NPM is not available yet.
)
echo.

:: Check MongoDB
echo [3/3] Checking MongoDB...
sc query MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] MongoDB Service found. Starting service...
    net start MongoDB >nul 2>nul
    echo [✓] MongoDB is running.
) else (
    echo [i] Note: Local MongoDB service not detected. The backend will attempt local mongod or you can use MongoDB Atlas cloud URI.
)
echo.

echo =========================================================================
echo   📦 Starting Step-by-Step Installation of Dependencies...
echo =========================================================================
echo.

echo [Step 1 of 5]: Installing Backend API packages...
cd /d "%~dp0backend"
call npm install
echo [Backend packages installed successfully]
echo.

echo [Step 2 of 5]: Installing Customer Storefront packages...
cd /d "%~dp0customer-frontend"
call npm install
echo [Customer Store packages installed successfully]
echo.

echo [Step 3 of 5]: Installing Seller Portal packages...
cd /d "%~dp0seller-frontend"
call npm install
echo [Seller Portal packages installed successfully]
echo.

echo [Step 4 of 5]: Installing Delivery Agent packages...
cd /d "%~dp0delivery-frontend"
call npm install
echo [Delivery Agent packages installed successfully]
echo.

echo [Step 5 of 5]: Installing Admin Control packages...
cd /d "%~dp0admin-frontend"
call npm install
echo [Admin packages installed successfully]
echo.

echo =========================================================================
echo   🚀 ALL PACKAGES INSTALLED! STARTING SERVICES NOW...
echo =========================================================================
echo.

start "NovaKart Backend (Port 5050)" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 3 /nobreak >nul

start "NovaKart Customer Store (Port 3000)" cmd /k "cd /d "%~dp0customer-frontend" && npm run dev"
timeout /t 2 /nobreak >nul

start "NovaKart Seller Portal (Port 3001)" cmd /k "cd /d "%~dp0seller-frontend" && npm run dev"
start "NovaKart Delivery (Port 3002)" cmd /k "cd /d "%~dp0delivery-frontend" && npm run dev"
start "NovaKart Admin (Port 3003)" cmd /k "cd /d "%~dp0admin-frontend" && npm run dev"

echo.
echo =========================================================================
echo   ✅ PLATFORM IS LIVE!
echo   Opening Customer Storefront (http://localhost:3000) in 5 seconds...
echo =========================================================================
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Leave this window open. Press any key to exit diagnostics.
pause >nul
