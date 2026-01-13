const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");
const showtimeRoutes = require('./routes/showtimeRoutes');
const hallRoutes = require('./routes/hallRoutes');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', require('./routes/paymentRoutes'));

module.exports = app;