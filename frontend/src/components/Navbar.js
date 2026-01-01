import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { isAuthenticated, voter, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Blockchain Voting
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-200 transition">Home</Link>
            <Link to="/elections" className="hover:text-gray-200 transition">Elections</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-election" className="hover:text-gray-200 transition">Create Election</Link>
                <Link to="/blockchain" className="hover:text-gray-200 transition">Blockchain</Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {voter?.name || 'Voter'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/register" className="hover:text-gray-200 transition">Register</Link>
                <Link to="/login" className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
