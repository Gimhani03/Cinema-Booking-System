const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // From Member 1
  userId: { type: String, required: true }, 
  // From Member 3
  showtimeId: { type: String, required: true }, 
  // From Member 5
  seatIds: { type: [String], required: true }, 
  
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Confirmed' }, // Can be 'Confirmed' or 'Cancelled'
  
  // Unique code for the user
  bookingReference: { 
    type: String, 
    unique: true, 
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);