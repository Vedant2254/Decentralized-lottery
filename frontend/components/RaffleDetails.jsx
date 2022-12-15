import React from "react";
import { ethers } from "ethers";
import Spinner from "./Spinner";

export default function RaffleDetails({
  raffleState: { entranceFee, playerCount, recentWinner, playerEntered, interval },
}) {
  return (
    <div className="mt-4 p-4 w-full rounded-xl bg-blue-100">
      {entranceFee == "0" ? (
        <div className="flex justify-center">
          <Spinner size={6} blue={true} />
        </div>
      ) : (
        <div>
          Entrace fee: {ethers.utils.formatEther(entranceFee)} ETH
          <br /> Number of players: {playerCount}
          <br /> Recent Winner: {recentWinner}
          <br /> Raffle Interval:{" "}
          {interval < 3600 ? `${interval} seconds` : `${interval / 60 / 60} hour(s)`}
          {playerEntered != null && (
            <p className={playerEntered ? "text-green-600" : "text-red-600"}>
              {playerEntered ? "You have entered the raffle!" : "You have not entered the raffle!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
