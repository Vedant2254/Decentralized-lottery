const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  const { deployer } = await getNamedAccounts();
  const contract = await ethers.getContractAt(
    "Raffle",
    "0xF8e55E1140Afa9D908758a508c6889e0711872eb",
    deployer
  );

  /* Adding player to the raffle */
  // console.log("Entering the raffle...");
  // const { entranceFee } = await networkConfig[network.config.chainId];
  // const txRes = await contract.enterRaffle({ value: entranceFee });
  // console.log(`Transaction hash: ${txRes.hash}`);
  // const txReciept = await txRes.wait(2);

  /* Checking upkeepNeeded */
  // console.log("Checking upkeepNeeded");
  // const { upkeepNeeded } = await contract.checkUpkeep([]);
  // console.log(upkeepNeeded);

  /* Calling performUpkeep */
  // const txRes = await contract.performUpkeep("0x");
  // console.log(`Transaction hash: ${txRes.hash}`);
  // const txReciept = await txRes.wait(1);
}

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.log(e);
  });
