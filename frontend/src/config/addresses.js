// Debug log to check if environment variables are loaded
console.log('Environment Variables:', {
    WETH: process.env.REACT_APP_WETH_ADDRESS,
    FACTORY: process.env.REACT_APP_FACTORY_ADDRESS,
    ROUTER: process.env.REACT_APP_ROUTER_ADDRESS,
    DAI: process.env.REACT_APP_DAI_ADDRESS,
    WETH_DAI_PAIR: process.env.REACT_APP_WETH_DAI_PAIR
});

// Add fallback values in case env variables are not loaded
export const CONTRACT_ADDRESSES = {
    WETH: process.env.REACT_APP_WETH_ADDRESS || "0xB3ef7a156282E63c368594F3aFa2BfcAEa09413b",
    FACTORY: process.env.REACT_APP_FACTORY_ADDRESS || "0xf429d4EF861F8Cb22e2DfdCFba262BFb04576720",
    ROUTER: process.env.REACT_APP_ROUTER_ADDRESS || "0xc7852590882A8Bf5880901F3AE105Fa6b21d70eF",
    DAI: process.env.REACT_APP_DAI_ADDRESS || "0x10fE13C5cEEA63F71d8484aA4d5E55aF2dcccA72",
    WETH_DAI_PAIR: process.env.REACT_APP_WETH_DAI_PAIR || "0x3b8147Db5C523fEf4c6De683BDDB8943F6A6821A"
};

// Debug log to check final addresses
console.log('Contract Addresses:', CONTRACT_ADDRESSES); 