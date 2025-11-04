#!/usr/bin/env python3

import sys
import json
from web3 import Web3
from web3.exceptions import ContractLogicError

# Configuration
RPC_URL = 'https://testnet-rpc.iopn.tech'
REGISTRAR_ADDRESS = '0x80F58D856432eFB0C0c58468FB2a2a3397fF2da7'  # Updated contract address
REGISTRAR_ABI_PATH = 'artifacts/IOPNRegistrar.abi.json'

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'usage: python get_owned_domains.py <address>'}))
        sys.exit(1)

    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            raise Exception('Cannot connect to RPC')

        user_address = w3.to_checksum_address(sys.argv[1])

        with open(REGISTRAR_ABI_PATH, 'r') as f:
            abi = json.load(f)

        contract = w3.eth.contract(address=w3.to_checksum_address(REGISTRAR_ADDRESS), abi=abi)

        # Get current block and query in chunks to avoid block range limits
        current_block = w3.eth.block_number
        chunk_size = 10000  # 10k blocks max
        zero_address = '0x' + '0' * 40

        transfer_events = []
        for start_block in range(max(0, current_block - 100000), current_block + 1, chunk_size):
            end_block = min(current_block, start_block + chunk_size - 1)
            try:
                chunk_events = contract.events.Transfer.get_logs(
                    from_block=start_block,
                    to_block=end_block,
                    argument_filters={
                        'to': user_address,
                        'from': zero_address
                    }
                )
                transfer_events.extend(chunk_events)
            except Exception as e:
                print(f"Warning: Failed to query blocks {start_block}-{end_block}: {e}", file=sys.stderr)

        owned_domains = []
        for event in transfer_events:
            token_id = event['args']['tokenId']
            try:
                name = contract.functions.tokenIdToName(token_id).call()
                owned_domains.append({
                    'name': name,
                    'tokenId': str(token_id)
                })
            except ContractLogicError:
                # If name not found, skip
                continue

        print(json.dumps({'domains': owned_domains}))

    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()