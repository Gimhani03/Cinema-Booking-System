const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Hall = require('../models/Hall');         // Member 4's Hall Model
const Showtime = require('../models/Showtime'); // Member 4's Showtime Model

// 1. SMART GENERATE SEATS (Based on Member 4's Layout)
router.post('/generate', async (req, res) => {
    try {
        const { showtimeId } = req.body;

        // A. Find the Showtime
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ error: "Showtime not found" });
        }

        // B. Find the Hall linked to this Showtime
        const hall = await Hall.findById(showtime.hall);
        if (!hall) {
            return res.status(404).json({ error: "Hall not found for this showtime" });
        }

        // C. Check if Layout exists
        if (!hall.seatLayout || hall.seatLayout.length === 0) {
            return res.status(400).json({ error: "This Hall has no seat layout defined." });
        }

        const seats = [];
        const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

        // D. Loop through Member 4's Layout (1 = Seat, 0 = Aisle)
        hall.seatLayout.forEach((rowArr, rIndex) => {
            const currentRowLabel = rowLabels[rIndex]; 

            rowArr.forEach((status, cIndex) => {
                if (status === 1) { // Only create a seat if it's a 1
                    seats.push({
                        showtimeId: showtime._id,
                        row: currentRowLabel,
                        number: cIndex + 1,
                        price: showtime.price, 
                        status: 'available'
                    });
                }
            });
        });

        // E. Save to Database
        if (seats.length > 0) {
            await Seat.insertMany(seats);
            res.json({ 
                message: `Success! Generated ${seats.length} seats for ${hall.name} using the defined layout.` 
            });
        } else {
            res.json({ message: "No seats were generated. The Hall layout might be empty." });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SEATS (Needed for the Frontend)
router.get('/:showtimeId', async (req, res) => {
    try {
        const seats = await Seat.find({ showtimeId: req.params.showtimeId });
        res.json(seats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE SEAT (Booking/Locking)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const seat = await Seat.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(seat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. RESET (Helper to clear seats)
router.delete('/reset', async (req, res) => {
    try {
        await Seat.deleteMany({});
        res.json({ message: "All seats deleted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CRITICAL: This is what was missing! ---
module.exports = router;