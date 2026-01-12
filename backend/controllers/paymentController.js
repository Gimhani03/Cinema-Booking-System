const Payment = require('../models/Payment');
const Booking = require('../models/Booking'); 
const sendEmail = require('../utils/emailService');

// @desc    Process a new payment
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod, cardLast4 } = req.body;

        // 1. Save the Payment
        const payment = new Payment({
            userId: req.user._id,
            bookingId,
            amount,
            paymentMethod,
            cardLast4,
            status: 'Completed'
        });

        const createdPayment = await payment.save();

        // 2. Fetch Booking Details safely
        const fullBooking = await Booking.findById(bookingId)
            .populate({
                path: 'showtimeId',
                populate: { path: 'movie', select: 'title' }
            });

        // 3. Send the Confirmation Email (Now Crash-Proof!)
        if (fullBooking) {
            // SAFEGUARDS: We check if data exists before using it to prevent crashes
            const movieTitle = fullBooking.showtimeId?.movie?.title || "Movie Ticket";
            
            // This is the line that was crashing. Now we check if seats exist first.
            const seatList = (fullBooking.seats && fullBooking.seats.length > 0) 
                ? fullBooking.seats.join(', ') 
                : 'General Admission';

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #fbbf24;">Payment Confirmation</h2>
                    <p>Hi <strong>${req.user.name}</strong>,</p>
                    <p>Your booking for <strong>${movieTitle}</strong> is confirmed!</p>
                    
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Seats:</strong> ${seatList}</p>
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
                console.log("Email sent successfully to:", req.user.email);
            } catch (emailError) {
                console.error("Email failed to send:", emailError);
            }
        }

        res.status(201).json(createdPayment);

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
};

// @desc    Get user's own payment history
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

// @desc    Get ALL payments (Admin only)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('bookingId', 'totalPrice status')
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error("Admin Payment Fetch Error:", error);
        res.status(500).json({ message: 'Error fetching all payments' });
    }
};

// @desc    Delete ALL payments (Admin only)
exports.deleteAllPayments = async (req, res) => {
    try {
        await Payment.deleteMany({});
        res.json({ message: 'All payment history deleted' });
    } catch (error) {
        console.error("Delete All Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Only My Payments (User Side)
exports.deleteMyPayments = async (req, res) => {
    try {
        await Payment.deleteMany({ userId: req.user._id });
        res.json({ message: "Your payment history has been cleared." });
    } catch (error) {
        console.error("Delete History Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};