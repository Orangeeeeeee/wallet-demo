// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';

// const MaxTransactFeature = ({ provider }) => {
//     const [maxTransactAmount, setMaxTransactAmount] = useState('0');

//     const calculateMaxTransact = async () => {
//         if (!provider) {
//             console.error('Ethereum provider is not available');
//             return;
//         }

//         const signer = provider.getSigner();
//         const balance = await signer.getBalance();
//         const gasEstimate = await provider.getFeeData();  // Fetch real-time gas price data
//         const gasPrice = gasEstimate.gasPrice;

//         // Assume a gas limit for token swap
//         const gasLimit = 21000;
//         const totalGasFee = gasPrice.mul(gasLimit);

//         const ethBalance = ethers.utils.formatEther(balance);
//         const estimatedGas = ethers.utils.formatEther(totalGasFee);

//         const maxAmount = Math.max(0, parseFloat(ethBalance) - parseFloat(estimatedGas));
//         setMaxTransactAmount(maxAmount.toString());
//     };

//     useEffect(() => {
//         if (provider) {
//             calculateMaxTransact();
//         }
//     }, [provider]);

//     return (
//         <div>
//             <Typography variant="body1">Max Transact Amount: {maxTransactAmount} ETH</Typography>
//             <Button variant="contained" onClick={calculateMaxTransact}>Calculate Max Transact</Button>
//         </div>
//     );
// };

// export default MaxTransactFeature;



import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const MaxTransactFeature = () => {
    const [maxTransactAmount, setMaxTransactAmount] = useState('0');
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

    useEffect(() => {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            setIsMetaMaskInstalled(true);
        } else {
            setIsMetaMaskInstalled(false);
            alert("MetaMask is not installed. Please install MetaMask to use this feature.");
        }
    }, []);

    const calculateMaxTransact = async () => {
        if (!window.ethereum) {
            console.error('Ethereum provider is not available');
            alert("Please ensure MetaMask is installed and try again.");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            const signer = provider.getSigner();
            const balance = await signer.getBalance();
            const gasEstimate = await provider.getFeeData();
            const gasPrice = gasEstimate.gasPrice;
    
            // Assume a gas limit for token swap
            const gasLimit = 21000;
            const totalGasFee = gasPrice.mul(gasLimit);
    
            const ethBalance = ethers.utils.formatEther(balance);
            const estimatedGas = ethers.utils.formatEther(totalGasFee);
    
            const maxAmount = Math.max(0, parseFloat(ethBalance) - parseFloat(estimatedGas));
            setMaxTransactAmount(maxAmount.toString());
        } catch (error) {
            console.error("Error calculating max transact amount:", error);
            alert("Failed to calculate the max transact amount.");
        }
    };

    return (
        <div>
            {isMetaMaskInstalled && (
                <>
                    <Button variant="contained" onClick={calculateMaxTransact}>Calculate Max Transact</Button>
                    <Typography variant="body1">Max Transact Amount: {maxTransactAmount} ETH</Typography>
                </>
            )}
        </div>
    );
};

export default MaxTransactFeature;



// import React, { useState, useEffect, useCallback } from 'react';
// import { ethers } from 'ethers';
// import { Button, Typography } from '@mui/material';

// const MaxTransactFeature = () => {
//     const [maxTransactAmount, setMaxTransactAmount] = useState('0');
//     const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);

//     // Check if MetaMask is installed and set up event listeners
//     useEffect(() => {
//         const checkMetaMaskInstallation = () => {
//             if (window.ethereum) {
//                 setIsMetaMaskInstalled(true);
//                 window.ethereum.on('accountsChanged', handleAccountsChanged);
//                 window.ethereum.on('chainChanged', handleChainChanged);
//                 checkIfConnected();
//             } else {
//                 setIsMetaMaskInstalled(false);
//                 alert("MetaMask is not installed. Please install MetaMask to use this feature.");
//             }
//         };

//         const handleAccountsChanged = (accounts) => {
//             if (accounts.length > 0) {
//                 setIsConnected(true);
//                 calculateMaxTransact();
//             } else {
//                 setIsConnected(false);
//                 setMaxTransactAmount('0');
//             }
//         };

//         const handleChainChanged = () => {
//             window.location.reload();
//         };

//         const checkIfConnected = async () => {
//             const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//             if (accounts && accounts.length > 0) {
//                 setIsConnected(true);
//             }
//         };

//         checkMetaMaskInstallation();

//         // Cleanup function to remove listeners
//         return () => {
//             if (window.ethereum) {
//                 window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//                 window.ethereum.removeListener('chainChanged', handleChainChanged);
//             }
//         };
//     }, []);

//     // Define calculateMaxTransact using useCallback to manage dependencies properly
//     const calculateMaxTransact = useCallback(async () => {
//         if (!window.ethereum) {
//             console.error('Ethereum provider is not available');
//             alert("Please ensure MetaMask is installed and try again.");
//             return;
//         }

//         if (!isConnected) {
//             alert("Please connect your wallet.");
//             return;
//         }

//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         try {
//             const signer = provider.getSigner();
//             const balance = await signer.getBalance();
//             const gasEstimate = await provider.getFeeData();
//             const gasPrice = gasEstimate.gasPrice;

//             const gasLimit = 100000; // Adjusted for potentially higher cost operations
//             const totalGasFee = gasPrice.mul(gasLimit);

//             const ethBalance = ethers.utils.formatEther(balance);
//             const estimatedGas = ethers.utils.formatEther(totalGasFee);

//             const maxAmount = Math.max(0, parseFloat(ethBalance) - parseFloat(estimatedGas));
//             setMaxTransactAmount(maxAmount.toString());
//         } catch (error) {
//             console.error("Error calculating max transact amount:", error);
//             alert("Failed to calculate the max transact amount.");
//         }
//     }, [isConnected]); // Include isConnected to ensure updates when connection status changes

//     return (
//         <div>
//             {isMetaMaskInstalled ? (
//                 <>
//                     {isConnected ? (
//                         <>
//                             <Button variant="contained" onClick={calculateMaxTransact}>Calculate Max Transact</Button>
//                             <Typography variant="body1">Max Transact Amount: {maxTransactAmount} ETH</Typography>
//                         </>
//                     ) : (
//                         <Button variant="contained" onClick={() => calculateMaxTransact()}>Connect Wallet</Button>
//                     )}
//                 </>
//             ) : (
//                 <Typography variant="body1">MetaMask is not installed.</Typography>
//             )}
//         </div>
//     );
// };

// export default MaxTransactFeature;

