#!/usr/bin/env node
/*
 Check owned .opns domains for a wallet
 Usage: node scripts/check-owned-domains.js
*/

require('dotenv').config();
const { ethers } = require('ethers');
const registrarAbi = require('../artifacts/IOPNRegistrar.abi.json');

async function main() {
  const rpc = process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';
  const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS;
  const walletAddress = '0x28416B29B5Ab1D49F2F4659Bb3C3b63458eE1e2e'; // Your 1e2e wallet

  if (!registrarAddress) {
    console.error('No NEXT_PUBLIC_REGISTRAR_ADDRESS in env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(registrarAddress, registrarAbi, provider);

  console.log(`Checking domains owned by: ${walletAddress}`);
  console.log(`Using registrar at: ${registrarAddress}`);
  console.log('='.repeat(50));

  // Check known domains we registered
  const knownDomains = [];

  // Add numbered domains 000-020
  for (let i = 0; i <= 20; i++) {
    knownDomains.push(i.toString().padStart(3, '0'));
  }

  // Add named domains
  knownDomains.push('team', 'dev');

  let ownedDomains = [];

  for (const domain of knownDomains) {
    try {
      const tokenId = await contract.nameToTokenId(domain);
      if (tokenId && tokenId !== 0n) {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          ownedDomains.push(domain);
        }
      }
    } catch (error) {
      // Domain might not exist or other error
      console.log(`Error checking ${domain}: ${error.message}`);
    }
  }

  console.log(`\nFound ${ownedDomains.length} .opns domains owned by your wallet:`);
  ownedDomains.forEach(domain => {
    console.log(`- ${domain}.opns`);
  });

  if (ownedDomains.length === 0) {
    console.log('No domains found.');
  }
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}