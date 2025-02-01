const cluster = require("cluster");
const os = require("os");
const { Kafka } = require("kafkajs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {
  CreateUser,
  UpdateUser,
  LoggedIn,
  AddPrediction,
  GetUserDeatils,
} = require("./blockchaininteraction");
const { callFunctionWithRetry } = require("./utility");

const packageDef = protoLoader.loadSync("archivalstorage.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const archivePackage = grpcObject.archivePackage;

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);
  const server = new grpc.Server();

  server.addService(archivalstorage.ArchivalStorage.service, {
    retrieveUser: retrieveUser,
  });

  server.bindAsync(
    "0.0.0.0:4000",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.log("Error in starting GRPC server ", err);
        return;
      }
      console.log(`Starting GRPC BlockChain Server on port ${port}`);
    }
  );

  async function retrieveUser(call, callback) {
    const userdetail = await GetUserDeatils(call.request.userID);
    callback(null, userdetail);
  }

  const kafka = new Kafka({ clientId: "kafka", brokers: ["localhost:9092"] });
  // const workerType = process.env.WORKER_TYPE;

  const consumer = kafka.consumer({
    groupId: "BlockChain",
  });

  try {
    await consumer.connect();

    console.log("Connected To Kafka User Consumer");

    await consumer.subscribe({
      fromBeginning: true,
      topic: ["User", "Attendance", "Prediction"],
    });

    await consumer.run({
      eachMessage: async (result) => {
        console.log(
          `Recerived message ${result.message.value} on topic ${result.topic} partition ${result.partition}`
        );
        const { eventType, userData, attendanceData, predictionData } =
          JSON.parse(result.message.value);
        if (result.topic === "User") {
          // const { userData } = JSON.parse(result.message.value);
          const { userID, email, userdata } = userData;
          if (eventType === "create-user") {
            const status = await callFunctionWithRetry(CreateUser, [
              userdata,
              userID,
              email,
            ]);
            if (!status) console.log("Failed To Create User");
          } else if (eventType === "update-user") {
            const status = await callFunctionWithRetry(UpdateUser, [
              email,
              userID,
              userdata,
            ]);
            if (!status) console.log("Failed To Update User");
          }
        } else if (result.topic === "Attendance") {
          // const { attendanceData } = JSON.parse(result.message.value);
          const { userID, loggedIn, loggedOut } = attendanceData;
          const status = await callFunctionWithRetry(LoggedIn, [
            userID,
            loggedIn,
            loggedOut,
          ]);
          if (!status) console.log("Failed To Add User");
        } else if (result.topic === "Prediction") {
          // const { predictionData } = JSON.parse(result.message.value);
          const { userID, rawData, predictedData } = predictionData;
          const status = await callFunctionWithRetry(AddPrediction, [
            rawData,
            predictedData,
            userID,
          ]);
          if (!status) console.log("Failed To Add User");
        }
      },
    });
  } catch (error) {
    console.error(`Something went wrong ${error}`);
  }
}
