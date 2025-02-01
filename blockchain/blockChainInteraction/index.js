const { ethers } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const UserDetails = require("../artifacts/contracts/User.sol/UserDetails.json");

const intializationContract = (view = false) => {
  const provider = new ethers.JsonRpcProvider();
  //   console.log(process.env.PRIVATE_KEY);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const walletConnect = wallet.connect(provider);

  const passToContract = view ? provider : walletConnect;
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    UserDetails.abi,
    passToContract
  );
  return contract;
};

const CreateUser = async (userData, userID, email) => {
  try {
    const contract = intializationContract();
    const transaction = await contract.createUser(userData, userID, email);
    await transaction.wait();
    return true;
  } catch (error) {
    console.error("Error in creating user");
    return false;
  }
};

const UpdateUser = async (email, userId, userData) => {
  try {
    const contract = intializationContract();
    const transaction = await contract.updateUser(email, userId, userData);
    await transaction.wait();
    return true;
  } catch (error) {
    console.error("Error in updating the user in BlockChain", error);
    return false;
  }
};

const AddPrediction = async (rawData, predictedData, userId) => {
  try {
    const contract = intializationContract();
    const transaction = await contract.addPrediction(
      rawData,
      predictedData,
      userId
    );
    await transaction.wait();
    return true;
  } catch (error) {
    console.error("Error in updating the user in BlockChain", error);
    return false;
  }
};

const LoggedIn = async (userId, loggedIn, loggedOut) => {
  try {
    const contract = intializationContract();
    const transaction = await contract.addLoggedData(
      userId,
      loggedIn,
      loggedOut
    );
    await transaction.wait();
    return true;
  } catch (error) {
    console.error("Error in updating the user in BlockChain", error);
    return false;
  }
};

const GetUserDeatils = async (userId) => {
  try {
    const contract = intializationContract(true);
    const transaction = await contract.getUserDetails(userId);
    // await transaction.wait(); Does not need in read operation
    console.log(Number(transaction[0]));
    //For uint256 in solidity -> it stores large number therefore
    //When Converted to JS its return n after number to show BIGINT we can convert it to number.

    // console.log(JSON.parse(transaction));

    return {
      // status: true,
      userID: Number(transaction[0]),
      email: transaction[1],
      userData: transaction[2],
      rawData: transaction[3],
      predictedData: transaction[4],
      loggedInData: transaction[5],
      loggedOutData: transaction[6],
    };
  } catch (error) {
    console.error("Error in updating the user in BlockChain", error);
    return { status: false, message: `Error in updating the value ${error}` };
  }
};

// CreateUser("testing-2", 2, "swa");
// GetUserDeatils(2);

module.exports = {
  CreateUser,
  GetUserDeatils,
  LoggedIn,
  UpdateUser,
  AddPrediction,
};
