const { Kafka } = require("kafkajs");

export const kafkaAdmin = async () => {
  try {
    const kafka = new Kafka({
      clintId: "kafka",
      brokers: ["localhost:9092"],
    });

    const admin = kafka.admin();
    console.log("Connecting To Kafka");
    await admin.connect();
    console.log("Connected To Kafka");

    await admin.createTopics({
      topics: [
        { topic: "User", numPartitions: 1 }, //1: User
        { topic: "Analytics", numPartitions: 2 }, //1: Raw Data 2: Prediction
        /* { topic: "Attendance", numPartitions: 1 },
        { topic: "Notification", numPartitions: 1 } */
      ],
    });

    console.log("Created Successfully the Topics");
    await admin.disconnect();
  } catch (error) {
    console.error(`Something went wrong ${error}`);
  } finally {
    process.exit(0);
  }
};

kafkaAdmin();
