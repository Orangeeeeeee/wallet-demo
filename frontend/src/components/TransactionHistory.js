import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Typography,
    Link,
    Chip,
    Box,
    Divider
} from '@mui/material';
import UniswapV2RouterJson from './UniswapV2Router02.json';
import UniswapV2Pair from './UniswapV2Pair.json';
import { CONTRACT_ADDRESSES } from '../config/addresses';

const TransactionHistory = ({ userAddress }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    const ROUTER_ADDRESS = CONTRACT_ADDRESSES.ROUTER;
    const ROUTER_ABI = UniswapV2RouterJson.abi;
    const UniswapV2PairABI = UniswapV2Pair.abi;

    // Mock data for demonstration
    const MOCK_TRANSACTIONS = [
        {
            type: 'Swap',
            hash: '0x123...abc',
            inputAmount: '0.5',
            outputAmount: '1000',
            gasUsed: '0.002134',
            status: 'Success',
            timestamp: '2024-03-15 14:30:00',
            blockNumber: 12345678,
            nonce: 42
        },
        {
            type: 'Swap',
            hash: '0x456...def',
            inputAmount: '1.2',
            outputAmount: '2400',
            gasUsed: '0.001897',
            status: 'Failed',
            timestamp: '2024-03-15 14:15:00',
            blockNumber: 12345677,
            nonce: 41
        },
        {
            type: 'Swap',
            hash: '0x789...ghi',
            inputAmount: '0.3',
            outputAmount: '600',
            gasUsed: '0.002001',
            status: 'Success',
            timestamp: '2024-03-15 14:00:00',
            blockNumber: 12345676,
            nonce: 40
        }
    ];

    const fetchTransactions = async () => {
        if (!userAddress) return;

        try {
            setError(null);
            console.log('Fetching Uniswap transactions for address:', userAddress);
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const routerContract = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

            // Get current block
            const currentBlock = await provider.getBlockNumber();
            console.log('Current block:', currentBlock);
            
            const fromBlock = Math.max(0, currentBlock - 1000);
            console.log('Fetching from block:', fromBlock);

            // Create filters for Swap events
            const swapFilter = {
                address: ROUTER_ADDRESS,
                topics: [
                    ethers.utils.id("Swap(address,uint256,uint256,uint256,uint256,address)"),
                    null,
                    null,
                    ethers.utils.hexZeroPad(userAddress, 32)
                ],
                fromBlock,
                toBlock: currentBlock
            };

            console.log('Fetching events...');
            const swapEvents = await provider.getLogs(swapFilter);

            console.log('Found events:', swapEvents.length);

            // Process events into transactions
            const processedTransactions = await Promise.all(
                swapEvents.map(async (event) => {
                    try {
                        const block = await event.getBlock();
                        const receipt = await provider.getTransactionReceipt(event.transactionHash);
                        const tx = await provider.getTransaction(event.transactionHash);

                        // Decode the event data
                        const decodedData = routerContract.interface.parseLog(event);
                        const {
                            sender,
                            amount0In,
                            amount1In,
                            amount0Out,
                            amount1Out,
                            to
                        } = decodedData.args;

                        // Determine swap direction and amounts
                        const isExactInput = amount0In.gt(0) || amount1In.gt(0);
                        const inputAmount = amount0In.gt(0) ? amount0In : amount1In;
                        const outputAmount = amount0Out.gt(0) ? amount0Out : amount1Out;

                        return {
                            type: 'Swap',
                            hash: event.transactionHash,
                            from: sender,
                            to: to,
                            inputAmount: ethers.utils.formatEther(inputAmount),
                            outputAmount: ethers.utils.formatEther(outputAmount),
                            timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                            gasUsed: ethers.utils.formatEther(
                                receipt.gasUsed.mul(receipt.effectiveGasPrice)
                            ),
                            status: receipt.status === 1 ? 'Success' : 'Failed',
                            blockNumber: block.number,
                            nonce: tx.nonce
                        };
                    } catch (err) {
                        console.error('Error processing swap event:', err);
                        return null;
                    }
                })
            );

            // Filter out failed processing and sort by timestamp
            const validTransactions = processedTransactions
                .filter(tx => tx !== null)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10); // Show last 10 transactions

            console.log('Processed transactions:', validTransactions);

            // If no transactions found, use mock data
            if (validTransactions.length === 0) {
                console.log('No transactions found, using mock data');
                setTransactions(MOCK_TRANSACTIONS);
            } else {
                setTransactions(validTransactions);
            }
            setError(null);

        } catch (error) {
            console.error('Error fetching transaction history:', error);
            console.log('Using mock data due to error');
            setTransactions(MOCK_TRANSACTIONS);
            setError('Failed to load real transaction history. Showing example data.');
        }
    };

    useEffect(() => {
        if (userAddress) {
            fetchTransactions();

            // Set up event listeners for real-time updates
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const pairContract = new ethers.Contract(
                    CONTRACT_ADDRESSES.WETH_DAI_PAIR,
                    UniswapV2PairABI,
                    provider
                );

                // Listen for Swap events from the pair contract
                const swapFilter = pairContract.filters.Swap();

                const handleNewSwap = async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
                    // Only process events where the user is involved
                    if (to.toLowerCase() === userAddress.toLowerCase() || 
                        sender.toLowerCase() === userAddress.toLowerCase()) {
                        console.log('New swap detected involving user:', event);
                        await fetchTransactions();
                    }
                };

                pairContract.on(swapFilter, handleNewSwap);

                return () => {
                    pairContract.removeListener(swapFilter, handleNewSwap);
                };
            } catch (err) {
                console.error('Error setting up event listeners:', err);
                setError('Error setting up transaction monitoring');
            }
        }
    }, [userAddress]);

    if (!userAddress) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
                Uniswap Transaction History
                {transactions === MOCK_TRANSACTIONS && (
                    <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ ml: 2 }}
                    >
                        (Example Data)
                    </Typography>
                )}
            </Typography>
            
            <TableContainer component={Paper} sx={{ 
                boxShadow: 'none',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                            <TableCell>Type</TableCell>
                            <TableCell>Input Amount</TableCell>
                            <TableCell>Output Amount</TableCell>
                            <TableCell>Gas Fee</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Block</TableCell>
                            <TableCell>Nonce</TableCell>
                            <TableCell>Transaction</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.hash} hover>
                                <TableCell>
                                    <Chip 
                                        label={tx.type}
                                        color="primary"
                                        size="small"
                                        sx={{ minWidth: 80 }}
                                    />
                                </TableCell>
                                <TableCell>{parseFloat(tx.inputAmount).toFixed(4)} ETH</TableCell>
                                <TableCell>{parseFloat(tx.outputAmount).toFixed(4)} ETH</TableCell>
                                <TableCell>{parseFloat(tx.gasUsed).toFixed(6)} ETH</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={tx.status}
                                        color={tx.status === 'Success' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{tx.timestamp}</TableCell>
                                <TableCell>{tx.blockNumber}</TableCell>
                                <TableCell>{tx.nonce}</TableCell>
                                <TableCell>
                                    <Link 
                                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        {`${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {error && (
                <Typography 
                    color="text.secondary" 
                    sx={{ 
                        mt: 2, 
                        textAlign: 'center',
                        fontSize: '0.875rem'
                    }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default TransactionHistory;
