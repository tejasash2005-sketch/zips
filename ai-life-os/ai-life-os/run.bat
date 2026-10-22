@echo off
title AI Life OS - Production Launcher
cls

echo ===================================================
echo   AI Life OS - Production Application Launcher
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking Project Directories...
set BACKEND_DIR=%~dp0ai-life-os-backend
set FRONTEND_DIR=%~dp0ai-life-os-frontend

echo Backend Directory:  %BACKEND_DIR%
echo Frontend Directory: %FRONTEND_DIR%
echo.

echo [2/3] Starting Backend Server (Express + Groq AI + MongoDB)...
start "AI Life OS - Backend Server (Port 5000)" cmd /k "cd /d "%BACKEND_DIR%" && npm start"

timeout /t 3 >nul

echo [3/3] Starting Frontend Client (React Website and App)...
start "AI Life OS - Frontend Client (Port 3000)" cmd /k "cd /d "%FRONTEND_DIR%" && npm start"

echo.
echo ===================================================
echo   AI Life OS is starting up!
echo ===================================================
echo   Frontend Website and App: http://localhost:3000
echo   Backend API and Health:   http://localhost:5000/health
echo ===================================================
echo.
pause
