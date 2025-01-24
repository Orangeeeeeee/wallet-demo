# Wallet Interface with Local Blockchain

This project is a wallet interface that interacts with smart contracts deployed on a local blockchain (Ganache). It includes token swapping functionality using a Uniswap-like interface.

## Project Structure

```
wallet-demo/
├── contracts/              # Hardhat project containing smart contracts
│   ├── README.md           # Project README
│   ├── artifacts/          # Artifacts generated by Hardhat
│   ├── contracts/         # Smart contract source files
│   ├── scripts/           # Deployment scripts
│   ├── test/             # Contract test files
│   └── hardhat.config.js  # Hardhat configuration
└── frontend/              # React frontend application
    ├── src/              # Source code
    ├── public/           # Static files
    └── package.json      # Frontend dependencies
```

## Prerequisites

- Node.js (v14+ recommended)
- Ganache (for local blockchain)
- MetaMask (or similar Web3 wallet)
- Git

## Assumptions

- **Local Blockchian**: The project is configured to work with a local blockchain provided by Ganache.
- **Mock Account**: The project is using a mock account from Ganache for development and testing purposes.
- **Token Contracts**: The project is configured to work with the MockWETH and MockDAI contracts.
- **Uniswap Implementation**: The project is using a local deployment of Uniswap V2 smart contracts instead of using the Uniswap SDK for off-chain routing calculations or fetching pool data.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd wallet-demo
   ```

2. **Install Dependencies**
   ```bash
   # Install contract dependencies
   cd contracts
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start Ganache**
   - Launch Ganache
   - Create a new workspace
   - Keep note of the RPC Server address (default: http://127.0.0.1:7545)

4. **Deploy Contracts**
   ```bash
   cd contracts
   npm hardhat node
   npx hardhat run scripts/deploy.js --network ganache
   ```
   - Copy the deployed contract addresses and paste them into the .env file

5. **Configure Frontend**
   ```bash
   cd ../frontend
   ```
   Create a `.env` file:
   ```
   REACT_APP_WETH_ADDRESS=<WETH_contract_address>
   REACT_APP_DAI_ADDRESS=<DAI_contract_address>
   REACT_APP_ROUTER_ADDRESS=<Router_contract_address>
   REACT_APP_FACTORY_ADDRESS=<Factory_contract_address>
   REACT_APP_WETH_DAI_PAIR=<WETH_DAI_Pair_address>
   ```

6. **Configure MetaMask**
   - Add a new network in MetaMask:
     - Network Name: Ganache
     - RPC URL: http://127.0.0.1:7545
     - Chain ID: 1337
     - Currency Symbol: ETH
   - Import a Ganache account using its private key

7. **Start the Frontend**
   ```bash
   npm start
   ```
   The application will be available at http://localhost:3000

## Features

- Connect wallet using MetaMask
- View token balances (ETH, WETH, DAI)
- Wrap/Unwrap ETH to WETH
- Swap between WETH and DAI
- Real-time price updates
- Transaction status notifications

## Testing

1. **Contract Tests**
   ```bash
   cd contracts
   npx hardhat test
   ```

2. **Frontend Tests**
   ```bash
   cd frontend
   npm test
   ```

## Common Issues & Troubleshooting

1. **MetaMask Connection Issues**
   - Ensure you're connected to the correct network (Ganache)
   - Reset your MetaMask account if transactions are stuck

2. **Contract Interaction Failures**
   - Verify contract addresses in the `.env` file
   - Ensure you have sufficient token balances and ETH for gas

3. **Network Issues**
   - Confirm Ganache is running
   - Check if the RPC URL matches your Ganache instance

## Development Notes

- The project uses Hardhat for smart contract development
- Frontend is built with React and ethers.js
- Mock tokens (WETH, DAI) are used for testing
- Uniswap V2 contracts are used for swap functionality

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request