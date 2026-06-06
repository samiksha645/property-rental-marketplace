# Property Rental Marketplace - Complete Setup & Development Guide

## Overview

This is a full-stack property rental marketplace built with:
- **Frontend**: React 19.2 + Vite + React Router
- **Backend**: Node.js + Express 5.2
- **Database**: PostgreSQL (Supabase or local)
- **Authentication**: JWT (custom implementation)

## Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL (local or Supabase)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Database Setup

#### Option A: Using Supabase (Cloud)

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your `DATABASE_URL` from project settings
4. Update `server/.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/database
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
```sql
CREATE DATABASE rental_marketplace;
```

3. Update `server/.env`:
```
DATABASE_URL=postgresql://localhost:5432/rental_marketplace
```

### 3. Set Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# server/.env
cp server/.env.example server/.env

# Edit server/.env with your DATABASE_URL and JWT_SECRET
```

**Important**: In production, change `JWT_SECRET` to a secure random string (min 32 characters).

### 4. Initialize Database

Run migrations to create tables:

```bash
cd server
node ../database/setup-db.js
cd ..
```

Or use the SQL script directly:
```bash
psql $DATABASE_URL -f database/schema.sql
```

### 5. Start Development Servers

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend Server:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 6. Access the Application

- **Main App**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **API Health**: http://localhost:5000/health

## Default Credentials

For development/testing:
- **Email**: admin@rentalmarketplace.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change these credentials immediately in production!

## Project Structure

```
property-rental-marketplace/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components (Login, Register, Admin)
│   │   ├── context/         # AuthContext for state management
│   │   ├── services/        # API calls (api.js, authService.js)
│   │   └── App.jsx          # Main app component with routing
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js/Express backend
│   ├── src/
│   │   ├── app.js           # Express app setup
│   │   ├── server.js        # Server entry point
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── validations/     # Input validation
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── migrations/          # Database migrations (001-006)
│   ├── schema.sql           # Complete database schema
│   ├── setup.sh            # Database setup script (Linux/Mac)
│   ├── setup-db.js         # Database setup script (Node.js)
│   └── seeds/              # Optional data seeds
│
└── README.md
```

## API Endpoints

### Authentication Routes
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)
- `PUT /api/v1/auth/update-password` - Change password (protected)
- `POST /api/v1/auth/logout` - Logout (protected)
- `GET /api/v1/auth/verify` - Verify token (protected)

### Admin Routes (require admin role)
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/users/:id` - Get user by ID
- `DELETE /api/v1/admin/users/:id` - Delete user
- `GET /api/v1/admin/properties` - Get all properties
- `POST /api/v1/admin/properties` - Create property
- `PUT /api/v1/admin/properties/:id` - Update property
- `DELETE /api/v1/admin/properties/:id` - Delete property
- `GET /api/v1/admin/bookings` - Get all bookings
- `PUT /api/v1/admin/bookings/:id/status` - Update booking status

### Property Routes
- `GET /api/v1/properties` - Get all properties (paginated)
- `GET /api/v1/properties/:id` - Get property details
- `GET /api/v1/properties/search?q=term` - Search properties
- `GET /api/v1/properties/featured` - Get featured properties

### Booking Routes
- `GET /api/v1/bookings` - Get user's bookings (protected)
- `POST /api/v1/bookings` - Create booking (protected)
- `GET /api/v1/bookings/:id` - Get booking details (protected)

## Authentication Flow

### Registration
1. User submits form with name, email, password
2. Backend validates input and checks email uniqueness
3. Password hashed with bcrypt (12 salt rounds)
4. User created in database
5. JWT token generated and returned
6. Token stored in localStorage
7. User redirected to home page

### Login
1. User submits email and password
2. Backend finds user and verifies password
3. JWT token generated and returned
4. Token stored in localStorage
5. User redirected to home page or admin dashboard

### Protected Routes
1. Frontend checks `isAuthenticated` before rendering protected components
2. Backend validates JWT in Authorization header
3. Request rejected if token invalid or expired
4. User redirected to login page if auth fails

## Admin Panel Features

### Dashboard
- Total user count
- Total property count  
- Total booking count
- Revenue statistics
- Recent bookings widget

### User Management
- View all users with pagination
- Search users by name/email
- Delete/deactivate users
- Soft delete (mark as inactive)

### Property Management
- View all properties
- Create new properties
- Edit property details
- Delete properties
- Filter by status and type

### Booking Management
- View all bookings
- Filter by status (pending, confirmed, cancelled)
- Update booking status
- View booking details with guest/property info

## Database Migrations

Migrations are organized sequentially:

1. **001_create_users_table.sql** - Users table with auth fields
2. **002_create_properties_table.sql** - Properties/listings table
3. **003_create_bookings_table.sql** - Bookings table with foreign keys
4. **004_add_property_indexes.sql** - Performance indexes
5. **005_add_additional_indexes.sql** - Deprecated (reference only)
6. **006_add_triggers.sql** - Deprecated (reference only)

All migrations are **idempotent** and can be safely rerun without errors.

### Run Migrations

```bash
# Via Node.js setup script (recommended)
node database/setup-db.js

# Via SQL file
psql $DATABASE_URL -f database/schema.sql

# Via individual migration files
psql $DATABASE_URL -f database/migrations/001_create_users_table.sql
```

## Security Considerations

### Implemented
- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ JWT token-based authentication
- ✅ Role-based access control (admin/user)
- ✅ Input validation on all endpoints
- ✅ CORS policy configured
- ✅ Rate limiting on API routes
- ✅ Secure JWT secret in environment variables

### Recommended Production Changes
- 🔒 Update JWT_SECRET to cryptographically secure value
- 🔒 Enable HTTPS/SSL certificates
- 🔒 Use secure cookies for tokens (HttpOnly, Secure, SameSite)
- 🔒 Implement refresh token rotation
- 🔒 Add email verification before account activation
- 🔒 Implement password reset with expiring tokens
- 🔒 Add audit logging for admin actions
- 🔒 Implement API key authentication for service-to-service communication

## Development Tips

### Adding New Routes
1. Create controller function in `src/controllers/`
2. Define route in `src/routes/`
3. Add middleware for protection if needed
4. Test with Postman or curl

### Adding Admin Features
1. Create frontend component in `client/src/pages/admin/`
2. Create API service method in `client/src/services/authService.js`
3. Add route in App.jsx with AdminRoute wrapper
4. Call service from component

### Database Queries
All database operations use parameterized queries to prevent SQL injection:
```javascript
const sql = 'SELECT * FROM users WHERE email = $1 AND id = $2';
const result = await query(sql, [email, id]); // Safe
```

## Troubleshooting

### "Connection refused" error
- Verify DATABASE_URL is correct
- Check PostgreSQL is running (local) or accessible (Supabase)
- Ensure firewall allows database connections

### "JWT verification failed"
- Check JWT_SECRET matches between server and frontend
- Verify token is in Authorization header format: `Bearer <token>`
- Check token expiration time

### CORS errors
- Verify origin is in CORS_ORIGIN environment variable
- For local development, ensure http://localhost:5173 is allowed
- Check preflight requests aren't being blocked

### Database migration errors
- Run `node database/setup-db.js` to recreate from scratch
- Ensure DATABASE_URL is set correctly
- Check PostgreSQL version compatibility

## Performance Optimization

- Database indexes on commonly queried fields (email, role, created_at)
- Pagination on all list endpoints (default 20-50 items)
- JWT tokens cached in localStorage (no database lookups for auth)
- Trigger-based `updated_at` column auto-updates
- Soft deletes preserve referential integrity

## Deployment

### To Render (Recommended for Supabase)

1. Push code to GitHub
2. Create Render account at render.com
3. Create Web Service connected to GitHub repo
4. Set environment variables:
   - DATABASE_URL (from Supabase)
   - JWT_SECRET (generate secure string)
   - NODE_ENV=production
5. Deploy from main branch

### To Other Platforms
Follow similar steps, ensuring:
- NODE_ENV=production
- Secure environment variables
- SSL/HTTPS enforced
- Database accessible from server

## License

ISC

## Support

For issues or questions:
1. Check logs in server console
2. Review error messages in browser console
3. Test API endpoints with Postman
4. Verify database connectivity
5. Check environment variables are set

---

**Last Updated**: 2026-06-06
**Version**: 1.0.0 (Complete Authentication & Admin System)
