const express = require("express");
const app = express();
const data = require("./Data/data.js");
const cors = require("cors");
const { Kafka } = require("kafkajs");
const axios = require("axios");
const { promise } = require("zod");

app.use(cors());
app.use(express.json());
const PORT = 3000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.status(200).json("Welcome to ServerVoucher4U");
});

app.use("/api", require("./Router/AccountRouter.js"));
app.use("/api", require("./Router/VoucherRouter.js"));
app.use("/api", require("./Router/ReportRouter.js"));
app.use("/api", require("./Router/PayRouter.js"));
app.use("/api", require("./Router/StatisticalRouter.js"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const kafka = new Kafka({
  clientId: "my-consumer2",
  brokers: [`api.wowo.htilssu.id.vn:9092`],
});

const consumer = kafka.consumer({ groupId: "my-group-vercel" });

const runPay = async () => {
  console.log("Connecting to Kafka...");
  await consumer.connect();
  console.log("Connected to Kafka.");

  await consumer.subscribe({ topic: "voucher", fromBeginning: true });
  console.log("Subscribed to topic: voucher");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const rawMessage = message.value.toString().trim();
        const parsedMessage = JSON.parse(rawMessage);
        const { orderId, status } = parsedMessage;
        console.log(`Parsed message:`, parsedMessage);

        if (status === "SUCCESS") {
          try {
            const res = await axios.get(
              `https://server-voucher.vercel.app/api/READKAFKA/${status}/${orderId}`
            );
            console.log("Response from server:", res.data);
          } catch (error) {
            console.error("Error sending SUCCESS to server:", error.message);
          }
        } else if (status === "FAILED") {
          try {
            const res = await axios.get(
              `https://server-voucher.vercel.app/api/READKAFKA/${status}/${orderId}`
            );
            console.log("Response from server:", res.data);
          } catch (error) {
            console.error("Error sending FAILED to server:", error.message);
          }
        } else {
          console.log(`Unknown status: ${status}`);
        }
      } catch (error) {
        console.error("Error parsing Kafka message:", error.message);
      }
    },
  });
};

runPay().catch(console.error);
