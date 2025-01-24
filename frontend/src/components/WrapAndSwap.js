import React, { useState } from 'react';
import {
    Box,
    Paper,
    Container,
    Divider,
    Alert,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import WrapETH from './WrapETH';
import SwapTokens from './SwapTokens';
import TransactionHistory from './TransactionHistory';

const WrapAndSwap = ({ userAddress, refreshBalance }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={3}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            centered
                        >
                            <Tab label="Wrap/Unwrap ETH" disabled={!userAddress} />
                            <Tab label="Swap Tokens" disabled={!userAddress} />
                        </Tabs>

                        <Divider />

                        {!userAddress ? (
                            <Alert severity="info">
                                Please connect your wallet to use this feature
                            </Alert>
                        ) : (
                            <>
                                {activeTab === 0 && (
                                    <WrapETH
                                        userAddress={userAddress}
                                        refreshBalance={refreshBalance}
                                    />
                                )}
                                {activeTab === 1 && (
                                    <SwapTokens
                                        userAddress={userAddress}
                                        refreshBalance={refreshBalance}
                                    />
                                )}
                                <TransactionHistory userAddress={userAddress} />
                            </>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
};

export default WrapAndSwap;