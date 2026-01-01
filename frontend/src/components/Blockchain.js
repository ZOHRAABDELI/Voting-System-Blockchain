import React, { useState, useEffect } from 'react';
import { getBlockchain, mineBlock } from '../api';

const Blockchain = () => {
  const [blockchain, setBlockchain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    try {
      const data = await getBlockchain();
      setBlockchain(data);
    } catch (err) {
      setError('Failed to load blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleMineBlock = async () => {
    setMining(true);
    setError('');
    setSuccess('');

    try {
      await mineBlock();
      setSuccess('Block mined successfully!');
      loadBlockchain();
    } catch (err) {
      setError('Failed to mine block');
    } finally {
      setMining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Blockchain Explorer</h1>
          <button
            onClick={handleMineBlock}
            disabled={mining}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
          >
            {mining ? 'Mining...' : '⛏️ Mine Block'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Blockchain Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Blocks</h3>
            <p className="text-3xl font-bold text-primary-600">{blockchain?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Chain Status</h3>
            <p className={`text-3xl font-bold ${blockchain?.is_valid ? 'text-green-600' : 'text-red-600'}`}>
              {blockchain?.is_valid ? '✓ Valid' : '✗ Invalid'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-purple-600">
              {blockchain?.chain?.reduce((sum, block) => sum + block.transactions.length, 0) || 0}
            </p>
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-4">
          {blockchain?.chain?.slice().reverse().map((block, index) => (
            <div key={block.index} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    Block #{block.index}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(block.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {block.transactions.length} tx
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-semibold mb-1">Proof</p>
                    <p className="font-mono text-gray-800">{block.proof}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 font-semibold mb-1">Previous Hash</p>
                    <p className="font-mono text-gray-800 break-all text-xs">{block.previous_hash}</p>
                  </div>
                </div>

                {block.transactions.length > 0 && (
                  <div>
                    <p className="text-gray-600 font-semibold mb-2">Transactions:</p>
                    <div className="space-y-2">
                      {block.transactions.map((tx, txIndex) => (
                        <div key={txIndex} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {tx.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(tx.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {tx.type === 'create_election' && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p className="font-semibold">{tx.title}</p>
                              <p className="text-xs text-gray-500">
                                {tx.candidates?.join(', ')}
                              </p>
                            </div>
                          )}
                          {tx.type === 'cast_vote' && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p className="font-mono text-xs">Vote Hash: {tx.vote_hash?.substring(0, 16)}...</p>
                            </div>
                          )}
                          {tx.type === 'register_voter' && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p className="font-mono text-xs">Voter Hash: {tx.voter_hash?.substring(0, 16)}...</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blockchain;
