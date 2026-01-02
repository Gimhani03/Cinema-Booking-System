const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");
const showtimeRoutes = require('./routes/showtimeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use('/api/showtimes', showtimeRoutes);

module.exports = app;