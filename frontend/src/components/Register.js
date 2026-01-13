import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerVoter } from '../api';
import { useAuth } from '../AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ethereum_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [blockchainTx, setBlockchainTx] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerVoter(formData.name, formData.email);
      setCredentials({
        voter_id: response.voter_id,
        secret_key: response.secret_key,
        name: formData.name,
        email: formData.email,
        ethereum_address: formData.ethereum_address,
      });
      // Store blockchain transaction hash if available
      if (response.blockchain_tx) {
        setBlockchainTx(response.blockchain_tx);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = () => {
    login({
      id: credentials.voter_id,
      secret_key: credentials.secret_key,
      name: credentials.name,
      ethereum_address: credentials.ethereum_address,
      email: credentials.email,
    });
    navigate('/elections');
  };

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Registration Successful!</h2>
            <p className="text-gray-600 mt-2">Please save your credentials securely</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Important: Save these credentials!</p>
            <p className="text-sm text-yellow-700">You'll need them to login and vote. We cannot recover them if lost.</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 block mb-1">Voter ID:</label>
              <p className="text-sm font-mono bg-white p-2 rounded border break-all">{credentials.voter_id}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 block mb-1">Secret Key:</label>
              <p className="text-sm font-mono bg-white p-2 rounded border break-all">{credentials.secret_key}</p>
            </div>
            {blockchainTx && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <label className="text-sm font-semibold text-blue-700 block mb-2">🔗 Blockchain Registration:</label>
                <p className="text-xs font-mono bg-white p-2 rounded border break-all mb-2">{blockchainTx}</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${blockchainTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 text-sm font-semibold underline"
                >
                  View Registration on Etherscan ↗
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveAndContinue}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            I've Saved My Credentials - Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Voter Registration</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
            />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ethereum Address (for blockchain voting) <span className="text-blue-600 text-sm">(optional)</span>
            </label>
            <input
              type="text"
              name="ethereum_address"
              value={formData.ethereum_address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0x... (MetaMask wallet address)"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter your MetaMask wallet address to record votes on the Ethereum blockchain
            </p>
          </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already registered?{' '}
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
