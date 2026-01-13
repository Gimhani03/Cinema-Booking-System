const Payment = require('../models/Payment');
const Booking = require('../models/Booking'); 
const Showtime = require('../models/Showtime'); // <--- 1. IMPORT SHOWTIME MODEL
const Seat = require('../models/Seat'); // Import Seat model
const sendEmail = require('../utils/emailService');

// @desc    Create Booking AND Process Payment together
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        console.log("1. Payment Request Received:", req.body);

        let { bookingId, showtimeId, seats, amount, paymentMethod, cardLast4 } = req.body;

        // --- SCENARIO A: Creating a New Booking (The "Member 7" Way) ---
        if (!bookingId) {
            console.log("2. Creating new booking...");
            
            // Validate
            if (!showtimeId || !seats || seats.length === 0) {
                return res.status(400).json({ message: "Missing booking details (showtimeId or seats)." });
            }

            // Fetch actual seat details to store permanently
            const seatObjects = await Seat.find({ _id: { $in: seats } });
            const seatDetails = seatObjects.map(s => ({
                row: s.row,
                number: s.number,
                price: s.price,
                seatId: s._id
            }));

            // A. Create the Booking Receipt
            const newBooking = new Booking({
                userId: req.user._id,
                showtimeId,
                seatIds: seats,  // FIX: Use seatIds instead of seats
                seatDetails,     // FIX: Store seat details permanently
                totalPrice: amount,
                status: 'Confirmed' 
            });

            const savedBooking = await newBooking.save();
            bookingId = savedBooking._id; 
            console.log("3. New Booking Created:", bookingId);

            // B. CRITICAL: Update the Showtime to mark seats as "Booked"
            // This prevents other people from booking the same seats!
            await Showtime.findByIdAndUpdate(showtimeId, {
                $push: { bookedSeats: { $each: seats } } 
            });
            console.log("4. Seats marked as booked in Showtime:", seats);
        }

        // --- SCENARIO B: Processing the Payment ---
        console.log("5. Processing Payment...");

        const payment = new Payment({
            userId: req.user._id,
            bookingId: bookingId, 
            amount,
            paymentMethod: paymentMethod || 'Credit Card',
            cardLast4: cardLast4 || '0000',
            status: 'Completed'
        });

        const createdPayment = await payment.save();
        console.log("6. Payment Saved:", createdPayment._id);

        // --- SCENARIO C: Send Confirmation Email ---
        const fullBooking = await Booking.findById(bookingId)
            .populate({
                path: 'showtimeId',
                populate: { path: 'movie', select: 'title' }
            })
            .populate('seatIds'); // FIX: Populate seatIds

        if (fullBooking) {
            const movieTitle = fullBooking.showtimeId?.movie?.title || "Movie Ticket";
            
            // Handle seats display - use seatDetails first, then seatIds
            let seatDisplay = "General";
            if (fullBooking.seatDetails && fullBooking.seatDetails.length > 0) {
                seatDisplay = fullBooking.seatDetails.map(s => `${s.row}${s.number}`).join(', ');
            } else if (fullBooking.seatIds && fullBooking.seatIds.length > 0) {
                seatDisplay = fullBooking.seatIds.map(s => 
                    (typeof s === 'object' && s.row) ? `${s.row}${s.number}` : s
                ).join(', ');
            }

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #fbbf24;">Payment Confirmation</h2>
                    <p>Hi <strong>${req.user.name}</strong>,</p>
                    <p>Your booking for <strong>${movieTitle}</strong> is confirmed!</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Seats:</strong> ${seatDisplay}</p>
                        <p><strong>Amount:</strong> Rs. ${amount.toLocaleString()}</p>
                        <p><strong>Ref:</strong> ${createdPayment._id}</p>
                    </div>
                    <p>Enjoy the movie!<br/>Cinema Booking Team</p>
                </div>
            `;

            try {
                await sendEmail({
                    email: req.user.email,
                    subject: `Booking Confirmed: ${movieTitle}`,
                    html: message
                });
            } catch (emailError) {
                console.error("Email failed:", emailError);
            }
        }

        res.status(201).json({ 
            success: true,
            payment: createdPayment, 
            booking: fullBooking 
        });

    } catch (error) {
        console.error("PAYMENT ERROR:", error);
        res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
};

// --- KEEP OTHER FUNCTIONS ---
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'showtimeId',
                    populate: { path: 'movie', select: 'title' }
                }
            });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('bookingId', 'totalPrice status bookingReference')
            .sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all payments' });
    }
};

exports.deleteMyPayments = async (req, res) => {
    try {
        await Payment.deleteMany({ userId: req.user._id });
        res.json({ message: "Your payment history has been cleared." });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};