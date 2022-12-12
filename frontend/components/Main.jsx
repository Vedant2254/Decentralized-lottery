import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import EnterRaffleButton from "./EnterRaffleButton";
import { contractAddresses, abi } from "../constants/index";
import RaffleDetails from "./RaffleDetails";

export default function Main() {
  const { account, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const contractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const initialRaffleState = {
    entranceFee: "0",
    playerCount: null,
    recentWinner: null,
    playerEntered: null,
  };

  const [raffleState, setRaffleState] = useState(initialRaffleState);

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getPlayerCount } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getPlayerCount",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const { runContractFunction: isPlayerEntered, data } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "isPlayerEntered",
    params: { player: account },
  });

  const enterRaffle = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: raffleState.entranceFee,
  });

  async function updateUI() {
    if (isWeb3Enabled) {
      try {
        setRaffleState(initialRaffleState);

        const currEntranceFee = (await getEntranceFee()).toString();
        const currPlayerCount = (await getPlayerCount()).toString();
        const currRecentWinner = (await getRecentWinner()).toString();
        const currPlayerEntered = await isPlayerEntered();

        setRaffleState({
          entranceFee: currEntranceFee,
          playerCount: currPlayerCount,
          recentWinner: currRecentWinner,
          playerEntered: currPlayerEntered,
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  useEffect(() => {
    updateUI();
  }, [isWeb3Enabled, chainIdHex, account]);

  return (
    <div className="m-6 min-w-fit w-60 mx-auto">
      {isWeb3Enabled ? (
        contractAddress ? (
          <>
            <EnterRaffleButton enterRaffle={enterRaffle} updateUI={updateUI} />
            <RaffleDetails raffleState={raffleState} />
          </>
        ) : (
          `${chainId} chain id not supported!`
        )
      ) : (
        "Use the connect button above to connect your wallet to website!"
      )}
    </div>
  );
}
