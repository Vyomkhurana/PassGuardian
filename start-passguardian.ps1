# PassGuardian Startup Script
# This script starts all PassGuardian services

Write-Host "Starting PassGuardian Services..." -ForegroundColor Cyan

# Configuration
$rootDir = "C:\Users\user\OneDrive\Desktop\PassGuardian\PassGuardian"
$pythonPort = 8001
$nodePort = 5000

# Change to root directory
Set-Location $rootDir
Write-Host "Working directory: $rootDir" -ForegroundColor Gray

# 1. Start Python FastAPI Service
Write-Host "Starting Python FastAPI service..." -ForegroundColor Green
$pythonCmd = "cd `"$rootDir\python-service`"; python -m uvicorn app:app --host 127.0.0.1 --port $pythonPort"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonCmd
Write-Host "Python service started on port $pythonPort" -ForegroundColor Green

# Give Python service time to start
Start-Sleep -Seconds 3

# 2. Start Node.js Backend
Write-Host "Starting Node.js backend..." -ForegroundColor Green
$nodeCmd = "cd `"$rootDir\backend`"; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $nodeCmd
Write-Host "Node.js backend started on port $nodePort" -ForegroundColor Green

# Give Node.js time to start
Start-Sleep -Seconds 3

# 3. Open browser to frontend
Write-Host "Opening PassGuardian in browser..." -ForegroundColor Green
Start-Process "http://localhost:5000"

Write-Host "All PassGuardian services are now running!" -ForegroundColor Cyan
Write-Host "   Python service: http://localhost:$pythonPort" -ForegroundColor Gray
Write-Host "   Node.js backend: http://localhost:$nodePort" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:$nodePort" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all services, close the PowerShell windows" -ForegroundColor Yellow