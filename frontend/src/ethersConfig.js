import { ethers } from 'ethers';

export const getProvider = () => {
    if (process.env.NODE_ENV === 'development') {
        return new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
    }
    return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = (provider) => {
    return provider.getSigner();
};