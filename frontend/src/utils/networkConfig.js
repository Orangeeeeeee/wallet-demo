export const SUPPORTED_NETWORKS = {
    1: {
        name: 'Mainnet',
        weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    },
    11155111: {
        name: 'Sepolia',
    }
};

export const isNetworkSupported = (chainId) => {
    return Object.keys(SUPPORTED_NETWORKS).includes(chainId.toString());
}; 