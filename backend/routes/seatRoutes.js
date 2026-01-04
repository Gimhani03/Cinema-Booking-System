const express = require('express');
const router = express.Router();
const { getSeatsByShowtime, updateSeat } = require('../controllers/seatController');

// Route matches: /api/seats/:showtimeId
router.get('/:showtimeId', getSeatsByShowtime);

// Route matches: /api/seats/:id
router.put('/:id', updateSeat);

module.exports = router;
