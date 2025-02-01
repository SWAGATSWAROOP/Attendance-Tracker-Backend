const { Kafka } = require("kafkajs");

export async function produce(userData, eventType, disconnect = false) {
  try {
    const kafka = new Kafka({
      clientId: "Kafka",
      brokers: ["localhost:9092"],
    });

    const producer = kafka.producer();
    console.log("Connecting The Producer");
    await producer.connect();
    console.log("Connected To Producer");

    const prouduceResult = await producer.send({
      topic: "User",
      messages: [
        {
          value: JSON.stringify({ eventType, userData }),
          partition: 0,
        },
      ],
    });

    console.log("Sent Succesfully To Kafka");

    if (disconnect) {
      await producer.disconnect();
      console.log("Producer Disconnected");
    }
  } catch (error) {
    console.error("Error ", error);
  }
}
