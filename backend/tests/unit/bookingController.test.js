const bookingController = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');
const httpMocks = require('node-mocks-http');

// Mock the models
jest.mock('../../models/Booking');
jest.mock('../../models/Seat');

describe('Booking Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    // TEST 1: Create Booking Success
    it('should create a booking successfully', async () => {
        req.body = {
            userId: 'user_123',
            showtimeId: 'showtime_abc', // Updated name
            seatIds: ['seat_1', 'seat_2'], // Updated name
            totalPrice: 2000
        };

        // Mock finding existing booking (return null = no double booking)
        Booking.findOne.mockResolvedValue(null);
        // Mock Seat.find to return seat details
        Seat.find.mockResolvedValue([
            { _id: 'seat_1', row: 'A', number: 1, price: 1000 },
            { _id: 'seat_2', row: 'A', number: 2, price: 1000 }
        ]);
        
        // Mock save
        Booking.prototype.save = jest.fn().mockResolvedValue({
            _id: 'booking_123',
            ...req.body
        });

        // Mock seat update
        Seat.updateMany.mockResolvedValue({});

        await bookingController.createBooking(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toHaveProperty('message', 'Booking successful!');
    });

    // TEST 2: Prevent Double Booking
    it('should prevent booking if seats are already taken', async () => {
        req.body = {
            userId: 'user_123',
            showtimeId: 'showtime_abc',
            seatIds: ['seat_1'],
            totalPrice: 1000
        };

        // Mock finding an existing booking (return object = already booked)
        Booking.findOne.mockResolvedValue({
            _id: 'existing_booking',
            status: 'Confirmed'
        });

        await bookingController.createBooking(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toHaveProperty('message', 'One or more seats are already booked!');
    });

    // TEST 3: Get User History
    it('should return user bookings', async () => {
        req.params.userId = 'user_123';

        const mockBookings = [
            { _id: 'b1', showtimeId: { movie: { title: 'Movie A' } }, seatIds: [] }
        ];

        // Chainable mock for .populate().populate().sort()
        const mockFind = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockBookings)
        };

        Booking.find.mockReturnValue(mockFind);

        await bookingController.getUserBookings(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockBookings);
    });
});