import { useState, useEffect } from "react";
import { encodeFunctionData, parseEther } from "viem";
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
        // create the provider
        const providerInstance = sdk.getProvider();
        setProvider(providerInstance);
        setStatus("Ready to Connect");
      } catch (error) {
        console.log("Error creating SDK", error);
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
    setStatus("Connecting to wallet...");

    try {
      // First, connect to the wallet normally
      const accounts = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      });

      // Get the universal account (first connected account)
      const universalAddr = accounts[0];
      setUniversalAccount(universalAddr);

      // Try Base Account SDK methods, but fall back gracefully if not supported
      let subAccountData = null;
      let connectionType = "standard";

      try {
        setStatus("Checking for Base Account support...");

        // Try to get existing sub-accounts
        const subAccountResponse = await provider.request({
          method: "wallet_getSubAccounts",
          params: [
            { accounts: [universalAddr], domain: window.location.origin },
          ],
        });

        // If we get here, Base Account SDK is supported
        const existingSubAccount = subAccountResponse.subAccounts?.[0];
        if (existingSubAccount) {
          subAccountData = existingSubAccount;
          connectionType = "base-account";
          setStatus("Connected with Base Account");
        } else {
          setStatus("Creating Base Account...");

          // Try to create a new sub-account
          const newSubAccount = await provider.request({
            method: "wallet_addSubAccounts",
            params: [{ accounts: [{ type: "create" }] }],
          });

          subAccountData = newSubAccount;
          connectionType = "base-account";
          setStatus("Base Account created successfully");
        }
      } catch (baseAccountError) {
        // Base Account SDK methods not supported - use fallback
        console.log(
          "Base Account SDK not supported, using standard wallet connection"
        );
        connectionType = "fallback";
        setStatus("Connected (Base Account not available)");
      }

      // Set sub-account (will be null for fallback mode)
      setSubAccount(subAccountData);

      // Update connection state
      setConnected(true);

      // Show appropriate success message
      if (connectionType === "base-account") {
        setStatus("Connected with Base Account support");
      } else {
        setStatus("Connected (standard wallet mode)");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);

      // Provide more specific error messages
      if (error.code === -32603) {
        setStatus("Connection failed: Method not supported by wallet");
      } else if (error.code === 4001) {
        setStatus("Connection cancelled by user");
      } else {
        setStatus(`Connection failed: ${error.message || "Unknown error"}`);
      }

      // Reset state on error
      setConnected(false);
      setUniversalAccount("");
      setSubAccount(null);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE THE FUND TRANSACTIONS
  const handleFunds = async () => {
    if (!provider || !subAccount) {
      setStatus("Wallet or Sub Account not ready");
      return;
    }
    setLoading(true);
    setStatus("Encoding contract call");

    try {
      const data = encodeFunctionData({
        abi: FUNDME_ABI,
        functionName: "fundMe",
        args: [],
      });

      const valueInWei = parseEther(FUND_AMOUNT.toString());
      const valueInHex = `0x${valueInWei.toString(16)}`;

      setStatus("Sending transaction from sub account");

      // setting the transaction
      const calltx = await provider.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "2.0",
            from: subAccount.address,
            chainId: `0x${baseSepolia.id.toString(16)}`,
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

      setStatus(`Funded successfully with ${FUND_AMOUNT} ETH from subAccount`);
      console.log("Transaction sent", calltx);
    } catch (error) {
      console.log("Error funding", error);
      setStatus(`Failed to fund: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FundMe Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your blockchain interactions [sub account implementation]
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div
          className={`grid grid-cols-1 ${
            connected ? "lg:grid-cols-2" : ""
          } gap-6 mb-8`}
        >
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center mb-4">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  connected ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Connection Status
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium text-sm ${
                    status.includes("Connected") ||
                    status.includes("successfully")
                      ? "text-green-600"
                      : status.includes("Failed") || status.includes("failed")
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {status || "Initializing..."}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Connected:</span>
                <span
                  className={`font-medium ${
                    connected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {connected ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Loading:</span>
                <span
                  className={`font-medium ${
                    loading ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {loading ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information Card - Only show when connected */}
          {connected && (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Account Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-600 block text-sm mb-1">
                    Universal Account:
                  </span>
                  <span className="font-mono text-xs bg-gray-50 p-2 rounded block break-all">
                    {universalAccount || "Not connected"}
                  </span>
                </div>
                <div className="py-2">
                  <span className="text-gray-600 block text-sm mb-1">
                    Sub Account:
                  </span>
                  <span className="font-mono text-xs bg-gray-50 p-2 rounded block break-all">
                    {subAccount?.address || "Not available"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleConnectWallet}
            disabled={loading || connected}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && !connected ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </span>
            ) : connected ? (
              "✓ Connected"
            ) : (
              "Connect Wallet"
            )}
          </button>

          <button
            onClick={handleFunds}
            disabled={!connected || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && connected ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Funding...
              </span>
            ) : (
              `Fund Contract (${FUND_AMOUNT} ETH)`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Built with Base Account SDK • Powered by Base Sepolia
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
