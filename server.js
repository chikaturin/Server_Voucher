const express = require("express");
const app = express();
const data = require("./Data/data.js");
const cors = require("cors");
const { Kafka } = require("kafkajs");

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

const consumerKafka = new Kafka({
  clientId: "my-consumer",
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
});

const consumer = consumerKafka.consumer({ groupId: "my-consumer" });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "useVoucher", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        // Parse the message value
        const messageValue = message.value.toString();
        if (messageValue === "failed") {
          axios
            .get("https://server-voucher.vercel.app/api/READKAFKA/FAIL", {
              message: messageValue,
            })
            .then((res) => {
              console.log("Response from server:", res.data);
            })
            .catch((error) => {
              console.error("Error sending message to server:", error);
            });
        }
      } catch (error) {
        console.error("Error parsing Kafka message:", error);
      }
    },
  });
};

runConsumer().catch(console.error);

const run2 = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "voucher", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue = message.value.toString();
        if (messageValue === "SUCCESS") {
          axios
            .get("https://server-voucher.vercel.app/api/READKAFKA/SUCCESS", {
              message: messageValue,
            })
            .then((res) => {
              console.log("Response from server:", res.data);
            })
            .catch((error) => {
              console.error("Error sending message to server:", error);
            });
        } else if (messageValue === "FAILED") {
          axios
            .get("https://server-voucher.vercel.app/api/READKAFKA/FAIL", {
              message: messageValue,
            })
            .then((res) => {
              console.log("Response from server:", res.data);
            })
            .catch((error) => {
              console.error("Error sending message to server:", error);
            });
        }
      } catch (error) {
        console.error("Error parsing Kafka message:", error);
      }
    },
  });
};
run2().catch(console.error);
