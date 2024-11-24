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
        const rawMessage = message.value;
        const messageValue = rawMessage.toString().trim();

        console.log(`Received raw message:`, rawMessage);
        console.log(`Parsed message: "${messageValue}"`);
        if (messageValue === "SUCCESS") {
          try {
            const res = await axios.get(
              "https://server-voucher.vercel.app/api/READKAFKA/SUCCESS"
            );
            console.log("Response from server:", res.data);
            console.log("Success voucher");
          } catch (error) {
            console.error("Error sending message to server:", error);
          }
          console.log("Success voucher");
        } else if (messageValue === "FAILED") {
          try {
            const res = await axios.get(
              "https://server-voucher.vercel.app/api/READKAFKA/FAIL"
            );
            console.log("Response from server:", res.data);
          } catch (error) {
            console.error("Error sending message to server:", error);
            console.log("Failed pay voucher");
          }
          console.log("Failed pay voucher");
        } else {
          console.log(`Unknown message: "${messageValue}"`);
        }
        console.log("Success voucher");
      } catch (error) {
        console.error("Error parsing Kafka message:", error);
      }
    },
  });
};

runPay().catch(console.error);
