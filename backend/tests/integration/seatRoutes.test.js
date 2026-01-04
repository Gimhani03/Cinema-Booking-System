const request = require('supertest');
const express = require('express');
const seatRoutes = require('../../routes/seats'); // Updated path to go up two levels

const app = express();
app.use(express.json());
app.use('/api/seats', seatRoutes);

// Mock Database 
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