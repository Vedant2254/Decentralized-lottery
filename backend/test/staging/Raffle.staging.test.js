const { assert, expect } = require("chai");
const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let deployer, raffle, entranceFee;
      const netConfig = networkConfig[network.config.chainId];

      beforeEach(async function () {
        // deploy contracts
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        entranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("Works with live Chainlink automators and Chainlink VRF, we get a random winner", async function () {
          const startingTimeStamp = raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();

          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event triggered...");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(raffleState.toString(), "0");
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(entranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
              resolve();
            });

            const txRes = await raffle.enterRaffle({ value: entranceFee });
            console.log(txRes);
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
