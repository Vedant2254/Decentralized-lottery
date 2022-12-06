const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMT = ethers.utils.parseEther("100");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  /* Setting up args */
  let vrfCoordinatorV2Mock, vrfCoordinatorV2Address, subscriptionId;
  let { entranceFee, gasLane, callbackGasLimit, interval } = networkConfig[chainId];

  if (developmentChains.includes(network.name)) {
    // address - createSubscription - get subscriptionId from event - fund subscriptionId - add consumer
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const txRes = await vrfCoordinatorV2Mock.createSubscription();
    const txReciept = await txRes.wait(1);
    subscriptionId = txReciept.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  let args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane, // keyHash
    subscriptionId,
    callbackGasLimit,
    interval,
  ];

  /* Deploying */
  const raffle = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  /* Adding raffle contract as a consumer on vrfCoordinatorV2Mock only if on developmentChain */
  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
  }

  /* Verifying contract if not on development chain and etherscan api key is present */
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(raffle.address, args);
  }

  log("Raffle deployed");
  log("-------------------------------------------");
};

module.exports.tags = ["all", "raffle"];
