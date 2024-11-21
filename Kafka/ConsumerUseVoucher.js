// const { Kafka } = require("kafkajs");

// const kafka = new Kafka({
//   clientId: "my-consumer2",
//   brokers: ["api.wowo.htilssu.id.vn:9092"],
// });

// const consumer = kafka.consumer({ groupId: "my-group" });

// const runConsumer = async () => {
//   await consumer.connect();
//   console.log("Consumer connected!");

//   await consumer.subscribe({ topic: "useVoucher", fromBeginning: true });
//   console.log("Subscribed to topic: useVoucher");

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const messageValue = message.value.toString().trim();
//         console.log(`Received message: "${messageValue}"`);
//         if (messageValue === "failed") {
//           try {
//             const response = await axios.get(
//               "https://server-voucher.vercel.app/api/READKAFKA/FAIL",
//               {
//                 params: { message: messageValue },
//               }
//             );
//             console.log("Response from server:", response.data);
//           } catch (error) {
//             console.error("Error sending message to server:", error);
//           }
//         }
//       } catch (error) {
//         console.error("Error processing Kafka message:", error);
//       }
//     },
//   });
// };

// runConsumer().catch(console.error);
