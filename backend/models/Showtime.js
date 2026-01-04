const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie', 
    required: true
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall', 
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, 
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);