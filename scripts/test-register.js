#!/usr/bin/env node
/*
 Test script to register a name on the deployed IOPN registrar
 Usage: node scripts/test-register.js <name>
*/

require('dotenv').config();
const { ethers } = require('ethers');
const registrarAbi = require('../artifacts/IOPNRegistrar.abi.json');

async function main() {
  const name = process.argv[2] || 'my';
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

  console.log(`Registering name: ${name}.iopn`);
  console.log(`Using registrar at: ${registrarAddress}`);

  // Check if name is available
  const tokenId = await contract.nameToTokenId(name);
  if (tokenId && tokenId !== 0n) {
    console.log('Name already registered');
    return;
  }

  // Get registration fee
  const fee = await contract.registrationFeeWei();
  console.log(`Registration fee: ${ethers.formatEther(fee)} OPN`);

  // Register the name
  console.log('Sending registration transaction...');
  const tx = await contract.register(name, { value: fee });
  console.log(`Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log('Registration successful!');

  // Verify ownership
  const newTokenId = await contract.nameToTokenId(name);
  const owner = await contract.ownerOf(newTokenId);
  console.log(`Name ${name}.iopn registered to: ${owner}`);
  console.log(`Token ID: ${newTokenId}`);
}

if (require.main === module) {
  main().catch(err => { console.error('ERROR', err); process.exit(1); });
}