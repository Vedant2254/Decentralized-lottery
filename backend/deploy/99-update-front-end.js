// this creates abi.json and contractAddress.json files in frontend/constants

const { ethers, network } = require("hardhat");
const fs = require("fs");

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END_CONSTANTS) {
    console.log("Updating frontend...");
    await updateContractAddresses();
    await updateContractABI();
  }
};

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId.toString();
  const FILE_PATH = "../frontend/constants/contractAddresses.json";

  const contractAddresses = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));

  if (contractAddresses[chainId]) {
    contractAddresses[chainId] = raffle.address;
  } else contractAddresses[chainId] = raffle.address;

  fs.writeFileSync(FILE_PATH, JSON.stringify(contractAddresses));
}

async function updateContractABI() {
  const raffle = await ethers.getContract("Raffle");
  const FILE_PATH = "../frontend/constants/abi.json";

  fs.writeFileSync(FILE_PATH, raffle.interface.format(ethers.utils.FormatTypes.json));
}

module.exports.tags = ["all", "frontend"];
