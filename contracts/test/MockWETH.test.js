// test/MockWETH.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockWETH Contract", function () {
  let MockWETH;
  let weth;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy(); // Deploy returns a Promise that resolves to the instance when the contract is mined
  });

  it("should allow to deposit ETH", async function () {
    await expect(() => weth.deposit({ value: ethers.utils.parseEther("1") }))
      .to.changeEtherBalance(owner, ethers.utils.parseEther("-1"));
    expect(await weth.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1"));
  });

  it("should allow to withdraw ETH", async function () {
    await weth.deposit({ value: ethers.utils.parseEther("1") });
    await expect(() => weth.withdraw(ethers.utils.parseEther("1")))
      .to.changeEtherBalance(owner, ethers.utils.parseEther("1"));
    expect(await weth.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("0"));
  });
});
