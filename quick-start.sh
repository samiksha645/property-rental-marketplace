#!/bin/bash
# Quick Start Script for Property Rental Marketplace
# Run this from the project root directory

set -e

echo "🚀 Property Rental Marketplace - Quick Start"
echo "==========================================="
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env and add your DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" server/.env; then
    echo "❌ DATABASE_URL not found in server/.env"
    echo "Please add your database connection string to server/.env"
    exit 1
fi

# Load environment
export $(grep -v '^#' server/.env | xargs)

echo "✅ Environment loaded"
echo ""

# Check if PostgreSQL is accessible
echo "🔍 Testing database connection..."
if ! npm --prefix server exec -- node -e "const pg = require('pg'); const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(() => { console.log('✅ Database connected'); process.exit(0); }).catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });"; then
    echo "❌ Cannot connect to database"
    echo "Please ensure DATABASE_URL is correct in server/.env"
    exit 1
fi

echo ""

# Initialize database
echo "🗄️  Initializing database..."
cd server
if ! node ../database/setup-db.js; then
    echo "❌ Database setup failed"
    exit 1
fi
cd ..

echo ""
echo "✅ All setup complete!"
echo ""
echo "📖 Next steps:"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "🌐 Access the app:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo "  Admin:    http://localhost:5173/admin"
echo ""
echo "📝 Default Credentials:"
echo "  Email:    admin@rentalmarketplace.com"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change admin credentials in production!"
