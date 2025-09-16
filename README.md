# 🔐 PassGuardian - Enterprise Password Security Dashboard

## 🚀 Quick Start (VS Code Terminal)

### **One Command to Rule Them All:**
```bash
npm start
```

This starts all services concurrently:
- 🐍 **Python FastAPI** (Port 8001) - Password analysis backend
- 🟢 **Node.js Backend** (Port 5000) - API proxy and middleware  
- 🌐 **Frontend Server** (Port 3000) - Beautiful UI dashboard

### **Available Commands:**
```bash
npm start          # Start all services
npm run dev        # Same as npm start (development mode)
npm run stop       # Stop all services
npm run open       # Open UI in browser
npm run python     # Start only Python service
npm run backend    # Start only Node.js backend
npm run frontend   # Start only frontend server
```

### **VS Code Integration:**
- **Ctrl+Shift+P** → "Tasks: Run Task" → "🚀 Start PassGuardian (All Services)"
- Or use **Ctrl+Shift+B** (default build task)

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend UI** | http://localhost:3000 | Main dashboard interface |
| **Node.js API** | http://localhost:5000 | Backend API endpoints |
| **Python API** | http://localhost:8001 | Password analysis service |
| **API Docs** | http://localhost:8001/docs | FastAPI documentation |

## 🏗️ Architecture

```
Frontend (Port 3000) → Node.js Backend (Port 5000) → Python FastAPI (Port 8001)
```

## 🛠️ Development

- All services auto-reload on file changes
- Logs are color-coded and prefixed for easy identification
- Each service runs in the same terminal with clear separation

## 🔧 Troubleshooting

If ports are in use, stop services with:
```bash
npm run stop
```

Or manually kill processes:
```bash
# Windows
taskkill /f /im python.exe /im node.exe

# Check what's running on ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8001
```

## 📁 Project Structure

```
PassGuardian/
├── frontend/          # React-like dashboard UI
├── backend/           # Node.js Express API
├── python-service/    # FastAPI password analysis
├── .vscode/          # VS Code tasks and settings
└── package.json      # NPM scripts and dependencies
```

## 🎯 Features

- ✅ Enterprise-grade password analysis
- ✅ Beautiful modern UI with animations
- ✅ Real-time security scoring
- ✅ Breach detection integration
- ✅ Professional dashboard design
- ✅ One-command startup

---

**🔐 PassGuardian - Secure your passwords with confidence!**
