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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Deploy Token</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Token Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Token Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Supply</label>
            <input
              type="number"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={deployToken}
            disabled={isPending || !name || !symbol || !supply}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Deploying...' : 'Deploy Token'}
          </button>
          {hash && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash: {hash}</p>
              {isConfirming && <p className="text-sm text-yellow-600">Confirming...</p>}
              {isConfirmed && <p className="text-sm text-green-600">Token deployed successfully!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}