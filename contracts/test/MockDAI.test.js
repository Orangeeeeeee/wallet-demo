const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockDAI", function () {
    let MockDAI;
    let dai;
    let owner;
    let addr1;
    let addr2;
    const initialSupply = ethers.utils.parseEther("1000000"); // 1 million DAI

    beforeEach(async function () {
        MockDAI = await ethers.getContractFactory("MockDAI");
        [owner, addr1, addr2] = await ethers.getSigners();
        dai = await MockDAI.deploy(initialSupply);
        await dai.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await dai.name()).to.equal("Mock DAI");
            expect(await dai.symbol()).to.equal("DAI");
        });

        it("Should mint initial supply to owner", async function () {
            expect(await dai.balanceOf(owner.address)).to.equal(initialSupply);
        });

        it("Should set decimals to 18", async function () {
            expect(await dai.decimals()).to.equal(18);
        });
    });

    describe("Minting", function () {
        it("Should allow minting new tokens", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            await dai.mint(addr1.address, mintAmount);
            expect(await dai.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Should emit Transfer event on mint", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            await expect(dai.mint(addr1.address, mintAmount))
                .to.emit(dai, "Transfer")
                .withArgs(ethers.constants.AddressZero, addr1.address, mintAmount);
        });
    });

    describe("Transfers", function () {
        const transferAmount = ethers.utils.parseEther("1000");

        beforeEach(async function () {
            await dai.transfer(addr1.address, transferAmount);
        });

        it("Should transfer tokens between accounts", async function () {
            await dai.connect(addr1).transfer(addr2.address, transferAmount);
            expect(await dai.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await dai.balanceOf(addr1.address)).to.equal(0);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const tooMuch = ethers.utils.parseEther("1001");
            await expect(dai.connect(addr1).transfer(addr2.address, tooMuch))
                .to.be.reverted;
        });
    });

    describe("Allowances", function () {
        const allowanceAmount = ethers.utils.parseEther("1000");
        const transferAmount = ethers.utils.parseEther("500");

        beforeEach(async function () {
            await dai.transfer(addr1.address, allowanceAmount);
            await dai.connect(addr1).approve(addr2.address, allowanceAmount);
        });

        it("Should update allowance on approve", async function () {
            expect(await dai.allowance(addr1.address, addr2.address))
                .to.equal(allowanceAmount);
        });

        it("Should allow transferFrom with allowance", async function () {
            await dai.connect(addr2).transferFrom(
                addr1.address,
                addr2.address,
                transferAmount
            );

            expect(await dai.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await dai.allowance(addr1.address, addr2.address))
                .to.equal(allowanceAmount.sub(transferAmount));
        });

        it("Should fail transferFrom if allowance is insufficient", async function () {
            const tooMuch = ethers.utils.parseEther("1001");
            await expect(dai.connect(addr2).transferFrom(
                addr1.address,
                addr2.address,
                tooMuch
            )).to.be.reverted;
        });
    });
}); 