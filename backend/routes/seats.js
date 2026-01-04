const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');

// 1. GENERATE SEATS (Create the grid)
router.post('/generate', async (req, res) => {
    try {
        const { showtimeId, rows, cols, price } = req.body;
        const rowLabels = ["A","B","C","D","E","F","G","H","I","J"].slice(0, rows);
        const seats = [];

        for (let r of rowLabels) {
            for (let c = 1; c <= cols; c++) {
                seats.push({
                    showtimeId,
                    row: r,
                    number: c,
                    price,
                    status: 'AVAILABLE'
                });
            }
        }
        await Seat.insertMany(seats);
        res.json({ message: `Success! Created ${seats.length} seats.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SEATS (Show the grid)
router.get('/:showtimeId', async (req, res) => {
    const seats = await Seat.find({ showtimeId: req.params.showtimeId });
    res.json(seats);
});

// 3. UPDATE SEAT (Lock/Book)
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    const seat = await Seat.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(seat);
});

// 4. RESET / DELETE ALL SEATS (New! Use this to fix the duplicate error)
router.delete('/reset', async (req, res) => {
    try {
        await Seat.deleteMany({});
        res.json({ message: "All seats deleted! You can generate again." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;