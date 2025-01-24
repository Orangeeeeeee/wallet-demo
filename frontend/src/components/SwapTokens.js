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
    Box
} from '@mui/material';
import UniswapV2Router02 from './UniswapV2Router02.json';
import WETH from './MockWETH.json';
import { CONTRACT_ADDRESSES } from '../config/addresses';

const SwapTokens = ({ userAddress, refreshBalance }) => {
    const [tokenAmount, setTokenAmount] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');
    const [isTransactionPending, setIsTransactionPending] = useState(false);
    const [wethBalance, setWethBalance] = useState('0');
    const [daiBalance, setDaiBalance] = useState('0');
    const [poolInfo, setPoolInfo] = useState({
        wethReserve: '0',
        daiReserve: '0'
    });

    const ROUTER_ADDRESS = CONTRACT_ADDRESSES.ROUTER;
    const WETH_ADDRESS = CONTRACT_ADDRESSES.WETH;
    const DAI_ADDRESS = CONTRACT_ADDRESSES.DAI;
    const FACTORY_ADDRESS = CONTRACT_ADDRESSES.FACTORY;
    const UniswapV2Router02ABI = UniswapV2Router02.abi;
    const WETH_ABI = WETH.abi;

    const fetchBalancesAndPoolInfo = async () => {
        if (!userAddress) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Get WETH and DAI contracts
            const wethContract = new Contract(
                WETH_ADDRESS,
                ["function balanceOf(address) view returns (uint256)"],
                provider
            );
            const daiContract = new Contract(
                DAI_ADDRESS,
                ["function balanceOf(address) view returns (uint256)"],
                provider
            );

            // Get pair contract
            const factoryContract = new Contract(
                FACTORY_ADDRESS,
                ["function getPair(address tokenA, address tokenB) external view returns (address)"],
                provider
            );
            const pairAddress = await factoryContract.getPair(WETH_ADDRESS, DAI_ADDRESS);

            // Fetch balances and pool info in parallel
            const [wethBal, daiBal, pairContract] = await Promise.all([
                wethContract.balanceOf(userAddress),
                daiContract.balanceOf(userAddress),
                new Contract(
                    pairAddress,
                    [
                        "function getReserves() view returns (uint112, uint112, uint32)",
                        "function token0() view returns (address)",
                        "function token1() view returns (address)"
                    ],
                    provider
                )
            ]);

            // Get pool reserves and token order
            const [reserve0, reserve1] = await pairContract.getReserves();
            const token0 = await pairContract.token0();
            
            // Set balances
            setWethBalance(ethers.utils.formatEther(wethBal));
            setDaiBalance(ethers.utils.formatEther(daiBal));

            // Set pool info based on token order
            const isWethToken0 = token0.toLowerCase() === WETH_ADDRESS.toLowerCase();
            setPoolInfo({
                wethReserve: ethers.utils.formatEther(isWethToken0 ? reserve0 : reserve1),
                daiReserve: ethers.utils.formatEther(isWethToken0 ? reserve1 : reserve0)
            });

        } catch (error) {
            console.error('Error fetching balances and pool info:', error);
            setWethBalance('0');
            setDaiBalance('0');
        }
    };

    useEffect(() => {
        fetchBalancesAndPoolInfo();
    }, [userAddress]);

    const handleSwapTokens = async () => {
        if (!userAddress || !tokenAmount || parseFloat(tokenAmount) <= 0) {
            setTransactionStatus('Please enter a valid amount');
            return;
        }

        // Check if amount exceeds WETH balance
        if (parseFloat(tokenAmount) > parseFloat(wethBalance)) {
            setTransactionStatus('Insufficient WETH balance');
            return;
        }

        setIsTransactionPending(true);
        setTransactionStatus('Initiating swap...');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Get contract instances
            const wethContract = new Contract(WETH_ADDRESS, WETH_ABI, signer);
            const routerContract = new Contract(ROUTER_ADDRESS, UniswapV2Router02ABI, signer);
            const factoryContract = new Contract(
                FACTORY_ADDRESS,
                ["function getPair(address, address) view returns (address)"],
                signer
            );

            // Check if pair exists and get reserves
            const pairAddress = await factoryContract.getPair(WETH_ADDRESS, DAI_ADDRESS);
            console.log('Pair address:', pairAddress);

            const pairContract = new Contract(
                pairAddress,
                [
                    "function getReserves() view returns (uint112, uint112, uint32)",
                    "function token0() view returns (address)",
                    "function token1() view returns (address)"
                ],
                provider
            );

            // Get reserves and token order
            const [reserve0, reserve1] = await pairContract.getReserves();
            const token0 = await pairContract.token0();
            const token1 = await pairContract.token1();
            
            console.log('Pair reserves:', {
                token0: token0.toLowerCase() === WETH_ADDRESS.toLowerCase() ? 'WETH' : 'DAI',
                reserve0: ethers.utils.formatEther(reserve0),
                token1: token1.toLowerCase() === DAI_ADDRESS.toLowerCase() ? 'DAI' : 'WETH',
                reserve1: ethers.utils.formatEther(reserve1)
            });

            // Check if there's enough liquidity
            if (reserve0.isZero() || reserve1.isZero()) {
                setTransactionStatus('Insufficient liquidity in the pool');
                return;
            }

            const amountIn = ethers.utils.parseEther(tokenAmount);
            
            // First check WETH allowance
            const currentAllowance = await wethContract.allowance(userAddress, ROUTER_ADDRESS);
            
            if (currentAllowance.lt(amountIn)) {
                setTransactionStatus('Approving WETH transfer...');
                try {
                    const approveTx = await wethContract.approve(ROUTER_ADDRESS, amountIn);
                    await approveTx.wait();
                    console.log('WETH approved');
                } catch (error) {
                    throw new Error('Failed to approve WETH transfer: ' + error.message);
                }
            }

            // Get expected output amount
            const path = [WETH_ADDRESS, DAI_ADDRESS];
            const amounts = await routerContract.getAmountsOut(amountIn, path);
            const expectedOutput = ethers.utils.formatEther(amounts[1]);
            console.log('Expected output:', expectedOutput, 'DAI');

            // Confirm with user
            setTransactionStatus(`Swapping ${tokenAmount} WETH for approximately ${expectedOutput} DAI...`);
            
            // Calculate minimum output amount (1% slippage)
            const minOutput = amounts[1].mul(99).div(100);
            console.log('Minimum output:', ethers.utils.formatEther(minOutput), 'DAI');

            // Execute swap
            const tx = await routerContract.swapExactTokensForTokens(
                amountIn,
                minOutput,
                path,
                userAddress,
                Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes deadline
                {
                    gasLimit: 500000
                }
            );

            setTransactionStatus('Transaction submitted. Waiting for confirmation...');
            const receipt = await tx.wait();
            console.log('Swap transaction confirmed:', receipt.transactionHash);

            // Update balances
            await refreshBalance?.();
            await fetchBalancesAndPoolInfo();
            setTransactionStatus("Tokens swapped successfully!");
            setTokenAmount('');
            
        } catch (error) {
            console.error('Swap error details:', {
                message: error.message,
                code: error.code,
                data: error.data,
                error
            });
            
            let errorMessage = 'Failed to swap tokens: ';
            if (error.code === 'ACTION_REJECTED') {
                errorMessage += 'Transaction was rejected';
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                errorMessage += 'Insufficient WETH balance';
            } else if (error.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
                errorMessage += 'Price impact too high';
            } else if (error.data) {
                errorMessage += `Contract error: ${error.data.message || error.message}`;
            } else {
                errorMessage += error.message;
            }
            
            setTransactionStatus(errorMessage);
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
                        WETH Balance: {parseFloat(wethBalance).toFixed(4)} WETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        DAI Balance: {parseFloat(daiBalance).toFixed(2)} DAI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Pool Liquidity:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                        • {parseFloat(poolInfo.wethReserve).toFixed(4)} WETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                        • {parseFloat(poolInfo.daiReserve).toFixed(2)} DAI
                    </Typography>
                </Stack>
            </Box>

            <TextField
                fullWidth
                label="Amount of WETH to Swap"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                disabled={isTransactionPending}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            WETH
                        </InputAdornment>
                    ),
                }}
            />
            <Button
                variant="contained"
                onClick={handleSwapTokens}
                disabled={isTransactionPending || !tokenAmount || parseFloat(tokenAmount) <= 0}
            >
                {isTransactionPending ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    'Swap WETH for DAI'
                )}
            </Button>
            {transactionStatus && (
                <Alert
                    severity={
                        transactionStatus.includes('Failed') ? 'error' :
                        transactionStatus.includes('successfully') ? 'success' :
                        'info'
                    }
                >
                    {transactionStatus}
                </Alert>
            )}
        </Stack>
    );
};

export default SwapTokens;
