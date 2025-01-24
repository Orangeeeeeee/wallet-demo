import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Container from '@mui/material/Container';
import WalletConnection from './components/WalletConnection';
import WrapAndSwap from './components/WrapAndSwap';

const appTheme = createTheme({
    palette: {
        primary: {
            main: '#1a237e',
            light: '#534bae',
            dark: '#000051',
        },
        background: {
            default: '#f5f5f5'
        }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

const App = () => {
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [refreshBalanceCallback, setRefreshBalanceCallback] = useState(null);

    const handleAddressChange = (address, refreshCallback) => {
        setConnectedAddress(address);
        setRefreshBalanceCallback(() => refreshCallback);
        console.log('Address changed:', address);
    };

    return (
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <Container>
                <WalletConnection onAddressChange={handleAddressChange} />
                {/* <MaxTransactFeature /> */}
                {connectedAddress && (
                    <WrapAndSwap 
                        userAddress={connectedAddress} 
                        refreshBalance={refreshBalanceCallback}
                    />
                )}
            </Container>
        </ThemeProvider>
    );
};

export default App;
