#!/usr/bin/env python3
"""
IOPN Domain Resolver via HTTP RPC

This script demonstrates how to:
1. Connect to IOPN Testnet
2. Check domain availability
3. Resolve domain names to addresses
4. Get domain ownership information

Usage:
python scripts/domain_resolver.py
"""

from web3 import Web3
import json

# IOPN Testnet Configuration
RPC_URL = "https://testnet-rpc.iopn.tech"
REGISTRAR_ADDRESS = "0xc1F422EF0E93C915730aCc2B80eE6DD46E475978"
RESOLVER_ADDRESS = "0xCA098dC5E77C620Ec7e72E7EB8A24b343bf0EDd1"

# Minimal ABI for the functions we need
REGISTRAR_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
        "name": "nameToTokenId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "ownerOf",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]

RESOLVER_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
        "name": "resolveAddress",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
        "name": "resolveText",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    }
]

def main():
    print("🔗 Connecting to IOPN Testnet...")

    # Connect to IOPN Testnet
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    # Check connection
    if not w3.is_connected():
        print("❌ Failed to connect to IOPN Testnet")
        return

    print("✅ Connected to IOPN Testnet")
    print(f"📊 Current block: {w3.eth.block_number}")

    # Initialize contracts
    registrar = w3.eth.contract(address=REGISTRAR_ADDRESS, abi=REGISTRAR_ABI)
    resolver = w3.eth.contract(address=RESOLVER_ADDRESS, abi=RESOLVER_ABI)

    # Test domain resolution
    test_domains = ["alice", "bob", "test123", "myname"]

    print("\n🔍 Testing Domain Resolution:")
    print("=" * 50)

    for domain in test_domains:
        print(f"\n📝 Checking domain: {domain}.opn")

        try:
            # Check if domain exists (get token ID)
            token_id = registrar.functions.nameToTokenId(domain).call()

            if token_id == 0:
                print(f"❌ Domain {domain}.opn is NOT registered")
                continue

            print(f"✅ Domain {domain}.opn is registered (Token ID: {token_id})")

            # Get owner
            owner = registrar.functions.ownerOf(token_id).call()
            print(f"👤 Owner: {owner}")

            # Try to resolve address (if resolver has data)
            try:
                resolved_address = resolver.functions.resolveAddress(domain).call()
                if resolved_address != "0x0000000000000000000000000000000000000000":
                    print(f"🔗 Resolved Address: {resolved_address}")
                else:
                    print("🔗 No custom address set (using owner address)")
            except Exception as e:
                print(f"⚠️  Could not resolve address: {e}")

            # Try to get text record
            try:
                text_record = resolver.functions.resolveText(domain).call()
                if text_record:
                    print(f"📄 Text Record: {text_record}")
            except Exception as e:
                print(f"⚠️  Could not get text record: {e}")

        except Exception as e:
            print(f"❌ Error checking domain {domain}: {e}")

    # Example: Check balance of an address
    print("\n💰 Balance Check Example:")
    print("=" * 30)

    example_address = "0x742d35Cc6634C0532925a3b8D4C70b17cA3c98b8"
    try:
        # Convert to checksum address
        checksum_address = w3.to_checksum_address(example_address)
        balance = w3.eth.get_balance(checksum_address)
        balance_eth = w3.from_wei(balance, 'ether')
        print(f"📊 Balance of {checksum_address}: {balance_eth} IOPN")
    except Exception as e:
        print(f"❌ Error getting balance: {e}")

if __name__ == "__main__":
    main()