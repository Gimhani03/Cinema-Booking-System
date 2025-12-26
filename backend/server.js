require('dotenv').config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error(err));

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5001}`);
});