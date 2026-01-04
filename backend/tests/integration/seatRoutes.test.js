const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose'); 

// --- FIX START: Mock Mongoose Connection ---
// This tells the test: "Pretend we connected to the DB, don't actually try."
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose, 
    connect: jest.fn().mockResolvedValue(), // Fake the connection success
    disconnect: jest.fn().mockResolvedValue(),
  };
});
// --- FIX END ---

const seatRoutes = require('../../routes/seats'); 

const app = express();
app.use(express.json());
app.use('/api/seats', seatRoutes);

// Mock Database Data (The Seat Model)
jest.mock('../../models/Seat', () => ({
  find: jest.fn().mockResolvedValue([{ row: 'A', number: 1, status: 'available' }]),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 200 }),
  insertMany: jest.fn().mockResolvedValue({ insertedCount: 200 }),
}));

describe('Seat Routes API', () => {
  
  test('GET /api/seats - Should return list of seats', async () => {
    const res = await request(app).get('/api/seats');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});