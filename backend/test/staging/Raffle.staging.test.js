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

      describe("checkUpkeep", function () {
        it("Check if checkUpkeep returns true when all conditions are satisfied", async function () {
          const txRes = await raffle.enterRaffle({ value: entranceFee });
          console.log(txRes.hash);
          await txRes.wait(2);

          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          assert(upkeepNeeded, `Value of upkeepNeeded is ${upkeepNeeded}`);
        });
      });

      describe("performUpkeep", function () {
        it("Check if performUpkeep runs when checkUpkeep is true else reverts", async function () {
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");

          upkeepNeeded
            ? await expect(raffle.performUpkeep("0x")).not.to.be.reverted
            : await expect(raffle.performUpkeep("0x")).to.be.revertedWith(
                "Raffle__UpKeepNotNeeded"
              );
        });
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

      describe("changeInterval", function () {
        it("Check if performUpkeep is performed before changing the interval and interval is changed", async function () {
          let txRes = await raffle.enterRaffle({ value: netConfig.entranceFee });
          console.log(txRes.hash);
          await txRes.wait(1);

          await new Promise(async (resolve, reject) => {
            raffle.once("RequestedRaffleWinner", async () => {
              try {
                console.log("Event triggered...");
                assert.equal((await raffle.getInterval()).toString(), "50");
              } catch (e) {
                reject(e);
              }
              resolve();
            });
            console.log("Changing interval...");
            txRes = await raffle.changeInterval("50");
            console.log(txRes.hash);
          });
        });
      });
    });
