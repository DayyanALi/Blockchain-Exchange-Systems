// SPDX-License-Identifier: MIT
// File: scripts/deployExchange.js

/**
 * @title Deployment Script - CurrencyExchange System
 * @notice This script deploys the core contracts for the stablecoin exchange system.
 * 
 * The order of operations is critical: deploy tokens  deploy exchange  register oracle  add liquidity.
 */

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // ==========================================================
  // 1. Setup
  // ==========================================================
  const [deployer] = await ethers.getSigners();
  console.log(" Deployer Address:", deployer.address);

  // ==========================================================
  // 2. Deploy StableCoin (LUMSCoin)
  // ==========================================================
  // - Get the contract factory for StableCoin
  // - Deploy the contract with an initial supply (e.g., 1,000,000 tokens)
  // - Wait for deployment and print its address
  // Example: "StableCoin deployed at: 0x1234..."
  console.log("\n Deploying StableCoin (LUMSCoin)...");
  
  const StableCoin = await ethers.getContractFactory("StableCoin");
  const initialSupply = ethers.utils.parseEther("1000000"); // 1,000,000 tokens
  const stableCoin = await StableCoin.deploy(ethers.utils.parseEther("1000000"));
  await stableCoin.deployed();
  
  console.log(" StableCoin deployed at:", stableCoin.address);

  // ==========================================================
  // 3. Deploy MockETH
  // ==========================================================
  // - Deploy a mock ERC20 token named "Mock ETH" with symbol "ETH"
  // - Use the same initial supply value as the stablecoin
  // - Wait for deployment and print address
  console.log("\n Deploying MockETH...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockETH = await MockERC20.deploy("Mock ETH", "ETH", ethers.utils.parseEther("1000000"));
  await mockETH.deployed();
  
  console.log(" MockETH deployed at:", mockETH.address);

  // ==========================================================
  // 4. Deploy CurrencyExchange
  // ==========================================================
  // - Get the contract factory for CurrencyExchange
  // - Deploy the contract, passing in the address of your stablecoin
  // - Wait for deployment and log its address
  console.log("\n Deploying CurrencyExchange...");
  
  const CurrencyExchange = await ethers.getContractFactory("CurrencyExchange");
  const exchange = await CurrencyExchange.deploy(stableCoin.address);
  await exchange.deployed();
  
  console.log(" CurrencyExchange deployed at:", exchange.address);

  // ==========================================================
  // 5. Register ETH with Chainlink Oracle
  // ==========================================================
  // - Use the Chainlink ETH/USD oracle address for Sepolia
  //   (Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306)
  // - Call `addCurrency("ETH", mockETH.address, ORACLE_ADDRESS)`
  // - Wait for confirmation and print message
  console.log("\n Registering ETH with Chainlink Oracle...");
  
  const ORACLE_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink ETH/USD on Sepolia
  
  const addCurrencyTx = await exchange.addCurrency("ETH", mockETH.address, ORACLE_ADDRESS);
  await addCurrencyTx.wait();
  
  console.log(" Registered ETH with oracle:", ORACLE_ADDRESS);

  // ==========================================================
  // 6. Mint Additional Tokens for Deployer
  // ==========================================================
  // - Mint extra tokens for the deployer for testing & liquidity
  // - Mint both stablecoin (LMC) and MockETH (e.g., 1,000,000 each)
  // - Wait for transactions and print balances
  console.log("\n Minting additional tokens for deployer...");
  
  const mintAmount = ethers.utils.parseEther("1000000"); // 1,000,000 tokens
  
  // Mint StableCoin
  const mintStableTx = await stableCoin.mint(deployer.address, mintAmount);
  await mintStableTx.wait();
  console.log(" Minted StableCoin:", ethers.utils.formatEther(mintAmount));
  
  // Mint MockETH
  const mintETHTx = await mockETH.mint(deployer.address, mintAmount);
  await mintETHTx.wait();
  console.log(" Minted MockETH:", ethers.utils.formatEther(mintAmount));

  // ==========================================================
  // 7. Approve and Add Liquidity
  // ==========================================================
  // - Approve the exchange contract to spend tokens on deployers behalf
  // - Add liquidity for both StableCoin and MockETH
  // - Suggested liquidity amount: 500,000 each
  // - Wait for transactions and confirm successful addition
  console.log("\n Approving and adding liquidity...");
  
  const liquidityAmount = ethers.utils.parseEther("500000"); // 500,000 tokens
  
  // Approve StableCoin
  const approveStableTx = await stableCoin.approve(exchange.address, liquidityAmount);
  await approveStableTx.wait();
  console.log(" Approved StableCoin for exchange");
  
  // Approve MockETH
  const approveETHTx = await mockETH.approve(exchange.address, liquidityAmount);
  await approveETHTx.wait();
  console.log(" Approved MockETH for exchange");
  
  // Add StableCoin liquidity
  const addStableLiquidityTx = await exchange.addLiquidityStable(liquidityAmount);
  await addStableLiquidityTx.wait();
  console.log(" Added StableCoin liquidity:", ethers.utils.formatEther(liquidityAmount));
  
  // Add MockETH liquidity
  const addETHLiquidityTx = await exchange.addLiquidity("ETH", liquidityAmount);
  await addETHLiquidityTx.wait();
  console.log(" Added MockETH liquidity:", ethers.utils.formatEther(liquidityAmount));


  // ==========================================================
  // 8. Print Final Balances
  // ==========================================================
  // - Fetch and log the exchange contracts StableCoin and ETH balances
  // - Verify they match the added liquidity amounts
  console.log("\n Final Exchange Balances:");
  
  const exchangeStableBalance = await exchange.stableBalance();
  const exchangeETHBalance = await exchange.balanceOf("ETH");
  
  console.log("Exchange Stable:", ethers.utils.formatEther(exchangeStableBalance));
  console.log("Exchange ETH:", ethers.utils.formatEther(exchangeETHBalance));

  console.log("\n Deployment Completed Successfully!");
  console.log("\n Contract Addresses Summary:");
  console.log("===================================");
  console.log("StableCoin:", stableCoin.address);
  console.log("MockETH:", mockETH.address);
  console.log("CurrencyExchange:", exchange.address);
  console.log("Oracle (ETH/USD):", ORACLE_ADDRESS);
  console.log("===================================");
  console.log(" Deployment Completed Successfully!");
}

main().catch((error) => {
  console.error(" Deployment Failed:", error);
  process.exitCode = 1;
});

