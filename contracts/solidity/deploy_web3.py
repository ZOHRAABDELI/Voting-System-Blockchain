#!/usr/bin/env python3
"""
Simple deployment script using Web3.py
Deploys the VotingSystem contract to local Hardhat node
"""

import json
import os
from web3 import Web3

# Connect to local Hardhat node
RPC_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Check connection
if not w3.is_connected():
    print("❌ Failed to connect to Ethereum node at", RPC_URL)
    print("   Make sure Hardhat node is running: npx hardhat node")
    exit(1)

print("✅ Connected to Ethereum node")
print(f"   Chain ID: {w3.eth.chain_id}")
print(f"   Latest block: {w3.eth.block_number}\n")

# Load contract ABI and bytecode
artifacts_path = "artifacts/contracts/VotingSystem.sol/VotingSystem.json"
with open(artifacts_path, 'r') as f:
    contract_json = json.load(f)

abi = contract_json['abi']
bytecode = contract_json['bytecode']

print("📄 Contract artifacts loaded")
print(f"   Bytecode size: {len(bytecode)} characters\n")

# Get deployer account (first Hardhat account)
deployer = w3.eth.accounts[0]
print(f"👤 Deploying from account: {deployer}")

balance = w3.eth.get_balance(deployer)
print(f"   Balance: {w3.from_wei(balance, 'ether')} ETH\n")

# Create contract instance
VotingSystem = w3.eth.contract(abi=abi, bytecode=bytecode)

# Deploy contract
print("🚀 Deploying contract...")
tx_hash = VotingSystem.constructor().transact({'from': deployer})

# Wait for transaction receipt
print(f"   Transaction hash: {tx_hash.hex()}")
print("   Waiting for confirmation...")

tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

contract_address = tx_receipt.contractAddress

print("\n" + "=" * 50)
print("✅ Contract deployed successfully!")
print("=" * 50)
print(f"📍 Contract address: {contract_address}")
print(f"⛓️  Block number: {tx_receipt.blockNumber}")
print(f"⛽ Gas used: {tx_receipt.gasUsed:,}")
print("=" * 50 + "\n")

# Save deployment info
os.makedirs("deployments", exist_ok=True)

deployment_info = {
    "network": "localhost",
    "contractAddress": contract_address,
    "deployer": deployer,
    "blockNumber": tx_receipt.blockNumber,
    "transactionHash": tx_hash.hex(),
    "gasUsed": tx_receipt.gasUsed,
    "chainId": w3.eth.chain_id
}

with open("deployments/localhost.json", 'w') as f:
    json.dump(deployment_info, f, indent=2)

print("📄 Deployment info saved to: deployments/localhost.json")

# Save ABI
with open("deployments/VotingSystem.abi.json", 'w') as f:
    json.dump(abi, f, indent=2)

print("📄 ABI saved to: deployments/VotingSystem.abi.json")

# Save contract address for easy access
with open("deployments/contract_address.txt", 'w') as f:
    f.write(contract_address)

print("📄 Contract address saved to: deployments/contract_address.txt")

print("\n🎉 Deployment complete!")
print("\nℹ️  To use this contract, set the following environment variable:")
print(f"   export CONTRACT_ADDRESS={contract_address}")
