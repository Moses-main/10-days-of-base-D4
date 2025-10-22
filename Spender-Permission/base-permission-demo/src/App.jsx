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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Spend Permission Demo</h1>
              <p className="text-xs text-neutral-400">Base Sepolia • Minimal UI</p>
            </div>
          </div>

          <button
            onClick={handleConnectWallet}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2 text-sm transition-colors ${
              connected
                ? "bg-neutral-900 hover:bg-neutral-800"
                : "bg-blue-600 hover:bg-blue-500"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full mr-1 ${connected ? 'bg-emerald-400' : 'bg-neutral-400'}`}
            ></span>
            {loading ? "Connecting..." : connected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </header>

        <main className="space-y-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-medium">Connection</h2>
                <p className="text-sm text-neutral-400">Use Base Account SDK to connect your wallet.</p>
              </div>
              <span className={`text-xs rounded-full px-2 py-1 border ${
                connected ? "border-emerald-600 text-emerald-400" : "border-neutral-700 text-neutral-400"
              }`}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Account</span>
                <span className="font-mono text-neutral-200 truncate max-w-[60%] text-right">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Status</span>
                <span className="text-neutral-300">{status || "—"}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-medium">Spend Permission</h2>
              <p className="text-sm text-neutral-400">Define an allowance and sign to create a permission.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-neutral-300">Allowance (ETH)</label>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value))}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-500 text-neutral-100"
                    placeholder="0.000000"
                  />
                  <span className="text-xs text-neutral-500">ETH</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-neutral-300">Spender</label>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm font-mono text-neutral-300 truncate">
                  {BACKEND_WALLET ? `${BACKEND_WALLET.slice(0, 6)}...${BACKEND_WALLET.slice(-4)}` : "Set VITE_BACKEND_WALLET_ADDRESS"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreatePermission}
                disabled={!connected || loading || !BACKEND_WALLET}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                {loading ? "Processing" : "Create Permission"}
              </button>

              {!connected && (
                <span className="text-xs text-amber-400">Connect your wallet to proceed.</span>
              )}
              {connected && !BACKEND_WALLET && (
                <span className="text-xs text-amber-400">Backend spender address is not configured.</span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium">Output</h2>
              <span className="text-xs text-neutral-500">Console also logs details</span>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs font-mono text-neutral-300 max-h-56 overflow-auto">
              {permission ? (
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(permission, null, 2)}</pre>
              ) : (
                <div className="text-neutral-500">No permission created yet.</div>
              )}
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-xs text-neutral-500">
          Built with Base Account SDK • Tailwind UI
        </footer>
      </div>
    </div>
  );
}

export default App;
