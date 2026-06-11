# Fix Checklist

## Database ✓ (112 properties seeded, schema correct)

## Critical Backend Fixes
- [ ] Fix adminController bookings query - use correct column references
- [ ] Add missing admin API routes for reviews, categories, cities CRUD
- [ ] Fix booking routes ordering (static before parameterized)

## Admin Panel Frontend
- [ ] Fix AdminLayout.css - proper fixed sidebar, responsive
- [ ] Fix Dashboard.css - premium design
- [ ] Fix AdminCommon.css - table/proper spacing
- [ ] Fix admin Properties page - landlord_name → owner_name
- [ ] Create admin Reviews page
- [ ] Create admin Categories page  
- [ ] Create admin Cities page
- [ ] Add routes for missing admin pages

## Public Pages
- [ ] Fix HomePage - load from DB, featured properties, cities, categories
- [ ] Fix PropertyDetails - premium gallery, amenities, map, booking
- [ ] Fix Properties - city/property type filtering
- [ ] Fix UserDashboard - profile, wishlist, bookings
- [ ] Fix Header - dynamic cities

## Auth
- [ ] Verify JWT login/logout works
- [ ] Token persistence fix