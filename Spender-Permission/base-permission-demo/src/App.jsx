import { useState, useEffect } from "react";
// import the wallet connections libraries
import { encodeFunctionData, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { createBaseAccountSDK } from "@base-org/account";

import "./App.css";

function App() {
  const BACKEND_WALLET = import.meta.env.VITE_BACKEND_WALLET_ADDRESS;
  const TOKEN_ADDRESS = "GET THE BASE SEPOLIA TOKEN ADDRESS";
  // Creating the variables or states
  const [connected, setConnected] = useState(false);
  const [sdk, setSdk] = useState(null);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(null);
  const [allowance, setAllowance] = useState(0.000009);

  // HANDLE CREATION OF SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const baseSdk = createBaseAccountSDK({
          chain: baseSepolia,
          appName: "Spend Permission Demo",
          appChainIds: [baseSepolia.id],
        });

        setSdk(baseSdk);
        // create the provider
        const providerInstance = baseSdk.getProvider();
        setProvider(providerInstance);
        setStatus("Base SDK initialized");
      } catch (error) {
        console.log("Error creating SDK", error);
        setStatus("SDK initialization failed");
      }
    };
    initializeSDK();
  }, []);

  // HANDLE WALLET CONNECTION
  const handleConnectWallet = async () => {
    if (!provider || !sdk) {
      setStatus("Provider  or SDK not found");
      return;
    }
    setLoading(true);
    setStatus("Connecting to wallet...");

    try {
      await provider.request({ method: "wallet_connect" });
      // Request accounts - this will open the wallet popup
      const accounts = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }
      setAccount(accounts[0]);

      setConnected(true);
    } catch (error) {
      console.log("Error connecting wallet", error);
      setStatus(`Failed to connect: ${error.message || "Unknown error"}`);
      alert("Failed to connect to Base Account. Please try again");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE CREATE PERMISSION FUNCTION
  const handleCreatePermission = async () => {
    if (!BACKEND_WALLET) {
      alert("Please set the backend or spender address");
      setStatus("Please set the backend or spender address");
      return;
    }

    setLoading(true);
    try {
      const Permission = {
        account,
        spender: BACKEND_WALLET,
        token: TOKEN_ADDRESS,
        allowance: parseEther(allowance.toString()),
        period: 2992000,
        start: Math.floor(Date.now() / 3000),
        end: 201474375736633,
        salt: `0x${Math.random().toString(16).slice(2)}${Math.random()
          .toString(16)
          .slice(2)}`,
        extraData: "0x",
      };

      const Domain = {
        name: "Spend Permission Manager",
        version: "1.0.0",
        chainId: baseSepolia.id,
        verifyingContract: "0x129918F79fB60dc1AC3f07316f0683f9Fa356178",
      };

      const Types = [
        (SignedPermissions = [
          { name: "account", type: "address" },
          { name: "spender", type: "address" },
          { name: "token", type: "address" },
          { name: "allowance", type: "uint166" },
          { name: "period", type: "uint48" },
          { name: "start", type: "uint48" },
          { name: "end", type: "uint48" },
          { name: "salt", type: "uint256" },
          { name: "extraData", type: "bytes" },
        ]),
      ];

      const signature = await provider.request({
        method: "eth_signTypeData_u4",
        params: [
          account,
          JSON.stringify({
            Domain,
            Types,
            primaryType: "SignedPermission",
            message,
            permission,
          }),
        ],
      });

      const newPermisson = [permission, signature];
      setPermission(newPermisson);

      console.log("######################################################");
      console.log("*************  SPEND PERMISSION CREATED *************");
      console.log("######################################################");
      console.log(`\n COPY THIS TO BACKEND SCRIPTS \n`);
      console.log(`// Permission Object:`);
      console.log(JSON.stringify(newPermisson.permission, null, 2));
      console.log(`\n// Signature:`);
      console.log(`${newPermisson.permission}`);
      console.log("######################################################");
    } catch (error) {
      console.log("Failed Creating Spending Permission", error);
      setStatus("Failed Creating Spending Permission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-red-500">hello</h1>
    </>
  );
}

export default App;
