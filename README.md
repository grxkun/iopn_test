# IOPN Platform

A web platform for interacting with the IOPN testnet blockchain network, featuring name registration, token deployment, and trading capabilities.

## Features

- **Name Service**: Register and manage .iopn domain names as ERC-721 NFTs
- **Deploy Token**: Create and deploy your own ERC-20 tokens on the IOPN network
- **Batch Sender**: Send multiple transactions in a batch for efficiency
- **Buy/Sell**: Trade tokens on the IOPN network (requires DEX deployment)

## Network Configuration

- **Network Name**: OPN Testnet
- **Chain ID**: 984 (0x3d8)
- **RPC URL**: https://testnet-rpc.iopn.tech
- **Currency Symbol**: OPN
- **Block Explorer**: https://testnet-explorer.iopn.tech

## Deployed Contracts

- **IOPN Registrar**: `0x336635Bf4E36F9B5594A62C0109e4Bf7b0c8AFcD`
- **IOPN Resolver**: `0x8f601f80B1B84c656aad074627db879f36f1627A`
- **Registration Fee**: 0.01 OPN tokens

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env`:
   ```
   NEXT_PUBLIC_REGISTRAR_ADDRESS=0x336635Bf4E36F9B5594A62C0109e4Bf7b0c8AFcD
   NEXT_PUBLIC_RESOLVER_ADDRESS=0x8f601f80B1B84c656aad074627db879f36f1627A
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

5. Connect your wallet and start using the platform.

### Production Deployment

The app is ready for deployment to Vercel or any other hosting platform:

1. **Vercel Deployment**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Set Environment Variables in Vercel**:
   - `NEXT_PUBLIC_REGISTRAR_ADDRESS`: `0x336635Bf4E36F9B5594A62C0109e4Bf7b0c8AFcD`
   - `NEXT_PUBLIC_RESOLVER_ADDRESS`: `0x8f601f80B1B84c656aad074627db879f36f1627A`

## Name Service Usage

### Registering a Name
1. Go to the "Register" page
2. Enter a name (3-32 characters, lowercase letters and numbers only)
3. Check availability
4. If available, click "Register" and confirm the transaction
5. Pay the 0.01 OPN registration fee

### Resolving Names
1. Go to the "Resolve" page
2. Enter a name to look up its associated address and text records

### Checking Ownership
1. Go to the "My Names" page
2. Enter a name to check who owns it

## Technologies Used

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, RainbowKit, Ethers.js v6, Viem
- **Smart Contracts**: Solidity 0.8.21, OpenZeppelin ERC-721
- **Development**: ESLint, Turbopack

## Contract Architecture

- **IOPNRegistrar.sol**: ERC-721 compliant name registrar with registration fees
- **IOPNResolver.sol**: Name resolver for address and text record lookups
- **Validation**: Names must be 3-32 characters, containing only lowercase letters and numbers
- **Fees**: Configurable registration fee (currently 0.01 OPN)

## Development Scripts

```bash
# Compile contracts
node scripts/deploy-name-registrar.js --compile-only

# Deploy contracts (requires PRIVATE_KEY)
node scripts/deploy-name-registrar.js --deploy --fee 0.01

# Test name registration
node scripts/test-register.js <name>

# Simulate deployment
node scripts/simulate-deploy.js <name>
```

## References

- [IOPN Developer Docs](https://iopn.gitbook.io/iopn/developer-docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

## Note

For the Buy/Sell feature to work, a DEX router must be deployed on the IOPN network. Update the router address in the code accordingly.
