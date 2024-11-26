// const { Kafka } = require("kafkajs");
// const axios = require("axios");
// const { promise } = require("zod");

// const kafka = new Kafka({
//   clientId: "my-consumer",
//   brokers: ["api.wowo.htilssu.id.vn:9092"],
// });

// const consumer = kafka.consumer({ groupId: "my-group-docker-aws" });

// const runPay = async () => {
//   console.log("Connecting to Kafka...");
//   await consumer.connect();
//   console.log("Connected to Kafka.");

//   await consumer.subscribe({ topic: "voucher", fromBeginning: true });
//   console.log("Subscribed to topic: voucher");

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const rawMessage = message.value.toString().trim();
//         const parsedMessage = JSON.parse(rawMessage);
//         const { orderId, status } = parsedMessage;
//         console.log(`Parsed message:`, parsedMessage);
//         console.log(`Order ID: ${orderId}, status: ${status}`);

//         if (status === "SUCCESS") {
//           console.log("Success", parsedMessage);
//         } else if (status === "FAIL") {
//           console.log("Fail", parsedMessage);
//         } else {
//           console.log(`Unknown status: ${status}`);
//         }
//       } catch (error) {
//         console.error("Error parsing Kafka message:", error.message);
//       }
//     },
//   });
// };

// runPay().catch(console.error);
