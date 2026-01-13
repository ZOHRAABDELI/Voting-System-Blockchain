"""
Web3 Integration Manager
Handles all Ethereum blockchain interactions for the voting system.
"""

import json
import os
from typing import Dict, List, Tuple, Optional
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

class Web3Manager:
    """Manages Web3 connections and smart contract interactions."""
    
    def __init__(self):
        """Initialize Web3 connection and contract."""
        # Get environment variables
        self.provider_url = os.getenv(
            'WEB3_PROVIDER_URL',
            'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
        )
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        self.private_key = os.getenv('PRIVATE_KEY')
        self.contract_abi = self._load_contract_abi()
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.provider_url))
        
        # Check connection
        if not self.w3.is_connected():
            raise Exception(f"Failed to connect to {self.provider_url}")
        
        # Initialize contract
        if self.contract_address:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.contract_abi
            )
        else:
            self.contract = None
    
    def _load_contract_abi(self) -> List:
        """Load contract ABI from file."""
        abi_file = os.path.join(
            os.path.dirname(__file__),
            'voting_contract_abi.json'
        )
        if os.path.exists(abi_file):
            with open(abi_file, 'r') as f:
                return json.load(f)
        return []
    
    def deploy_contract(self) -> str:
        """
        Deploy the voting contract to the blockchain.
        
        Returns:
            Contract address
        """
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set in environment")
        
        # Create account from private key
        account = Account.from_key(self.private_key)
        
        # Get nonce
        nonce = self.w3.eth.get_transaction_count(account.address)
        
        # Get gas price
        gas_price = self.w3.eth.gas_price
        
        # Load contract bytecode
        bytecode_file = os.path.join(
            os.path.dirname(__file__),
            'voting_contract_bytecode.txt'
        )
        if not os.path.exists(bytecode_file):
            raise FileNotFoundError(
                f"Contract bytecode file not found: {bytecode_file}"
            )
        
        with open(bytecode_file, 'r') as f:
            bytecode = f.read().strip()
        
        # Create contract factory
        contract_factory = self.w3.eth.contract(
            abi=self.contract_abi,
            bytecode=bytecode
        )
        
        # Build constructor transaction
        constructor_tx = contract_factory.constructor().build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 3000000,
            'gasPrice': gas_price,
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            constructor_tx,
            account.key
        )
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_receipt.contractAddress
    
    def register_voter(self, voter_address: str) -> Dict:
        """
        Register a voter on the blockchain.
        
        Args:
            voter_address: Ethereum address of the voter
            
        Returns:
            Transaction receipt dictionary
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set")
        
        account = Account.from_key(self.private_key)
        voter_checksum = Web3.to_checksum_address(voter_address)
        
        # Build transaction
        tx = self.contract.functions.registerVoter(
            voter_checksum
        ).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        # Sign and send
        signed_txn = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return self._format_receipt(receipt)
    
    def create_election(
        self,
        title: str,
        description: str,
        candidates: List[str],
        start_time: int,
        end_time: int
    ) -> Dict:
        """
        Create a new election on the blockchain.
        
        Args:
            title: Election title
            description: Election description
            candidates: List of candidate names
            start_time: Unix timestamp for start
            end_time: Unix timestamp for end
            
        Returns:
            Transaction receipt with election ID
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set")
        
        account = Account.from_key(self.private_key)
        
        # Build transaction
        tx = self.contract.functions.createElection(
            title,
            description,
            candidates,
            start_time,
            end_time
        ).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        # Sign and send
        signed_txn = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return self._format_receipt(receipt)
    
    def cast_vote(
        self,
        election_id: int,
        candidate_index: int,
        voter_address: str
    ) -> Dict:
        """
        Cast a vote in an election.
        
        Args:
            election_id: ID of the election
            candidate_index: Index of the candidate
            voter_address: Address of the voter
            
        Returns:
            Transaction receipt
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set")
        
        owner_account = Account.from_key(self.private_key)
        owner_address = owner_account.address
        
        # Build transaction - use owner's address as sender
        # The voter_address is passed to the contract for identification
        tx = self.contract.functions.castVote(
            election_id,
            candidate_index
        ).build_transaction({
            'from': Web3.to_checksum_address(owner_address),
            'nonce': self.w3.eth.get_transaction_count(
                Web3.to_checksum_address(owner_address)
            ),
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        # Sign and send with owner's key
        signed_txn = self.w3.eth.account.sign_transaction(
            tx,
            owner_account.key
        )
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return self._format_receipt(receipt)
    
    def get_election(self, election_id: int) -> Dict:
        """
        Get election details from the blockchain.
        
        Args:
            election_id: ID of the election
            
        Returns:
            Election data dictionary
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        election = self.contract.functions.getElection(election_id).call()
        
        return {
            'id': election[0],
            'title': election[1],
            'description': election[2],
            'creator': election[3],
            'startTime': election[4],
            'endTime': election[5],
            'active': election[6],
            'candidates': election[7],
            'totalVotes': election[8],
        }
    
    def get_results(self, election_id: int) -> Dict:
        """
        Get election results from the blockchain.
        
        Args:
            election_id: ID of the election
            
        Returns:
            Dictionary mapping candidate index to vote count
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        results = self.contract.functions.getResults(election_id).call()
        
        return {
            'election_id': election_id,
            'results': results,
        }
    
    def has_voted(self, election_id: int, voter_address: str) -> bool:
        """
        Check if a voter has already voted in an election.
        
        Args:
            election_id: ID of the election
            voter_address: Address of the voter
            
        Returns:
            True if voter has voted, False otherwise
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        voter_checksum = Web3.to_checksum_address(voter_address)
        return self.contract.functions.hasVoterVoted(
            election_id,
            voter_checksum
        ).call()
    
    def is_voter_registered(self, voter_address: str) -> bool:
        """
        Check if a voter is registered.
        
        Args:
            voter_address: Address of the voter
            
        Returns:
            True if registered, False otherwise
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        voter_checksum = Web3.to_checksum_address(voter_address)
        return self.contract.functions.isVoterRegistered(
            voter_checksum
        ).call()
    
    def close_election(self, election_id: int) -> Dict:
        """
        Close an election.
        
        Args:
            election_id: ID of the election
            
        Returns:
            Transaction receipt
        """
        if not self.contract:
            raise ValueError("Contract not initialized")
        
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set")
        
        account = Account.from_key(self.private_key)
        
        # Build transaction
        tx = self.contract.functions.closeElection(election_id).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        # Sign and send
        signed_txn = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return self._format_receipt(receipt)
    
    def _format_receipt(self, receipt) -> Dict:
        """Format transaction receipt for API response."""
        return {
            'success': receipt['status'] == 1,
            'transactionHash': receipt['transactionHash'].hex(),
            'blockNumber': receipt['blockNumber'],
            'gasUsed': receipt['gasUsed'],
            'contractAddress': receipt['contractAddress'].hex() if receipt['contractAddress'] else None,
        }
    
    def get_account_balance(self, address: str) -> str:
        """Get account balance in ETH."""
        address_checksum = Web3.to_checksum_address(address)
        balance_wei = self.w3.eth.get_balance(address_checksum)
        balance_eth = self.w3.from_wei(balance_wei, 'ether')
        return str(balance_eth)
    
    def get_network_info(self) -> Dict:
        """Get current network information."""
        return {
            'chainId': self.w3.eth.chain_id,
            'latestBlockNumber': self.w3.eth.block_number,
            'gasPrice': self.w3.eth.gas_price,
        }


# Global Web3 manager instance
web3_manager = None


def initialize_web3():
    """Initialize the global Web3 manager."""
    global web3_manager
    try:
        web3_manager = Web3Manager()
        return web3_manager
    except Exception as e:
        print(f"Warning: Web3 initialization failed: {str(e)}")
        print("System will use fallback mode (local storage only)")
        return None


def get_web3_manager():
    """Get the global Web3 manager instance."""
    return web3_manager
