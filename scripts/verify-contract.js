#!/usr/bin/env node
/*
 Contract verification and publishing script for IOPN Testnet
 Usage:
  # Verify contract
  node scripts/verify-contract.js --verify

  # Deploy and verify
  node scripts/verify-contract.js --deploy-and-verify

  # Just compile
  node scripts/verify-contract.js --compile
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

function usage() {
  console.log('Usage: node scripts/verify-contract.js [--compile] [--deploy] [--verify] [--deploy-and-verify]');
  console.log('Environment variables:');
  console.log('  PRIVATE_KEY - Your wallet private key');
  console.log('  RPC_URL - IOPN testnet RPC URL (default: https://testnet-rpc.iopn.tech)');
  console.log('  REGISTRATION_FEE - Fee in OPN tokens (default: 0)');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') { out.help = true; continue; }
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      out[key] = true;
    }
  }
  return out;
}

async function compileContracts() {
  console.log('🔨 Compiling contracts...');

  const contractsDir = path.join(__dirname, '..', 'contracts');
  const sources = {};
  fs.readdirSync(contractsDir).forEach(file => {
    if (file.endsWith('.sol')) {
      const full = path.join(contractsDir, file);
      sources[file] = { content: fs.readFileSync(full, 'utf8') };
    }
  });

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'metadata']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    console.error('❌ Compilation errors:');
    output.errors.forEach(error => console.error(error.formattedMessage));
    return null;
  }

  console.log('✅ Compilation successful');
  return output.contracts;
}

async function deployContract(compiledContracts) {
  console.log('🚀 Deploying IOPN Registrar...');

  const rpc = process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';
  const key = process.env.PRIVATE_KEY;
  const feeTokens = process.env.REGISTRATION_FEE || '0';

  if (!key) {
    throw new Error('No PRIVATE_KEY in environment');
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  console.log(`📡 Network: ${rpc}`);
  console.log(`👤 Deployer: ${wallet.address}`);
  console.log(`💰 Registration fee: ${feeTokens} OPN`);

  // Get contract artifacts
  const contractName = 'IOPNRegistrar.sol';
  const contractData = compiledContracts[contractName]['IOPNRegistrar'];

  if (!contractData) {
    throw new Error('Contract IOPNRegistrar not found in compilation output');
  }

  const bytecode = contractData.evm.bytecode.object;
  const abi = contractData.abi;

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  // Constructor parameters: name, symbol, registrationFeeWei
  const name = "IOPN Registrar";
  const symbol = "IOPN";
  const feeWei = ethers.parseEther(feeTokens);

  console.log('📝 Deploying contract...');
  const contract = await factory.deploy(name, symbol, feeWei);
  console.log(`⏳ Transaction hash: ${contract.deploymentTransaction().hash}`);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`✅ Contract deployed at: ${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: wallet.address,
    network: rpc,
    registrationFee: feeTokens,
    deploymentTx: contract.deploymentTransaction().hash,
    deployedAt: new Date().toISOString(),
    abi
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'artifacts', 'deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('💾 Deployment info saved to artifacts/deployment.json');

  return { contractAddress, abi, deploymentTx: contract.deploymentTransaction().hash };
}

async function verifyContract(contractAddress, abi, deploymentTx) {
  console.log('🔍 Verifying contract on IOPN Testnet...');

  // For IOPN testnet, we'll create a verification request
  // This would typically be sent to an explorer API
  const rpc = process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';

  // Read the source code
  const sourcePath = path.join(__dirname, '..', 'contracts', 'IOPNRegistrar.sol');
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');

  // Create verification data
  const verificationData = {
    contractAddress,
    sourceCode,
    abi,
    compilerVersion: '0.8.21',
    optimization: true,
    runs: 200,
    constructorArgs: [], // We'll need to encode these properly
    deploymentTx,
    network: rpc,
    verifiedAt: new Date().toISOString()
  };

  // For now, just save the verification data
  // In a real scenario, this would be sent to the explorer API
  fs.writeFileSync(
    path.join(__dirname, '..', 'artifacts', 'verification.json'),
    JSON.stringify(verificationData, null, 2)
  );

  console.log('📋 Verification data saved to artifacts/verification.json');
  console.log('🔗 To complete verification, submit this data to your blockchain explorer');

  // Try to get the constructor arguments from the deployment transaction
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const tx = await provider.getTransaction(deploymentTx);

    if (tx && tx.data) {
      const iface = new ethers.Interface(abi);
      const decoded = iface.parseTransaction({ data: tx.data });

      if (decoded && decoded.args) {
        console.log('📝 Constructor arguments:');
        console.log('  name:', decoded.args[0]);
        console.log('  symbol:', decoded.args[1]);
        console.log('  registrationFeeWei:', decoded.args[2].toString());
      }
    }
  } catch (error) {
    console.log('⚠️  Could not decode constructor arguments:', error.message);
  }
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    usage();
    process.exit(0);
  }

  try {
    // Compile contracts
    const compiledContracts = await compileContracts();
    if (!compiledContracts) {
      process.exit(1);
    }

    let deploymentResult = null;

    // Deploy if requested
    if (args.deploy || args['deploy-and-verify']) {
      deploymentResult = await deployContract(compiledContracts);
    }

    // Verify if requested
    if (args.verify || args['deploy-and-verify']) {
      if (args.verify && !deploymentResult) {
        // Load existing deployment info
        const deploymentPath = path.join(__dirname, '..', 'artifacts', 'deployment.json');
        if (fs.existsSync(deploymentPath)) {
          deploymentResult = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
          console.log('📂 Loaded existing deployment info');
        } else {
          console.error('❌ No deployment info found. Deploy first with --deploy');
          process.exit(1);
        }
      }

      if (deploymentResult) {
        await verifyContract(
          deploymentResult.contractAddress,
          deploymentResult.abi,
          deploymentResult.deploymentTx
        );
      }
    }

    console.log('🎉 Operation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}