#!/usr/bin/env node
/*
 Register specific named domains
 Usage: node scripts/register-names.js
*/

require('dotenv').config();
const { ethers } = require('ethers');
const registrarAbi = require('../artifacts/IOPNRegistrar.abi.json');

async function main() {
  const rpc = process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';
  const key = process.env.PRIVATE_KEY;

  if (!key) {
    console.error('No PRIVATE_KEY in env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS;
  if (!registrarAddress) {
    console.error('No NEXT_PUBLIC_REGISTRAR_ADDRESS in env');
    process.exit(1);
  }

  const contract = new ethers.Contract(registrarAddress, registrarAbi, wallet);

  console.log(`Using registrar at: ${registrarAddress}`);
  console.log(`Wallet address: ${wallet.address}`);

  const domains = ['team', 'dev', 'my'];

  for (const domain of domains) {
    try {
      console.log(`\n📝 Processing: ${domain}.opns`);

      // Check if name is available
      const tokenId = await contract.nameToTokenId(domain);
      if (tokenId && tokenId !== 0n) {
        console.log(`⏭️  ${domain}.opns already registered (Token ID: ${tokenId})`);
        continue;
      }

      // Check if whitelisted
      const isWhitelisted = await contract.whitelisted(wallet.address);
      let fee = 0n;
      if (!isWhitelisted) {
        // Calculate fee for named domains (assuming 3+ chars = 1 OPN)
        fee = ethers.parseEther('1');
      }

      console.log(`💰 Registering ${domain}.opns (fee: ${ethers.formatEther(fee)} OPN, whitelisted: ${isWhitelisted})...`);
      const tx = await contract.register(domain, { value: fee });
      console.log(`✅ Transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ ${domain}.opns registered successfully!`);

      // Verify ownership
      const newTokenId = await contract.nameToTokenId(domain);
      const owner = await contract.ownerOf(newTokenId);
      console.log(`👤 Owner: ${owner}`);
      console.log(`🆔 Token ID: ${newTokenId}`);

    } catch (error) {
      console.error(`❌ Failed to register ${domain}.opns:`, error.message);
    }
  }
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}