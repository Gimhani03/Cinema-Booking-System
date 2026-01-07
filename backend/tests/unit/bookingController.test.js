const bookingController = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');
const httpMocks = require('node-mocks-http'); 

// Mock the models
jest.mock('../../models/Booking');
jest.mock('../../models/Seat');

describe('Booking Controller Unit Tests', () => {
    let req, res;

    // Reset mocks before every test to ensure clean slate
    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks(); // <--- Important! Clears previous calls
    });

    // ------------------------------------------------------------------
    // TEST 1: CREATE BOOKING
    // ------------------------------------------------------------------
    describe('createBooking', () => {
        it('should create a booking and lock seats if seats are available', async () => {
            req.body = {
                userId: "user_123",
                showtimeId: "showtime_abc",
                seatIds: ["seat_1", "seat_2"],
                totalPrice: 2000
            };

            // 1. Pretend no double booking exists
            Booking.findOne.mockResolvedValue(null);
            
            // 2. Pretend save works (Mock the prototype save function)
            Booking.prototype.save = jest.fn().mockResolvedValue({});

            // 3. Pretend Seat update works
            Seat.updateMany.mockResolvedValue({});

            // 4. Run actual function
            await bookingController.createBooking(req, res);

            // 5. Check results
            expect(res.statusCode).toBe(201); 
            expect(Seat.updateMany).toHaveBeenCalled(); 
            expect(JSON.parse(res._getData()).message).toBe("Booking successful!");
        });

        it('should return 400 if seats are already booked', async () => {
            req.body = {
                userId: "user_123",
                showtimeId: "showtime_abc",
                seatIds: ["seat_1"],
                totalPrice: 1000
            };

            // 1. Pretend a booking already exists
            Booking.findOne.mockResolvedValue({ _id: 'existing_booking' });

            // 2. Run function
            await bookingController.createBooking(req, res);

            // 3. Check results
            expect(res.statusCode).toBe(400); 
            expect(JSON.parse(res._getData()).message).toBe("One or more seats are already booked!");
        });
    });

    // ------------------------------------------------------------------
    // TEST 2: CLEAR HISTORY (The New Feature)
    // ------------------------------------------------------------------
    describe('clearUserHistory', () => {
        it('should delete all bookings for a user via POST', async () => {
            // Setup the request with userId in the BODY (Cheat Code match)
            req.body = { userId: "user_123" };

            // Mock deleteMany to succeed
            Booking.deleteMany.mockResolvedValue({ deletedCount: 5 });

            await bookingController.clearUserHistory(req, res);

            expect(Booking.deleteMany).toHaveBeenCalledWith({ userId: "user_123" });
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData()).message).toBe("History cleared!");
        });

        it('should return 400 if User ID is missing', async () => {
            req.body = {}; // Empty body

            await bookingController.clearUserHistory(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData()).message).toBe("User ID is required");
        });
    });

    // ------------------------------------------------------------------
    // TEST 3: GET USER BOOKINGS (Checking Populate)
    // ------------------------------------------------------------------
    describe('getUserBookings', () => {
        it('should fetch bookings and populate data', async () => {
            req.params.userId = "user_123";

            // Mocking a chain: find -> populate -> populate -> sort
            const mockSort = jest.fn().mockResolvedValue(['booking1', 'booking2']);
            const mockPopulate2 = jest.fn().mockReturnValue({ sort: mockSort });
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            
            Booking.find.mockReturnValue({ populate: mockPopulate1 });

            await bookingController.getUserBookings(req, res);

            expect(Booking.find).toHaveBeenCalledWith({ userId: "user_123" });
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(['booking1', 'booking2']);
        });
    });

});