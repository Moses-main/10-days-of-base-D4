# 10-days-of-base-D4 (Sub-Account + Spender Permission)

This repository contains two mini dApps that demonstrate Account Abstraction (AA) patterns on Base Sepolia using the Base Account SDK:

- Sub-Account pattern for scoped, safer transactions
- Spender Permission pattern for off-chain signed allowances

Both apps are structured as separate frontend demos plus their corresponding smart contracts (Foundry). Use this README to understand what each folder does in the blockchain ecosystem and find the live links.

## Monorepo Structure

```
.
├─ Spender-Permission/
│  ├─ base-permission-demo/        # Frontend dApp (Vite/React) for creating spend permissions
│  └─ base-spender-contract/       # Foundry smart contract for enforcing spend permissions
│
├─ SubAccount/
│  ├─ base-subaccount-demo/        # Frontend dApp (Vite/React) for connecting and funding via sub-accounts
│  └─ FundMe/                      # Foundry smart contract receiving funds (demo target)
│
├─ .gitmodules                     # Submodule references (if any)
└─ .gitignore
```

---

## Spender-Permission/

### base-permission-demo/ (Frontend)
- Role: React/Vite frontend that connects a Base Account, configures an allowance, and signs a spend-permission off-chain.
- What it demonstrates:
  - Connecting with the Base Account SDK on Base Sepolia
  - Preparing a permission payload (spender/token/allowance/period/etc.)
  - Generating an EIP-712 style signature (off-chain authorization)
  - Passing the signed permission to a backend or contract for on-chain enforcement
- Live URL: https://spender-permission.vercel.app/
- Key files:
  - `src/App.jsx`: Main UI and interaction logic
  - `.env`: Stores configuration values
    - `VITE_BACKEND_WALLET_ADDRESS` — the spender/backend address that will be authorized
    - `VITE_TOKEN_ADDRESS` — the Base Sepolia token address used for the permission

### base-spender-contract/ (Smart Contracts)
- Role: Foundry project containing contracts that verify and enforce a spend permission granted off-chain.
- What it demonstrates:
  - Verifying that a spender has a valid signed permission from an owner
  - Enforcing per-period allowances
  - Typical AA-compatible validation and execution flows
- Typical tools:
  - `forge build`, `forge test`, `forge script` for deploying/testing

How they work together:
- The frontend collects parameters and produces a signed permission.
- The contract validates the signature and enforces the allowance on-chain.

---

## SubAccount/

### base-subaccount-demo/ (Frontend)
- Role: React/Vite frontend that connects a Base Account, detects or creates a sub-account context, and submits a transaction (e.g., fund a contract) from that sub-account.
- What it demonstrates:
  - Using the Base Account SDK with `wallet_getSubAccounts` and `wallet_sendCalls`
  - Submitting a call (encoded ABI) from a sub-account instead of the primary account
  - Clean, minimal UI for connection status and a single action (fund)
- Live URL: https://sub-account.vercel.app/
- Key files:
  - `src/App.jsx`: Main UI and interaction logic
  - `.env`: Stores the demo contract address (e.g., `VITE_CONTRACT_ADDRESS`)

### FundMe/ (Smart Contracts)
- Role: Foundry project for a simple payable contract used as a demo target to receive funds.
- What it demonstrates:
  - A minimal function (`fundMe`) that accepts ETH payments
  - A safe target to verify sub-account calls and see transaction results
- Typical tools:
  - `forge build`, `forge test`, `forge script` for deploying/testing

How they work together:
- The frontend encodes the `fundMe()` call using the ABI and sends it from the chosen sub-account.
- The `FundMe` contract receives and records the funds on-chain, allowing you to validate the sub-account flow end-to-end.

---

## Live Deployments

- Sub-Account Demo: https://sub-account.vercel.app/
- Spender Permission Demo: https://spender-permission.vercel.app/

Both apps target Base Sepolia test network and use the Base Account SDK under the hood.

---

## High-Level Architecture in the Blockchain Ecosystem

- Frontend (dApps):
  - Connect to the user's Base Account via the Base Account SDK
  - Build transaction or permission payloads client-side
  - Request signatures (for on-chain txs or off-chain permissions)

- Off-chain Signatures (Spender Permission):
  - Produce EIP-712 typed data signatures that authorize specific spending rules
  - Keep UX smooth while delaying on-chain execution until needed

- Smart Contracts (Foundry projects):
  - Validate signatures and enforce rules (spender permission)
  - Act as transaction recipients/targets (FundMe)
  - Provide deterministic, repeatable testing and deployment tooling

---

## Local Development (Quick Start)

- Frontend demos (Vite/React):
  1. Install deps: `npm install`
  2. Create `.env` files in each frontend folder:
     - SubAccount demo: `VITE_CONTRACT_ADDRESS=<deployed_fundme_address>`
     - Spender Permission demo: `VITE_BACKEND_WALLET_ADDRESS=<spender_or_backend_address>`
  3. Start dev server: `npm run dev`

- Contracts (Foundry):
  1. Install Foundry: https://book.getfoundry.sh/
  2. Build: `forge build`
  3. Test: `forge test`
  4. Deploy: `forge script` (check each project’s `script/` folder)

---

## Networks

- Chain: Base Sepolia
- SDK: `@base-org/account`

---

## Security & Caveats

- These demos are for educational purposes on a test network.
- Keep private keys and secrets out of the repo.
- Verify addresses before use (`token`, `spender`, `contract`, etc.).
- Move to production only after audits and comprehensive testing.

---

## Helpful Links

- Base Account SDK: https://github.com/base-org
- Foundry (Forge): https://book.getfoundry.sh/
- Base Sepolia: https://docs.base.org/
