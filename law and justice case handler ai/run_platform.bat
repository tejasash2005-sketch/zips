@echo off
echo Starting Legal Platform...

:: Start Backend
echo Starting Django Backend...
start cmd /k "cd backend && python manage.py runserver"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend
echo Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Login: admin / admin123
echo ==========================================
echo.
pause
