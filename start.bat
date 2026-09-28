@echo off
echo ========================================================
echo Starting GeneGuard Multi-Disease Health AI Platform...
echo ========================================================

echo [1/3] Launching Flask Backend API Server on http://localhost:5000...
start "GeneGuard Backend API" cmd /k "cd backend && python app.py"

echo [2/3] Launching Medical Chatbot Knowledge Server on http://localhost:8080...
start "GeneGuard Chatbot Knowledge Core" cmd /k "cd chatbot && python app.py"

echo [3/3] Launching Vite Frontend on http://localhost:5173...
start "GeneGuard Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo All servers started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo Chatbot:  http://localhost:8080
echo ========================================================
pause
