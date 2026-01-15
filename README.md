# ZK Invoice Platform

A privacy-preserving invoice management platform built on **Mantle Network** with **Zero-Knowledge KYC verification**. Users can create, manage, and pay invoices while maintaining regulatory compliance through ZK proofs that verify identity without revealing sensitive personal information.

## 🌟 Features

- **Zero-Knowledge KYC**: Verify identity compliance without exposing personal data
- **Privacy-Preserving Invoices**: Create and manage invoices with encrypted business data
- **On-Chain Verification**: Smart contracts verify KYC status and process payments
- **Mantle Network**: Built on Mantle Sepolia Testnet for low gas fees
- **Web3 Wallet Integration**: Connect with MetaMask via RainbowKit

## 🏗️ Architecture

```
zk-invoice-4/
├── circuits/          # Circom ZK circuits for KYC verification
├── contracts/         # Solidity smart contracts
└── frontend/          # Next.js web application
```

### Smart Contracts

| Contract | Address (Mantle Sepolia) | Description |
|----------|-------------------------|-------------|
| ZKKYCRegistry | `0x66945d47d4f2b582E6dEc601d4f7E3ebd50d7230` | Manages KYC submissions and verifications |
| InvoiceManager | `0x06e56a9A77a226733e6122a5254d87F7485BD7C1` | Handles invoice creation and payments |
| KYCVerifier | `0x4ee40b8851e87294712Ff498d2eccb481004BA09` | Verifies ZK proofs on-chain |

### ZK Circuits

The `circuits/kyc.circom` implements:
- **Identity Commitment**: Poseidon hash of personal details (name, DOB, country, document)
- **Age Verification**: Proves user is above minimum age without revealing birth date
- **Country Allowlist**: Verifies country is in approved list without revealing which country

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask wallet
- MNT tokens on Mantle Sepolia (get from [faucet](https://faucet.sepolia.mantle.xyz))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zk-invoice-4

# Install dependencies for all packages
npm install
cd contracts && npm install
cd ../frontend && npm install
```

### Configuration

1. **Contracts** - Create `contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
```

2. **Frontend** - Create `frontend/.env.local` (optional, defaults are set):
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ZK_KYC_REGISTRY_ADDRESS=0x66945d47d4f2b582E6dEc601d4f7E3ebd50d7230
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0x06e56a9A77a226733e6122a5254d87F7485BD7C1
```

### Running the Application

```bash
# Start the frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Mantle Sepolia
npx hardhat ignition deploy ignition/modules/ZKInvoice.js --network mantleTestnet
```

## 📱 Usage

### 1. Connect Wallet
- Click "Connect Wallet" and select MetaMask
- Ensure you're on Mantle Sepolia Testnet (Chain ID: 5003)

### 2. Complete KYC
- Navigate to the KYC page
- Fill in your identity details
- Submit KYC (creates identity commitment on-chain)
- Verify KYC (owner/verifier approves the submission)

### 3. Create Invoices
- Go to "Create Invoice"
- Enter recipient, amount, and description
- Submit to create an on-chain invoice

### 4. Pay Invoices
- View pending invoices on the dashboard
- Click "Pay" to settle an invoice with MNT

## 🔧 Technology Stack

- **Blockchain**: Mantle Sepolia Testnet
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **ZK Circuits**: Circom 2.1.0, SnarkJS
- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: wagmi, viem, RainbowKit
- **Styling**: Tailwind CSS

## 🔐 Security

- Identity data is hashed using Poseidon (ZK-friendly)
- Private KYC details never leave the user's device
- Only zero-knowledge proofs are submitted on-chain
- Smart contracts use OpenZeppelin's Ownable for access control

## 📄 License

MIT License

