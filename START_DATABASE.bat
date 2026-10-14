@echo off
TITLE VoteSecure Pro - Database Starter
COLOR 0E

echo ==========================================
echo    CHECKING FOR MONGODB SERVICE
echo ==========================================
echo.

:: 1. Check for Local Windows Service
sc query MongoDB > nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] MongoDB Service found. Attempting to start...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo [OK] MongoDB Service started successfully.
    ) else (
        echo [WARN] Could not start service. It may already be running or requires Admin rights.
        echo Try right-clicking this file and "Run as Administrator".
    )
    goto end
)

:: 2. Check for Docker as fallback
echo [INFO] MongoDB Windows Service not found. Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting MongoDB container via Docker...
    docker-compose up -d mongodb
    goto end
)

echo.
echo ==========================================
echo [ERROR] NO DATABASE SYSTEM FOUND!
echo ==========================================
echo.
echo You need MongoDB to run this project.
echo.
echo 1. DOWNLOAD: https://www.mongodb.com/try/download/community
echo 2. INSTALL: Choose "Complete" and "Install as a Service".
echo 3. RE-RUN: This script after installation.
echo.

:end
pause
