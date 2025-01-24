const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[1];
    console.log("Adding liquidity with account:", deployer.address);

    try {
        // Check ETH balance first
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("\nAccount ETH balance:", ethers.formatEther(balance), "ETH");

        // Calculate total required including gas
        const ethAmount = ethers.parseEther("5"); // 5 ETH
        const daiAmount = ethers.parseEther("10000"); // 10,000 DAI
        const estimatedGas = ethers.parseEther("0.1"); // Buffer for gas costs

        const totalRequired = ethers.getBigInt(ethAmount) + ethers.getBigInt(estimatedGas);

        if (balance < totalRequired) {
            console.error(`Insufficient ETH balance. Need at least ${ethers.formatEther(totalRequired.toString())} ETH (including gas)`);
            process.exit(1);
        }

        // Contract addresses
        const WETH_ADDRESS = '0xd7aD2CcEd9425327848Edb1106E88040d9a18978';
        const ROUTER_ADDRESS = '0x0fB8bb2D9d922A439aF7EB6DFd2ce5F63427bCA8';
        const DAI_ADDRESS = '0x2DECEcF0B46e4cF9136f9a1b2298B4328D62c09c';
        const FACTORY_ADDRESS = '0x1CB6c491C9de5A9c139616f89F6cCA6ed7Cf089D';

        console.log("\nPreparing tokens...");
        console.log("ETH Amount:", ethers.formatEther(ethAmount), "ETH");
        console.log("DAI Amount:", ethers.formatEther(daiAmount), "DAI");

        // Get contract instances
        const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS, deployer);
        const dai = await ethers.getContractAt("MockDAI", DAI_ADDRESS, deployer);
        const router = await ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS, deployer);
        const factory = await ethers.getContractAt("UniswapV2Factory", FACTORY_ADDRESS, deployer);

        // Mint DAI tokens first
        console.log("\nMinting DAI tokens...");
        const mintTx = await dai.mint(deployer.address, daiAmount, {
            gasLimit: 200000
        });
        await mintTx.wait();
        console.log("Minted", ethers.formatEther(daiAmount), "DAI");

        // Wrap ETH with explicit gas limit
        console.log("\nWrapping ETH...");
        const wrapTx = await weth.deposit({
            value: ethAmount,
            gasLimit: 200000
        });
        await wrapTx.wait();
        console.log("Wrapped", ethers.formatEther(ethAmount), "ETH to WETH");

        // Check balances before approval
        const wethBalance = await weth.balanceOf(deployer.address);
        const daiBalance = await dai.balanceOf(deployer.address);
        console.log("\nBalances before approval:");
        console.log("WETH Balance:", ethers.formatEther(wethBalance));
        console.log("DAI Balance:", ethers.formatEther(daiBalance));

        // Approve tokens with explicit gas limits
        console.log("\nApproving tokens...");
        const approveTx1 = await weth.approve(ROUTER_ADDRESS, ethAmount, {
            gasLimit: 100000
        });
        await approveTx1.wait();
        const approveTx2 = await dai.approve(ROUTER_ADDRESS, daiAmount, {
            gasLimit: 100000
        });
        await approveTx2.wait();
        console.log("Tokens approved");

        // Check if pair exists
        const pairAddress = await factory.getPair(WETH_ADDRESS, DAI_ADDRESS);
        console.log("\nPair Address:", pairAddress);

        // Add liquidity with explicit gas limit and slippage tolerance
        console.log("\nAdding liquidity...");
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

        // Calculate minimum amounts (1% slippage)
        const minWETH = ethAmount.mul(99).div(100);
        const minDAI = daiAmount.mul(99).div(100);

        console.log("Min WETH:", ethers.formatEther(minWETH));
        console.log("Min DAI:", ethers.formatEther(minDAI));

        const tx = await router.addLiquidity(
            WETH_ADDRESS,
            DAI_ADDRESS,
            ethAmount,
            daiAmount,
            minWETH, // min WETH (1% slippage)
            minDAI,  // min DAI (1% slippage)
            deployer.address,
            deadline,
            {
                gasLimit: 500000
            }
        );

        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Liquidity added successfully!");

        // Get pair info
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
        const reserves = await pair.getReserves();
        
        console.log("\nPool reserves:");
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));

    } catch (error) {
        console.error("\nFailed to add liquidity:", error);
        if (error.error) {
            console.error("Error details:", error.error);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });