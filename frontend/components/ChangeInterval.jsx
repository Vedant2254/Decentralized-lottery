import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import Spinner from "./Spinner";

export default function ChangeIntervalButton({ contractAddress, abi, updateUI }) {
  const [params, setParams] = useState({ interval: "", force: false });
  const [nextInterval, setNextInterval] = useState("");
  const [txLink, setTxLink] = useState(null);

  const {
    runContractFunction: changeInterval,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    contractAddress,
    abi,
    functionName: "changeInterval",
    params,
  });

  async function handleSuccess(tx) {
    await tx.wait(1);
    updateUI();
  }

  const { runContractFunction: getNextInterval } = useWeb3Contract({
    contractAddress,
    abi,
    functionName: "getNextInterval",
    params: {},
  });

  async function handleSuccess(tx) {
    setTxLink(`https://goerli.etherscan.io/tx/${tx.hash}`);
    await tx.wait(1);
    updateUI();
  }

  useEffect(() => {
    (async () => {
      setNextInterval((await getNextInterval()).toString());
    })();
  }, []);

  return (
    <div className="mt-4">
      {txLink ? (
        <button className="w-full bg-yellow-400 hover:bg-yellow-300 p-2 rounded-md disabled:bg-yellow-400 transition-all">
          <Spinner blue={true} />
          <a href={txLink} target="_blank" className="w-full ml-2">
            View Transaction
          </a>
        </button>
      ) : (
        <>
          <div className="flex px-1 mb-1">
            <input
              type="text"
              value={params.interval}
              onChange={(event) => {
                setParams({ ...params, interval: event.target.value });
              }}
              placeholder="Interval (in seconds)"
              className="outline-none w-full border-b-2 mr-2"
            />
            <button
              className={`${
                params.force ? "" : "line-through"
              } bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-md transition-all`}
              onClick={() => {
                setParams({ ...params, force: !params.force });
              }}
            >
              Force
            </button>
          </div>
          <button
            onClick={() => {
              changeInterval({
                onSuccess: handleSuccess,
                onError: (err) => {
                  console.log(err);
                },
              });
            }}
            disabled={isLoading || isFetching}
            className="w-full bg-yellow-400 hover:bg-yellow-300 p-2 rounded-md disabled:bg-yellow-400 transition-all"
          >
            {isLoading || isFetching ? (
              <Spinner blue={true} />
            ) : (
              <div>
                Change Interval <small>(Next interval - {nextInterval})</small>
              </div>
            )}
          </button>
        </>
      )}
    </div>
  );
}
