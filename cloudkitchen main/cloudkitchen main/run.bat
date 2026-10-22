@echo off
setlocal enabledelayedexpansion

:: Ensure we are in the script's directory
cd /d "%~dp0"

title CloudKitchen Pro - Auto Launcher
color 0B

echo =====================================================
echo    CloudKitchen Pro - Intelligent Auto-Launcher
echo =====================================================
echo.

:: --- 1. Port Management (Auto-Existing Check) ---
echo [*] Checking if Port 5000 is already in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo [!] Port 5000 is occupied by Process ID: %%a
    echo [*] Automatically clearing existing process to allow restart...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 >nul
)
echo [OK] Port 5000 is clear.
echo.

:: --- 2. Python Detection ---
echo [1/4] Detecting Python installation...
set "PYTHON_EXE="

:: Check 'python'
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_EXE=python"
) else (
    :: Check 'python3'
    python3 --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXE=python3"
    ) else (
        :: Check 'py' (Windows Launcher)
        py --version >nul 2>&1
        if !errorlevel! equ 0 (
            set "PYTHON_EXE=py"
        )
    )
)

if not defined PYTHON_EXE (
    echo [ERROR] Python not found.
    echo Please install Python 3.8+ from https://www.python.org/
    echo Critical: Ensure "Add Python to PATH" is checked during install.
    pause
    exit /b 1
)
echo [OK] Using: !PYTHON_EXE!
echo.

:: --- 3. Dependency Check ---
echo [2/4] Verifying/Installing requirements...
echo        Note: Installing ML libraries (scikit-learn, pandas) may take 1-2 minutes.
!PYTHON_EXE! -m pip install -r requirements.txt --quiet
if !errorlevel! neq 0 (
    echo [WARN] Standard installation failed. Trying individual install...
    !PYTHON_EXE! -m pip install flask flask-sqlalchemy flask-bcrypt flask-login flask-socketio eventlet scikit-learn pandas reportlab --quiet
)
echo [OK] Dependencies ready.
echo.

:: --- 4. Database Check ---
echo [3/4] Verifying database...
if exist "instance\cloudkitchen.db" (
    echo [OK] Existing database found.
) else (
    echo [*] No database found. A fresh one will be created.
)
echo.

:: --- 5. Execution ---
echo [4/4] Launching CloudKitchen Pro Server...
echo.
echo -----------------------------------------------------
echo  URL: http://localhost:5000
echo  Credentials: See README.md or use admin@cloudkitchen.com / Admin@123
echo -----------------------------------------------------
echo.

:: Launch browser in background
start "" /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5000"

:: Start App
!PYTHON_EXE! app.py

if !errorlevel! neq 0 (
    echo.
    echo [CRITICAL ERROR] Server failed to start.
    echo Please check if you have another app using Port 5000.
    echo Or try running: !PYTHON_EXE! app.py
    pause
)

pause
