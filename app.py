"""
Flask API server for the blockchain voting system.
Provides RESTful endpoints for voter registration, voting, and results.
Integrated with Ethereum blockchain via Web3.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from datetime import datetime, timedelta

# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'contracts'))

from contracts.blockchain import Blockchain
from contracts.voting_contract import VotingContract
from contracts.web3_manager import initialize_web3, get_web3_manager

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize blockchain and voting contract (fallback for local storage)
blockchain = Blockchain()
voting_contract = VotingContract(blockchain)

# Initialize Web3 manager (Ethereum integration)
web3_manager = initialize_web3()
use_blockchain = web3_manager is not None

# Load existing data from files
print("Loading blockchain data...")
if blockchain.load_from_file():
    print(f"✓ Blockchain loaded: {len(blockchain.chain)} blocks")
else:
    print("✓ Starting with fresh blockchain")

if voting_contract.load_from_file():
    print(f"✓ Voting data loaded: {len(voting_contract.elections)} elections, {len(voting_contract.voters)} voters")
else:
    print("✓ Starting with fresh voting data")

if use_blockchain:
    print("✓ Web3 Manager initialized - Using Ethereum blockchain")
    network_info = web3_manager.get_network_info()
    print(f"  Chain ID: {network_info['chainId']}")
    print(f"  Latest Block: {network_info['latestBlockNumber']}")
else:
    print("⚠ Web3 Manager not initialized - Using fallback local storage")


def save_data():
    """Save blockchain and voting data to disk."""
    blockchain.save_to_file()
    voting_contract.save_to_file()


# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'blockchain_mode': 'ethereum' if use_blockchain else 'local',
        'blockchain_length': len(blockchain.chain),
        'pending_transactions': len(blockchain.pending_transactions),
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/blockchain', methods=['GET'])
def get_blockchain():
    """Get the entire blockchain."""
    if use_blockchain:
        network_info = web3_manager.get_network_info()
        return jsonify({
            'mode': 'ethereum',
            'chainId': network_info['chainId'],
            'latestBlock': network_info['latestBlockNumber'],
            'gasPrice': str(network_info['gasPrice']),
            'message': 'Connected to Ethereum blockchain'
        }), 200
    else:
        return jsonify({
            'chain': blockchain.get_chain_data(),
            'length': len(blockchain.chain),
            'is_valid': blockchain.is_chain_valid(),
            'mode': 'local'
        }), 200


@app.route('/api/mine', methods=['POST'])
def mine_block():
    """Mine a new block (local mode only)."""
    if use_blockchain:
        return jsonify({'error': 'Mining not needed in blockchain mode'}), 400
    
    data = request.get_json()
    miner_address = data.get('miner_address', 'system')
    
    block = blockchain.mine_block(miner_address)
    save_data()  # Save after mining
    
    return jsonify({
        'message': 'New block mined successfully',
        'block': block.to_dict()
    }), 200


# ============================================================================
# VOTER ENDPOINTS
# ============================================================================

@app.route('/api/voters/register', methods=['POST'])
def register_voter():
    """Register a new voter."""
    data = request.get_json()
    
    required_fields = ['name', 'email']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields: name, email'}), 400
    
    try:
        # Register voter in local system (for authentication)
        voter_id, secret_key = voting_contract.register_voter(
            voter_name=data['name'],
            email=data['email']
        )
        
        # If using Ethereum, also register on blockchain
        blockchain_tx = None
        if use_blockchain and data.get('ethereum_address'):
            try:
                tx_receipt = web3_manager.register_voter(data['ethereum_address'])
                # Extract just the transaction hash
                blockchain_tx = tx_receipt.get('transactionHash') if isinstance(tx_receipt, dict) else str(tx_receipt)
                print(f"Voter registered on Ethereum: {blockchain_tx}")
            except Exception as e:
                print(f"Warning: Failed to register voter on blockchain: {str(e)}")
        
        save_data()  # Save after registration
        
        return jsonify({
            'success': True,
            'voter_id': voter_id,
            'secret_key': secret_key,
            'blockchain_tx': blockchain_tx,
            'message': 'Voter registered successfully. Please save your credentials!'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/voters/<voter_id>', methods=['GET'])
def get_voter(voter_id):
    """Get voter information."""
    voter = voting_contract.get_voter_info(voter_id)
    
    if not voter:
        return jsonify({'error': 'Voter not found'}), 404
    
    return jsonify(voter), 200


@app.route('/api/voters/verify', methods=['POST'])
def verify_voter():
    """Verify voter credentials."""
    data = request.get_json()
    
    required_fields = ['voter_id', 'secret_key']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    is_valid = voting_contract.verify_voter(
        voter_id=data['voter_id'],
        secret_key=data['secret_key']
    )
    
    return jsonify({
        'valid': is_valid,
        'voter_info': voting_contract.get_voter_info(data['voter_id']) if is_valid else None
    }), 200


@app.route('/api/voters/<address>/is-registered', methods=['GET'])
def check_voter_registration(address):
    """Check if a voter is registered on the blockchain."""
    if not use_blockchain:
        return jsonify({'error': 'Blockchain mode not enabled'}), 400
    
    try:
        is_registered = web3_manager.is_voter_registered(address)
        return jsonify({
            'address': address,
            'registered': is_registered
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ELECTION ENDPOINTS
# ============================================================================

@app.route('/api/elections', methods=['GET'])
def get_elections():
    """Get all elections."""
    elections = voting_contract.get_all_elections()
    
    # Enrich with blockchain data if available
    if use_blockchain and elections:
        try:
            for election in elections:
                election_id = int(election['id'].replace('-', '')[:8], 16) % 1000
                blockchain_election = web3_manager.get_election(election_id)
                election['blockchain_id'] = election_id
                election['blockchain_status'] = blockchain_election.get('active', False)
        except Exception as e:
            print(f"Warning: Could not enrich elections with blockchain data: {str(e)}")
    
    return jsonify(elections), 200


@app.route('/api/elections/<election_id>', methods=['GET'])
def get_election(election_id):
    """Get specific election details."""
    election = voting_contract.get_election(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    # Try to get blockchain data
    if use_blockchain:
        try:
            blockchain_id = int(election_id.replace('-', '')[:8], 16) % 1000
            blockchain_election = web3_manager.get_election(blockchain_id)
            election['blockchain_id'] = blockchain_id
            election['blockchain_data'] = blockchain_election
        except Exception as e:
            print(f"Warning: Could not fetch blockchain election data: {str(e)}")
    
    return jsonify(election), 200


@app.route('/api/elections', methods=['POST'])
def create_election():
    """Create a new election."""
    data = request.get_json()
    
    required_fields = ['title', 'description', 'candidates', 'creator']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not isinstance(data['candidates'], list) or len(data['candidates']) < 2:
        return jsonify({'error': 'At least 2 candidates are required'}), 400
    
    try:
        # Create election locally
        election_id = voting_contract.create_election(
            title=data['title'],
            description=data['description'],
            candidates=data['candidates'],
            creator=data['creator'],
            start_time=data.get('start_time'),
            end_time=data.get('end_time')
        )
        
        # Create on blockchain if enabled
        blockchain_tx = None
        blockchain_id = None
        if use_blockchain:
            try:
                start_time = data.get('start_time', int(datetime.now().timestamp()))
                end_time = data.get('end_time', int((datetime.now() + timedelta(days=7)).timestamp()))
                
                tx_receipt = web3_manager.create_election(
                    title=data['title'],
                    description=data['description'],
                    candidates=data['candidates'],
                    start_time=start_time,
                    end_time=end_time
                )
                # Extract just the transaction hash
                blockchain_tx = tx_receipt.get('transactionHash') if isinstance(tx_receipt, dict) else str(tx_receipt)
                blockchain_id = len(voting_contract.get_all_elections()) - 1
                print(f"Election created on blockchain: {blockchain_tx}")
            except Exception as e:
                print(f"Warning: Failed to create election on blockchain: {str(e)}")
        
        save_data()  # Save after election creation
        
        return jsonify({
            'success': True,
            'election_id': election_id,
            'blockchain_id': blockchain_id,
            'blockchain_tx': blockchain_tx,
            'message': 'Election created successfully'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/elections/<election_id>/vote', methods=['POST'])
def cast_vote(election_id):
    """Cast a vote in an election."""
    data = request.get_json()
    
    required_fields = ['voter_id', 'secret_key', 'candidate']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result = voting_contract.cast_vote(
        election_id=election_id,
        voter_id=data['voter_id'],
        secret_key=data['secret_key'],
        candidate=data['candidate']
    )
    
    if result['success']:
        # Cast vote on blockchain if enabled
        blockchain_tx = None
        if use_blockchain and data.get('ethereum_address'):
            try:
                # Get candidate index
                election = voting_contract.get_election(election_id)
                candidate_index = election['candidates'].index(data['candidate'])
                blockchain_id = int(election_id.replace('-', '')[:8], 16) % 1000
                
                tx_receipt = web3_manager.cast_vote(
                    election_id=blockchain_id,
                    candidate_index=candidate_index,
                    voter_address=data['ethereum_address']
                )
                # Extract just the transaction hash
                blockchain_tx = tx_receipt.get('transactionHash') if isinstance(tx_receipt, dict) else str(tx_receipt)
                print(f"Vote cast on blockchain: {blockchain_tx}")
            except Exception as e:
                print(f"Warning: Failed to cast vote on blockchain: {str(e)}")
        
        save_data()  # Save after vote
        result['blockchain_tx'] = blockchain_tx
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@app.route('/api/elections/<election_id>/results', methods=['GET'])
def get_results(election_id):
    """Get election results."""
    results = voting_contract.get_results(election_id)
    
    if not results['success']:
        return jsonify(results), 404
    
    # Get blockchain results if available
    if use_blockchain:
        try:
            blockchain_id = int(election_id.replace('-', '')[:8], 16) % 1000
            blockchain_results = web3_manager.get_results(blockchain_id)
            results['blockchain_results'] = blockchain_results['results']
        except Exception as e:
            print(f"Warning: Could not fetch blockchain results: {str(e)}")
    
    return jsonify(results), 200


@app.route('/api/elections/<election_id>/close', methods=['POST'])
def close_election(election_id):
    """Close an election."""
    data = request.get_json()
    
    if 'creator_id' not in data:
        return jsonify({'error': 'Creator ID is required'}), 400
    
    result = voting_contract.close_election(
        election_id=election_id,
        creator_id=data['creator_id']
    )
    
    if result['success']:
        # Close on blockchain if enabled
        blockchain_tx = None
        if use_blockchain:
            try:
                blockchain_id = int(election_id.replace('-', '')[:8], 16) % 1000
                blockchain_tx = web3_manager.close_election(blockchain_id)
                print(f"Election closed on blockchain: {blockchain_tx}")
            except Exception as e:
                print(f"Warning: Failed to close election on blockchain: {str(e)}")
        
        save_data()  # Save after closing election
        result['blockchain_tx'] = blockchain_tx
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@app.route('/api/elections/<election_id>/has-voted', methods=['POST'])
def check_has_voted(election_id):
    """Check if a voter has already voted."""
    data = request.get_json()
    
    if 'voter_id' not in data:
        return jsonify({'error': 'Voter ID is required'}), 400
    
    has_voted = voting_contract.has_voted(election_id, data['voter_id'])
    
    # Check on blockchain if available
    blockchain_has_voted = None
    if use_blockchain and data.get('ethereum_address'):
        try:
            blockchain_id = int(election_id.replace('-', '')[:8], 16) % 1000
            blockchain_has_voted = web3_manager.has_voted(blockchain_id, data['ethereum_address'])
        except Exception as e:
            print(f"Warning: Could not check blockchain voting status: {str(e)}")
    
    return jsonify({
        'has_voted': has_voted,
        'blockchain_has_voted': blockchain_has_voted
    }), 200


# ============================================================================
# TRANSACTION ENDPOINTS
# ============================================================================

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get transaction history."""
    voter_id = request.args.get('voter_id')
    transactions = blockchain.get_transaction_history(voter_id)
    
    return jsonify(transactions), 200


@app.route('/api/account/<address>/balance', methods=['GET'])
def get_account_balance(address):
    """Get account balance (Ethereum)."""
    if not use_blockchain:
        return jsonify({'error': 'Blockchain mode not enabled'}), 400
    
    try:
        balance = web3_manager.get_account_balance(address)
        return jsonify({
            'address': address,
            'balance_eth': balance
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Starting Blockchain Voting System API Server")
    print("="*60)
    if use_blockchain:
        print("Mode: ETHEREUM BLOCKCHAIN (Sepolia testnet)")
    else:
        print("Mode: LOCAL STORAGE (fallback)")
    print("Server running on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
