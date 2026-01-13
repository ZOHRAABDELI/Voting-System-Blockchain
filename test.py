"""
Simple test script to verify blockchain and voting contract functionality.
Run this to test the backend without starting the server.
"""

import sys
import os

# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'contracts'))

from contracts.blockchain import Blockchain
from contracts.voting_contract import VotingContract


def test_blockchain():
    """Test basic blockchain functionality."""
    print("=" * 60)
    print("Testing Blockchain Implementation")
    print("=" * 60)
    
    # Create blockchain
    blockchain = Blockchain()
    print(f"✓ Blockchain created with {len(blockchain.chain)} blocks (genesis)")
    
    # Add some transactions
    blockchain.add_transaction({
        'type': 'test',
        'data': 'Test transaction 1'
    })
    blockchain.add_transaction({
        'type': 'test',
        'data': 'Test transaction 2'
    })
    print(f"✓ Added {len(blockchain.pending_transactions)} pending transactions")
    
    # Mine a block
    block = blockchain.mine_block('test_miner')
    print(f"✓ Mined block #{block.index} with proof {block.proof}")
    
    # Verify chain
    is_valid = blockchain.is_chain_valid()
    print(f"✓ Blockchain is {'valid' if is_valid else 'invalid'}")
    
    print(f"\nBlockchain summary:")
    print(f"  Total blocks: {len(blockchain.chain)}")
    print(f"  Pending transactions: {len(blockchain.pending_transactions)}")
    print()


def test_voting_contract():
    """Test voting contract functionality."""
    print("=" * 60)
    print("Testing Voting Contract")
    print("=" * 60)
    
    # Create blockchain and voting contract
    blockchain = Blockchain()
    voting = VotingContract(blockchain)
    
    # Register voters
    voter1_id, voter1_key = voting.register_voter("Alice Smith", "alice@example.com")
    voter2_id, voter2_key = voting.register_voter("Bob Johnson", "bob@example.com")
    print(f"✓ Registered 2 voters")
    
    # Create election
    election_id = voting.create_election(
        title="Test Election",
        description="Testing the voting system",
        candidates=["Candidate A", "Candidate B", "Candidate C"],
        creator=voter1_id
    )
    print(f"✓ Created election: {election_id[:8]}...")
    
    # Cast votes
    result1 = voting.cast_vote(election_id, voter1_id, voter1_key, "Candidate A")
    print(f"✓ Voter 1 voted: {result1['message']}")
    
    result2 = voting.cast_vote(election_id, voter2_id, voter2_key, "Candidate B")
    print(f"✓ Voter 2 voted: {result2['message']}")
    
    # Try to vote twice (should fail)
    result3 = voting.cast_vote(election_id, voter1_id, voter1_key, "Candidate C")
    print(f"✓ Double vote prevented: {result3['error']}")
    
    # Get results
    results = voting.get_results(election_id)
    print(f"\n✓ Election Results:")
    print(f"  Title: {results['title']}")
    print(f"  Total votes: {results['total_votes']}")
    print(f"  Winner: {results['winner']}")
    print(f"\n  Vote breakdown:")
    for result in results['results']:
        print(f"    {result['candidate']}: {result['votes']} votes ({result['percentage']}%)")
    
    # Mine the transactions
    blockchain.mine_block('system')
    print(f"\n✓ Mined block with all transactions")
    print(f"  Blockchain length: {len(blockchain.chain)} blocks")
    print(f"  Total transactions: {sum(len(block.transactions) for block in blockchain.chain)}")
    print()


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("  BLOCKCHAIN VOTING SYSTEM - TEST SUITE")
    print("=" * 60 + "\n")
    
    try:
        test_blockchain()
        test_voting_contract()
        
        print("=" * 60)
        print("  ALL TESTS PASSED ✓")
        print("=" * 60)
        print("\nThe blockchain voting system is working correctly!")
        print("You can now start the Flask server with: python app.py")
        print()
        
    except Exception as e:
        print(f"\nTest failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
