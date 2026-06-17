@echo off
cls
echo.
echo ========================================
echo   MEMA SPORTS - QUICK START
echo ========================================
echo.
echo This will set up everything automatically!
echo.
echo What will happen:
echo   1. Install dependencies (npm install)
echo   2. Create database tables
echo   3. Add test products
echo   4. Start the development server
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul
echo.

echo ========================================
echo Step 1/4: Installing dependencies...
echo ========================================
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
echo ✓ Dependencies installed!
echo.

echo ========================================
echo Step 2/4: Creating database schema...
echo ========================================
psql -U postgres -d mema_sports -f lib\schema.sql
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create schema
    echo.
    echo Make sure:
    echo   1. PostgreSQL is installed and running
    echo   2. Database 'mema_sports' exists
    echo   3. Password in .env.local is correct
    echo.
    echo To create database, run:
    echo   psql -U postgres
    echo   CREATE DATABASE mema_sports;
    echo.
    pause
    exit /b 1
)
echo ✓ Database schema created!
echo.

echo ========================================
echo Step 3/4: Adding test products...
echo ========================================
psql -U postgres -d mema_sports -f add_test_products.sql
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to add test products
    pause
    exit /b 1
)
echo ✓ Test products added!
echo.

echo ========================================
echo Step 4/4: Starting development server...
echo ========================================
echo.
echo Your site will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server when done.
echo.
timeout /t 3 > nul

call npm run dev
