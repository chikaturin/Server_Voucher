const { MONGODB_URI, KAFKA_URI } = require("../Middleware/config.js");
const mongoose = require("mongoose");
console.log(KAFKA_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((e) => {
    console.error("Did not connect to MongoDB", e);
  });

module.exports = mongoose;
