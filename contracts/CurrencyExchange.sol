// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CurrencyExchange {
    IERC20 public stableCoin; // e.g. LMC

    // State variables
    mapping(string => IERC20) public currencies;
    mapping(string => AggregatorV3Interface) public oracles;

    // Events
    event Swap(address indexed user, string pair, uint256 inAmt, uint256 outAmt);
    event LiquidityAdded(address indexed user, string symbol, uint256 amount);
    event Debug(string msg, uint256 val);

    constructor(address _stableCoin) {
        require(_stableCoin != address(0), "Invalid stablecoin address");
        stableCoin = IERC20(_stableCoin);
    }

    // Register currency + oracle
    function addCurrency(string memory symbol, address token, address oracle) external {
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(token != address(0), "Invalid token address");
        require(oracle != address(0), "Invalid oracle address");
        
        currencies[symbol] = IERC20(token);
        oracles[symbol] = AggregatorV3Interface(oracle);
    }

    // View balances
    function balanceOf(string memory symbol) external view returns (uint256) {
        return currencies[symbol].balanceOf(address(this));
    }

    function stableBalance() external view returns (uint256) {
        return stableCoin.balanceOf(address(this));
    }

    // Add liquidity in stable
    function addLiquidityStable(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        bool success = stableCoin.transferFrom(msg.sender, address(this), amount);
        require(success, "Stable transfer failed");
        
        emit LiquidityAdded(msg.sender, "LMC", amount);
    }

    // Add liquidity in any token
    function addLiquidity(string memory symbol, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(address(currencies[symbol]) != address(0), "Currency not registered");
        
        IERC20 token = currencies[symbol];
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        emit LiquidityAdded(msg.sender, symbol, amount);
    }

    // Swap LMC -> Token
    function swapStableToCurrency(string memory symbol, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(address(currencies[symbol]) != address(0), "Currency not registered");
        require(address(oracles[symbol]) != address(0), "Oracle not registered");
        
        // Transfer LMC from user to contract FIRST
        bool transferSuccess = stableCoin.transferFrom(msg.sender, address(this), amount);
        require(transferSuccess, "Stable transfer failed");
        
        // Get price from oracle
        int256 price = getLatestPrice(symbol);
        require(price > 0, "Invalid price");
        
        // Get oracle decimals
        uint8 oracleDecimals = oracles[symbol].decimals();
        
        // Calculate output: (amount * 10^oracleDecimals) / price
        uint256 outAmount = (amount * (10 ** oracleDecimals)) / uint256(price);
        
        // Check liquidity AFTER calculating output
        IERC20 token = currencies[symbol];
        require(token.balanceOf(address(this)) >= outAmount, "Not enough liquidity");
        
        // Transfer token to user
        bool success = token.transfer(msg.sender, outAmount);
        require(success, "Token transfer failed");
        
        emit Swap(msg.sender, "LMC->ETH", amount, outAmount);
    }

    // Swap Token -> LMC
    function swapCurrencyToStable(string memory symbol, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(address(currencies[symbol]) != address(0), "Currency not registered");
        require(address(oracles[symbol]) != address(0), "Oracle not registered");
        
        // Transfer currency token from user to contract FIRST
        IERC20 token = currencies[symbol];
        bool transferSuccess = token.transferFrom(msg.sender, address(this), amount);
        require(transferSuccess, "Currency transfer failed");
        
        // Get price from oracle
        int256 price = getLatestPrice(symbol);
        require(price > 0, "Invalid price");
        
        // Get oracle decimals
        uint8 oracleDecimals = oracles[symbol].decimals();
        
        // Calculate LMC output: (amount * price) / 10^oracleDecimals
        uint256 outAmount = (amount * uint256(price)) / (10 ** oracleDecimals);
        
        // Check liquidity AFTER calculating output
        require(stableCoin.balanceOf(address(this)) >= outAmount, "Not enough stable liquidity");
        
        // Transfer LMC to user
        bool success = stableCoin.transfer(msg.sender, outAmount);
        require(success, "Stable transfer failed");
        
        emit Swap(msg.sender, "ETH->LMC", amount, outAmount);
    }

    // Helper function to get latest price from oracle
    function getLatestPrice(string memory symbol) public view returns (int256) {
        AggregatorV3Interface oracle = oracles[symbol];
        (, int256 price, , ,) = oracle.latestRoundData();
        return price;
    }
}