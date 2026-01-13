import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllElections } from '../api';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const data = await getAllElections();
      setElections(data);
    } catch (err) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-5xl font-display font-black text-gray-800 mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Active Elections
            </h1>
            <p className="text-gray-600 text-lg">Browse and participate in ongoing elections</p>
          </div>
          <Link
            to="/create-election"
            className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Election</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 animate-shake flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {elections.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center animate-scale-in">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-3xl font-display font-bold text-gray-700 mb-3">No Elections Yet</h3>
            <p className="text-gray-500 text-lg mb-8">Be the first to create a democratic election on the blockchain!</p>
            <Link
              to="/create-election"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create First Election</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {elections.map((election, index) => (
              <Link
                key={election.id}
                to={`/elections/${election.id}`}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-500 transform hover:-translate-y-2 stagger-item relative overflow-hidden"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {election.title}
                    </h3>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                      election.status === 'active' 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {election.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{election.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-800">{election.candidates?.length || 0} Candidates</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{new Date(election.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl hover:shadow-glow transition-all duration-300 font-bold text-lg transform group-hover:scale-105 flex items-center justify-center gap-2">
                  <span>View Details</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;
