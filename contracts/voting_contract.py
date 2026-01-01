"""
Voting smart contract implementation.
This module handles voter registration, vote casting, and vote counting.
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from uuid import uuid4


class VotingContract:
    """Smart contract for managing voting elections."""
    
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.elections: Dict[str, Dict] = {}
        self.voters: Dict[str, Dict] = {}
        self.votes: Dict[str, Dict] = {}  # election_id -> {voter_id -> vote}
        self.voter_hashes: Dict[str, str] = {}  # For anonymous voting
    
    def create_election(self, title: str, description: str, 
                       candidates: List[str], creator: str,
                       start_time: Optional[float] = None,
                       end_time: Optional[float] = None) -> str:
        """
        Create a new election.
        
        Args:
            title: Election title
            description: Election description
            candidates: List of candidate names
            creator: ID of the election creator
            start_time: Election start timestamp (optional)
            end_time: Election end timestamp (optional)
            
        Returns:
            Election ID
        """
        election_id = str(uuid4())
        
        election = {
            'id': election_id,
            'title': title,
            'description': description,
            'candidates': candidates,
            'creator': creator,
            'created_at': datetime.now().isoformat(),
            'start_time': start_time,
            'end_time': end_time,
            'status': 'active'
        }
        
        self.elections[election_id] = election
        self.votes[election_id] = {}
        
        # Record election creation on blockchain
        transaction = {
            'type': 'create_election',
            'election_id': election_id,
            'title': title,
            'candidates': candidates,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_transaction(transaction)
        
        return election_id
    
    def register_voter(self, voter_name: str, email: str, 
                      voter_id: Optional[str] = None) -> Tuple[str, str]:
        """
        Register a new voter.
        
        Args:
            voter_name: Voter's name
            email: Voter's email
            voter_id: Optional voter ID (generated if not provided)
            
        Returns:
            Tuple of (voter_id, secret_key)
        """
        if voter_id is None:
            voter_id = str(uuid4())
        
        # Generate a secret key for the voter
        secret_key = str(uuid4())
        
        # Create anonymous hash for the voter
        voter_hash = hashlib.sha256(
            f"{voter_id}{secret_key}".encode()
        ).hexdigest()
        
        voter = {
            'id': voter_id,
            'name': voter_name,
            'email': email,
            'registered_at': datetime.now().isoformat(),
            'secret_key': secret_key,
            'eligible': True
        }
        
        self.voters[voter_id] = voter
        self.voter_hashes[voter_id] = voter_hash
        
        # Record voter registration on blockchain (without revealing identity)
        transaction = {
            'type': 'register_voter',
            'voter_hash': voter_hash,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_transaction(transaction)
        
        return voter_id, secret_key
    
    def verify_voter(self, voter_id: str, secret_key: str) -> bool:
        """
        Verify a voter's credentials.
        
        Args:
            voter_id: Voter ID
            secret_key: Voter's secret key
            
        Returns:
            True if valid, False otherwise
        """
        voter = self.voters.get(voter_id)
        if not voter:
            return False
        return voter['secret_key'] == secret_key and voter['eligible']
    
    def cast_vote(self, election_id: str, voter_id: str, 
                  secret_key: str, candidate: str) -> Dict[str, any]:
        """
        Cast a vote in an election.
        
        Args:
            election_id: ID of the election
            voter_id: ID of the voter
            secret_key: Voter's secret key
            candidate: Name of the candidate to vote for
            
        Returns:
            Dictionary with vote result
        """
        # Verify election exists
        if election_id not in self.elections:
            return {'success': False, 'error': 'Election not found'}
        
        election = self.elections[election_id]
        
        # Check election status
        if election['status'] != 'active':
            return {'success': False, 'error': 'Election is not active'}
        
        # Verify voter
        if not self.verify_voter(voter_id, secret_key):
            return {'success': False, 'error': 'Invalid voter credentials'}
        
        # Check if voter already voted
        if voter_id in self.votes[election_id]:
            return {'success': False, 'error': 'You have already voted in this election'}
        
        # Verify candidate exists
        if candidate not in election['candidates']:
            return {'success': False, 'error': 'Invalid candidate'}
        
        # Create anonymous vote hash
        vote_hash = hashlib.sha256(
            f"{election_id}{voter_id}{candidate}{datetime.now().isoformat()}".encode()
        ).hexdigest()
        
        # Record vote (anonymously)
        self.votes[election_id][voter_id] = {
            'candidate': candidate,
            'timestamp': datetime.now().isoformat(),
            'vote_hash': vote_hash
        }
        
        # Add vote transaction to blockchain (anonymous)
        transaction = {
            'type': 'cast_vote',
            'election_id': election_id,
            'vote_hash': vote_hash,
            'voter_hash': self.voter_hashes[voter_id],
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_transaction(transaction)
        
        return {
            'success': True,
            'message': 'Vote cast successfully',
            'vote_hash': vote_hash
        }
    
    def get_results(self, election_id: str) -> Dict[str, any]:
        """
        Calculate and return election results.
        
        Args:
            election_id: ID of the election
            
        Returns:
            Dictionary with election results
        """
        if election_id not in self.elections:
            return {'success': False, 'error': 'Election not found'}
        
        election = self.elections[election_id]
        votes = self.votes.get(election_id, {})
        
        # Count votes
        vote_counts = {candidate: 0 for candidate in election['candidates']}
        
        for vote in votes.values():
            candidate = vote['candidate']
            if candidate in vote_counts:
                vote_counts[candidate] += 1
        
        # Calculate percentages
        total_votes = sum(vote_counts.values())
        results = []
        
        for candidate, count in vote_counts.items():
            percentage = (count / total_votes * 100) if total_votes > 0 else 0
            results.append({
                'candidate': candidate,
                'votes': count,
                'percentage': round(percentage, 2)
            })
        
        # Sort by vote count
        results.sort(key=lambda x: x['votes'], reverse=True)
        
        return {
            'success': True,
            'election_id': election_id,
            'title': election['title'],
            'total_votes': total_votes,
            'results': results,
            'winner': results[0]['candidate'] if results and results[0]['votes'] > 0 else None
        }
    
    def get_election(self, election_id: str) -> Optional[Dict]:
        """Get election details."""
        return self.elections.get(election_id)
    
    def get_all_elections(self) -> List[Dict]:
        """Get all elections."""
        return list(self.elections.values())
    
    def close_election(self, election_id: str, creator_id: str) -> Dict[str, any]:
        """
        Close an election (only by creator).
        
        Args:
            election_id: ID of the election
            creator_id: ID of the creator
            
        Returns:
            Dictionary with operation result
        """
        if election_id not in self.elections:
            return {'success': False, 'error': 'Election not found'}
        
        election = self.elections[election_id]
        
        if election['creator'] != creator_id:
            return {'success': False, 'error': 'Only the creator can close this election'}
        
        election['status'] = 'closed'
        
        # Record on blockchain
        transaction = {
            'type': 'close_election',
            'election_id': election_id,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_transaction(transaction)
        
        return {'success': True, 'message': 'Election closed successfully'}
    
    def has_voted(self, election_id: str, voter_id: str) -> bool:
        """Check if a voter has already voted in an election."""
        if election_id not in self.votes:
            return False
        return voter_id in self.votes[election_id]
    
    def get_voter_info(self, voter_id: str) -> Optional[Dict]:
        """Get voter information (without secret key)."""
        voter = self.voters.get(voter_id)
        if not voter:
            return None
        
        # Return voter info without secret key
        return {
            'id': voter['id'],
            'name': voter['name'],
            'email': voter['email'],
            'registered_at': voter['registered_at'],
            'eligible': voter['eligible']
        }
