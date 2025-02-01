// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserDetails{
    uint256 private numOfUsers;

    constructor (){
        numOfUsers = 0;
    }

    struct User{
        uint256 userID;
        string email;
        string userData;
        string [] rawData;
        string [] predictedData;  
        string [] userLoggedInData;
        string [] userLoggedOutData;
    }

    event userCreated(
        uint256 indexed userID,
        string indexed email
    );

    event userUpdated(
        uint256 indexed userUpdated,
        string indexed email
    );

    mapping (uint256 => User) private Users;

    modifier userMustExist(uint256 userID) {
        require(bytes(Users[userID].email).length != 0, "User does not exist!");
        _;
    }

    modifier userMustNotExist(uint256 userID) {
        require(bytes(Users[userID].email).length == 0, "User already exists!");
        _;
    }

    function createUser(string memory userData, uint256 userID,string memory email) public userMustNotExist(userID) {
        string [] memory rawData;
        string [] memory predictedData;
        string [] memory userLoggedInData;
        string [] memory userLoggedOutData;
        Users[userID] = User(
            userID,
            email,
            userData,
            rawData,
            predictedData,
            userLoggedInData,
            userLoggedOutData
        );

        emit userCreated(
            userID,
            email
        );
        numOfUsers++;
    }

    function updateUser(string memory email,uint256 userID,string memory userData) public userMustExist(userID){
        // require(Users[userID].userID != 0,"User Doesn't exist");
        Users[userID].email = email;
        Users[userID].userData = userData;

        emit userUpdated(userID, email);
    }

    function addLoggedData(uint256 userID,string memory LoggedIn,string memory LoggedOut) public userMustExist(userID) {
        // require(Users[userID].userID != 0,"User Doesn't exist");
        Users[userID].userLoggedInData.push(LoggedIn);
        Users[userID].userLoggedOutData.push(LoggedOut);
    }



    function addPrediction(string memory rawData,string memory predictedData,uint256 userID) public userMustExist(userID) {
        // require(Users[userID].userID != 0,"User Doesn't exist");
       Users[userID].rawData.push(rawData);        
       Users[userID].predictedData.push(predictedData);
    }

    function getUserDetails(uint256 userID) public userMustExist(userID) view returns (uint256 ,string memory, string memory,string [] memory,string [] memory,string [] memory,string [] memory) {
        
        return (
            Users[userID].userID,
            Users[userID].email,
            Users[userID].userData,
            Users[userID].rawData,
            Users[userID].predictedData,
            Users[userID].userLoggedInData,
            Users[userID].userLoggedOutData
        );
    }
}