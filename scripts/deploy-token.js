#!/usr/bin/env node
/*
 CLI deploy script for ERC-20 token on IOPN testnet
 Usage examples:

 1) Using environment variables:
    PRIVATE_KEY=0x... RPC_URL=https://testnet-rpc.iopn.tech \
      node scripts/deploy-token.js --name "MyToken" --symbol "MTK" --supply "1000000"

 2) Passing as flags (not recommended for private key):
    node scripts/deploy-token.js --name MyToken --symbol MTK --supply 1000000 --rpc https://testnet-rpc.iopn.tech --key 0x...

 Note: supply is in token units (will be parsed with 18 decimals). Make sure the deployer wallet has sufficient OPN balance.
*/

 
const { ethers } = require('ethers');
// Load environment variables from .env if present
try {
  require('dotenv').config();
} catch {
  // noop if dotenv is not available
}

function usage() {
  console.log('\nDeploy ERC-20 to IOPN testnet');
  console.log('Usage: node scripts/deploy-token.js --name NAME --symbol SYMBOL --supply SUPPLY [--rpc RPC_URL] [--key PRIVATE_KEY]');
  console.log('\nOptions:');
  console.log('  --name     Token name (e.g. MyToken)');
  console.log('  --symbol   Token symbol (e.g. MTK)');
  console.log('  --supply   Total supply (in whole tokens, decimals=18)');
  console.log('  --rpc      RPC URL (default: https://testnet-rpc.iopn.tech)');
  console.log('  --key      Private key (or set env var PRIVATE_KEY)');
  console.log('\nExamples:');
  console.log('  PRIVATE_KEY=0x... node scripts/deploy-token.js --name MyToken --symbol MTK --supply 1000000');
  console.log('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') {
      out.help = true;
      continue;
    }
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1];
      if (!val || val.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = val;
        i++;
      }
    }
  }
  return out;
}

async function main() {
  const argv = parseArgs();
  if (argv.help) {
    usage();
    process.exit(0);
  }

  const name = argv.name;
  const symbol = argv.symbol;
  const supply = argv.supply;
  const dryRun = argv.dry || argv['dry-run'] || false;
  const decimalsArg = argv.decimals || argv.dec || argv.d;
  const decimals = decimalsArg ? Number(decimalsArg) : 18;
  const rpc = argv.rpc || process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';
  const key = argv.key || process.env.PRIVATE_KEY;

  if (!name || !symbol || !supply) {
    console.error('Missing required arguments.');
    usage();
    process.exit(1);
  }

  if (!key) {
    console.error('No private key provided. Set PRIVATE_KEY env or use --key flag. Aborting.');
    process.exit(1);
  }

  console.log('Using RPC:', rpc);

  // Basic ERC20 bytecode + ABI (constructor: name, symbol, totalSupply)
  // This is a standard compiled ERC20 (from the project UI). If you have a compiled artifact, replace ABI/BYTECODE accordingly.
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
    { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'owner', type: 'address' }, { indexed: true, internalType: 'address', name: 'spender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' } ], name: 'Approval', type: 'event' },
    { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'from', type: 'address' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' } ], name: 'Transfer', type: 'event' },
    { inputs: [ { internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' } ], name: 'allowance', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
    { inputs: [ { internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'approve', outputs: [ { internalType: 'bool', name: '', type: 'bool' } ], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [ { internalType: 'address', name: 'account', type: 'address' } ], name: 'balanceOf', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'decimals', outputs: [ { internalType: 'uint8', name: '', type: 'uint8' } ], stateMutability: 'view', type: 'function' },
    { inputs: [ { internalType: 'address', name: 'recipient', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'transfer', outputs: [ { internalType: 'bool', name: '', type: 'bool' } ], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [ { internalType: 'address', name: 'sender', type: 'address' }, { internalType: 'address', name: 'recipient', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'transferFrom', outputs: [ { internalType: 'bool', name: '', type: 'bool' } ], stateMutability: 'nonpayable', type: 'function' }
  ];

  const ERC20_BYTECODE = '0x608060405234801561001057600080fd5b50604051610b8c380380610b8c8339818101604052606081101561003357600080fd5b8101908080519060200190929190805190602001909291908051906020019092919050505080600061005f846001600160e01b036100de565b80549091168117909155600180549091161561007c57600080fd5b61008e82826100e2565b5061009a82826100e2565b50505061016f565b6001600160e01b031981831682846000818110156100c357fe5b905060200201356040518091829081818181858883f19550505050505050565b6102b6806100f16000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01b6063ffffffff1681146100d457806370a08231146100f957806395d89b4114610119578063a9059cbb1461011e578063dd62ed3e14610142578063f2fde38b14610166575b600080fd5b6100df600480360360208110156100ea57600080fd5b503561018c565b60408051918252519081900360200190f35b6100df6004803603602081101561010f57600080fd5b50356101a2565b6100df6101bd565b6101326004803603604081101561013457600080fd5b506001600160a01b0381351690602081013590604001356101c6565b6100df6004803603604081101561015857600080fd5b506001600160a01b0381351690602081013590604001356101f2565b61018a6004803603602081101561017c57600080fd5b503561021d565b005b600154600090819081906001600160a01b031633146101a057600080fd5b6101a9565b60006101ad82610242565b92915050565b60018054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101c25780601f10610197576101008083540402835291602001916101c2565b820191906000526020600020905b8154815290600101906020018083116101a557829003601f168201915b505050505090505b90565b60006101d1338484610242565b6001600160a01b03166101e3828461026b565b506001949350505050565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b6102256102a0565b61022e816102a4565b50565b6001600160a01b03811661024f57600080fd5b610258816102a4565b50565b6000818484111561026b57600080fd5b505050900390565b6001600160a01b03821661027d57600080fd5b61028960008383610242565b61029482600161026b565b505050565b60006102a26102a0565b90565b6001600160a01b0381166102b657600080fd5b6102bf816102c4565b50565b60006001600160a01b0382165b905090565b91905056fe608060405234801561001057600080fd5b50600436106100cf5760003560e01b6063ffffffff1681146100d457806370a08231146100f957806395d89b4114610119578063a9059cbb1461011e578063dd62ed3e14610166575b600080fd5b6100df600480360360208110156100ea57600080fd5b503561018c565b60408051918252519081900360200190f35b6100df6004803603602081101561010f57600080fd5b50356101a2565b6100df6101bd565b6101326004803603604081101561013457600080fd5b506001600160a01b0381351690602081013590604001356101c6565b6100df6004803603604081101561015857600080fd5b506001600160a01b0381351690602081013590604001356101f2565b61018a6004803603602081101561017c57600080fd5b503561021d565b005b600154600090819081906001600160a01b031633146101a057600080fd5b6101a9565b60006101ad82610242565b92915050565b60018054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156101c25780601f10610197576101008083540402835291602001916101c2565b820191906000526020600020905b8154815290600101906020018083116101a557829003601f168201915b505050505090505b90565b60006101d1338484610242565b6001600160a01b03166101e3828461026b565b506001949350505050565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b6102256102a0565b61022e816102a4565b50565b6001600160a01b03811661024f57600080fd5b610258816102a4565b50565b6000818484111561026b57600080fd5b505050900390565b6001600160a01b03821661027d57600080fd5b61028960008383610242565b61029482600161026b565b505050565b60006102a26102a0565b90565b6001600160a01b0381166102b657600080fd5b6102bf816102c4565b50565b60006001600160a01b0382165b905090565b91905056fe';

  // Connect provider (wallet only needed for live deploy)
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  const totalSupply = ethers.parseUnits(supply.toString(), decimals);

  console.log('Preparing deployment...');
  // Create a factory without signer to inspect deploy tx
  const factory = new ethers.ContractFactory(ERC20_ABI, ERC20_BYTECODE);
  const unsignedDeployTx = factory.getDeployTransaction(name, symbol, totalSupply);

  if (dryRun) {
    console.log('\n-- DRY RUN --');
    console.log('Constructor args:');
    console.log('  name:', name);
    console.log('  symbol:', symbol);
    console.log('  totalSupply (tokens):', supply);
    console.log('  totalSupply (units):', totalSupply.toString());
    console.log('\nEncoded deploy data (hex):', unsignedDeployTx.data || unsignedDeployTx.dataHex || '<none>');

    if (key) {
      // If a key is available, show deployer and estimate gas
      const wallet = new ethers.Wallet(key);
      console.log('Deployer address (from provided key):', wallet.address);

      // attach from and estimate gas
      const txForEstimate = Object.assign({}, unsignedDeployTx, { from: wallet.address });
      try {
        const gasEstimate = await provider.estimateGas(txForEstimate);
        console.log('Estimated gas:', gasEstimate.toString());
      } catch (err) {
        console.warn('Gas estimation failed:', err.message || err);
      }
    } else {
      console.log('\nNo private key provided; to estimate gas, re-run with PRIVATE_KEY set or --key flag.');
    }

    process.exit(0);
  }

  if (!key) {
    console.error('No private key provided. Provide PRIVATE_KEY env or --key to perform a live deploy.');
    process.exit(1);
  }

  const wallet = new ethers.Wallet(key, provider);
  console.log('Deployer address:', wallet.address);

  console.log(`Deploying ${name} (${symbol}) with total supply ${supply} tokens (${totalSupply.toString()} units)`);
  const factoryWithSigner = new ethers.ContractFactory(ERC20_ABI, ERC20_BYTECODE, wallet);
  const contract = await factoryWithSigner.deploy(name, symbol, totalSupply);
  console.log('Transaction hash:', contract.deployTransaction.hash);

  console.log('Waiting for contract to be mined...');
  try {
    if (typeof contract.waitForDeployment === 'function') {
      await contract.waitForDeployment();
    } else if (contract.deploymentTransaction) {
      const receipt = await contract.deploymentTransaction().wait();
      console.log('Block number:', receipt.blockNumber || (receipt && receipt.blockNumber));
    }
  } catch (err) {
    // ignore - fallback
    console.warn('Wait for deployment fallback failed:', err?.message || err);
  }

  console.log('Contract deployed at:', contract.target || contract.address || contract.address);
  console.log('Deployment tx:', contract.deployTransaction.hash);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
}
