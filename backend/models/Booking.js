const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Member 1 (User is still a simple string for now, which is fine)
  userId: { type: String, required: true }, 

  //  LINK TO SHOWTIME COLLECTION (Fixes "Movie Name Loading...")
  showtimeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Showtime', // This tells Mongoose to look in the "Showtime" table
      required: true 
  }, 

  //  LINK TO SEAT COLLECTION (Fixes "Seats" listing)
  seatIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Seat',     // This tells Mongoose to look in the "Seat" table
      required: true 
  }], 

  //  NEW: Store seat details for historical record
  seatDetails: [{
    row: String,
    number: Number,
    price: Number,
    seatId: mongoose.Schema.Types.ObjectId
  }],
  
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Confirmed' }, 
  
  // Unique code for the user
  bookingReference: { 
    type: String, 
    unique: true, 
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);