@echo off
TITLE VoteSecure Pro Runner
COLOR 0B

:: Change to the directory where the .bat file is
cd /d "%~dp0"

echo ==========================================
echo    VOTESECURE PRO - CLOUD EDITION
echo ==========================================
echo.
echo [1/3] Using MongoDB Atlas (Cloud Database)
echo.

:: Check for Backend Dependencies
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend && call npm install && cd ..
)

:: Check for Frontend Dependencies
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

:: Option to Seed Database
echo.
echo ==========================================
echo IMPORTANT: Since you are using a new Cloud DB,
echo you MUST seed it once to create the login accounts.
echo ==========================================
set /p SEED="Do you want to seed the database now? (y/n): "
if /i "%SEED%"=="y" (
    echo [INFO] Seeding Cloud Database...
    cd backend
    call npm run seed
    cd ..
)

echo.
echo [2/3] Starting Backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo    All systems GO!
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:3000
echo ==========================================
echo.
pause
