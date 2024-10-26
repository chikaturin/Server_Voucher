const { Kafka } = require("kafkajs");
require("dotenv").config();

const kafka = new Kafka({
  clientId: "my-producer",
  brokers: [process.env.KAFKA_URI],
});

const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  await producer.send({
    topic: "test-topic",
    messages: [{ value: "Hello KafkaJS user by tam!" }],
  });
  await producer.disconnect();
};

run().catch(console.error);
