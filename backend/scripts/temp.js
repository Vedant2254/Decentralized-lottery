const { network } = require("hardhat");

(async () => {
  const trace = await network.provider.send("debug_traceTransaction", [
    "0xcc454aa73563f7b97237e5ab1ed0859f0eaeea6abea666542e0455b43d97ace6",
  ]);

  const mine = await network.provider.send("evm_mine");
  const blocknumber = await network.provider.send("eth_blockNumber");

  // console.log(trace);
  // console.log(mine);
  console.log(parseInt(blocknumber));
})();
