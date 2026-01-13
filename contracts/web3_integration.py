"""
Web3 Ethereum Integration Module

This module replaces the custom Python blockchain with actual Ethereum blockchain interaction.
It uses Web3.py to communicate with Ethereum nodes and interact with the deployed VotingSystem smart contract.

Key Components:
1. Web3Provider: Manages connection to Ethereum network
2. VotingContractWeb3: Wrapper for smart contract interactions
3. Event listening and transaction management
"""

from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime


class Web3Provider:
    """
    Manages connection to Ethereum network and Web3 instance.
    
    Supports multiple networks:
    - Local Hardhat/Ganache for development
    - Sepolia testnet for testing
    - Ethereum mainnet for production
    """
    
    def __init__(self, provider_url: str = None, chain_id: int = None):
        """
        Initialize Web3 provider connection.
        
        Args:
            provider_url: Ethereum node URL (e.g., Infura, Alchemy, local node)
            chain_id: Network chain ID (1 = mainnet, 11155111 = Sepolia, 31337 = local)
        """
        # Default to local Hardhat node if not specified
        self.provider_url = provider_url or os.getenv('ETH_PROVIDER_URL', 'http://127.0.0.1:8545')
        self.chain_id = chain_id or int(os.getenv('ETH_CHAIN_ID', '31337'))
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.provider_url))
        
        # Add PoA middleware for networks like Sepolia
        if self.chain_id in [11155111, 5]:  # Sepolia, Goerli
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Verify connection
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to Ethereum node at {self.provider_url}")
        
        print(f"✅ Connected to Ethereum network (Chain ID: {self.chain_id})")
        print(f"   Latest block: {self.w3.eth.block_number}")
    
    def get_web3(self) -> Web3:
        """Return the Web3 instance."""
        return self.w3
    
    def get_account(self, private_key: str = None) -> str:
        """
        Get account address from private key or use default account.
        
        Args:
            private_key: Private key for transactions (optional)
            
        Returns:
            Ethereum address
        """
        if private_key:
            account = self.w3.eth.account.from_key(private_key)
            return account.address
        else:
            # Use first account from node (for local development)
            return self.w3.eth.accounts[0] if self.w3.eth.accounts else None


class VotingContractWeb3:
    """
    Wrapper for VotingSystem smart contract interactions using Web3.py.
    
    This class provides Python interface to all smart contract functions,
    handling transaction signing, gas estimation, and event parsing.
    """
    
    def __init__(self, web3_provider: Web3Provider, contract_address: str, abi_path: str):
        """
        Initialize contract wrapper.
        
        Args:
            web3_provider: Web3Provider instance
            contract_address: Deployed contract address
            abi_path: Path to contract ABI JSON file
        """
        self.w3 = web3_provider.get_web3()
        self.provider = web3_provider
        
        # Load contract ABI
        with open(abi_path, 'r') as f:
            abi = json.load(f)
        
        # Create contract instance
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=abi
        )
        
        print(f"✅ Contract loaded at: {contract_address}")
    
    # ============================================
    # VOTER FUNCTIONS
    # ============================================
    
    def register_voter(self, name: str, email: str, from_address: str, 
                      private_key: str = None) -> Tuple[int, str]:
        """
        Register a new voter on the blockchain.
        
        Args:
            name: Voter's name
            email: Voter's email
            from_address: Ethereum address of the voter
            private_key: Private key for signing transaction
            
        Returns:
            Tuple of (voter_id, transaction_hash)
        """
        # Build transaction
        tx = self.contract.functions.registerVoter(name, email).build_transaction({
            'from': from_address,
            'nonce': self.w3.eth.get_transaction_count(from_address),
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price,
            'chainId': self.provider.chain_id
        })
        
        # Sign and send transaction
        if private_key:
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            # For local development with unlocked accounts
            tx_hash = self.w3.eth.send_transaction(tx)
        
        # Wait for transaction receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Parse event to get voter ID
        voter_registered_event = self.contract.events.VoterRegistered().process_receipt(receipt)[0]
        voter_id = voter_registered_event['args']['voterId']
        
        return voter_id, tx_hash.hex()
    
    def get_voter(self, address: str) -> Dict:
        """
        Get voter information from blockchain.
        
        Args:
            address: Voter's Ethereum address
            
        Returns:
            Dictionary with voter information
        """
        voter_data = self.contract.functions.getVoter(
            Web3.to_checksum_address(address)
        ).call()
        
        return {
            'id': voter_data[0],
            'address': voter_data[1],
            'name': voter_data[2],
            'email': voter_data[3],
            'isRegistered': voter_data[4],
            'registeredAt': datetime.fromtimestamp(voter_data[5]).isoformat()
        }
    
    def is_voter_registered(self, address: str) -> bool:
        """Check if address is registered voter."""
        return self.contract.functions.isVoterRegistered(
            Web3.to_checksum_address(address)
        ).call()
    
    # ============================================
    # ELECTION FUNCTIONS
    # ============================================
    
    def create_election(self, title: str, description: str, candidates: List[str],
                       from_address: str, private_key: str = None) -> Tuple[int, str]:
        """
        Create a new election on blockchain.
        
        Args:
            title: Election title
            description: Election description
            candidates: List of candidate names
            from_address: Creator's Ethereum address
            private_key: Private key for signing
            
        Returns:
            Tuple of (election_id, transaction_hash)
        """
        tx = self.contract.functions.createElection(
            title, description, candidates
        ).build_transaction({
            'from': from_address,
            'nonce': self.w3.eth.get_transaction_count(from_address),
            'gas': 300000,
            'gasPrice': self.w3.eth.gas_price,
            'chainId': self.provider.chain_id
        })
        
        if private_key:
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            tx_hash = self.w3.eth.send_transaction(tx)
        
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Parse event to get election ID
        election_created_event = self.contract.events.ElectionCreated().process_receipt(receipt)[0]
        election_id = election_created_event['args']['electionId']
        
        return election_id, tx_hash.hex()
    
    def get_election(self, election_id: int) -> Dict:
        """Get election details from blockchain."""
        election_data = self.contract.functions.getElection(election_id).call()
        
        return {
            'id': election_data[0],
            'title': election_data[1],
            'description': election_data[2],
            'creator': election_data[3],
            'createdAt': datetime.fromtimestamp(election_data[4]).isoformat(),
            'isActive': election_data[5],
            'totalVotes': election_data[6],
            'candidates': list(election_data[7])
        }
    
    def get_all_elections(self) -> List[Dict]:
        """Get all elections from blockchain."""
        election_ids = self.contract.functions.getAllElectionIds().call()
        elections = []
        
        for election_id in election_ids:
            elections.append(self.get_election(election_id))
        
        return elections
    
    # ============================================
    # VOTING FUNCTIONS
    # ============================================
    
    def cast_vote(self, election_id: int, candidate_index: int,
                  from_address: str, private_key: str = None) -> str:
        """
        Cast a vote in an election.
        
        Args:
            election_id: Election ID to vote in
            candidate_index: Index of candidate in candidates array
            from_address: Voter's Ethereum address
            private_key: Private key for signing
            
        Returns:
            Transaction hash
        """
        tx = self.contract.functions.castVote(
            election_id, candidate_index
        ).build_transaction({
            'from': from_address,
            'nonce': self.w3.eth.get_transaction_count(from_address),
            'gas': 150000,
            'gasPrice': self.w3.eth.gas_price,
            'chainId': self.provider.chain_id
        })
        
        if private_key:
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            tx_hash = self.w3.eth.send_transaction(tx)
        
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_hash.hex()
    
    def has_voted(self, election_id: int, address: str) -> bool:
        """Check if voter has voted in election."""
        return self.contract.functions.hasVotedInElection(
            election_id,
            Web3.to_checksum_address(address)
        ).call()
    
    # ============================================
    # RESULTS FUNCTIONS
    # ============================================
    
    def get_election_results(self, election_id: int) -> Dict:
        """
        Get complete election results from blockchain.
        
        Args:
            election_id: Election ID
            
        Returns:
            Dictionary with results
        """
        results_data = self.contract.functions.getElectionResults(election_id).call()
        
        candidates = list(results_data[0])
        vote_counts = list(results_data[1])
        total_votes = results_data[2]
        
        # Build results array
        results = []
        for i, candidate in enumerate(candidates):
            percentage = (vote_counts[i] / total_votes * 100) if total_votes > 0 else 0
            results.append({
                'candidate': candidate,
                'votes': vote_counts[i],
                'percentage': round(percentage, 2)
            })
        
        # Sort by votes
        results.sort(key=lambda x: x['votes'], reverse=True)
        
        return {
            'success': True,
            'election_id': election_id,
            'total_votes': total_votes,
            'results': results,
            'winner': results[0]['candidate'] if results and results[0]['votes'] > 0 else None
        }
    
    # ============================================
    # ADMIN FUNCTIONS
    # ============================================
    
    def close_election(self, election_id: int, from_address: str, 
                      private_key: str = None) -> str:
        """Close an election."""
        tx = self.contract.functions.closeElection(election_id).build_transaction({
            'from': from_address,
            'nonce': self.w3.eth.get_transaction_count(from_address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'chainId': self.provider.chain_id
        })
        
        if private_key:
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            tx_hash = self.w3.eth.send_transaction(tx)
        
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_hash.hex()
    
    def get_total_voters(self) -> int:
        """Get total number of registered voters."""
        return self.contract.functions.getTotalVoters().call()
    
    def get_total_elections(self) -> int:
        """Get total number of elections."""
        return self.contract.functions.getTotalElections().call()
