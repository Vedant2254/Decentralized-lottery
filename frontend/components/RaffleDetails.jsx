import React from "react";
import { ethers } from "ethers";
import Spinner from "./Spinner";

export default function RaffleDetails({
  raffleState: { entranceFee, playerCount, recentWinner, playerEntered },
}) {
  return (
    <div className="mt-4 p-4 w-full rounded-xl bg-blue-100">
      Entrace fee:{" "}
      {entranceFee != "0" ? (
        `${ethers.utils.formatEther(entranceFee)} ETH`
      ) : (
        <Spinner blue={true} />
      )}
      <br /> Number of players: {playerCount || <Spinner blue={true} />}
      <br /> Recent Winner: {recentWinner || <Spinner blue={true} />}
      <br />{" "}
      {playerEntered != null && (
        <p className={playerEntered ? "text-green-600" : "text-red-600"}>
          {playerEntered ? "You have entered the raffle!" : "You have not entered the raffle!"}
        </p>
      )}
    </div>
  );
}
