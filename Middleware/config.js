require("dotenv").config();

console.log("Kafka URI:", process.env.KAFKA_URI);
module.exports = {
  KAFKA_URI: process.env.KAFKA_URI,
  MONGODB_URI: process.env.MONGODB_URI,
};
