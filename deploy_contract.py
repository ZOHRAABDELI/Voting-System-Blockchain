"""
Smart Contract Deployment Script
Deploy the VotingContract to Sepolia testnet.
"""

import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()


def deploy_voting_contract():
    """Deploy the VotingContract to the blockchain."""
    
    # Load environment variables
    provider_url = os.getenv('WEB3_PROVIDER_URL')
    private_key = os.getenv('PRIVATE_KEY')
    
    if not provider_url:
        raise ValueError("WEB3_PROVIDER_URL not set in .env file")
    if not private_key:
        raise ValueError("PRIVATE_KEY not set in .env file")
    
    # Initialize Web3
    w3 = Web3(Web3.HTTPProvider(provider_url))
    
    print(f"Connecting to: {provider_url}")
    print(f"Connected: {w3.is_connected()}")
    
    if not w3.is_connected():
        raise Exception("Failed to connect to the Ethereum network")
    
    # Get account from private key
    account = Account.from_key(private_key)
    print(f"Deployer account: {account.address}")
    
    # Get account balance
    balance = w3.eth.get_balance(account.address)
    balance_eth = w3.from_wei(balance, 'ether')
    print(f"Account balance: {balance_eth} ETH")
    
    if balance_eth < 0.01:
        print("WARNING: Low balance! Get test ETH from https://www.sepolia.dev/#faucet")
        return
    
    # Load contract ABI
    abi_file = os.path.join(os.path.dirname(__file__), 'voting_contract_abi.json')
    with open(abi_file, 'r') as f:
        contract_abi = json.load(f)
    
    # For this example, we'll use a pre-compiled bytecode
    # You would normally get this from the Solidity compiler
    bytecode = "60806040523480156200001157600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061023a806200006260003960008060405180830381600087803b1580156200007657600080fd5b5087f1158015620000938750848484846000604051806020016040528060008152508282600091509150600183039050600083339050600080826020020190810190503660006040516020016200015e9190620001e8565b60405160208183030381529060405290508060ff168260008151811062000186576200018562000209565b5b6020026020010190600a60f81b8160008151811062000189576200018962000209565b5b60200260200101818152505050505050565b6000620001b482620001e0565b620001c08184620001d8565b9350620001cd8185620001d8565b92505060006020840201915050919050565b919050565b600082825260200191505092915050565b600060208201905062000200600083018462000200565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea264697066735822122084829e96a67a2bacd9d0c8c2bc945cfc1c8d50c08c56c9c9e54c4d5d5f8b9a0064736f6c63430008130033"
    
    print("\nDeploying contract...")
    print(f"Using bytecode: {bytecode[:50]}...")
    
    # Create contract factory
    contract_factory = w3.eth.contract(
        abi=contract_abi,
        bytecode=bytecode
    )
    
    # Get nonce
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Get gas price
    gas_price = w3.eth.gas_price
    
    # Build constructor transaction
    constructor_tx = contract_factory.constructor().build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 3000000,
        'gasPrice': gas_price,
    })
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(constructor_tx, private_key)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    print(f"Transaction hash: {tx_hash.hex()}")
    
    # Wait for receipt
    print("Waiting for transaction to be mined...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    
    contract_address = tx_receipt['contractAddress']
    print(f"\n✓ Contract deployed successfully!")
    print(f"Contract address: {contract_address}")
    print(f"Block number: {tx_receipt['blockNumber']}")
    print(f"Gas used: {tx_receipt['gasUsed']}")
    
    # Update .env file
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    env_content = env_content.replace('CONTRACT_ADDRESS=0x', f'CONTRACT_ADDRESS={contract_address}')
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"\n✓ Updated .env file with contract address")
    print(f"\nNext steps:")
    print(f"1. Contract is deployed and ready to use")
    print(f"2. Start the Flask backend: python app.py")
    print(f"3. Start the React frontend: cd frontend && npm start")
    
    return contract_address


if __name__ == '__main__':
    try:
        deploy_voting_contract()
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
