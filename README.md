# Blockchain Exchange Systems

A Solidity-based exchange system that implements an ERC20-style stablecoin, an oracle-backed currency exchange, and deployment workflows for local and Sepolia testnet environments.

The project demonstrates smart contract development for token issuance, liquidity management, oracle-based pricing, and bidirectional swaps between a USD-pegged stablecoin and registered ERC20 assets.

## Features

- ERC20-style stablecoin implementation with minting, burning, allowances, and transfer support
- Currency exchange contract for registering ERC20 assets with Chainlink-compatible price oracles
- Liquidity management for stablecoin and registered token reserves
- Swap flows for stablecoin-to-token and token-to-stablecoin conversions
- Chainlink ETH/USD oracle integration for Sepolia deployments
- Mock ERC20 and mock oracle contracts for local testing and development
- JavaScript deployment and integration scripts using Hardhat and ethers.js

## Tech Stack

- Solidity
- Hardhat
- ethers.js
- Chainlink Price Feeds
- Ethereum Sepolia
- MetaMask / Alchemy RPC configuration
- JavaScript

## Project Structure

```text
contracts/
  StableCoin.sol          # ERC20-style USD-pegged stablecoin
  CurrencyExchange.sol    # Oracle-backed token exchange contract
  MockERC20.sol           # Mock ERC20 token for testing exchange flows
  MockV3Aggregator.sol    # Mock Chainlink-style oracle for local testing

scripts/
  deployExchange.js       # Deploy stablecoin, mock token, exchange, oracle registration, and liquidity
  setupExchange.js        # Configure deployed contracts and run setup operations
  integrationTestSepolia.js # Exercise deployed contracts on Sepolia
```

## Core Contracts

### StableCoin

`StableCoin.sol` implements a USD-pegged ERC20-style token named `LUMSCoin` with:

- token metadata
- balances and allowances
- `transfer`, `approve`, and `transferFrom`
- owner-controlled `mint`
- token `burn`

### CurrencyExchange

`CurrencyExchange.sol` manages registered token markets and price feeds. It supports:

- registering ERC20 assets with oracle addresses
- adding stablecoin and token liquidity
- reading exchange balances
- converting stablecoin into registered tokens
- converting registered tokens back into stablecoin
- emitting swap and liquidity events

## Local Setup

Install dependencies:

```bash
npm install
```

Compile contracts:

```bash
npx hardhat compile
```

Run a local Hardhat node:

```bash
npx hardhat node
```

Deploy locally:

```bash
npx hardhat run scripts/deployExchange.js --network localhost
```

## Sepolia Deployment

Create a `.env` file with your RPC URL and deployer private key:

```text
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
```

Deploy to Sepolia:

```bash
npx hardhat run scripts/deployExchange.js --network sepolia
```

Run the Sepolia integration script after deployment:

```bash
npx hardhat run scripts/integrationTestSepolia.js --network sepolia
```

## Security Notes

This repository is intended as a smart contract engineering project and should not be used with real funds without a full security review. Never commit private keys, seed phrases, RPC secrets, or `.env` files.

## Key Concepts Demonstrated

- EVM smart contract state management
- ERC20 token mechanics
- wallet approvals and token allowances
- liquidity pools and swap execution
- oracle-based pricing
- Sepolia testnet deployment
- transaction execution and event-driven debugging
