const Booking = require('../models/Booking');

// CREATE: Confirm a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seatIds, totalPrice } = req.body;

        // Validation: Prevent double booking (Your core duty)
        const existingBooking = await Booking.findOne({ 
            showtimeId, 
            seatIds: { $in: seatIds },
            status: 'Confirmed' 
        });

        if (existingBooking) {
            return res.status(400).json({ message: "One or more seats are already booked!" });
        }

        const newBooking = new Booking({ userId, showtimeId, seatIds, totalPrice });
        await newBooking.save();

        res.status(201).json({ message: "Booking successful!", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// READ: Get history for a specific user
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history" });
    }
};

// UPDATE: Cancel a booking (Change status instead of deleting)
exports.cancelBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status: 'Cancelled' }, 
            { new: true }
        );
        res.json({ message: "Booking cancelled successfully", updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Cancel failed" });
    }
};