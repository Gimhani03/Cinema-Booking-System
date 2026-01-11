const Payment = require('../models/Payment');

// @desc    Process a new payment
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod, cardLast4 } = req.body;

        const payment = new Payment({
            userId: req.user._id,
            bookingId,
            amount,
            paymentMethod,
            cardLast4,
            status: 'Completed'
        });

        const createdPayment = await payment.save();
        res.status(201).json(createdPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
};

// @desc    Get user's own payment history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

// @desc    Get ALL payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
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
// @route   DELETE /api/payments
// @access  Private/Admin
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
// @route   DELETE /api/payments/my-payments
// @access  Private
exports.deleteMyPayments = async (req, res) => {
    try {
        await Payment.deleteMany({ userId: req.user._id });
        res.json({ message: "Your payment history has been cleared." });
    } catch (error) {
        console.error("Delete History Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};