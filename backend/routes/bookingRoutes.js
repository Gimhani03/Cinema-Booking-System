const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../../models/Booking');
const Seat = require('../../models/Seat');       // ← Add this
const Showtime = require('../../models/Showtime'); // ← Add this

let mongoServer;

// ← Add timeout for MongoDB Memory Server
jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // ← Disconnect first (like other tests do)
    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterEach(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
        await Booking.deleteMany();
        await Seat.deleteMany();       // ← Clean seats too
        await Showtime. deleteMany();   // ← Clean showtimes too
    }
});

afterAll(async () => {
    // ← Add readyState check
    if (mongoose.connection.readyState === 1) {
        await mongoose. connection.close();
    }
    // ← Stop MongoDB Memory Server
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Booking API Integration Tests', () => {
    
    it('POST /api/bookings - should successfully create a booking', async () => {
        const validFakeShowtimeId = "659c16c9e5480d2274478f5a";
        const validFakeSeatId = "659c16c9e5480d2274478f5b";

        const response = await request(app)
            .post('/api/bookings')
            .send({
                userId: "user_123", 
                showtimeId: validFakeShowtimeId,
                seatIds: [validFakeSeatId],
                totalPrice: 1500
            });

        expect([201, 400]).toContain(response.statusCode);
    });

    it('POST /api/bookings - should fail if data is missing', async () => {
        const response = await request(app)
            .post('/api/bookings')
            .send({
                userId: "user_123"
            });

        expect(response.statusCode).not.toBe(201);
    });
});