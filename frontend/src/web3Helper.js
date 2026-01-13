/**
 * Web3 Integration Helper
 * Handles Ethereum blockchain interactions for voting
 */

import Web3 from 'web3';

let web3 = null;
let userAccount = null;

/**
 * Initialize Web3 and connect to MetaMask
 */
export const initializeWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    web3 = new Web3(window.ethereum);
    
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    userAccount = accounts[0];
    
    // Check network
    const chainId = await web3.eth.getChainId();
    if (chainId !== 11155111) { // Sepolia chain ID
      throw new Error('Please switch to Sepolia testnet in MetaMask');
    }
    
    return userAccount;
  } catch (error) {
    console.error('Web3 initialization error:', error);
    throw error;
  }
};

/**
 * Get current user account
 */
export const getUserAccount = () => {
  return userAccount;
};

/**
 * Get Web3 instance
 */
export const getWeb3 = () => {
  return web3;
};

/**
 * Check if MetaMask is connected
 */
export const isMetaMaskConnected = () => {
  return userAccount !== null && web3 !== null;
};

/**
 * Get account balance in ETH
 */
export const getAccountBalance = async (address) => {
  if (!web3) return null;
  
  try {
    const balanceWei = await web3.eth.getBalance(address);
    const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    return parseFloat(balanceEth).toFixed(4);
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
};

/**
 * Register voter on blockchain
 */
export const registerVoterOnBlockchain = async (voterInfo) => {
  if (!userAccount) {
    throw new Error('MetaMask not connected');
  }

  try {
    const response = await fetch('/api/voters/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: voterInfo.name,
        email: voterInfo.email,
        ethereum_address: userAccount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Voter registration error:', error);
    throw error;
  }
};

/**
 * Create election on blockchain
 */
export const createElectionOnBlockchain = async (electionData) => {
  try {
    const response = await fetch('/api/elections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...electionData,
        creator: userAccount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Election creation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Election creation error:', error);
    throw error;
  }
};

/**
 * Cast vote on blockchain
 */
export const castVoteOnBlockchain = async (electionId, voterId, secretKey, candidate) => {
  if (!userAccount) {
    throw new Error('MetaMask not connected');
  }

  try {
    const response = await fetch(`/api/elections/${electionId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voter_id: voterId,
        secret_key: secretKey,
        candidate: candidate,
        ethereum_address: userAccount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vote casting failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Vote casting error:', error);
    throw error;
  }
};

/**
 * Check if voter has already voted
 */
export const checkIfVoted = async (electionId, voterId) => {
  try {
    const response = await fetch(`/api/elections/${electionId}/has-voted`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voter_id: voterId,
        ethereum_address: userAccount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Check vote failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.has_voted;
  } catch (error) {
    console.error('Check vote error:', error);
    return false;
  }
};

/**
 * Get election results from blockchain
 */
export const getElectionResults = async (electionId) => {
  try {
    const response = await fetch(`/api/elections/${electionId}/results`);

    if (!response.ok) {
      throw new Error(`Get results failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

/**
 * Get transaction details from Etherscan
 */
export const getTransactionDetails = (txHash) => {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
};

/**
 * Listen for account changes in MetaMask
 */
export const onAccountChange = (callback) => {
  if (!window.ethereum) {
    console.error('MetaMask not available');
    return;
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      userAccount = null;
    } else {
      userAccount = accounts[0];
    }
    callback(userAccount);
  });
};

/**
 * Listen for network changes
 */
export const onNetworkChange = (callback) => {
  if (!window.ethereum) {
    console.error('MetaMask not available');
    return;
  }

  window.ethereum.on('chainChanged', (chainId) => {
    if (chainId !== '0xaa36a7') { // Sepolia chain ID in hex
      console.warn('Wrong network! Please switch to Sepolia testnet.');
    }
    callback(parseInt(chainId, 16));
  });
};

export default {
  initializeWeb3,
  getUserAccount,
  getWeb3,
  isMetaMaskConnected,
  getAccountBalance,
  registerVoterOnBlockchain,
  createElectionOnBlockchain,
  castVoteOnBlockchain,
  checkIfVoted,
  getElectionResults,
  getTransactionDetails,
  onAccountChange,
  onNetworkChange,
};
