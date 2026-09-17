# NovaKart Multi-Vendor Platform PowerShell Launcher
$env:PATH = "C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;$env:PATH"
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  🚀 Launching NovaKart Multi-Vendor Platform (MERN Stack)" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "1. Starting Backend API Server (Port 5050)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Backend API Engine (Port 5050)'; cd '$root\backend'; npm start"

Start-Sleep -Seconds 2

Write-Host "2. Starting Customer Website (Port 3000)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Customer Storefront (Port 3000)'; cd '$root\customer-frontend'; npm run dev"

Write-Host "3. Starting Seller Website (Port 3001)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Seller Business Portal (Port 3001)'; cd '$root\seller-frontend'; npm run dev"

Write-Host "4. Starting Delivery Agent Website (Port 3002)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Delivery Agent Radar (Port 3002)'; cd '$root\delivery-frontend'; npm run dev"

Write-Host "5. Starting Admin Control Center (Port 3003)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Admin Master Control (Port 3003)'; cd '$root\admin-frontend'; npm run dev"

Write-Host "6. Starting Warehouse Hub Logistics (Port 3004)..." -ForegroundColor Yellow
Start-Process "$PSHOME\powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Warehouse Hub Logistics (Port 3004)'; cd '$root\warehouse-frontend'; npm run dev"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  ✅ All 5 Frontend Portals and Unified Backend are running!" -ForegroundColor Green
Write-Host "  - Customer Portal:        http://localhost:3000" -ForegroundColor White
Write-Host "  - Seller Portal:          http://localhost:3001" -ForegroundColor White
Write-Host "  - Delivery Agent Portal:  http://localhost:3002" -ForegroundColor White
Write-Host "  - Admin Portal:           http://localhost:3003" -ForegroundColor White
Write-Host "  - Warehouse Hub:          http://localhost:3004" -ForegroundColor White
Write-Host "  - Unified Backend API:    http://localhost:5050" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
