import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import {
    Button,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    InputAdornment,
    Typography,
    Box,
} from '@mui/material';
import WETHJson from './MockWETH.json';
import { CONTRACT_ADDRESSES } from '../config/addresses';

const WrapETH = ({ userAddress, refreshBalance }) => {
    const [ethAmount, setEthAmount] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');
    const [isTransactionPending, setIsTransactionPending] = useState(false);
    const [maxAmount, setMaxAmount] = useState('0');
    const [gasEstimate, setGasEstimate] = useState({
        gasLimit: '0',
        gasPrice: '0',
        totalGasCost: '0'
    });
    const [ethBalance, setEthBalance] = useState('0');
    const [wethBalance, setWethBalance] = useState('0');

    const WETH_ADDRESS = CONTRACT_ADDRESSES.WETH;
    // const WETH_ADDRESS = '0xB3ef7a156282E63c368594F3aFa2BfcAEa09413b';
    const WETH_ABI = WETHJson.abi;

    // Add function to fetch WETH balance
    const fetchWethBalance = async () => {
        if (!userAddress) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const wethContract = new Contract(WETH_ADDRESS, WETH_ABI, provider);
            const balance = await wethContract.balanceOf(userAddress);
            setWethBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error('Error fetching WETH balance:', error);
        }
    };

    // Calculate max amount and gas estimates
    const calculateMaxAndGas = async () => {
        if (!userAddress) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(userAddress);
            const gasPrice = await provider.getGasPrice();
            const wethContract = new Contract(WETH_ADDRESS, WETH_ABI, provider);
            
            // Estimate gas for deposit
            const gasLimit = await wethContract.estimateGas.deposit({
                value: ethers.utils.parseEther('1'),
                from: userAddress
            });

            // Calculate total gas cost
            const totalGasCost = gasPrice.mul(gasLimit);
            
            // Calculate max amount (balance - gas cost)
            const maxAmountWei = balance.sub(totalGasCost);
            const maxAmountEth = ethers.utils.formatEther(maxAmountWei.gt(0) ? maxAmountWei : '0');
            
            setMaxAmount(maxAmountEth);
            setEthBalance(ethers.utils.formatEther(balance));
            setGasEstimate({
                gasLimit: gasLimit.toString(),
                gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
                totalGasCost: ethers.utils.formatEther(totalGasCost)
            });

            // Fetch WETH balance
            await fetchWethBalance();

        } catch (error) {
            console.error('Error calculating max amount:', error);
        }
    };

    useEffect(() => {
        calculateMaxAndGas();
    }, [userAddress]);

    const handleContractError = (error) => {
        if (error.code === 'ACTION_REJECTED') {
            return 'Transaction was cancelled';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            return 'Insufficient ETH balance';
        }
        return error.message;
    };

    const handleMaxClick = () => {
        setEthAmount(maxAmount);
    };

    const wrapETH = async () => {
        if (!userAddress || !ethAmount || parseFloat(ethAmount) <= 0) {
            setTransactionStatus('Please enter a valid amount');
            return;
        }

        setIsTransactionPending(true);
        setTransactionStatus('Initiating wrap...');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const wethContract = new Contract(WETH_ADDRESS, WETH_ABI, signer);

            const value = ethers.utils.parseEther(ethAmount);
            const maxValue = ethers.utils.parseEther(maxAmount);

            if (value.gt(maxValue)) {
                setTransactionStatus('Amount exceeds maximum (including gas fees)');
                return;
            }

            // Execute wrap with estimated gas
            const tx = await wethContract.deposit({
                value,
                gasLimit: parseInt(gasEstimate.gasLimit) + 10000 // Add buffer
            });
            
            setTransactionStatus('Transaction submitted. Confirming...');
            const receipt = await tx.wait();

            // Display transaction details
            console.log('Transaction details:', {
                hash: receipt.transactionHash,
                gasUsed: receipt.gasUsed.toString(),
                effectiveGasPrice: ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei')
            });

            // Update balances and recalculate max
            await refreshBalance?.();
            await calculateMaxAndGas();
            await fetchWethBalance();
            setTransactionStatus("ETH Wrapped Successfully!");
            setEthAmount('');

        } catch (error) {
            console.error('Wrap error:', error);
            setTransactionStatus(`Failed to wrap ETH: ${handleContractError(error)}`);
        } finally {
            setIsTransactionPending(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
            }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 500 }}>
                    Balance Information
                </Typography>
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        ETH Balance: {parseFloat(ethBalance).toFixed(4)} ETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        WETH Balance: {parseFloat(wethBalance).toFixed(4)} WETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Maximum Wrap Amount: {parseFloat(maxAmount).toFixed(4)} ETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Estimated Gas Fee: {parseFloat(gasEstimate.totalGasCost).toFixed(6)} ETH
                        ({gasEstimate.gasPrice} Gwei)
                    </Typography>
                </Stack>
            </Box>
            
            <TextField
                fullWidth
                label="Amount of ETH to Wrap"
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                disabled={isTransactionPending}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button 
                                size="small" 
                                onClick={handleMaxClick}
                                sx={{ mr: 1 }}
                            >
                                MAX
                            </Button>
                            ETH
                        </InputAdornment>
                    ),
                }}
            />
            <Button
                variant="contained"
                onClick={wrapETH}
                disabled={isTransactionPending || !ethAmount || ethAmount <= 0}
            >
                {isTransactionPending ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    'Wrap ETH'
                )}
            </Button>
            {transactionStatus && (
                <Alert
                    severity={
                        transactionStatus.includes('Failed') ? 'error' :
                        transactionStatus.includes('Successfully') ? 'success' :
                        'info'
                    }
                >
                    {transactionStatus}
                </Alert>
            )}
        </Stack>
    );
};

export default WrapETH; 