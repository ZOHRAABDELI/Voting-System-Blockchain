import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { isAuthenticated, voter, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="gradient-bg text-white shadow-2xl backdrop-blur-sm sticky top-0 z-50 animate-fade-in-down">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-display font-bold flex items-center group animate-slide-in-right">
            <div className="w-10 h-10 mr-3 bg-white bg-opacity-20 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              VoteChain
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 animate-slide-in-left">
            <Link to="/" className="hover:text-blue-200 transition-all duration-300 font-medium relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/elections" className="hover:text-blue-200 transition-all duration-300 font-medium relative group">
              Elections
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-election" className="hover:text-blue-200 transition-all duration-300 font-medium relative group">
                  Create
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/blockchain" className="hover:text-blue-200 transition-all duration-300 font-medium relative group">
                  Blockchain
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-full font-medium backdrop-blur-sm border border-white border-opacity-30 animate-fade-in">
                    👤 {voter?.name || 'Voter'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-5 py-2 rounded-full transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/register" className="hover:text-blue-200 transition-all duration-300 font-medium relative group">
                  Register
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/login" className="bg-white text-primary-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in-down">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all">Home</Link>
              <Link to="/elections" className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all">Elections</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/create-election" className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all">Create Election</Link>
                  <Link to="/blockchain" className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all">Blockchain</Link>
                  <div className="px-4 py-2 bg-white bg-opacity-20 rounded-lg">👤 {voter?.name || 'Voter'}</div>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all">Register</Link>
                  <Link to="/login" className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all font-semibold">Login</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
