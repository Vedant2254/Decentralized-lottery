import React, { useState } from "react";
import { Check, useNotification } from "web3uikit";
import Spinner from "./Spinner";

export default function EnterRaffleButton({ enterRaffle, updateUI }) {
  const { runContractFunction, isLoading, isFetching } = enterRaffle;
  const dispatch = useNotification();
  let [txLink, setTxLink] = useState(null);

  function showStatusNotification() {
    dispatch({
      type: "info",
      title: (
        <a href={txLink} target="_blank">
          Transaction
        </a>
      ),
      message: (
        <a href={txLink} target="_blank">
          View Transaction
        </a>
      ),
      position: "topR",
    });
  }

  function showSuccessNotification() {
    dispatch({
      type: "success",
      title: "Transaction",
      message: "Transaction Complete!",
      icon: <Check />,
      position: "topR",
    });
  }

  function showErrorNotification(message) {
    dispatch({
      type: "error",
      title: "Transaction",
      message,
      position: "bottomR",
    });
  }

  async function handleSuccess(tx) {
    try {
      setTxLink(`https://goerli.etherscan.io/tx/${tx.hash}`);
      showStatusNotification();
      await tx.wait(1);
      setTxLink(null);
      updateUI();
      showSuccessNotification();
    } catch (e) {
      setTxLink(null);
      showErrorNotification("Transaction Failed!");
    }
  }

  async function handleError(err) {
    let emsg = err.error ? err.error : err;
    emsg = emsg.message || "Some error occured!";

    showErrorNotification(emsg);
  }

  return (
    <>
      {txLink ? (
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md disabled:bg-blue-400 disabled:hover:bg-blue-400 transition-all">
          <a href={txLink} target="_blank" className="w-full">
            View Transaction
          </a>
        </button>
      ) : (
        <button
          onClick={() => {
            runContractFunction({
              onSuccess: handleSuccess,
              onError: handleError,
            });
          }}
          disabled={isLoading || isFetching}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md disabled:bg-blue-400 disabled:hover:bg-blue-400 transition-all"
        >
          {isLoading || isFetching ? <Spinner /> : "Enter Raffle"}
        </button>
      )}
    </>
  );
}
