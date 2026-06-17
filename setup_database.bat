@echo off
echo ========================================
echo PostgreSQL Database Setup for Mema Sports
echo ========================================
echo.

echo Step 1: Creating database schema...
psql -U postgres -d mema_sports -f lib\schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create schema. Make sure PostgreSQL is running and database exists.
    pause
    exit /b 1
)
echo Schema created successfully!
echo.

echo Step 2: Adding test products...
psql -U postgres -d mema_sports -f add_test_products.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to add test products.
    pause
    exit /b 1
)
echo Test products added successfully!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your database is ready. You can now run:
echo   npm run dev
echo.
pause
