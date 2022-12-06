require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const ACC1_PRIVATE_KEY = process.env.ACC1_PRIVATE_KEY || "";
const ACC2_PRIVATE_KEY = process.env.ACC2_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKET_CAP_KEY = process.env.COINMARKET_CAP_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [ACC1_PRIVATE_KEY, ACC2_PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // ACC1_PRIVATE_KEY
    },
    player: {
      default: 1, // ACC2_PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "INR",
    coinmarketcap: COINMARKET_CAP_KEY,
  },
  mocha: {
    setTimeout: 500000, // 500 seconds max for running tests
  },
};
