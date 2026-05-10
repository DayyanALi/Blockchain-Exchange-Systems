// SPDX-License-Identifier: MIT
// File: scripts/testSwaps.js

/**
 * @title testSwaps.js
 * @notice Script to interact with deployed contracts on Sepolia.
 * It performs the following:
 *  1. Reads existing contract addresses from .env
 *  2. Fetches and prints initial balances
 *  3. Adds more stablecoin liquidity
 *  4. Executes a small swap (ETH â†’ LMC)
 *  5. Prints updated balances
 *
 */

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // ==========================================================
  // 1. Setup and Contract Connections
  // ==========================================================
  const [deployer] = await ethers.getSigners();
  console.log("ðŸ‘¤ Active Signer:", deployer.address);
  // - Load contract addresses from your .env file:
  //   STABLE_ADDR, MOCKETH_ADDR, EXCHANGE_ADDR, ETH_USD_ORACLE
  // - Connect to deployed contracts using ethers.getContractAt():
  //   MockERC20 for stable and ETH tokens, CurrencyExchange for exchange.
  // - Print all contract addresses for confirmation.
  const STABLE_ADDR = process.env.STABLE_ADDR;
  const MOCKETH_ADDR = process.env.MOCKETH_ADDR;
  const EXCHANGE_ADDR = process.env.EXCHANGE_ADDR;
  const ETH_USD_ORACLE = process.env.ORACLE_ADDRESS || "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  console.log("\nðŸ“‹ Contract Addresses:");
  console.log("===================================");
  console.log("StableCoin:", STABLE_ADDR);
  console.log("MockETH:", MOCKETH_ADDR);
  console.log("Exchange:", EXCHANGE_ADDR);
  console.log("Oracle (ETH/USD):", ETH_USD_ORACLE);
  console.log("===================================\n");


  // ==========================================================
  // 2. Fetch Initial Balances
  // ==========================================================
  // - Retrieve user and exchange balances for both StableCoin (LMC) and MockETH.
  // - Use ethers.utils.formatEther() to print values in readable format.
  // - Display them in a neat â€œBefore Swapâ€ section.
  console.log("\n===== Before Swaps =====");
  
  const userStableBefore = await stableCoin.balanceOf(deployer.address);
  const userETHBefore = await mockETH.balanceOf(deployer.address);
  const exchangeStableBefore = await exchange.stableBalance();
  const exchangeETHBefore = await exchange.balanceOf("ETH");

  console.log("User Stable:", ethers.utils.formatEther(userStableBefore));
  console.log("User ETH:", ethers.utils.formatEther(userETHBefore));
  console.log("Exchange Stable:", ethers.utils.formatEther(exchangeStableBefore));
  console.log("Exchange ETH:", ethers.utils.formatEther(exchangeETHBefore));
  console.log("========================\n");

  // ==========================================================
  // 3. Add Additional StableCoin Liquidity
  // ==========================================================
  // - Define a liquidity amount (e.g., 300,000 LMC)
  // - Approve the exchange contract to spend that amount
  // - Call exchange.addLiquidityStable(amount)
  // - Wait for the transaction to confirm
  // - Log a success message
  console.log("ðŸ“ Adding additional StableCoin liquidity...");
  
  const liquidityAmount = ethers.utils.parseEther("300000"); // 300,000 LMC
  
  // Approve the exchange to spend StableCoin
  const approveTx = await stableCoin.approve(EXCHANGE_ADDR, liquidityAmount);
  await approveTx.wait();
  console.log("âœ… Approved StableCoin for exchange");
  
  // Add liquidity
  const addLiquidityTx = await exchange.addLiquidityStable(liquidityAmount);
  await addLiquidityTx.wait();
  console.log("âœ… Added liquidity:", ethers.utils.formatEther(liquidityAmount), "LMC\n");


  // ==========================================================
  // 4. Perform a Small Swap (ETH â†’ LMC)
  // ==========================================================
  // - Define a small ETH amount for swap (e.g., 0.01)
  // - Approve the exchange contract to spend ETH
  // - Call exchange.swapCurrencyToStable("ETH", amount)
  // - Wait for the transaction
  // - Print a success confirmation message
  console.log("ðŸ“ Performing swap: ETH -> LMC...");
  
  const swapAmount = ethers.utils.parseEther("0.01"); // 0.01 ETH
  
  // Approve the exchange to spend MockETH
  const approveETHTx = await mockETH.approve(EXCHANGE_ADDR, swapAmount);
  await approveETHTx.wait();
  console.log("âœ… Approved MockETH for exchange");
  
  // Perform swap
  const swapTx = await exchange.swapCurrencyToStable("ETH", swapAmount);
  await swapTx.wait();
  console.log("âœ… Swap ETH -> LMC complete!\n");

  // ==========================================================
  // 5. Fetch and Print Balances After Swaps
  // ==========================================================
  // - Retrieve and print updated user and exchange balances
  // - Compare values before and after to verify swap impact
  // - Use ethers.utils.formatEther() for formatting
  // - Display them in an â€œAfter Swapâ€ summary table
  console.log("===== After Swaps =====");
  
  const userStableAfter = await stableCoin.balanceOf(deployer.address);
  const userETHAfter = await mockETH.balanceOf(deployer.address);
  const exchangeStableAfter = await exchange.stableBalance();
  const exchangeETHAfter = await exchange.balanceOf("ETH");

  console.log("User Stable:", ethers.utils.formatEther(userStableAfter));
  console.log("User ETH:", ethers.utils.formatEther(userETHAfter));
  console.log("Exchange Stable:", ethers.utils.formatEther(exchangeStableAfter));
  console.log("Exchange ETH:", ethers.utils.formatEther(exchangeETHAfter));
  console.log("=======================\n");

  // Calculate and display changes
  console.log("ðŸ“Š Balance Changes:");
  console.log("===================================");
  
  const userStableChange = userStableAfter.sub(userStableBefore);
  const userETHChange = userETHAfter.sub(userETHBefore);
  const exchangeStableChange = exchangeStableAfter.sub(exchangeStableBefore);
  const exchangeETHChange = exchangeETHAfter.sub(exchangeETHBefore);
  
  console.log("User Stable Change:", ethers.utils.formatEther(userStableChange));
  console.log("User ETH Change:", ethers.utils.formatEther(userETHChange));
  console.log("Exchange Stable Change:", ethers.utils.formatEther(exchangeStableChange));
  console.log("Exchange ETH Change:", ethers.utils.formatEther(exchangeETHChange));
  console.log("===================================\n");

  console.log("âœ… Swap Test Completed Successfully!");
}

// ==========================================================
// Error Handling
// ==========================================================
main().catch((error) => {
  console.error("âŒ Test Swaps Script Failed:", error);
  process.exitCode = 1;
});
