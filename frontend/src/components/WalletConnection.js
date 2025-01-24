import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
    Button, 
    Typography, 
    CircularProgress, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Box,
    Paper,
    Stack,
    Chip,
    Container
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getProvider } from '../ethersConfig';

const WalletConnection = ({ onAddressChange }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed.");
            alert("Please install MetaMask to use this feature!");
            return;
        }

        try {
            setLoading(true);
            await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts[0]);
            if (onAddressChange) {
                onAddressChange(accounts[0]);
            }
            setError('');
        } catch (error) {
            console.error("Connection Error:", error);
            setError("Failed to connect to wallet.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial setup and event listeners
        const setupListeners = async () => {
            if (window.ethereum) {
                // Listen for account changes
                window.ethereum.on('accountsChanged', async (accounts) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        if (onAddressChange) {
                            onAddressChange(accounts[0]);
                        }
                    } else {
                        handleDisconnect();
                    }
                });

                // Listen for chain changes
                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });
            }
        };

        setupListeners();

        // Cleanup listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, [walletAddress]);

    const handleDisconnect = () => {
        setWalletAddress('');
        setError('');
        setOpen(false);
        if (onAddressChange) {
            onAddressChange(null);
        }
        if (window.ethereum && window.ethereum.removeAllListeners) {
            window.ethereum.removeAllListeners();
        }
    };

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 2 }}>
                <Paper 
                    elevation={3}
                    sx={{ 
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack spacing={2}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center'
                        }}>
                            <Typography 
                                variant="h6" 
                                component="h2" 
                                sx={{ 
                                    fontWeight: 500,
                                    color: 'text.primary'
                                }}
                            >
                                Wallet Status
                            </Typography>
                            {walletAddress && (
                                <Chip 
                                    label="Connected" 
                                    color="success" 
                                    size="small"
                                    sx={{ 
                                        fontWeight: 500,
                                        '& .MuiChip-label': {
                                            px: 2
                                        }
                                    }}
                                />
                            )}
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : !walletAddress ? (
                            <Button 
                                variant="contained" 
                                onClick={connectWallet}
                                startIcon={<AccountBalanceWalletIcon />}
                                sx={{
                                    py: 1.5,
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark'
                                    },
                                    fontWeight: 500
                                }}
                            >
                                Connect Wallet
                            </Button>
                        ) : (
                            <Box sx={{ 
                                bgcolor: 'grey.50', 
                                p: 2, 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Connected Address
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontFamily: 'monospace',
                                        bgcolor: 'background.paper',
                                        p: 1,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200'
                                    }}
                                >
                                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    onClick={handleClickOpen}
                                    sx={{ 
                                        mt: 2,
                                        fontWeight: 500
                                    }}
                                    size="small"
                                >
                                    Disconnect
                                </Button>
                            </Box>
                        )}

                        {error && (
                            <Typography 
                                color="error" 
                                sx={{ 
                                    bgcolor: 'error.light', 
                                    p: 2, 
                                    borderRadius: 1,
                                    color: 'error.main',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Box>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Disconnect Wallet
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to disconnect your wallet?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleClose}
                        sx={{ fontWeight: 500 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDisconnect} 
                        color="error"
                        variant="contained"
                        sx={{ fontWeight: 500 }}
                    >
                        Disconnect
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default WalletConnection;
