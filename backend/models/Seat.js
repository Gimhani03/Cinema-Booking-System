const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  showtimeId: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE' },
  price: { type: Number, required: true }
});

seatSchema.index({ showtimeId: 1, row: 1, number: 1 }, { unique: true });
module.exports = mongoose.model('Seat', seatSchema);