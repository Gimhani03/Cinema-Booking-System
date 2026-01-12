const { processPayment } = require('../../controllers/paymentController');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const httpMocks = require('node-mocks-http');

// We mock the DB to simulate the integration point, but we test the FLOW
jest.mock('../../utils/emailService'); 
jest.mock('../../models/Payment');
jest.mock('../../models/Booking');

describe('Integration Test: Payment System Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should process payment transaction and return 201 Created', async () => {
        // 1. Setup Request
        const req = httpMocks.createRequest({
            method: 'POST',
            user: { _id: 'userInt', email: 'int@test.com' },
            body: { bookingId: 'b2', amount: 5000 }
        });
        const res = httpMocks.createResponse();

        // 2. Mock Database Interaction
        Payment.prototype.save = jest.fn().mockResolvedValue({
            _id: 'payment_int_123',
            status: 'Completed'
        });
        Booking.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                seats: ['B1', 'B2'],
                showtimeId: { movie: { title: 'Integration Movie' } }
            })
        });

        // 3. Run Logic
        await processPayment(req, res);

        // 4. CHECK FLOW: Did the controller integrate with DB and return correct HTTP status?
        expect(res.statusCode).toBe(201);
        const data = res._getJSONData();
        expect(data._id).toBe('payment_int_123');
        expect(data.status).toBe('Completed');
    });
});