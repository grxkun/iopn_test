#!/usr/bin/env node
/*
 Bulk register domains on the deployed IOPN registrar
 Usage: node scripts/bulk-register.js [--start 0] [--end 20] [--key PRIVATE_KEY]
*/

require('dotenv').config();
const { ethers } = require('ethers');
const registrarAbi = require('../artifacts/IOPNRegistrar.abi.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1];
      if (!val || val.startsWith('--')) { out[key] = true; } else { out[key] = val; i++; }
    }
  }
  return out;
}

async function main() {
  const argv = parseArgs();
  const start = parseInt(argv.start || '0');
  const end = parseInt(argv.end || '20');
  const key = argv.key || process.env.PRIVATE_KEY;

  const rpc = process.env.RPC_URL || 'https://testnet-rpc.iopn.tech';

  if (!key) {
    console.error('No PRIVATE_KEY provided. Use --key or set PRIVATE_KEY env');
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

  // Generate domain list: padded 3-digit numbers
  const domains = [];
  for (let i = start; i <= end; i++) {
    domains.push(i.toString().padStart(3, '0')); // 000, 001, 002, ..., 020
  }

  console.log(`Registering domains: ${domains[0]}.opns through ${domains[domains.length-1]}.opns`);
  console.log(`\n🔄 Starting bulk registration of ${domains.length} domains...`);
  console.log('='.repeat(60));

  let successCount = 0;
  let skipCount = 0;

  for (const domain of domains) {
    try {
      console.log(`\n📝 Processing: ${domain}.opns`);

      // Check if name is available
      const tokenId = await contract.nameToTokenId(domain);
      if (tokenId && tokenId !== 0n) {
        console.log(`⏭️  ${domain}.opns already registered (Token ID: ${tokenId})`);
        skipCount++;
        continue;
      }

      // Calculate fee based on length (whitelisted wallets pay 0)
      const isWhitelisted = await contract.whitelisted(wallet.address);
      let fee = 0n;
      if (!isWhitelisted) {
        const length = domain.length;
        fee = length === 3 ? ethers.parseEther('3') : length === 4 ? ethers.parseEther('2') : ethers.parseEther('1');
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

      successCount++;

      // Small delay to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Failed to register ${domain}.opns:`, error.message);
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