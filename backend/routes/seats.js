const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Hall = require('../models/Hall');         // Member 4's Hall Model
const Showtime = require('../models/Showtime'); // Member 4's Showtime Model

// 1. SMART GENERATE (Manual Trigger)
// Useful if Admin wants to force-regenerate seats
router.post('/generate', async (req, res) => {
    try {
        const { showtimeId } = req.body;
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const hall = await Hall.findById(showtime.hall);
        if (!hall) return res.status(404).json({ error: "Hall not found" });

        if (!hall.seatLayout || hall.seatLayout.length === 0) {
            return res.status(400).json({ error: "Hall has no layout" });
        }

        const seats = await generateSeats(showtime, hall);
        await Seat.insertMany(seats);
        
        res.json({ message: `Success! Generated ${seats.length} seats.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SEATS (Auto-Generating / Self-Fixing!)
router.get('/:showtimeId', async (req, res) => {
    try {
        const { showtimeId } = req.params;

        // Step A: Check if seats already exist
        let seats = await Seat.find({ showtimeId });

        if (seats.length > 0) {
            return res.json(seats); // Seats exist? Great, send them!
        }

        // --- SELF-FIX LOGIC ---
        // If no seats found, we generate them automatically right now.
        console.log(`No seats found for ${showtimeId}. Auto-generating...`);

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const hall = await Hall.findById(showtime.hall);
        if (!hall || !hall.seatLayout) return res.json([]); // Can't generate

        // Generate the array using helper function
        const newSeats = await generateSeats(showtime, hall);

        if (newSeats.length > 0) {
            await Seat.insertMany(newSeats);
            console.log(`Auto-generated ${newSeats.length} seats.`);
            return res.json(newSeats); // Send the brand new seats!
        } else {
            return res.json([]);
        }

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

// HELPER FUNCTION (Shared logic)
async function generateSeats(showtime, hall) {
    const seats = [];
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

    hall.seatLayout.forEach((rowArr, rIndex) => {
        const currentRowLabel = rowLabels[rIndex]; 
        rowArr.forEach((status, cIndex) => {
            if (status === 1) { 
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
    return seats;
}

module.exports = router;