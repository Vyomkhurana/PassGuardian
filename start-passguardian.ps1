# PassGuardian Unified Startup Script
# This script starts all PassGuardian services in one command

Write-Host "🔐 Starting PassGuardian - Enterprise Password Manager" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration
$rootDir = Get-Location
$pythonPort = 8001
$nodePort = 5000
$frontendPort = 3000

Write-Host "📁 Working directory: $rootDir" -ForegroundColor Gray
Write-Host ""

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow
if (-not (Test-Port $pythonPort)) {
    Write-Host "❌ Port $pythonPort is already in use. Please close the application using this port." -ForegroundColor Red
    exit 1
}
if (-not (Test-Port $nodePort)) {
    Write-Host "❌ Port $nodePort is already in use. Please close the application using this port." -ForegroundColor Red
    exit 1
}
if (-not (Test-Port $frontendPort)) {
    Write-Host "❌ Port $frontendPort is already in use. Please close the application using this port." -ForegroundColor Red
    exit 1
}
Write-Host "✅ All ports are available" -ForegroundColor Green
Write-Host ""

# 1. Start Python FastAPI Service
Write-Host "🐍 Starting Python FastAPI service..." -ForegroundColor Green
$pythonServicePath = Join-Path $rootDir "python-service"
$pythonCmd = "Set-Location '$pythonServicePath'; python -m uvicorn app:app --host 127.0.0.1 --port $pythonPort --reload"
$pythonProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonCmd -PassThru
Write-Host "   ✅ Python service starting on http://localhost:$pythonPort" -ForegroundColor Green

# Wait for Python service to start
Write-Host "   ⏳ Waiting for Python service to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Start Node.js Backend
Write-Host "🟢 Starting Node.js backend..." -ForegroundColor Green
$backendPath = Join-Path $rootDir "backend"
$nodeCmd = "Set-Location '$backendPath'; node server.js"
$nodeProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $nodeCmd -PassThru
Write-Host "   ✅ Node.js backend starting on http://localhost:$nodePort" -ForegroundColor Green

# Wait for Node.js service to start
Write-Host "   ⏳ Waiting for Node.js backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 3. Start Frontend HTTP Server
Write-Host "🌐 Starting Frontend HTTP server..." -ForegroundColor Green
$frontendPath = Join-Path $rootDir "frontend"
$frontendCmd = "Set-Location '$frontendPath'; python -m http.server $frontendPort"
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -PassThru
Write-Host "   ✅ Frontend server starting on http://localhost:$frontendPort" -ForegroundColor Green

# Wait for frontend to start
Write-Host "   ⏳ Waiting for frontend server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 All PassGuardian services are now running!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "📋 Service URLs:" -ForegroundColor White
Write-Host "   🐍 Python API:    http://localhost:$pythonPort" -ForegroundColor Gray
Write-Host "   🟢 Node.js API:   http://localhost:$nodePort" -ForegroundColor Gray
Write-Host "   🌐 Frontend UI:   http://localhost:$frontendPort" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor White
Write-Host "   🐍 Python API:    http://localhost:$pythonPort/docs" -ForegroundColor Gray
Write-Host ""

# Open frontend in browser
Write-Host "🚀 Opening PassGuardian in your default browser..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:$frontendPort"

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • To stop all services: Close all PowerShell windows or press Ctrl+C in each" -ForegroundColor Gray
Write-Host "   • To view logs: Check the individual PowerShell windows" -ForegroundColor Gray
Write-Host "   • Frontend communicates with Node.js backend on port $nodePort" -ForegroundColor Gray
Write-Host "   • Node.js backend communicates with Python service on port $pythonPort" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 PassGuardian is ready! Secure your passwords with confidence." -ForegroundColor Cyan

# Store process IDs for potential cleanup
Write-Host "Process IDs for manual cleanup if needed:" -ForegroundColor DarkGray
Write-Host "   Python: $($pythonProcess.Id), Node.js: $($nodeProcess.Id), Frontend: $($frontendProcess.Id)" -ForegroundColor DarkGray

# Keep the main script running
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (services will continue running)" -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Check if processes are still running
        if ($pythonProcess.HasExited) {
            Write-Host "⚠️  Python service has stopped unexpectedly" -ForegroundColor Red
        }
        if ($nodeProcess.HasExited) {
            Write-Host "⚠️  Node.js backend has stopped unexpectedly" -ForegroundColor Red
        }
        if ($frontendProcess.HasExited) {
            Write-Host "⚠️  Frontend server has stopped unexpectedly" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host ""
    Write-Host "👋 Startup script stopped. Services are still running in background." -ForegroundColor Yellow
}