@echo off
echo 🚀 Starting Amazon Intel Platform...

start "Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 3

start "Extension" cmd /k "cd extension && npm run dev"

timeout /t 3

start "Dashboard" cmd /k "cd dashboard && npm start"

echo ✅ All services starting!
echo Backend:   http://localhost:8000
echo Dashboard: http://localhost:3000
echo Docs:      http://localhost:8000/docs