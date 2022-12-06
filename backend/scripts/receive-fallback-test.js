const { ethers, getNamedAccounts, network, deployments } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  await deployments.fixture(["all"]);

  const user = (await ethers.getSigners())[0];
  const contract = await ethers.getContract("Raffle", user);

  const nonce = await user.getTransactionCount();
  const tx = {
    nonce: nonce,
    gasPrice: 20000000000,
    gasLimit: 1000000,
    to: null,
    value: 0,
    data: `0x`,
    chainId: 1337,
  };

  console.log((await user.getBalance()).toString());

  const txRes = await user.provider.sendTransaction(tx);
  const txReciept = await txRes.wait(1);

  console.log((await user.getBalance()).toString());
}

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.log(e);
  });
