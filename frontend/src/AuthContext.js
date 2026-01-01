import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [voter, setVoter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load voter data from localStorage
    const savedVoterId = localStorage.getItem('voterId');
    const savedSecretKey = localStorage.getItem('secretKey');
    const savedVoterName = localStorage.getItem('voterName');
    const savedVoterEmail = localStorage.getItem('voterEmail');

    if (savedVoterId && savedSecretKey) {
      setVoter({
        id: savedVoterId,
        secret_key: savedSecretKey,
        name: savedVoterName,
        email: savedVoterEmail,
      });
      setIsAuthenticated(true);
    }
  }, []);

  const login = (voterData) => {
    setVoter(voterData);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('voterId', voterData.id);
    localStorage.setItem('secretKey', voterData.secret_key);
    if (voterData.name) localStorage.setItem('voterName', voterData.name);
    if (voterData.email) localStorage.setItem('voterEmail', voterData.email);
  };

  const logout = () => {
    setVoter(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('voterId');
    localStorage.removeItem('secretKey');
    localStorage.removeItem('voterName');
    localStorage.removeItem('voterEmail');
  };

  return (
    <AuthContext.Provider value={{ voter, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
