const Booking = require('../models/Booking');
const Seat = require('../models/Seat'); // <--- 1. IMPORT THIS!

// CREATE: Confirm a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seatIds, totalPrice } = req.body;

        // Validation: Prevent double booking
        const existingBooking = await Booking.findOne({ 
            showtimeId, 
            seatIds: { $in: seatIds },
            status: 'Confirmed' 
        });

        if (existingBooking) {
            return res.status(400).json({ message: "One or more seats are already booked!" });
        }

        // 1. Create the Booking Record
        const newBooking = new Booking({ userId, showtimeId, seatIds, totalPrice });
        await newBooking.save();

        // 2. IMPORTANT: Update the Seats to be "booked"
        // This puts the "Sold" sticker on the chairs so they turn red/grey
        await Seat.updateMany(
            { _id: { $in: seatIds } }, 
            { $set: { status: 'booked' } }
        );

        res.status(201).json({ message: "Booking successful!", booking: newBooking });
    } catch (error) {
        console.error("Booking Error:", error);
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

// UPDATE: Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        // 1. Find the booking first to get the seat IDs
        const bookingToCancel = await Booking.findById(req.params.id);
        
        if (!bookingToCancel) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 2. Change Booking Status
        bookingToCancel.status = 'Cancelled';
        await bookingToCancel.save();

        // 3. FREE UP THE SEATS (Make them available again)
        await Seat.updateMany(
            { _id: { $in: bookingToCancel.seatIds } },
            { $set: { status: 'available' } }
        );

        res.json({ message: "Booking cancelled successfully", booking: bookingToCancel });
    } catch (error) {
        res.status(500).json({ message: "Cancel failed", error: error.message });
    }
};