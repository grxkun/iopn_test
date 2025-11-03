'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Mock DEX router ABI (simplified Uniswap V2 Router)
const ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactETHForTokens',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForETH',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Mock router address - replace with actual if available
const ROUTER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder

export default function BuySell() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);

  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const executeTrade = async () => {
    if (!address || !tokenAddress || !amount) return;

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    if (isBuying) {
      // Buy token with OPN
      writeContract({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [0, ['0x0000000000000000000000000000000000000000', tokenAddress], address, deadline], // WETH placeholder
        value: parseEther(amount),
      });
    } else {
      // Sell token for OPN
      // First need approval, but for simplicity, assume approved
      writeContract({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [parseEther(amount), 0, [tokenAddress, '0x0000000000000000000000000000000000000000'], address, deadline],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Buy/Sell Tokens</h1>
        {!address && <p className="text-red-500 mb-4">Please connect your wallet first.</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Token Address</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={isBuying ? "Amount of OPN to spend" : "Amount of tokens to sell"}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
            <div className="mt-1 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isBuying}
                  onChange={() => setIsBuying(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Buy</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isBuying}
                  onChange={() => setIsBuying(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Sell</span>
              </label>
            </div>
          </div>
          <button
            onClick={executeTrade}
            disabled={isPending || !address || !tokenAddress || !amount}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Executing...' : `${isBuying ? 'Buy' : 'Sell'} Tokens`}
          </button>
          {hash && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash: {hash}</p>
              {isConfirming && <p className="text-sm text-yellow-600">Confirming...</p>}
              {isConfirmed && <p className="text-sm text-green-600">Trade executed successfully!</p>}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Note: This assumes a DEX router is deployed on IOPN. Replace router address with actual one.
          </p>
        </div>
      </div>
    </div>
  );
}