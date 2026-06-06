@echo off
REM Quick Start Script for Windows
REM Run this from the project root directory

echo 🚀 Property Rental Marketplace - Quick Start
echo ===========================================
echo.

REM Check if .env exists
if not exist "server\.env" (
    echo 📝 Creating server\.env from template...
    copy server\.env.example server\.env
    echo ⚠️  Please edit server\.env and add your DATABASE_URL
    exit /b 1
)

echo ✅ Environment configuration found
echo.

REM Initialize database
echo 🗄️  Initializing database...
cd server
node ..\database\setup-db.js
if errorlevel 1 (
    echo ❌ Database setup failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo ✅ All setup complete!
echo.
echo 📖 Next steps:
echo.
echo Terminal 1 - Start Backend:
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 - Start Frontend:
echo   cd client
echo   npm run dev
echo.
echo 🌐 Access the app:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Admin:    http://localhost:5173/admin
echo.
echo 📝 Default Credentials:
echo   Email:    admin@rentalmarketplace.com
echo   Password: admin123
echo.
echo ⚠️  IMPORTANT: Change admin credentials in production!
