# Authentication & Admin System Setup Guide

This guide explains how to integrate and use the complete authentication and admin system that has been added to your property rental marketplace.

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [API Endpoints](#api-endpoints)
6. [Admin Dashboard](#admin-dashboard)
7. [Testing](#testing)
8. [Security Notes](#security-notes)

## Overview

The authentication system includes:
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Protected routes on both frontend and backend
- Complete admin dashboard with user, property, and booking management

## Database Setup

### Run the Migration

Execute the migration script to create the users table:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration
\i database/migrations/001_create_users_table.sql
```

Or using the setup script:
```bash
node database/setup.js
```

### Default Admin User

After running the migration, you'll have a default admin user:
- **Email:** admin@rentalmarketplace.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change this password immediately in production!

## Backend Setup

### 1. Install Dependencies

The backend already has the required dependencies:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

If needed, reinstall:
```bash
cd server
npm install
```

### 2. Environment Variables

Update `server/.env` with your JWT secret:

```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars_for_security
JWT_EXPIRES_IN=7d
```

### 3. Start the Backend

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

This will install `react-router-dom` for routing.

### 2. Start the Frontend

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile (Protected)
```
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

#### Update Password (Protected)
```
PUT /api/v1/auth/update-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Logout (Protected)
```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Admin Endpoints (All require admin role)

#### Get Dashboard Stats
```
GET /api/v1/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users
```
GET /api/v1/admin/users?page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

#### Delete User
```
DELETE /api/v1/admin/users/:id
Authorization: Bearer <admin_token>
```

#### Get All Properties (Admin View)
```
GET /api/v1/admin/properties?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Create Property (Admin)
```
POST /api/v1/admin/properties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "landlord_id": 1,
  "title": "Luxury Apartment",
  "description": "Beautiful apartment",
  "property_type": "apartment",
  "bedrooms": 2,
  "bathrooms": 2,
  "max_guests": 4,
  "base_price_per_night": 150,
  "city": "New York",
  "state": "NY",
  "country": "USA"
}
```

#### Update Property (Admin)
```
PUT /api/v1/admin/properties/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "base_price_per_night": 200
}
```

#### Delete Property (Admin)
```
DELETE /api/v1/admin/properties/:id
Authorization: Bearer <admin_token>
```

#### Get All Bookings
```
GET /api/v1/admin/bookings?page=1&limit=20&status=pending
Authorization: Bearer <admin_token>
```

#### Update Booking Status
```
PUT /api/v1/admin/bookings/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

## Admin Dashboard

### Accessing the Admin Panel

1. Login with admin credentials
2. Click the "Admin Panel" button in the header
3. Or navigate directly to `/admin`

### Admin Dashboard Features

#### Dashboard Overview
- Total users count
- Total properties count
- Total bookings count
- Total revenue
- Recent bookings table

#### User Management
- View all users
- Search users by name or email
- Delete users (except admin users)
- View user details

#### Property Management
- View all properties
- Edit property details
- Delete properties (hard delete)
- View property statistics

#### Booking Management
- View all bookings
- Filter by status
- Confirm pending bookings
- Cancel bookings
- View booking details

## Testing

### Manual Testing

1. **Register a new user:**
   - Go to `/register`
   - Fill in the form
   - Should redirect to home page

2. **Login:**
   - Go to `/login`
   - Use admin credentials: `admin@rentalmarketplace.com` / `admin123`
   - Should see "Admin Panel" button in header

3. **Access Admin Panel:**
   - Click "Admin Panel" button
   - Should see dashboard with statistics
   - Navigate between Users, Properties, Bookings

4. **Test Protected Routes:**
   - Logout
   - Try accessing `/admin`
   - Should redirect to login page

### API Testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentalmarketplace.com","password":"admin123"}'

# Get Profile (use token from login)
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

### Implemented Security Features

1. **Password Hashing**
   - All passwords are hashed using bcrypt with 12 salt rounds
   - Passwords are never stored in plain text

2. **JWT Authentication**
   - Tokens expire after 7 days (configurable)
   - Tokens are verified on every protected request
   - Invalid tokens are rejected

3. **Role-Based Access Control**
   - Admin routes require admin role
   - Non-admin users cannot access admin endpoints
   - Frontend routes are protected based on authentication and role

4. **SQL Injection Prevention**
   - All queries use parameterized queries
   - No raw SQL with user input

5. **Input Validation**
   - Email format validation
   - Password length requirements
   - Required field validation

### Production Recommendations

1. **Change Default Admin Password**
   ```sql
   UPDATE users 
   SET password = '$2a$12$<new_hashed_password>' 
   WHERE email = 'admin@rentalmarketplace.com';
   ```

2. **Use Strong JWT Secret**
   - Generate a random 64+ character secret
   - Store in environment variable
   - Never commit to version control

3. **Enable HTTPS**
   - Use SSL certificates in production
   - Force HTTPS redirects

4. **Rate Limiting**
   - Already implemented on `/api` routes
   - Adjust limits based on your needs

5. **CORS Configuration**
   - Update `server/src/config/cors.js` with your production domain
   - Remove localhost origins in production

6. **Environment Variables**
   - Use `.env` file for all sensitive data
   - Never commit `.env` to version control
   - Use environment-specific configs

## Troubleshooting

### Common Issues

1. **"Cannot find module 'react-router-dom'"**
   - Run `npm install` in the client directory

2. **"JWT secret not defined"**
   - Add `JWT_SECRET` to `server/.env`

3. **"Database connection failed"**
   - Check `DATABASE_URL` in `server/.env`
   - Ensure PostgreSQL is running

4. **"Token expired"**
   - Login again to get a new token
   - Increase `JWT_EXPIRES_IN` in `.env` if needed

5. **"Cannot access admin panel"**
   - Ensure user has `admin` role in database
   - Check `role` field in users table

## File Structure

### Backend Files Created/Modified
```
server/
├── src/
│   ├── models/
│   │   └── UserModel.js (NEW)
│   ├── controllers/
│   │   ├── authController.js (NEW)
│   │   └── adminController.js (NEW)
│   ├── middleware/
│   │   ├── auth.js (MODIFIED)
│   │   └── adminMiddleware.js (NEW)
│   ├── routes/
│   │   ├── authRoutes.js (NEW)
│   │   ├── adminRoutes.js (NEW)
│   │   └── index.js (MODIFIED)
│   └── app.js (NO CHANGES NEEDED)
├── .env (MODIFIED)
└── package.json (NO CHANGES NEEDED)
```

### Frontend Files Created
```
client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx (NEW)
│   │   ├── Login.css (NEW)
│   │   ├── Register.jsx (NEW)
│   │   ├── Register.css (NEW)
│   │   └── admin/
│   │       ├── Dashboard.jsx (NEW)
│   │       ├── Dashboard.css (NEW)
│   │       ├── Users.jsx (NEW)
│   │       ├── Properties.jsx (NEW)
│   │       ├── Bookings.jsx (NEW)
│   │       └── AdminCommon.css (NEW)
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.jsx (NEW)
│   │       └── AdminLayout.css (NEW)
│   ├── context/
│   │   └── AuthContext.jsx (NEW)
│   ├── services/
│   │   └── authService.js (NEW)
│   └── App.jsx (MODIFIED)
├── package.json (MODIFIED)
└── .env (NO CHANGES NEEDED)
```

### Database Files Created
```
database/
└── migrations/
    └── 001_create_users_table.sql (NEW)
```

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have been run

---

**Integration completed successfully!** 🎉

Your property rental marketplace now has a complete authentication and admin system ready for production use.