const { ethers } = require("hardhat");

async function main() {
    // const [deployer] = await ethers.getSigners();
    const signers = await ethers.getSigners();
    const deployer = signers[1];
    console.log("Deploying contracts with account:", deployer.address);

    try {
        // Deploy WETH
        console.log("\nDeploying WETH...");
        const MockWETH = await ethers.getContractFactory("MockWETH");
        const weth = await MockWETH.deploy();
        await weth.waitForDeployment();
        console.log("WETH deployed to:", await weth.getAddress());

        // Deploy Factory
        console.log("\nDeploying UniswapV2Factory...");
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        const factory = await Factory.deploy(deployer.address);
        await factory.waitForDeployment();
        console.log("Factory deployed to:", await factory.getAddress());

        // Deploy Router
        console.log("\nDeploying UniswapV2Router02...");
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        const router = await Router.deploy(
            await factory.getAddress(),
            await weth.getAddress()
        );
        await router.waitForDeployment();
        console.log("Router deployed to:", await router.getAddress());

        // Deploy MockDAI
        console.log("\nDeploying MockDAI...");
        const MockDAI = await ethers.getContractFactory("MockDAI");
        const dai = await MockDAI.deploy("1000000000000000000000000");
        await dai.waitForDeployment();
        console.log("MockDAI deployed to:", await dai.getAddress());

        // Create WETH-DAI pair
        console.log("\nCreating WETH-DAI pair...");
        await factory.createPair(await weth.getAddress(), await dai.getAddress());
        const pairAddress = await factory.getPair(await weth.getAddress(), await dai.getAddress());
        console.log("WETH-DAI pair created at:", pairAddress);

        console.log("\nDeployment Summary:");
        console.log("--------------------");
        console.log("WETH:", await weth.getAddress());
        console.log("Factory:", await factory.getAddress());
        console.log("Router:", await router.getAddress());
        console.log("DAI:", await dai.getAddress());
        console.log("WETH-DAI Pair:", pairAddress);

    } catch (error) {
        console.error("\nDeployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });