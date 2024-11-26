const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-consumer2",
  brokers: ["api.wowo.htilssu.id.vn:9092"],
});

const consumer = kafka.consumer({ groupId: "my-group-use-voucher" });

const runConsumer = async () => {
  await consumer.connect();
  console.log("Consumer connected!");

  await consumer.subscribe({ topic: "useVoucher", fromBeginning: true });
  console.log("Subscribed to topic: useVoucher");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

runConsumer().catch(console.error);
