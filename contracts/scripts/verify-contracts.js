const { ethers } = require("hardhat");

async function main() {
    // Contract addresses
    const WETH_ADDRESS = '0xc5a5C42992dECbae36851359345FE25997F5C42d';
    const FACTORY_ADDRESS = '0x67d269191c92Caf3cD7723F116c85e6E9bf55933';
    const ROUTER_ADDRESS = '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E';
    const DAI_ADDRESS = '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690';
    const PAIR_ADDRESS = '0x7B05863DFf3BDC4E8E4777e0dA76d3ab9844dD17';

    const provider = ethers.provider;

    console.log("\nVerifying contract deployments...");

    // Verify WETH
    const wethCode = await provider.getCode(WETH_ADDRESS);
    console.log("\nWETH Contract:");
    console.log("Address:", WETH_ADDRESS);
    console.log("Code length:", wethCode.length);
    console.log("Is contract:", wethCode.length > 2);

    // Verify Factory
    const factoryCode = await provider.getCode(FACTORY_ADDRESS);
    console.log("\nFactory Contract:");
    console.log("Address:", FACTORY_ADDRESS);
    console.log("Code length:", factoryCode.length);
    console.log("Is contract:", factoryCode.length > 2);

    // Verify Router
    const routerCode = await provider.getCode(ROUTER_ADDRESS);
    console.log("\nRouter Contract:");
    console.log("Address:", ROUTER_ADDRESS);
    console.log("Code length:", routerCode.length);
    console.log("Is contract:", routerCode.length > 2);

    // Verify DAI
    const daiCode = await provider.getCode(DAI_ADDRESS);
    console.log("\nDAI Contract:");
    console.log("Address:", DAI_ADDRESS);
    console.log("Code length:", daiCode.length);
    console.log("Is contract:", daiCode.length > 2);

    // Verify Pair
    const pairCode = await provider.getCode(PAIR_ADDRESS);
    console.log("\nPair Contract:");
    console.log("Address:", PAIR_ADDRESS);
    console.log("Code length:", pairCode.length);
    console.log("Is contract:", pairCode.length > 2);

    // Try to get some contract info
    try {
        const factory = await ethers.getContractAt("UniswapV2Factory", FACTORY_ADDRESS);
        const router = await ethers.getContractAt("UniswapV2Router02", ROUTER_ADDRESS);
        
        console.log("\nChecking Factory-Router connection:");
        const factoryFromRouter = await router.factory();
        console.log("Factory address from Router:", factoryFromRouter);
        console.log("Matches expected Factory:", factoryFromRouter === FACTORY_ADDRESS);

        console.log("\nChecking WETH-Router connection:");
        const wethFromRouter = await router.WETH();
        console.log("WETH address from Router:", wethFromRouter);
        console.log("Matches expected WETH:", wethFromRouter === WETH_ADDRESS);

    } catch (error) {
        console.error("\nError checking contract connections:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });