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
//         const rawMessage = message.value;
//         const messageValue = rawMessage.toString().trim();

//         console.log(`Received raw message:`, rawMessage);
//         console.log(`Parsed message: "${messageValue}"`);
//         if (messageValue === "SUCCESS") {
//           try {
//             const res = await axios.get(
//               "https://server-voucher.vercel.app/api/READKAFKA/SUCCESS"
//             );
//             console.log("Response from server:", res.data);
//             console.log("Success voucher");
//           } catch (error) {
//             console.error("Error sending message to server:", error);
//           }
//         } else if (messageValue === "FAILED") {
//           try {
//             const res = await axios.get(
//               "https://server-voucher.vercel.app/api/READKAFKA/FAIL"
//             );
//             console.log("Response from server:", res.data);
//           } catch (error) {
//             console.error("Error sending message to server:", error);
//             console.log("Failed pay voucher");
//           }
//         } else {
//           console.log(`Unknown message: "${messageValue}"`);
//         }
//         console.log("Success voucher");
//       } catch (error) {
//         console.error("Error parsing Kafka message:", error);
//       }
//     },
//   });
// };

// runPay().catch(console.error);
