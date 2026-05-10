// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IERC20 Interface
 * @dev Standard ERC20 interface definition.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title StableCoin (LUMSCoin)
 * @notice ERC20-compliant stablecoin pegged to 1 USD.
 */
contract StableCoin is IERC20 {

    // ========== State Variables ==========
    string private _name;        // e.g., "LUMSCoin"
    string private _symbol;      // e.g., "LMC"
    uint8 private _decimals;     // Typically 18

    uint256 private _totalSupply;
    address public owner;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    // ========== Modifiers ==========
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ========== Constructor ==========
    /**
     * @dev Initializes the contract with an initial supply.
     * Mint all tokens to the deployer and emit a Transfer event.
     */
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _name = "LUMSCoin";
        _symbol = "LMC";
        _decimals = 18;
        
        uint256 scaledSupply = initialSupply * (10 ** _decimals);
        _totalSupply = scaledSupply;
        balances[owner] = scaledSupply;
        
        emit Transfer(address(0), owner, scaledSupply);
    }

    // ========== Metadata ==========
    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    // ========== ERC20 Core Functions ==========
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        // Requirements:
        // - `to` cannot be address(0)
        // - sender must have sufficient balance
        // Emit a Transfer event
        require(to != address(0), "Transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address _owner, address spender) public view override returns (uint256) {
        return allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        // Emit Approval event
        allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // Requirements:
        // - `from` must have sufficient balance
        // - allowance[from][msg.sender] must be sufficient
        // Update balances and allowance
        // Emit Transfer event
        require(to != address(0), "Transfer to zero address");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    // ========== Mint and Burn ==========
    /**
     * @dev Mint new tokens to the specified address.
     * Can only be called by the owner (or exchange contract).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        // Emit Transfer(address(0), to, amount)
        require(to != address(0), "Mint to zero address");
        
        _totalSupply += amount;
        balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Burn tokens from senderâ€™s balance.
     * Reduces total supply permanently.
     */
    function burn(uint256 amount) external {
        // Reduce total supply and balance
        // Emit Transfer(msg.sender, address(0), amount)
        require(balances[msg.sender] >= amount, "Insufficient balance to burn");
        
        balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }
}
