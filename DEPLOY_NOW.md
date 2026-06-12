# Deploy All Fixes to Render - Quick Steps

## Step 1: Commit & Push to GitHub

Open **Terminal** in VS Code (Ctrl+`) and run:

```bash
# Stage all changed files
git add client/src/services/authService.js
git add client/src/services/api.js
git add client/src/pages/HomePage.jsx
git add client/src/pages/Properties.jsx
git add client/src/pages/PropertyDetails.jsx
git add client/src/pages/PropertyDetails.css
git add client/src/components/layout/Header.jsx
git add client/src/components/layout/Header.css
git add client/src/components/property/PropertyCard.jsx

# Commit with message
git commit -m "Fix: admin panel, login JSON error, property types, gallery, city counts, mobile navbar"

# Push to GitHub
git push origin main
```

## Step 2: Deploy on Render

Go to https://dashboard.render.com

### For Frontend (Client):
1. Find your **Static Site** named "property-rental-marketplace" (or similar)
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait 2-3 minutes for build & deploy

### For Backend (Server):
1. Find your **Web Service** (the Node.js/Express API)
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait 1-2 minutes for restart

## Step 3: Verify

Visit your site: https://property-rental-market.onrender.com

Test:
1. ✅ **Login** with admin@rentalmarketplace.com / admin123
2. ✅ **Admin Panel** button should appear in navbar after login
3. ✅ **Property Types** - only Apartment, Flat, Villa, Independent House, Studio Apartment, PG
4. ✅ **City Cards** show property counts (not "0")
5. ✅ **Mobile menu** - hamburger works smoothly
6. ✅ **Property Details** - no "Show All Photos" button

---

## Alternative: Deploy Just Frontend

If only frontend changed (which is what we fixed), you only need to redeploy the **Static Site** on Render.

The backend (server) doesn't need redeployment since we only changed frontend files.