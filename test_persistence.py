"""
Test script to verify blockchain persistence functionality.
This script tests saving and loading blockchain data to/from disk.
"""

import sys
import os

# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'contracts'))

from contracts.blockchain import Blockchain
from contracts.voting_contract import VotingContract


def test_blockchain_persistence():
    """Test blockchain save and load functionality."""
    print("=" * 60)
    print("Testing Blockchain Persistence")
    print("=" * 60)
    
    # Create a new blockchain
    print("\n1. Creating new blockchain...")
    blockchain = Blockchain()
    
    # Add some transactions
    print("2. Adding transactions...")
    blockchain.add_transaction({
        'type': 'test',
        'data': 'Transaction 1'
    })
    blockchain.add_transaction({
        'type': 'test',
        'data': 'Transaction 2'
    })
    
    # Mine a block
    print("3. Mining block...")
    block = blockchain.mine_block('test_miner')
    print(f"   Block mined: Index {block.index}, Hash: {block.compute_hash()[:16]}...")
    
    # Add more transactions and mine another block
    blockchain.add_transaction({
        'type': 'test',
        'data': 'Transaction 3'
    })
    block2 = blockchain.mine_block('test_miner')
    print(f"   Block mined: Index {block2.index}, Hash: {block2.compute_hash()[:16]}...")
    
    original_length = len(blockchain.chain)
    print(f"\n4. Original blockchain length: {original_length}")
    
    # Save blockchain
    print("5. Saving blockchain to disk...")
    blockchain.save_to_file()
    print("   \u2713 Saved to data/blockchain.json")
    
    # Create a new blockchain instance and load
    print("\n6. Creating new blockchain instance...")
    new_blockchain = Blockchain()
    print(f"   New blockchain length (before load): {len(new_blockchain.chain)}")
    
    print("7. Loading blockchain from disk...")
    if new_blockchain.load_from_file():
        print("   \u2713 Blockchain loaded successfully")
        print(f"   Loaded blockchain length: {len(new_blockchain.chain)}")
        print(f"   Is valid: {new_blockchain.is_chain_valid()}")
        
        # Verify data
        if len(new_blockchain.chain) == original_length:
            print("   \u2713 Blockchain length matches!")
        else:
            print("   \u2717 ERROR: Blockchain length mismatch!")
            return False
    else:
        print("   \u2717 ERROR: Failed to load blockchain")
        return False
    
    print("\n\u2713 Blockchain persistence test PASSED")
    return True


def test_voting_contract_persistence():
    """Test voting contract save and load functionality."""
    print("\n" + "=" * 60)
    print("Testing Voting Contract Persistence")
    print("=" * 60)
    
    # Create blockchain and voting contract
    print("\n1. Creating blockchain and voting contract...")
    blockchain = Blockchain()
    voting_contract = VotingContract(blockchain)
    
    # Register voters
    print("2. Registering voters...")
    voter1_id, voter1_key = voting_contract.register_voter("Alice", "alice@example.com")
    voter2_id, voter2_key = voting_contract.register_voter("Bob", "bob@example.com")
    print(f"   Registered 2 voters")
    
    # Create election
    print("3. Creating election...")
    election_id = voting_contract.create_election(
        title="Test Election",
        description="Testing persistence",
        candidates=["Candidate A", "Candidate B", "Candidate C"],
        creator=voter1_id
    )
    print(f"   Election created: {election_id[:16]}...")
    
    original_elections = len(voting_contract.elections)
    original_voters = len(voting_contract.voters)
    
    # Save voting contract data
    print("\n4. Saving voting contract data to disk...")
    voting_contract.save_to_file()
    print("   \u2713 Saved to data/voting_data.json")
    
    # Create new instance and load
    print("\n5. Creating new voting contract instance...")
    new_blockchain = Blockchain()
    new_voting_contract = VotingContract(new_blockchain)
    print(f"   Elections count (before load): {len(new_voting_contract.elections)}")
    print(f"   Voters count (before load): {len(new_voting_contract.voters)}")
    
    print("6. Loading voting contract data from disk...")
    if new_voting_contract.load_from_file():
        print("   \u2713 Voting contract data loaded successfully")
        print(f"   Elections count: {len(new_voting_contract.elections)}")
        print(f"   Voters count: {len(new_voting_contract.voters)}")
        
        # Verify data
        if len(new_voting_contract.elections) == original_elections:
            print("   \u2713 Elections count matches!")
        else:
            print("   \u2717 ERROR: Elections count mismatch!")
            return False
            
        if len(new_voting_contract.voters) == original_voters:
            print("   \u2713 Voters count matches!")
        else:
            print("   \u2717 ERROR: Voters count mismatch!")
            return False
            
        # Verify loaded data
        if election_id in new_voting_contract.elections:
            print("   \u2713 Election data preserved!")
        else:
            print("   \u2717 ERROR: Election data not found!")
            return False
    else:
        print("   \u2717 ERROR: Failed to load voting contract data")
        return False
    
    print("\n\u2713 Voting contract persistence test PASSED")
    return True


def cleanup_test_files():
    """Clean up test data files."""
    print("\n" + "=" * 60)
    print("Cleaning up test files...")
    print("=" * 60)
    
    files = ['data/blockchain.json', 'data/voting_data.json']
    for filepath in files:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"   \u2713 Removed {filepath}")
    
    # Remove data directory if empty
    if os.path.exists('data') and not os.listdir('data'):
        os.rmdir('data')
        print("   \u2713 Removed empty data directory")


if __name__ == '__main__':
    print("\n")
    print("*" * 60)
    print("BLOCKCHAIN PERSISTENCE TEST SUITE")
    print("*" * 60)
    
    try:
        # Run tests
        blockchain_test = test_blockchain_persistence()
        voting_test = test_voting_contract_persistence()
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Blockchain persistence: {'PASSED \u2713' if blockchain_test else 'FAILED \u2717'}")
        print(f"Voting contract persistence: {'PASSED \u2713' if voting_test else 'FAILED \u2717'}")
        
        if blockchain_test and voting_test:
            print("\n" + "\u2713" * 60)
            print("ALL TESTS PASSED!")
            print("\u2713" * 60)
        else:
            print("\n" + "\u2717" * 60)
            print("SOME TESTS FAILED")
            print("\u2717" * 60)
            sys.exit(1)
        
        # Cleanup
        cleanup_test_files()
        
    except Exception as e:
        print(f"\n\u2717 ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
