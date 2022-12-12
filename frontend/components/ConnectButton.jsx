import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ConnectButton() {
  const { account, isWeb3Enabled, isWeb3EnableLoading, enableWeb3, deactivateWeb3, Moralis } =
    useMoralis();

  useEffect(() => {
    if (window.localStorage.getItem("connected")) enableWeb3();
  }, []);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (!account) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
      }
    });
  });

  return (
    <div>
      <button
        onClick={async () => {
          const retVal = await enableWeb3();
          retVal && window && window.localStorage.setItem("connected", "metamask");
        }}
        disabled={isWeb3Enabled || isWeb3EnableLoading}
        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md disabled:bg-blue-400 disabled:hover:bg-blue-400 transition-all"
      >
        {isWeb3Enabled
          ? `Connected to ${account.slice(0, 6)}...${account.slice(account.length - 6)}`
          : "Connect to MetaMask"}
      </button>
    </div>
  );
}
