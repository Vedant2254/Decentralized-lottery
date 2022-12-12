# Tools used for this project

## Tools

1. Solidity
2. Javascript
3. Hardhat
4. Chainlink

## Modules

1.  Deploy, verify and test scripts

    ```js
    const { ethers, network, run, deployments, getNamedAccounts } = require("hardhat");
    const { assert, expect } = require("chai");
    ```

2.  In hardhat.config.js

    ```js
    require("@nomiclabs/hardhat-waffle");
    require("@nomiclabs/hardhat-etherscan");
    require("hardhat-deploy");
    require("solidity-coverage");
    require("hardhat-gas-reporter");
    require("hardhat-contract-sizer");
    require("dotenv").config();
    ```
