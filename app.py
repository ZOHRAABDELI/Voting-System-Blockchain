"""
Flask API server for the blockchain voting system.
Provides RESTful endpoints for voter registration, voting, and results.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'contracts'))

from contracts.blockchain import Blockchain
from contracts.voting_contract import VotingContract

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize blockchain and voting contract
blockchain = Blockchain()
voting_contract = VotingContract(blockchain)

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


def save_data():
    """Save blockchain and voting data to disk."""
    blockchain.save_to_file()
    voting_contract.save_to_file()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'blockchain_length': len(blockchain.chain),
        'pending_transactions': len(blockchain.pending_transactions)
    }), 200


@app.route('/api/blockchain', methods=['GET'])
def get_blockchain():
    """Get the entire blockchain."""
    return jsonify({
        'chain': blockchain.get_chain_data(),
        'length': len(blockchain.chain),
        'is_valid': blockchain.is_chain_valid()
    }), 200


@app.route('/api/mine', methods=['POST'])
def mine_block():
    """Mine a new block."""
    data = request.get_json()
    miner_address = data.get('miner_address', 'system')
    
    block = blockchain.mine_block(miner_address)
    save_data()  # Save after mining
    
    return jsonify({
        'message': 'New block mined successfully',
        'block': block.to_dict()
    }), 200


@app.route('/api/voters/register', methods=['POST'])
def register_voter():
    """Register a new voter."""
    data = request.get_json()
    
    required_fields = ['name', 'email']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        voter_id, secret_key = voting_contract.register_voter(
            voter_name=data['name'],
            email=data['email']
        )
        save_data()  # Save after registration
        
        return jsonify({
            'success': True,
            'voter_id': voter_id,
            'secret_key': secret_key,
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


@app.route('/api/elections', methods=['GET'])
def get_elections():
    """Get all elections."""
    elections = voting_contract.get_all_elections()
    return jsonify(elections), 200


@app.route('/api/elections/<election_id>', methods=['GET'])
def get_election(election_id):
    """Get specific election details."""
    election = voting_contract.get_election(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
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
        election_id = voting_contract.create_election(
            title=data['title'],
            description=data['description'],
            candidates=data['candidates'],
            creator=data['creator'],
            start_time=data.get('start_time'),
            end_time=data.get('end_time')
        )
        save_data()  # Save after election creation
        
        return jsonify({
            'success': True,
            'election_id': election_id,
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
        save_data()  # Save after vote
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@app.route('/api/elections/<election_id>/results', methods=['GET'])
def get_results(election_id):
    """Get election results."""
    results = voting_contract.get_results(election_id)
    
    if not results['success']:
        return jsonify(results), 404
    
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
        save_data()  # Save after closing election
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
    
    return jsonify({'has_voted': has_voted}), 200


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get transaction history."""
    voter_id = request.args.get('voter_id')
    transactions = blockchain.get_transaction_history(voter_id)
    
    return jsonify(transactions), 200


if __name__ == '__main__':
    print("Starting Blockchain Voting System API Server...")
    print("Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
