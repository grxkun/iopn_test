#!/usr/bin/env node
/*
 Bulk register domains on the deployed IOPN registrar
 Registers domains 0.opn through 50.opn, plus my.opn and dev.opn
 Usage: node scripts/bulk-register.js
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

  // Get registration fee
  const fee = await contract.registrationFeeWei();
  console.log(`Registration fee: ${ethers.formatEther(fee)} OPN`);

  // Generate domain list: valid alternatives for 0-50, plus my and dev
  // Since contract requires minimum 3 characters, use padded versions
  const domains = [];
  for (let i = 0; i <= 50; i++) {
    domains.push(i.toString().padStart(3, '0')); // 000, 001, 002, ..., 050
  }
  domains.push('dev'); // dev is already registered

  console.log(`Using padded names: 000.opn through 050.opn (since contract requires minimum 3 characters)`);
  console.log(`Note: Original names 0.opn-50.opn are too short per contract validation`);

  console.log(`\n🔄 Starting bulk registration of ${domains.length} domains...`);
  console.log('=' * 60);

  let successCount = 0;
  let skipCount = 0;

  for (const domain of domains) {
    try {
      console.log(`\n📝 Processing: ${domain}.opn`);

      // Check if name is available
      const tokenId = await contract.nameToTokenId(domain);
      if (tokenId && tokenId !== 0n) {
        console.log(`⏭️  ${domain}.opn already registered (Token ID: ${tokenId})`);
        skipCount++;
        continue;
      }

      // Register the name
      console.log(`💰 Registering ${domain}.opn (fee: ${ethers.formatEther(fee)} OPN)...`);
      const tx = await contract.register(domain, { value: fee });
      console.log(`✅ Transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`🎉 ${domain}.opn registered successfully!`);

      // Verify ownership
      const newTokenId = await contract.nameToTokenId(domain);
      const owner = await contract.ownerOf(newTokenId);
      console.log(`👤 Owner: ${owner}`);
      console.log(`🆔 Token ID: ${newTokenId}`);

      successCount++;

      // Small delay to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Failed to register ${domain}.opn:`, error.message);
    }
  }

  console.log('\n' + '=' * 60);
  console.log(`📊 Bulk registration complete!`);
  console.log(`✅ Successfully registered: ${successCount} domains`);
  console.log(`⏭️  Skipped (already registered): ${skipCount} domains`);
  console.log(`📋 Total processed: ${successCount + skipCount} domains`);
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}