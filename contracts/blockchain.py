"""
Blockchain implementation for the voting system.
This module contains the core blockchain logic including blocks, chains, and proof-of-work.
"""

import hashlib
import json
import os
from time import time
from typing import List, Dict, Any, Optional
from uuid import uuid4


class Block:
    """Represents a single block in the blockchain."""
    
    def __init__(self, index: int, timestamp: float, transactions: List[Dict], 
                 proof: int, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.proof = proof
        self.previous_hash = previous_hash
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert block to dictionary representation."""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'proof': self.proof,
            'previous_hash': self.previous_hash,
        }
    
    def compute_hash(self) -> str:
        """Compute the SHA-256 hash of the block."""
        block_string = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()


class Blockchain:
    """Blockchain implementation for managing voting transactions."""
    
    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Dict] = []
        self.nodes = set()
        
        # Create the genesis block
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the blockchain."""
        genesis_block = Block(0, time(), [], 100, "0")
        self.chain.append(genesis_block)
    
    def get_last_block(self) -> Block:
        """Return the last block in the chain."""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict[str, Any]) -> int:
        """
        Add a new transaction to the list of pending transactions.
        
        Args:
            transaction: Dictionary containing transaction details
            
        Returns:
            Index of the block that will hold this transaction
        """
        self.pending_transactions.append(transaction)
        return self.get_last_block().index + 1
    
    def proof_of_work(self, last_proof: int) -> int:
        """
        Simple Proof of Work Algorithm:
        - Find a number p' such that hash(pp') contains leading 4 zeroes
        - p is the previous proof, and p' is the new proof
        
        Args:
            last_proof: Previous proof value
            
        Returns:
            New proof value
        """
        proof = 0
        while not self.valid_proof(last_proof, proof):
            proof += 1
        return proof
    
    @staticmethod
    def valid_proof(last_proof: int, proof: int) -> bool:
        """
        Validates the Proof: Does hash(last_proof, proof) contain 4 leading zeroes?
        
        Args:
            last_proof: Previous Proof
            proof: Current Proof
            
        Returns:
            True if correct, False if not.
        """
        guess = f'{last_proof}{proof}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"
    
    def mine_block(self, miner_address: str) -> Block:
        """
        Mine a new block and add it to the chain.
        
        Args:
            miner_address: Address of the miner (for potential rewards)
            
        Returns:
            The newly mined block
        """
        last_block = self.get_last_block()
        last_proof = last_block.proof
        proof = self.proof_of_work(last_proof)
        
        # Create new block
        new_block = Block(
            index=len(self.chain),
            timestamp=time(),
            transactions=self.pending_transactions,
            proof=proof,
            previous_hash=last_block.compute_hash()
        )
        
        # Reset pending transactions
        self.pending_transactions = []
        
        # Add block to chain
        self.chain.append(new_block)
        
        return new_block
    
    def is_chain_valid(self, chain: List[Block] = None) -> bool:
        """
        Determine if a given blockchain is valid.
        
        Args:
            chain: A blockchain to validate (defaults to current chain)
            
        Returns:
            True if valid, False if not
        """
        if chain is None:
            chain = self.chain
        
        if len(chain) == 0:
            return False
        
        # Check genesis block
        if chain[0].index != 0 or chain[0].previous_hash != "0":
            return False
        
        # Check each block
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]
            
            # Check that the hash of the previous block is correct
            if current_block.previous_hash != previous_block.compute_hash():
                return False
            
            # Check that the Proof of Work is correct
            if not self.valid_proof(previous_block.proof, current_block.proof):
                return False
        
        return True
    
    def get_chain_data(self) -> List[Dict]:
        """Return the blockchain data as a list of dictionaries."""
        return [block.to_dict() for block in self.chain]
    
    def get_transaction_history(self, voter_id: str = None) -> List[Dict]:
        """
        Get transaction history, optionally filtered by voter ID.
        
        Args:
            voter_id: Optional voter ID to filter by
            
        Returns:
            List of transactions
        """
        transactions = []
        for block in self.chain:
            for tx in block.transactions:
                if voter_id is None or tx.get('voter_id') == voter_id:
                    transactions.append({
                        **tx,
                        'block_index': block.index,
                        'timestamp': block.timestamp
                    })
        return transactions
    
    def save_to_file(self, filepath: str = 'data/blockchain.json'):
        """
        Save blockchain to a JSON file.
        
        Args:
            filepath: Path to save the blockchain data
        """
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        data = {
            'chain': self.get_chain_data(),
            'pending_transactions': self.pending_transactions
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filepath: str = 'data/blockchain.json') -> bool:
        """
        Load blockchain from a JSON file.
        
        Args:
            filepath: Path to load the blockchain data from
            
        Returns:
            True if loaded successfully, False otherwise
        """
        if not os.path.exists(filepath):
            return False
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Reconstruct chain from saved data
            self.chain = []
            for block_data in data['chain']:
                block = Block(
                    index=block_data['index'],
                    timestamp=block_data['timestamp'],
                    transactions=block_data['transactions'],
                    proof=block_data['proof'],
                    previous_hash=block_data['previous_hash']
                )
                self.chain.append(block)
            
            self.pending_transactions = data.get('pending_transactions', [])
            
            # Validate loaded chain
            if not self.is_chain_valid():
                print("Warning: Loaded blockchain is invalid!")
                return False
            
            return True
        except Exception as e:
            print(f"Error loading blockchain: {e}")
            return False
