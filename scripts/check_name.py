#!/usr/bin/env python3
"""
Validate a domain name and (optionally) check availability via RPC.
Outputs JSON, e.g.:
{
  "name": "alice",
  "is_valid": true,
  "reason": "",
  "available": true
}

Usage:
  python scripts/check_name.py <name>
"""

import json
import os
import re
import sys
from typing import Dict

try:
    from web3 import Web3  # optional; if not installed, availability check will be skipped
except Exception:  # pragma: no cover
    Web3 = None  # type: ignore

RPC_URL = os.environ.get("RPC_URL", "https://testnet-rpc.iopn.tech")
REGISTRAR_ADDRESS = os.environ.get("NEXT_PUBLIC_REGISTRAR_ADDRESS", "0xc1F422EF0E93C915730aCc2B80eE6DD46E475978")

REGISTRAR_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
        "name": "nameToTokenId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    }
]

VALID_RE = re.compile(r"^[a-z0-9]{3,32}$")

def validate_name(name: str) -> Dict:
    original = name
    name = (name or "").strip().lower()
    if not name:
        return {"name": original, "is_valid": False, "reason": "empty name"}
    if len(name) < 3 or len(name) > 32:
        return {"name": name, "is_valid": False, "reason": "Name must be 3-32 chars"}
    if not VALID_RE.match(name):
        return {"name": name, "is_valid": False, "reason": "Only lowercase letters and numbers"}
    return {"name": name, "is_valid": True, "reason": ""}


def check_availability(name: str) -> bool:
    if Web3 is None:
        return False  # can't verify; let frontend handle fallback
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            return False
        contract = w3.eth.contract(address=REGISTRAR_ADDRESS, abi=REGISTRAR_ABI)
        token_id = contract.functions.nameToTokenId(name).call()
        return int(token_id) == 0
    except Exception:
        return False


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "no name provided"}))
        sys.exit(0)
    name = sys.argv[1]
    result = validate_name(name)
    # attempt availability if valid
    if result.get("is_valid"):
        result["available"] = check_availability(result["name"])
    print(json.dumps(result))

if __name__ == "__main__":
    main()
