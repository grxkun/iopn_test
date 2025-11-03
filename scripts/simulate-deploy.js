#!/usr/bin/env node
 
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ethers } = require('ethers');

function ensureCompiled() {
  const artifactsDir = path.join(__dirname, '..', 'artifacts');
  const regBin = path.join(artifactsDir, 'IOPNRegistrar.bin');
  const resBin = path.join(artifactsDir, 'IOPNResolver.bin');
  if (!fs.existsSync(regBin) || !fs.existsSync(resBin)) {
    console.log('Artifacts not found — compiling contracts first...');
    execSync('node scripts/deploy-name-registrar.js --compile-only', { stdio: 'inherit' });
  }
}

function toTokenId(name) {
  const bytes = ethers.toUtf8Bytes(name);
  const hash = ethers.keccak256(bytes);
  let tokenId = BigInt(hash);
  if (tokenId === 0n) tokenId = 1n;
  return tokenId;
}

async function main() {
  const name = process.argv[2] || 'alice';
  const normalized = name.toLowerCase();

  ensureCompiled();

  // create ephemeral wallet to act as deployer/owner
  const wallet = ethers.Wallet.createRandom();
  const deployer = wallet.address;

  // compute pseudo-deterministic simulated contract addresses (not real chain addresses)
  function pseudoAddress(seed) {
    const h = ethers.keccak256(ethers.toUtf8Bytes(seed));
    // take last 20 bytes
    const addr = '0x' + h.slice(-40);
  try { return ethers.getAddress(addr); } catch { return addr; }
  }

  const registrarAddress = pseudoAddress(deployer + ':registrar');
  const resolverAddress = pseudoAddress(deployer + ':resolver');

  const tokenId = toTokenId(normalized);

  const simulated = {
    deployer,
    registrarAddress,
    resolverAddress,
    name: normalized,
    tokenId: tokenId.toString(),
    owner: deployer,
    timestamp: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, '..', 'artifacts', 'simulated-deploy.json');
  fs.writeFileSync(outPath, JSON.stringify(simulated, null, 2));

  console.log('\n--- Simulated deploy summary ---');
  console.log('Deployer (ephemeral):', deployer);
  console.log('Registrar (simulated):', registrarAddress);
  console.log('Resolver (simulated):', resolverAddress);
  console.log('Registered name:', normalized + '.iopn');
  console.log('Token ID:', tokenId.toString());
  console.log('Owner:', deployer);
  console.log('\nSaved simulated state to:', outPath);
  console.log('--- End summary ---\n');
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}
