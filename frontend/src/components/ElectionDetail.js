import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElection, castVote, getElectionResults, checkHasVoted } from '../api';
import { useAuth } from '../AuthContext';

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { voter, isAuthenticated } = useAuth();
  
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockchainTx, setBlockchainTx] = useState(null);

  useEffect(() => {
    loadElectionData();
  }, [id]);

  const loadElectionData = async () => {
    try {
      const electionData = await getElection(id);
      setElection(electionData);
      
      const resultsData = await getElectionResults(id);
      setResults(resultsData);

      if (isAuthenticated && voter) {
        const voteStatus = await checkHasVoted(id, voter.id);
        setHasVoted(voteStatus.has_voted);
      }
    } catch (err) {
      setError('Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await castVote(id, voter.id, voter.secret_key, selectedCandidate, voter.ethereum_address);
      
      if (response.success) {
        setSuccess('Vote cast successfully!');
        setHasVoted(true);
        // Store blockchain transaction hash if available
        if (response.blockchain_tx) {
          setBlockchainTx(response.blockchain_tx);
        }
        // Reload results
        setTimeout(() => {
          loadElectionData();
        }, 1000);
      } else {
        setError(response.error || 'Failed to cast vote');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Election Not Found</h2>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/elections')}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Elections
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title}</h1>
              <p className="text-gray-600">{election.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              election.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {election.status}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p>{success}</p>
              {blockchainTx && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm font-semibold mb-2">🔗 Blockchain Transaction:</p>
                  <div className="bg-white bg-opacity-50 p-2 rounded mb-2 break-all font-mono text-xs">
                    {blockchainTx}
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${blockchainTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-green-700 hover:text-green-900 font-semibold underline"
                  >
                    View on Etherscan ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              Please <a href="/login" className="underline font-semibold">login</a> to vote
            </div>
          )}

          {hasVoted && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              ✓ You have already voted in this election
            </div>
          )}

          {/* Voting Form */}
          {election.status === 'active' && isAuthenticated && !hasVoted && (
            <form onSubmit={handleVote} className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Cast Your Vote</h2>
              <div className="space-y-3">
                {election.candidates?.map((candidate) => (
                  <label
                    key={candidate}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedCandidate === candidate
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate}
                      checked={selectedCandidate === candidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold text-gray-800">{candidate}</span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={voting || !selectedCandidate}
                className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
              >
                {voting ? 'Submitting Vote...' : 'Submit Vote'}
              </button>
            </form>
          )}

          {/* Results */}
          {results && results.success && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Results</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-600">Total Votes: <span className="font-bold text-gray-800">{results.total_votes}</span></p>
                {results.winner && (
                  <p className="text-gray-600">Winner: <span className="font-bold text-green-600">{results.winner}</span></p>
                )}
              </div>
              <div className="space-y-4">
                {results.results?.map((result, index) => (
                  <div key={result.candidate} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {index === 0 && result.votes > 0 && (
                          <span className="text-2xl mr-2">🏆</span>
                        )}
                        <span className="font-semibold text-gray-800">{result.candidate}</span>
                      </div>
                      <span className="text-gray-600">{result.votes} votes ({result.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
