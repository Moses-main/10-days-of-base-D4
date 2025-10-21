import { useState, useEffect, version } from "react";
import "./App.css";
import { createPublicClient, encodeFunctionData, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { createBaseAccountSDK } from "@base-org/account";

function App() {
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const FUND_AMOUNT = 0.000006;
  const FUNDME_ABI = [
    {
      inputs: [],
      name: "fundMe",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];

  const [connected, setConnected] = useState(false);
  const [universalAccount, setUniversalAccount] = useState("");
  const [subAccount, setSubAccount] = useState(null);
  const [status, setStatus] = useState("");

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  // HANDLE CREATION OF SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdk = createBaseAccountSDK({
          chain: baseSepolia,
          appName: "FundMe-Demo",
          appChainIds: [baseSepolia.id],
        });
        // create the provicder
        const providerInstance = sdk.getProvider();
        setProvider(providerInstance);
        setStatus("Ready to Connect");
      } catch (error) {
        console.log(error("Error creating SDK"), error);
        setStatus("SDK initialization failed");
      }
    };
    initializeSDK();
  }, []);

  // HANDLE WALLET CONNECTION
  const handleConnectWallet = async () => {
    if (!provider) {
      setStatus("Provider not found");
      return;
    }
    setLoading(true);
    setStatus("Connecting... to base account");

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      });

      // get the universal account which is the first account
      // that is connected when connected to the wallet
      const universalAddr = accounts[0];
      setUniversalAccount(universalAddr);

      // getting the sub account then
      setStatus("Checking for existing subAccounts");

      const response = await provider.request({
        method: "wallet_getSubAccounts",
        params: [{ accounts: universalAddr, domain: Window.location.origin }],
      });

      // fetch the sub account and set
      const existingSubAccount = response.subAccount[0];
      if (existingSubAccount) {
        setSubAccount(existingSubAccount);
        setStatus("Connected, subAccount Ready");
      } else {
        setStatus("Creating subAccounts");
        const newSubAccount = await provider.request({
          method: "wallet_addSubAccounts",
          params: [{ accounts: { type: "create" } }],
        });

        setSubAccount(newSubAccount);
        setStatus("Connected: SubAccount Created and Ready");
      }

      setStatus("Connected to base account");
    } catch (error) {
      console.log(error("Error connecting wallet"), error);
      setStatus("Failed to connect to base account");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE THE FUND TRANSACTIONS
  const handleFunds = async () => {
    if (!provider || !subAccount) {
      throw new Error("Wallet or Sub Account not ready");
    }
    setStatus("Encoding contract call");
    const data = encodeFunctionData({
      abi: FUNDME_ABI,
      functionName: "FundMe",
      args: [],
    });

    const valueInWei = parseEther(FUND_AMOUNT.toString());
    const valueInHex = `0x${valueInWei.toString(16)}`;

    setStatus("Sending transaction from sub account");
    try {
      // setting the transaction
      const calltx = await provider.request({
        method: "wallet_sendCalls",

        params: [
          {
            version: "2.0",
            from: subAccount.address,
            chainid: `0x${baseSepolia.id.toString(16)}`,
            calls: [
              {
                to: CONTRACT_ADDRESS,
                data: data,
                value: valueInHex,
              },
            ],
          },
        ],
      });

      setStatus(`Funded successfully with ${FUND_AMOUNT} from subAccount`);
      console.log("Transaction sent", calltx);
    } catch (error) {
      console.log(error("Error funding"), error);
      setStatus("Failed to fund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <h1 className="text-2xl font-bold">{status}</h1>
      <button
        onClick={handleConnectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Connect Wallet
      </button>
      <button
        onClick={handleFunds}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Fund
      </button> */}
    </>
  );
}

export default App;
