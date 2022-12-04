const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // took it from https://docs.chain.link/vrf/v2/direct-funding/supported-networks#goerli-testnet
const GAS_PRICE_LINK = 1e9; // chainlink does some computation for us, to avoid over usage of gas, this is the gas limit set by chainlink, it changes from blockchain to blockchain

module.exports = !developmentChains.includes(network.name)
  ? skip
  : async ({ getNamedAccounts, deployments }) => {
      const { deploy, log } = deployments;
      const { deployer } = await getNamedAccounts();

      log("Local network detected! Deploying mocks...");

      await deploy("VRFCoordinatorV2Mock", {
        from: deployer,
        log: true,
        args: [BASE_FEE, GAS_PRICE_LINK],
      });

      log("Mocks deployed");
      log("-------------------------------------------");
    };

module.exports.tags = ["all", "mocks"];
