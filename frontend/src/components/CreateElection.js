import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElection } from '../api';
import { useAuth } from '../AuthContext';

const CreateElection = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidates: ['', ''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [blockchainTx, setBlockchainTx] = useState(null);
  const navigate = useNavigate();
  const { voter, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCandidateChange = (index, value) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index] = value;
    setFormData({
      ...formData,
      candidates: newCandidates,
    });
  };

  const addCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, ''],
    });
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length > 2) {
      const newCandidates = formData.candidates.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        candidates: newCandidates,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate candidates
    const validCandidates = formData.candidates.filter(c => c.trim() !== '');
    if (validCandidates.length < 2) {
      setError('Please provide at least 2 candidates');
      setLoading(false);
      return;
    }

    try {
      const response = await createElection(
        formData.title,
        formData.description,
        validCandidates,
        voter.id
      );
      
      if (response.success) {
        setSuccess(response.election_id);
        if (response.blockchain_tx) {
          setBlockchainTx(response.blockchain_tx);
        }
        // Navigate after 3 seconds or on button click
        setTimeout(() => {
          navigate(`/elections/${response.election_id}`);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Create New Election</h1>

        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Election Created!</h2>
                <p className="text-gray-600 mt-2">Your election has been successfully created on the blockchain</p>
              </div>

              {blockchainTx && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <p className="text-sm font-semibold text-blue-700 mb-2">🔗 Blockchain Transaction:</p>
                  <p className="text-xs font-mono bg-white p-2 rounded border break-all mb-2">{blockchainTx}</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${blockchainTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 text-sm font-semibold underline"
                  >
                    View on Etherscan ↗
                  </a>
                </div>
              )}

              <button
                onClick={() => navigate(`/elections/${success}`)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Go to Election
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">Redirecting in 3 seconds...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!success && (
          <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Election Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Student Council President Election 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Provide details about this election..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Candidates * (minimum 2)
              </label>
              <div className="space-y-3">
                {formData.candidates.map((candidate, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={candidate}
                      onChange={(e) => handleCandidateChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={`Candidate ${index + 1} name`}
                      required
                    />
                    {formData.candidates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addCandidate}
                className="mt-3 text-primary-600 hover:text-primary-700 flex items-center font-semibold"
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Another Candidate
              </button>
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Creating Election...' : 'Create Election'}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default CreateElection;
