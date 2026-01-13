import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  initWeb3, 
  loadContract, 
  getCurrentAccount, 
  isVoterRegistered,
  getVoterInfo 
} from './web3Service';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [voterInfo, setVoterInfo] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const initializeWeb3 = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize Web3
      const initialized = await initWeb3();
      
      if (!initialized) {
        throw new Error('Failed to initialize Web3');
      }
      
      // Load contract (you'll need to provide ABI and address)
      // For now, we'll load from environment or config
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const contractABI = require('./contracts/VotingSystem.json'); // ABI file
      
      if (contractAddress && contractABI) {
        loadContract(contractABI.abi, contractAddress);
      }
      
      // Get current account
      const currentAccount = await getCurrentAccount();
      setAccount(currentAccount);
      setIsConnected(true);
      
      // Check if registered
      if (currentAccount) {
        const registered = await isVoterRegistered();
        setIsRegistered(registered);
        
        if (registered) {
          const info = await getVoterInfo();
          setVoterInfo(info);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Web3 initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setAccount(null);
      setIsConnected(false);
      setIsRegistered(false);
      setVoterInfo(null);
    } else {
      // User switched account
      setAccount(accounts[0]);
      await checkRegistration(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // Reload page on network change
    window.location.reload();
  };

  const checkRegistration = async (accountAddress = null) => {
    try {
      const registered = await isVoterRegistered();
      setIsRegistered(registered);
      
      if (registered) {
        const info = await getVoterInfo(accountAddress);
        setVoterInfo(info);
      } else {
        setVoterInfo(null);
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this dApp.');
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeWeb3();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsRegistered(false);
    setVoterInfo(null);
  };

  const refreshVoterInfo = async () => {
    await checkRegistration();
  };

  const value = {
    account,
    isConnected,
    isRegistered,
    voterInfo,
    networkId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    refreshVoterInfo,
    checkRegistration
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
