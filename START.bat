@echo off
REM Watu County Election System - Startup Script

echo.
echo ========================================
echo   Watu County Election System
echo   Startup Script v1.0
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org
    pause
    exit /b 1
)

echo [OK] Python is installed

REM Check if in correct directory
if not exist "app1.py" (
    echo ERROR: app1.py not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo [OK] Project directory is correct

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed

REM Start the application
echo.
echo ========================================
echo   Starting Election System...
echo ========================================
echo.
echo Access the system at:
echo   - Voting Portal: http://localhost:5000/
echo   - Admin Panel:   http://localhost:5000/admin
echo   - Admin Password: KrIstii02$$
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app1.py

pause
