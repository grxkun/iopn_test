#!/usr/bin/env node
/*
 Compile and (optionally) deploy IOPN registrar + resolver.
 Usage:
  # compile only
  node scripts/deploy-name-registrar.js --compile-only

  # deploy (requires PRIVATE_KEY in env or --key)
  PRIVATE_KEY=0x... RPC_URL=https://testnet-rpc.iopn.tech node scripts/deploy-name-registrar.js --deploy

 The script will compile contracts in /contracts using solc-js and output ABI/bytecode to /artifacts.
*/

 
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

function usage() {
  console.log('Usage: node scripts/deploy-name-registrar.js [--compile-only] [--deploy] [--rpc RPC_URL] [--key PRIVATE_KEY]');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') { out.help = true; continue; }
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1];
      if (!val || val.startsWith('--')) { out[key] = true; } else { out[key] = val; i++; }
    }
  }
  return out;
}

async function compileContracts() {
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
        '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'] }
      }
    }
  };

  function findImports(importPath) {
    try {
      // prefer local contracts
      const localPath = path.join(contractsDir, importPath);
      if (fs.existsSync(localPath)) {
        return { contents: fs.readFileSync(localPath, 'utf8') };
      }
      // try node_modules
      const nmPath = path.join(__dirname, '..', 'node_modules', importPath);
      if (fs.existsSync(nmPath)) {
        return { contents: fs.readFileSync(nmPath, 'utf8') };
      }
     
      const nmPath2 = path.join(__dirname, '..', 'node_modules', importPath.replace('@', ''));
      if (fs.existsSync(nmPath2)) {
        return { contents: fs.readFileSync(nmPath2, 'utf8') };
      }
      return { error: 'File not found' };
    } catch (err) {
      return { error: err.message };
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const errs = output.errors.filter(e => e.severity === 'error');
    const warns = output.errors.filter(e => e.severity === 'warning');
    warns.forEach(w => console.warn(w.formattedMessage));
    if (errs.length) {
      errs.forEach(e => console.error(e.formattedMessage));
      throw new Error('Compilation failed');
    }
  }

  const artifactsDir = path.join(__dirname, '..', 'artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

  const compiled = {};
  for (const file in output.contracts) {
    for (const contractName in output.contracts[file]) {
      const data = output.contracts[file][contractName];
      const abi = data.abi;
      const bytecode = data.evm.bytecode.object;
      compiled[contractName] = { abi, bytecode };
      fs.writeFileSync(path.join(artifactsDir, contractName + '.abi.json'), JSON.stringify(abi, null, 2));
      fs.writeFileSync(path.join(artifactsDir, contractName + '.bin'), bytecode);
      console.log('Compiled', contractName);
    }
  }
  return compiled;
}

async function main() {
  const argv = parseArgs();
  if (argv.help) { usage(); process.exit(0); }

  const rpc = argv.rpc || process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';
  const key = argv.key || process.env.PRIVATE_KEY;
  const compileOnly = argv['compile-only'] || argv['compile'] || false;
  const doDeploy = argv.deploy || false;
  const feeTokens = argv.fee || process.env.REGISTRATION_FEE || '0';
  // convert token amount (e.g., "1") to wei string
  const feeWei = ethers.parseUnits(feeTokens.toString(), 18).toString();

  console.log('RPC:', rpc);

  const compiled = await compileContracts();

  if (compileOnly && !doDeploy) {
    console.log('Compilation finished. Artifacts written to /artifacts');
    process.exit(0);
  }

  if (!doDeploy) {
    console.log('No --deploy specified. Use --deploy to deploy contracts (requires PRIVATE_KEY).');
    process.exit(0);
  }

  if (!key) {
    console.error('No private key provided. Set PRIVATE_KEY env or pass --key <key>.');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  console.log('Deployer:', wallet.address);

  // Deploy registrar first
  const registrarData = compiled['IOPNRegistrar'];
  const resolverData = compiled['IOPNResolver'];
  if (!registrarData || !resolverData) {
    throw new Error('Compiled artifacts not found for registrar/resolver');
  }

  const factoryRegistrar = new ethers.ContractFactory(registrarData.abi, registrarData.bytecode, wallet);
  console.log('Deploying IOPNRegistrar... with registration fee (wei):', feeWei);
  const registrar = await factoryRegistrar.deploy("IOPN Registrar", "IOPN", feeWei);
  console.log('Registrar tx:', registrar.deploymentTransaction?.hash || 'pending...');
  await registrar.deploymentTransaction().wait();
  try { if (typeof registrar.waitForDeployment === 'function') await registrar.waitForDeployment(); } catch(err){ console.warn(err); }
  console.log('Registrar address:', registrar.target || registrar.address);

  // Deploy resolver with registrar address
  const factoryResolver = new ethers.ContractFactory(resolverData.abi, resolverData.bytecode, wallet);
  console.log('Deploying IOPNResolver...');
  const resolver = await factoryResolver.deploy(registrar.target || registrar.address);
  console.log('Resolver tx:', resolver.deploymentTransaction?.hash || 'pending...');
  await resolver.deploymentTransaction().wait();
  try { if (typeof resolver.waitForDeployment === 'function') await resolver.waitForDeployment(); } catch(err){ console.warn(err); }
  console.log('Resolver address:', resolver.target || resolver.address);

  console.log('\nDeployment complete. Save these addresses for the frontend.');
  console.log('REGISTRAR_ADDRESS=', registrar.target || registrar.address);
  console.log('RESOLVER_ADDRESS=', resolver.target || resolver.address);
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}
