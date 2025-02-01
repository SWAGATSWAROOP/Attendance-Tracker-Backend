const express = require("express");
require("dotenv").config();
// const { kafkaAdmin } = require("./kafka/config.js");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("auth.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const authPackage = grpcObject.authPackage;
const app = express();
const { produce } = require("./kafka/producer.js");

//Admin Kafka
//kafkaAdmin();

const port = process.env.PORT || 3000;
const grpcPort = process.env.GRPC_PORT || 4000;

const grpcClient = new authPackage.Auth(
  `localhost:${grpcPort}`,
  grpc.credentials.createInsecure()
);

app.listen(port, () => {
  console.log("Server is listening on port 3000");
});
