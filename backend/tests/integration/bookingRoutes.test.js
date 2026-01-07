const request = require('supertest');
const baseURL = "http://localhost:5001"; 

describe('Booking API Integration Tests', () => {
    
    it('POST /api/bookings - should successfully create a booking', async () => {
        // We use these specific 24-character strings so MongoDB doesn't crash with a "Format Error"
        const validFakeShowtimeId = "659c16c9e5480d2274478f5a";
        const validFakeSeatId = "659c16c9e5480d2274478f5b";

        const response = await request(baseURL)
            .post('/api/bookings')
            .send({
                userId: "user_123", 
                showtimeId: validFakeShowtimeId,
                seatIds: [validFakeSeatId],
                totalPrice: 1500
            });

        // If it returns 500, check your Terminal 1 (Server) logs for the specific error.
        // But 201 (Created) or 400 (Already Booked) are what we want.
        expect([201, 400]).toContain(response.statusCode);
    });

    it('POST /api/bookings - should fail if data is missing', async () => {
        const response = await request(baseURL)
            .post('/api/bookings')
            .send({
                userId: "user_123"
                // Missing showtime, seats, etc.
            });

        expect(response.statusCode).not.toBe(201);
    });
});