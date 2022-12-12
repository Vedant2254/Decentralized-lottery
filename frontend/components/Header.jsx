import ConnectButton from "./ConnectButton";
// import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <div className="flex flex-row justify-between border-b-2">
      <h1 className="m-6 text-3xl">Decentralized Raffle</h1>
      <div className="m-6">
        <ConnectButton />
      </div>
    </div>
  );
}
