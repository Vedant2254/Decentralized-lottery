const { assert, expect } = require("chai");
const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let deployer, raffle, vrfCoordinatorV2Mock, interval;
      const netConfig = networkConfig[network.config.chainId];

      beforeEach(async function () {
        // deploy contracts
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        interval = await raffle.getInterval();
      });

      describe("constructor", function () {
        it("Initializes the contract correctly", async function () {
          const vrfCoordinatorV2MockAddress = await raffle.getVRFCoordinatorV2();
          const raffleState = await raffle.getRaffleState();
          const entranceFee = await raffle.getEntranceFee();
          const gasLane = await raffle.getGasLane();
          const callbackGasLimit = await raffle.getCallbackGasLimit();
          const interval = await raffle.getInterval();

          assert.equal(vrfCoordinatorV2MockAddress, vrfCoordinatorV2Mock.address);
          assert.equal(raffleState.toString(), "0");
          assert.equal(entranceFee.toString(), netConfig.entranceFee.toString());
          assert.equal(gasLane, netConfig.gasLane);
          assert.equal(callbackGasLimit, netConfig.callbackGasLimit);
          assert.equal(interval.toString(), netConfig.interval.toString());
        });
      });

      describe("enterRaffle", function () {
        it("Should revert if raffle state is not open", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });

          // Time travelling the blockchain into future XD. Increasing the time to interval + 1
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine");

          // Pretending to be a chainlink automator
          await raffle.performUpkeep([]);
          await expect(raffle.enterRaffle({ value: netConfig.entranceFee })).to.be.revertedWith(
            "Raffle__NotOpen"
          );
        });

        it("Should revert if sent value is less than entrance fee", async function () {
          await expect(
            raffle.enterRaffle({ value: ethers.utils.parseEther("0.001") })
          ).to.be.revertedWith("Raffle__NotEnoughETH");
        });

        it("Stores the player when players enters in the raffle", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });
          const player = await raffle.getPlayer(0);
          assert.equal(player, deployer);
        });

        it("Emits an event when players enters the raffle", async function () {
          await expect(raffle.enterRaffle({ value: netConfig.entranceFee })).to.emit(
            raffle,
            "RaffleEnter"
          );
        });
      });

      describe("checkUpKeep", function () {
        it("Returns false if people haven't sent any ETH", async function () {
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it("Returns false if raffle isn't open", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });

          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine");

          await raffle.performUpkeep([]);
          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          assert.equal(raffleState.toString(), "1");
          assert(!upkeepNeeded);
        });

        it("Returns false if time hasn't passed", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });

          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
          await network.provider.send("evm_mine");

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it("Returns true if raffleIsOpen, timeHasPassed, hasPlayers, ETH", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });

          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine");

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(upkeepNeeded);
        });
      });

      describe("performUpkeep", function () {
        it("Should run only if checkUpkeep returns true", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
          await network.provider.send("evm_mine", []);

          await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpKeepNotNeeded");
        });

        it("Should revert if checkUpkeep returns false", async function () {
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
          await network.provider.send("evm_mine", []);

          await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpKeepNotNeeded");
        });

        it("Should change the raffleState, call i_vrfCoordinator.requestRandomWords and emit an event", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const txRes = await raffle.performUpkeep("0x"); // 0x is same as [] passing empty bytes object
          const txReciept = await txRes.wait(1);

          // here we are getting event at index 1 because VRFCoordinatorV2 also emits an event with a requestId
          // before our event is emitted, so event emitted by VRFCoordinatorV2 is present at index 0 and ours is at index 1
          const { requestId } = txReciept.events[1].args;
          const raffleState = await raffle.getRaffleState();

          assert.equal(raffleState.toString(), "1");
          assert(requestId.toNumber() > 0);
        });
      });

      describe("fulfillRandomWords", function () {
        beforeEach(async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
          await network.provider.send("evm_mine", []);
        });

        it("Can only be called after performUpkeep", async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address, [])
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address, [])
          ).to.be.revertedWith("nonexistent request");
        });

        it("Picks a winner, resets storage variables, and sends ETH to the winner", async function () {
          const additionalEntrants = 3;
          const accounts = await ethers.getSigners();
          for (let i = 1; i <= additionalEntrants; i++) {
            const accConnRaffle = await raffle.connect(accounts[i]);
            await accConnRaffle.enterRaffle({ value: netConfig.entranceFee });
          }
          const initialTimeStamp = await raffle.getLatestTimeStamp();

          // Using promise here, because we don't want the test to end before our event is triggered
          await new Promise(async (resolve, reject) => {
            // declaring a listener for WinnerPicked event
            raffle.once("WinnerPicked", async () => {
              try {
                const recentWinner = await raffle.getRecentWinner();
                const winnerEndingBalance = await accounts[1].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();
                const raffleState = await raffle.getRaffleState();
                const playerCount = await raffle.getPlayerCount();
                assert.equal(playerCount.toString(), "0");
                assert.equal(raffleState.toString(), "0");
                assert(endingTimeStamp > initialTimeStamp);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance
                    .add(netConfig.entranceFee.mul(additionalEntrants).add(netConfig.entranceFee))
                    .toString()
                );
              } catch (e) {
                reject(e);
              }
              resolve();
            });

            // this code will trigger WinnerPicked event
            // executes performUpkeep and takes the requestId
            // passes the requestId and contract address (consumer) to fulfillRandomWords
            // We are simply simulation the Chainlink automator and chainlink VRF
            const txRes = await raffle.performUpkeep("0x");
            const txReciept = await txRes.wait(1);
            const winnerStartingBalance = await accounts[1].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReciept.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });

      describe("changeInterval", function () {
        it("Check if reverts if sender is not owner", async function () {
          const player = (await ethers.getSigners())[1];
          const playerConnectedContract = await ethers.getContract("Raffle", player);

          await expect(playerConnectedContract.changeInterval("50")).to.be.revertedWith(
            "Raffle__NotOwner"
          );
        });

        it("Check if performUpkeep is performed before changing the interval and interval is changed", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          await new Promise(async (resolve, reject) => {
            raffle.once("RequestedRaffleWinner", async () => {
              try {
                assert.equal((await raffle.getInterval()).toString(), "50");
              } catch (e) {
                reject(e);
              }
              resolve();
            });
            await raffle.changeInterval("50");
          });
        });

        it("Interval changes if upkeepNeeded is false", async function () {
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
          await network.provider.send("evm_mine", []);

          await raffle.changeInterval("70");
          assert.equal((await raffle.getInterval()).toString(), "70");
        });

        it("Interval changes take effect", async function () {
          await raffle.changeInterval("100");

          await raffle.enterRaffle({ value: netConfig.entranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          assert(!upkeepNeeded);
        });
      });

      describe("isPlayerEntered", function () {
        it("Returns true when player is in the Raffle", async function () {
          await raffle.enterRaffle({ value: netConfig.entranceFee });

          const retVal = await raffle.isPlayerEntered(deployer);
          assert(retVal);
        });

        it("Returns false when player is not in the Raffle", async function () {
          const retVal = await raffle.isPlayerEntered(deployer);
          assert(!retVal);
        });
      });
    });
