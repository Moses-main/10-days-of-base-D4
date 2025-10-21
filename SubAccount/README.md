# 10-Days-of-Base-D4 (Sub-Account)

A full-stack Web3 application demonstrating Base blockchain integration with a funding smart contract and React frontend.

## 📋 Overview

This project consists of two main components:

1. **FundMe Smart Contract** - A Solidity contract deployed on Base that allows users to fund it with ETH
2. **Base Subaccount Demo** - A React frontend that interacts with Base blockchain and smart contracts

## 🏗️ Architecture

```
10-days-of-base-D4-(sub-account)/
├── FundMe/                 # Solidity smart contract project
│   ├── src/
│   │   └── FundMe.sol     # Main funding contract
│   ├── lib/               # Foundry dependencies
│   └── foundry.toml       # Foundry configuration
└── base-subaccount-demo/   # React frontend
    ├── src/
    │   ├── App.jsx        # Main React component
    │   └── main.jsx       # React app entry point
    ├── public/            # Static assets
    └── package.json       # Node.js dependencies
```

## 🔧 Tech Stack

### Smart Contract (FundMe)

- **Solidity**: Smart contract development
- **Foundry**: Development framework, testing, and deployment
- **Base Blockchain**: Layer 2 Ethereum scaling solution

### Frontend (base-subaccount-demo)

- **React 19**: Modern React framework
- **Vite**: Fast build tool and dev server
- **Viem**: Ethereum library for blockchain interactions
- **Base Account SDK**: Base blockchain account management
- **Tailwind CSS**: Utility-first CSS framework

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Foundry (for Solidity development)
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd 10-days-of-base-D4-(sub-account)
```

### 2. Setup Frontend

```bash
cd base-subaccount-demo
npm install
```

### 3. Setup Smart Contract (Optional - for development)

```bash
cd ../FundMe
forge install
```

## 🏃‍♂️ Running the Application

### Frontend Development Server

```bash
cd base-subaccount-demo
npm run dev
```

The React app will be available at `http://localhost:5173`

### Smart Contract Development (Optional)

```bash
cd FundMe
# Start local Anvil node (for testing)
anvil

# In another terminal, deploy contracts
forge create src/FundMe.sol:FundMe --rpc-url http://localhost:8545 --private-key <your-private-key>
```

## 💡 Key Features

### FundMe Smart Contract

The `FundMe` contract provides basic funding functionality:

```solidity
contract FundMe {
    function fundMe() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

**Features:**

- Accepts ETH payments through `fundMe()` function
- Tracks contract balance with `getBalance()`
- Prevents accidental ETH sends through `receive()` fallback

### React Frontend

The frontend integrates with Base blockchain using:

- **Viem**: For blockchain communication
- **Base Account SDK**: For account management
- **Real-time Balance**: Fetches and displays wallet balances

```jsx
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Fetch balance from Base address
const balance = await publicClient.getBalance({
  address: "0x129918F79fB60dc1AC3f07316f0683f9Fa356178",
});
```

## 🔗 Integration

The React app is designed to interact with the FundMe smart contract deployed on Base. The current implementation demonstrates:

1. **Blockchain Connection**: Establishes connection to Base network
2. **Balance Queries**: Fetches account balances
3. **Account Management**: Uses Base Account SDK for wallet integration

## 🛠️ Development Commands

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Smart Contract

```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Format code
forge fmt

# Start local node
anvil

# Deploy to network
forge create src/FundMe.sol:FundMe --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

## 🌐 Networks

- **Base Mainnet**: Production Base blockchain
- **Base Sepolia**: Testnet for development
- **Local Anvil**: Local development network (when using Foundry)

## 📚 Project Structure

### FundMe Contract Features

- **fundMe()**: Accepts ETH payments with validation
- **getBalance()**: Returns current contract balance
- **receive()**: Prevents accidental ETH transfers

### Frontend Components

- **App.jsx**: Main component with Base blockchain integration
- **Viem Integration**: Direct blockchain communication
- **Base Account SDK**: Account and wallet management

## 🔒 Security Considerations

- Contract includes input validation (`require(msg.value > 0)`)
- Frontend uses established libraries for blockchain interactions
- Consider audit before mainnet deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a learning series. Please check individual component licenses.

## 🆘 Support

For issues and questions:

1. Check existing documentation
2. Review code comments
3. Create GitHub issue with detailed description

---

**Note**: This project demonstrates Base blockchain development patterns and smart contract integration with React frontends.
