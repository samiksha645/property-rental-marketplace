const express = require('express');
const router = express.Router();
const propertyRoutes = require('./propertyRoutes');
const bookingRoutes = require('./bookingRoutes');

router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
