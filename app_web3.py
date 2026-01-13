"""
Flask API server for the Ethereum-based blockchain voting system.

This is the UPDATED version that uses actual Ethereum smart contracts
instead of custom Python blockchain implementation.

Key Changes:
- Uses Web3.py to interact with deployed Ethereum smart contract
- Voter authentication via Ethereum addresses and private keys
- All data stored on Ethereum blockchain (not local files)
- Transaction hashes returned for blockchain verification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'contracts'))

from contracts.web3_integration import Web3Provider, VotingContractWeb3

app = Flask(__name__)
CORS(app)

# ============================================
# WEB3 INITIALIZATION
# ============================================

# Initialize Web3 provider
provider_url = os.getenv('ETH_PROVIDER_URL', 'http://127.0.0.1:8545')
chain_id = int(os.getenv('ETH_CHAIN_ID', '31337'))

print("\n" + "="*60)
print("  Blockchain Voting System - Ethereum Edition")
print("="*60)
print(f"🌐 Connecting to: {provider_url}")
print(f"⛓️  Chain ID: {chain_id}")

try:
    web3_provider = Web3Provider(provider_url=provider_url, chain_id=chain_id)
except Exception as e:
    print(f"❌ Failed to connect to Ethereum node: {e}")
    print("⚠️  Make sure your Ethereum node is running!")
    print("   For local development: npx hardhat node")
    sys.exit(1)

# Load contract
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
ABI_PATH = os.getenv('ABI_PATH', 'contracts/solidity/deployments/VotingSystem.abi.json')

if not CONTRACT_ADDRESS:
    print("❌ CONTRACT_ADDRESS not set in environment variables")
    print("   Please deploy the contract first and set CONTRACT_ADDRESS in .env")
    sys.exit(1)

try:
    voting_contract = VotingContractWeb3(
        web3_provider=web3_provider,
        contract_address=CONTRACT_ADDRESS,
        abi_path=ABI_PATH
    )
    print(f"✅ Contract loaded successfully")
except Exception as e:
    print(f"❌ Failed to load contract: {e}")
    sys.exit(1)

print("="*60)
print("✨ Server ready to accept requests")
print("="*60 + "\n")

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_private_key_from_request(data):
    """Extract private key from request (for transaction signing)."""
    return data.get('private_key') or os.getenv('DEFAULT_PRIVATE_KEY')

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        block_number = web3_provider.get_web3().eth.block_number
        total_voters = voting_contract.get_total_voters()
        total_elections = voting_contract.get_total_elections()
        
        return jsonify({
            'status': 'healthy',
            'network': 'ethereum',
            'chain_id': chain_id,
            'latest_block': block_number,
            'contract_address': CONTRACT_ADDRESS,
            'total_voters': total_voters,
            'total_elections': total_elections
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


@app.route('/api/blockchain', methods=['GET'])
def get_blockchain():
    """Get blockchain information."""
    try:
        w3 = web3_provider.get_web3()
        latest_block = w3.eth.get_block('latest')
        
        return jsonify({
            'network': 'ethereum',
            'chain_id': chain_id,
            'latest_block': latest_block['number'],
            'timestamp': latest_block['timestamp'],
            'contract_address': CONTRACT_ADDRESS,
            'total_voters': voting_contract.get_total_voters(),
            'total_elections': voting_contract.get_total_elections()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# VOTER ENDPOINTS
# ============================================

@app.route('/api/voters/register', methods=['POST'])
def register_voter():
    """
    Register a new voter on the Ethereum blockchain.
    
    Body:
        - name: Voter's name
        - email: Voter's email
        - address: Ethereum address
        - private_key: Private key for signing transaction
    """
    data = request.get_json()
    
    required_fields = ['name', 'email', 'address']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields: name, email, address'}), 400
    
    try:
        private_key = get_private_key_from_request(data)
        
        voter_id, tx_hash = voting_contract.register_voter(
            name=data['name'],
            email=data['email'],
            from_address=data['address'],
            private_key=private_key
        )
        
        return jsonify({
            'success': True,
            'voter_id': voter_id,
            'address': data['address'],
            'tx_hash': tx_hash,
            'message': 'Voter registered on Ethereum blockchain!'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/voters/<address>', methods=['GET'])
def get_voter(address):
    """Get voter information from blockchain."""
    try:
        voter = voting_contract.get_voter(address)
        return jsonify(voter), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@app.route('/api/voters/verify', methods=['POST'])
def verify_voter():
    """Verify voter exists on blockchain."""
    data = request.get_json()
    
    if 'address' not in data:
        return jsonify({'error': 'Missing address'}), 400
    
    try:
        is_registered = voting_contract.is_voter_registered(data['address'])
        voter_info = voting_contract.get_voter(data['address']) if is_registered else None
        
        return jsonify({
            'valid': is_registered,
            'voter_info': voter_info
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# ELECTION ENDPOINTS
# ============================================

@app.route('/api/elections', methods=['GET'])
def get_elections():
    """Get all elections from blockchain."""
    try:
        elections = voting_contract.get_all_elections()
        return jsonify(elections), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/elections/<int:election_id>', methods=['GET'])
def get_election(election_id):
    """Get specific election details from blockchain."""
    try:
        election = voting_contract.get_election(election_id)
        return jsonify(election), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@app.route('/api/elections', methods=['POST'])
def create_election():
    """
    Create a new election on Ethereum blockchain.
    
    Body:
        - title: Election title
        - description: Election description
        - candidates: Array of candidate names
        - creator_address: Ethereum address of creator
        - private_key: Private key for signing transaction
    """
    data = request.get_json()
    
    required_fields = ['title', 'description', 'candidates', 'creator_address']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not isinstance(data['candidates'], list) or len(data['candidates']) < 2:
        return jsonify({'error': 'At least 2 candidates are required'}), 400
    
    try:
        private_key = get_private_key_from_request(data)
        
        election_id, tx_hash = voting_contract.create_election(
            title=data['title'],
            description=data['description'],
            candidates=data['candidates'],
            from_address=data['creator_address'],
            private_key=private_key
        )
        
        return jsonify({
            'success': True,
            'election_id': election_id,
            'tx_hash': tx_hash,
            'message': 'Election created on Ethereum blockchain'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# VOTING ENDPOINTS
# ============================================

@app.route('/api/elections/<int:election_id>/vote', methods=['POST'])
def cast_vote(election_id):
    """
    Cast a vote in an election on Ethereum blockchain.
    
    Body:
        - voter_address: Ethereum address of voter
        - candidate_index: Index of candidate (0-based)
        - private_key: Private key for signing transaction
    """
    data = request.get_json()
    
    required_fields = ['voter_address', 'candidate_index']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        private_key = get_private_key_from_request(data)
        
        tx_hash = voting_contract.cast_vote(
            election_id=election_id,
            candidate_index=data['candidate_index'],
            from_address=data['voter_address'],
            private_key=private_key
        )
        
        return jsonify({
            'success': True,
            'tx_hash': tx_hash,
            'message': 'Vote recorded on Ethereum blockchain'
        }), 200
    except Exception as e:
        error_msg = str(e)
        if 'Already voted' in error_msg:
            return jsonify({'error': 'You have already voted in this election'}), 400
        return jsonify({'error': error_msg}), 500


@app.route('/api/elections/<int:election_id>/has-voted', methods=['POST'])
def check_has_voted(election_id):
    """Check if voter has voted in election."""
    data = request.get_json()
    
    if 'voter_address' not in data:
        return jsonify({'error': 'Voter address is required'}), 400
    
    try:
        has_voted = voting_contract.has_voted(election_id, data['voter_address'])
        return jsonify({'has_voted': has_voted}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# RESULTS ENDPOINTS
# ============================================

@app.route('/api/elections/<int:election_id>/results', methods=['GET'])
def get_results(election_id):
    """Get election results from blockchain."""
    try:
        results = voting_contract.get_election_results(election_id)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.route('/api/elections/<int:election_id>/close', methods=['POST'])
def close_election(election_id):
    """Close an election on blockchain."""
    data = request.get_json()
    
    if 'creator_address' not in data:
        return jsonify({'error': 'Creator address is required'}), 400
    
    try:
        private_key = get_private_key_from_request(data)
        
        tx_hash = voting_contract.close_election(
            election_id=election_id,
            from_address=data['creator_address'],
            private_key=private_key
        )
        
        return jsonify({
            'success': True,
            'tx_hash': tx_hash,
            'message': 'Election closed on blockchain'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True') == 'True'
    
    print("\n" + "="*60)
    print("  🚀 Ethereum Voting System API Server")
    print("="*60)
    print(f"📍 Server: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"📝 Contract: {CONTRACT_ADDRESS}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
