# Deployment Guide - Property Rental Marketplace

## 🚨 Fix for "column password does not exist" Error

Your deployed database is missing the `password` column in the users table. Follow these steps to fix it:

### Step 1: Run Database Migration on Render

1. **Log in to your Render dashboard**
2. **Go to your PostgreSQL database**
3. **Click on "Connect" to get your database connection string**
4. **Use a database client to run the migration:**

   **Option A: Use Render's built-in query editor (if available)**
   - Copy the contents of `database/migrations/002_add_password_column.sql`
   - Paste and execute in Render's query editor

   **Option B: Use a local database client**
   ```bash
   # Install DBeaver or pgAdmin
   # Connect using your Render database connection string
   # Run the SQL migration file
   ```

### Step 2: Redeploy Your Server

After running the migration, you need to redeploy your server on Render:

1. **Go to your Render web service dashboard**
2. **Click "Manual Deploy" or "Deploy Latest Commit"**
3. **Wait for deployment to complete**

### Step 3: Verify the Fix

1. **Go to your deployed website**
2. **Try logging in with:**
   - Email: `admin@rentalmarketplace.com`
   - Password: You'll need to reset it (the migration sets a temporary password)

---

## 📋 Complete Deployment Checklist

### Prerequisites
- [ ] GitHub repository connected to Render
- [ ] PostgreSQL database on Render
- [ ] Environment variables configured

### Database Setup
- [ ] Run `database/migrations/001_create_users_table.sql` (initial setup)
- [ ] Run `database/migrations/002_add_password_column.sql` (fix missing columns)
- [ ] Verify all columns exist: id, name, email, password, role, phone, profile_image, is_active, is_email_verified, last_login, created_at, updated_at

### Server Deployment (Render)
- [ ] Root directory: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set:
  - `DATABASE_URL` (your Render PostgreSQL connection string)
  - `JWT_SECRET` (a strong secret key)
  - `NODE_ENV=production`
  - `PORT` (automatically set by Render)

### Client Deployment (Render/Netlify/Vercel)
- [ ] Root directory: `client`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables set:
  - `VITE_API_URL=https://your-server-url.onrender.com/api/v1`

### Post-Deployment
- [ ] Test login functionality
- [ ] Test registration functionality
- [ ] Test property listings
- [ ] Test admin panel (if applicable)
- [ ] Check server logs for errors

---

## 🔧 Troubleshooting

### Error: "column password does not exist"
**Solution:** Run the database migration as described above.

### Error: "CORS policy blocked"
**Solution:** Update `server/src/config/cors.js` to include your frontend URL:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.com',
  'https://property-rental-marketplace-3wo7.onrender.com'
];
```

### Error: "Cannot connect to database"
**Solution:** 
1. Check your `DATABASE_URL` environment variable
2. Make sure your Render database is running
3. Verify network access settings in Render

### Login page not showing
**Solution:** 
1. Make sure you've pushed the latest changes to GitHub
2. Trigger a new deployment on Render
3. Clear browser cache and try again

---

## 📝 Environment Variables Template

### Server (.env)
```env
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=production
PORT=10000
```

### Client (.env)
```env
VITE_API_URL=https://your-server-url.onrender.com/api/v1
```

---

## 🔄 How to Deploy Future Changes

1. **Make changes locally**
2. **Test locally:**
   ```bash
   cd client && npm run build
   cd ../server && npm test
   ```
3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
4. **Render will automatically deploy** (if auto-deploy is enabled)
5. **Verify deployment** by checking your live site

---

## 🆘 Need Help?

If you're still having issues:
1. Check Render server logs
2. Check Render database logs
3. Verify all environment variables are set correctly
4. Make sure your database migration ran successfully

Good luck with your deployment! 🚀