const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// URL: /api/bookings
router.post('/', bookingController.createBooking);

// URL: /api/bookings/user/:userId
router.get('/user/:userId', bookingController.getUserBookings);

// URL: /api/bookings/cancel/:id
router.put('/cancel/:id', bookingController.cancelBooking);

module.exports = router;