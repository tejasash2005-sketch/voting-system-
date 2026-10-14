@echo off
TITLE VoteSecure Pro - Docker Runner
COLOR 0E

echo ==========================================
echo    VOTESECURE PRO - DOCKER STARTUP
echo ==========================================
echo.

cd /d %~dp0

:: Check for Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    pause
    exit /b
)

echo [1/1] Building and starting containers...
docker-compose up --build

pause
