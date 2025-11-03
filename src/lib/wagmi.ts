'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'IOPN Platform',
  projectId: 'your-project-id', // Replace with actual project ID from WalletConnect
  chains: [
    {
      id: 984,
      name: 'OPN Testnet',
      network: 'opn-testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'OPN',
        symbol: 'OPN',
      },
      rpcUrls: {
        default: {
          http: ['https://testnet-rpc.iopn.tech'],
        },
        public: {
          http: ['https://testnet-rpc.iopn.tech'],
        },
      },
      blockExplorers: {
        default: { name: 'IOPN Explorer', url: 'https://testnet-explorer.iopn.tech' }, // Assuming, replace if known
      },
      testnet: true,
    },
    mainnet,
    sepolia,
  ],
  transports: {
    [984]: http('https://testnet-rpc.iopn.tech'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});