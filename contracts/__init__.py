"""
Initialize contracts module.
"""

from .blockchain import Blockchain, Block
from .voting_contract import VotingContract

__all__ = ['Blockchain', 'Block', 'VotingContract']
