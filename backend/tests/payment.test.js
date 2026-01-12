const { processPayment } = require('../controllers/paymentController');
const sendEmail = require('../utils/emailService');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const httpMocks = require('node-mocks-http'); 

// --- 1. MOCK EVERYTHING (Fake the Database & Email) ---
jest.mock('../utils/emailService');
jest.mock('../models/Payment');
jest.mock('../models/Booking');

describe('Payment System Tests', () => {

    // Reset the "fake memory" before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST 1: Check if Email is sent on success ---
    test('Should save payment and send email when successful', async () => {
        
        // A. Setup Fake Request (Simulating a User)
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/payments',
            user: { _id: 'user123', name: 'Test User', email: 'test@example.com' },
            body: {
                bookingId: 'booking123',
                amount: 5000,
                paymentMethod: 'Credit Card',
                cardLast4: '4242'
            }
        });
        const res = httpMocks.createResponse();

        // B. Setup Fake Database Responses
        // 1. Pretend the Payment saves successfully
        Payment.prototype.save = jest.fn().mockResolvedValue({ _id: 'pay_abc_123', status: 'Completed' });
        
        // 2. Pretend the Booking exists with a Movie Title and Seats
        Booking.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                seats: ['A1', 'A2'],
                showtimeId: { movie: { title: 'Wicked' } }
            })
        });

        // C. Run the Actual Function
        await processPayment(req, res);

        // --- D. VERIFY RESULTS ---
        
        // 1. Did it send a "Created" (201) success code?
        expect(res.statusCode).toBe(201);

        // 2. Did it try to send an email?
        expect(sendEmail).toHaveBeenCalledTimes(1);

        // 3. Did it send to the right person?
        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@example.com',
            subject: expect.stringContaining('Booking Confirmed')
        }));

        console.log("✅ Test Passed: Payment Saved & Email Triggered");
    });
});