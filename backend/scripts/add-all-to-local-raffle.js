const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  const raffle = await ethers.getContract("Raffle");

  for (let i = 0; i < accounts.length; i++) {
    const connectedRaffle = await raffle.connect(accounts[i]);
    await (await connectedRaffle.enterRaffle({ value: ethers.utils.parseEther("9998") })).wait(1);
  }
}

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.log(e);
  });
