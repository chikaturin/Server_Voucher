const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: `54.161.104.151`,
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error: ", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("end", () => {
  console.log("Disconnected from Redis");
});

module.exports = redisClient;
