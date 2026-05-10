const assert = require("assert");
const { ethers } = require("hardhat");

describe("CurrencyExchange", function () {
  async function deployFixture() {
    const [owner, trader] = await ethers.getSigners();

    const StableCoin = await ethers.getContractFactory("StableCoin");
    const stable = await StableCoin.deploy(1000000);
    await stable.deployed();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const weth = await MockERC20.deploy("Mock ETH", "ETH", ethers.utils.parseEther("1000000"));
    await weth.deployed();

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const oracle = await MockV3Aggregator.deploy(8, "200000000000");
    await oracle.deployed();

    const CurrencyExchange = await ethers.getContractFactory("CurrencyExchange");
    const exchange = await CurrencyExchange.deploy(stable.address);
    await exchange.deployed();

    await exchange.addCurrency("ETH", weth.address, oracle.address);

    await stable.approve(exchange.address, ethers.utils.parseEther("500000"));
    await exchange.addLiquidityStable(ethers.utils.parseEther("500000"));

    await weth.approve(exchange.address, ethers.utils.parseEther("500"));
    await exchange.addLiquidity("ETH", ethers.utils.parseEther("500"));

    await stable.transfer(trader.address, ethers.utils.parseEther("2000"));
    await weth.transfer(trader.address, ethers.utils.parseEther("1"));

    return { stable, weth, exchange, trader };
  }

  it("swaps stablecoin into a registered token using oracle pricing", async function () {
    const { stable, weth, exchange, trader } = await deployFixture();

    await stable.connect(trader).approve(exchange.address, ethers.utils.parseEther("2000"));
    await exchange.connect(trader).swapStableToCurrency("ETH", ethers.utils.parseEther("2000"));

    const ethBalance = await weth.balanceOf(trader.address);
    assert.strictEqual(ethers.utils.formatEther(ethBalance), "2.0");
  });

  it("swaps a registered token back into stablecoin using oracle pricing", async function () {
    const { stable, weth, exchange, trader } = await deployFixture();

    await weth.connect(trader).approve(exchange.address, ethers.utils.parseEther("1"));
    await exchange.connect(trader).swapCurrencyToStable("ETH", ethers.utils.parseEther("1"));

    const stableBalance = await stable.balanceOf(trader.address);
    assert.strictEqual(ethers.utils.formatEther(stableBalance), "4000.0");
  });
});
