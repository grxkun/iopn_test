'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, defineChain } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// Define IOPN Testnet chain
const iopnTestnet = defineChain({
  id: 984,
  name: 'IOPN Testnet',
  network: 'iopn-testnet',
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
    default: { name: 'IOPN Explorer', url: 'https://testnet.iopn.tech' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'IOPN Community domains',
  projectId: 'your-project-id', // Replace with actual project ID from WalletConnect
  chains: [
    iopnTestnet,
    mainnet,
    sepolia,
  ],
  transports: {
    [iopnTestnet.id]: http('https://testnet-rpc.iopn.tech'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});