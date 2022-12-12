const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
  const raffle = await ethers.getContract("Raffle", deployer);

  await network.provider.send("evm_increaseTime", [31]);
  await network.provider.send("evm_mine", []);

  const txRes = await raffle.performUpkeep("0x");
  const txReciept = await txRes.wait(1);

  await vrfCoordinatorV2Mock.fulfillRandomWords(txReciept.events[1].args.requestId, raffle.address);
}

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.log(e);
  });
