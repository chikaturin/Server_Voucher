const { MONGODB_URI } = require("../config/config.js");
const mongoose = require("mongoose");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((e) => {
    console.error("Did not connect to MongoDB", e);
  });

module.exports = mongoose;
