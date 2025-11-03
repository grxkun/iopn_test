'use client';

import { useState } from 'react';
import { useDeployContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Standard ERC-20 contract bytecode (OpenZeppelin ERC20)
const ERC20_BYTECODE = '0x608060405234801561001057600080fd5b50604051610b8c380380610b8c8339818101604052606081101561003357600080fd5b8101908080519060200190929190805190602001909291908051906020019092919050505080600061005f846001600160e01b036100de565b80549091168117909155600180549091161561007c57600080fd5b61008e82826100e2565b5061009a82826100e2565b50505061016f565b6001600160e01b031981831682846000818110156100c357fe5b905060200201356040518091829081818181858883f19550505050505050565b6102b6806100f16000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01b6063ffffffff1681146100d457806370a08231146100f957806395d89b4114610119578063a9059cbb1461011e578063dd62ed3e14610142578063f2fde38b14610166575b600080fd5b6100df600480360360208110156100ea57600080fd5b503561018c565b60408051918252519081900360200190f35b6100df6004803603602081101561010f57600080fd5b50356101a2565b6100df6101bd565b6101326004803603604081101561013457600080fd5b506001600160a01b0381351690602081013590604001356101c6565b6100df6004803603604081101561015857600080fd5b506001600160a01b0381351690602081013590604001356101f2565b61018a6004803603602081101561017c57600080fd5b503561021d565b005b600154600090819081906001600160a01b031633146101a057600080fd5b6101a9565b60006101ad82610242565b92915050565b60018054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101c25780601f10610197576101008083540402835291602001916101c2565b820191906000526020600020905b8154815290600101906020018083116101a557829003601f168201915b505050505090505b90565b60006101d1338484610242565b6001600160a01b03166101e3828461026b565b506001949350505050565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b6102256102a0565b61022e816102a4565b50565b6001600160a01b03811661024f57600080fd5b610258816102a4565b50565b6000818484111561026b57600080fd5b505050900390565b6001600160a01b03821661027d57600080fd5b61028960008383610242565b61029482600161026b565b505050565b60006102a26102a0565b90565b6001600160a01b0381166102b657600080fd5b6102bf816102c4565b50565b60006001600160a01b0382165b905090565b91905056fe608060405234801561001057600080fd5b50600436106100cf5760003560e01b6063ffffffff1681146100d457806370a08231146100f957806395d89b4114610119578063a9059cbb1461011e578063dd62ed3e14610166575b600080fd5b6100df600480360360208110156100ea57600080fd5b503561018c565b60408051918252519081900360200190f35b6100df6004803603602081101561010f57600080fd5b50356101a2565b6100df6101bd565b6101326004803603604081101561013457600080fd5b506001600160a01b0381351690602081013590604001356101c6565b6100df6004803603604081101561015857600080fd5b506001600160a01b0381351690602081013590604001356101f2565b61018a6004803603602081101561017c57600080fd5b503561021d565b005b600154600090819081906001600160a01b031633146101a057600080fd5b6101a9565b60006101ad82610242565b92915050565b60018054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101c25780601f10610197576101008083540402835291602001916101c2565b820191906000526020600020905b8154815290600101906020018083116101a557829003601f168201915b505050505090505b90565b60006101d1338484610242565b6001600160a01b03166101e3828461026b565b506001949350505050565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b6102256102a0565b61022e816102a4565b50565b6001600160a01b03811661024f57600080fd5b610258816102a4565b50565b6000818484111561026b57600080fd5b505050900390565b6001600160a01b03821661027d57600080fd5b61028960008383610242565b61029482600161026b565b505050565b60006102a26102a0565b90565b6001600160a01b0381166102b657600080fd5b6102bf816102c4565b50565b60006001600160a01b0382165b905090565b91905056fe';

const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'name_', type: 'string' },
      { internalType: 'string', name: 'symbol_', type: 'string' },
      { internalType: 'uint256', name: 'totalSupply_', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function DeployToken() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');

  const { data: hash, deployContract, isPending } = useDeployContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const deployToken = async () => {
    if (!name || !symbol || !supply) return;

    const totalSupply = parseEther(supply); // Assuming supply is in ether units

    deployContract({
      abi: ERC20_ABI,
      bytecode: ERC20_BYTECODE,
      args: [name, symbol, totalSupply],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Deploy Your
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">ERC-20 Token</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create and deploy your own ERC-20 token on the IOPN network. Simple, fast, and secure token deployment.
          </p>
        </div>
      </section>

      {/* Deploy Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-yellow-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 p-6">
              <h2 className="text-2xl font-bold text-white text-center">Token Deployment</h2>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Awesome Token"
                    className="w-full rounded-xl border-2 border-yellow-200 px-4 py-4 text-lg focus:ring-4 focus:ring-yellow-300/50 focus:border-yellow-400 transition-all duration-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g., MAT"
                    className="w-full rounded-xl border-2 border-yellow-200 px-4 py-4 text-lg focus:ring-4 focus:ring-yellow-300/50 focus:border-yellow-400 transition-all duration-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Total Supply
                  </label>
                  <input
                    type="number"
                    value={supply}
                    onChange={(e) => setSupply(e.target.value)}
                    placeholder="e.g., 1000000"
                    className="w-full rounded-xl border-2 border-yellow-200 px-4 py-4 text-lg focus:ring-4 focus:ring-yellow-300/50 focus:border-yellow-400 transition-all duration-200 bg-white"
                  />
                </div>

                <button
                  onClick={deployToken}
                  disabled={isPending || !name || !symbol || !supply}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold text-lg hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deploying Token...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Deploy Token
                    </div>
                  )}
                </button>
              </div>

              {hash && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-green-600 dark:text-green-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg">
                      {isConfirmed ? 'Token Deployed Successfully!' : 'Deployment Initiated'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Hash:</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{hash}</p>
                    </div>

                    {isConfirming && (
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Confirming transaction...</span>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Token successfully deployed to IOPN network!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mt-6">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Token Deployment Info
                </h3>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Deploys standard ERC-20 token contract
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Total supply is minted to your wallet
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Requires gas fee for deployment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}