const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seatRoutes = require('../../routes/seats');
const Seat = require('../../models/Seat');

// --- SETUP CUSTOM APP ---
const app = express();
app.use(express.json());
// Mount routes at root. 
// So the path becomes: /:showtimeId
app.use('/', seatRoutes); 

let mongoServer;

// --- DATABASE SETUP ---
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Seat.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// --- THE TEST ---
describe('Seat Routes API', () => {
  test('GET /:showtimeId - Should return list of seats', async () => {
    // 1. Generate a Fake Showtime ID
    const fakeId = new mongoose.Types.ObjectId();

    // 2. Create a seat LINKED to that ID
    await Seat.create({ 
      row: 'A', 
      number: 1, 
      price: 1000, 
      status: 'available', 
      showtimeId: fakeId // Link it here
    });
    
    // 3. THE FIX: Add the ID to the URL!
    // Instead of get('/'), we use get('/' + fakeId)
    const res = await request(app).get('/' + fakeId); 

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].showtimeId).toBe(fakeId.toString());
  });
});