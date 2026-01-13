import Web3 from 'web3';

// Contract ABI and address (will be set after deployment)
let contractABI = null;
let contractAddress = null;
let web3 = null;
let contract = null;

/**
 * Initialize Web3 and connect to Ethereum provider
 * @returns {Promise<boolean>} True if connection successful
 */
export const initWeb3 = async () => {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log('✅ Web3 initialized with MetaMask');
      return true;
    } 
    // Legacy dapp browsers
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      console.log('✅ Web3 initialized with legacy provider');
      return true;
    }
    // Fallback to local node
    else {
      const provider = new Web3.providers.HttpProvider(
        process.env.REACT_APP_ETHEREUM_NODE || 'http://localhost:8545'
      );
      web3 = new Web3(provider);
      console.log('⚠️ Using local Ethereum node (no MetaMask)');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Web3:', error);
    return false;
  }
};

/**
 * Load contract ABI and address
 * @param {Object} abi - Contract ABI from compilation
 * @param {string} address - Deployed contract address
 */
export const loadContract = (abi, address) => {
  if (!web3) {
    throw new Error('Web3 not initialized. Call initWeb3() first.');
  }
  
  contractABI = abi;
  contractAddress = address;
  contract = new web3.eth.Contract(abi, address);
  
  console.log('✅ Contract loaded at:', address);
  return contract;
};

/**
 * Get current connected account
 * @returns {Promise<string>} Current Ethereum address
 */
export const getCurrentAccount = async () => {
  if (!web3) await initWeb3();
  
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

/**
 * Get network ID
 * @returns {Promise<number>} Network ID
 */
export const getNetworkId = async () => {
  if (!web3) await initWeb3();
  
  return await web3.eth.net.getId();
};

/**
 * Register a new voter on the blockchain
 * @param {string} name - Voter name
 * @param {string} email - Voter email
 * @returns {Promise<Object>} Transaction receipt and voter info
 */
export const registerVoterOnChain = async (name, email) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const account = await getCurrentAccount();
  
  try {
    // Call smart contract registerVoter function
    const receipt = await contract.methods
      .registerVoter(name, email)
      .send({ 
        from: account,
        gas: 300000 
      });
    
    // Extract voter ID from event logs
    const event = receipt.events.VoterRegistered;
    const voterId = event.returnValues.voterId;
    
    return {
      success: true,
      voterId: voterId,
      voterAddress: account,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error registering voter:', error);
    throw error;
  }
};

/**
 * Check if current user is registered
 * @returns {Promise<boolean>} True if registered
 */
export const isVoterRegistered = async () => {
  if (!contract) throw new Error('Contract not loaded');
  
  const account = await getCurrentAccount();
  
  try {
    const voter = await contract.methods.voters(account).call();
    return voter.isRegistered;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
};

/**
 * Get voter information
 * @param {string} address - Voter's Ethereum address
 * @returns {Promise<Object>} Voter data
 */
export const getVoterInfo = async (address = null) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const voterAddress = address || await getCurrentAccount();
  
  try {
    const voter = await contract.methods.voters(voterAddress).call();
    
    return {
      id: voter.id,
      address: voter.voterAddress,
      name: voter.name,
      email: voter.email,
      isRegistered: voter.isRegistered,
      registeredAt: new Date(parseInt(voter.registeredAt) * 1000)
    };
  } catch (error) {
    console.error('Error getting voter info:', error);
    throw error;
  }
};

/**
 * Create a new election
 * @param {string} title - Election title
 * @param {string} description - Election description
 * @param {Array<string>} candidates - Array of candidate names
 * @returns {Promise<Object>} Transaction receipt and election ID
 */
export const createElectionOnChain = async (title, description, candidates) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const account = await getCurrentAccount();
  
  try {
    const receipt = await contract.methods
      .createElection(title, description, candidates)
      .send({ 
        from: account,
        gas: 500000 
      });
    
    // Extract election ID from event
    const event = receipt.events.ElectionCreated;
    const electionId = event.returnValues.electionId;
    
    return {
      success: true,
      electionId: electionId,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error creating election:', error);
    throw error;
  }
};

/**
 * Get all elections
 * @returns {Promise<Array>} Array of election objects
 */
export const getAllElectionsFromChain = async () => {
  if (!contract) throw new Error('Contract not loaded');
  
  try {
    const electionIds = await contract.methods.getElectionIds().call();
    
    const elections = await Promise.all(
      electionIds.map(async (id) => {
        const election = await contract.methods.elections(id).call();
        const candidates = await contract.methods.getElectionCandidates(id).call();
        
        return {
          id: election.id,
          title: election.title,
          description: election.description,
          creator: election.creator,
          createdAt: new Date(parseInt(election.createdAt) * 1000),
          isActive: election.isActive,
          totalVotes: election.totalVotes,
          candidates: candidates
        };
      })
    );
    
    return elections;
  } catch (error) {
    console.error('Error getting elections:', error);
    throw error;
  }
};

/**
 * Get specific election details
 * @param {number} electionId - Election ID
 * @returns {Promise<Object>} Election data
 */
export const getElectionFromChain = async (electionId) => {
  if (!contract) throw new Error('Contract not loaded');
  
  try {
    const election = await contract.methods.elections(electionId).call();
    const candidates = await contract.methods.getElectionCandidates(electionId).call();
    
    return {
      id: election.id,
      title: election.title,
      description: election.description,
      creator: election.creator,
      createdAt: new Date(parseInt(election.createdAt) * 1000),
      isActive: election.isActive,
      totalVotes: election.totalVotes,
      candidates: candidates
    };
  } catch (error) {
    console.error('Error getting election:', error);
    throw error;
  }
};

/**
 * Cast a vote in an election
 * @param {number} electionId - Election ID
 * @param {string} candidate - Candidate name
 * @returns {Promise<Object>} Transaction receipt
 */
export const castVoteOnChain = async (electionId, candidate) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const account = await getCurrentAccount();
  
  try {
    const receipt = await contract.methods
      .vote(electionId, candidate)
      .send({ 
        from: account,
        gas: 200000 
      });
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error casting vote:', error);
    
    // Parse common errors
    if (error.message.includes('Already voted')) {
      throw new Error('You have already voted in this election');
    } else if (error.message.includes('Not registered')) {
      throw new Error('You must be registered to vote');
    } else if (error.message.includes('not active')) {
      throw new Error('This election is not active');
    }
    
    throw error;
  }
};

/**
 * Check if user has voted in an election
 * @param {number} electionId - Election ID
 * @param {string} address - Voter address (optional)
 * @returns {Promise<boolean>} True if already voted
 */
export const hasVotedInElection = async (electionId, address = null) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const voterAddress = address || await getCurrentAccount();
  
  try {
    return await contract.methods.hasVoted(electionId, voterAddress).call();
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

/**
 * Get election results
 * @param {number} electionId - Election ID
 * @returns {Promise<Object>} Results with vote counts
 */
export const getElectionResults = async (electionId) => {
  if (!contract) throw new Error('Contract not loaded');
  
  try {
    const election = await contract.methods.elections(electionId).call();
    const candidates = await contract.methods.getElectionCandidates(electionId).call();
    
    // Get vote count for each candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const votes = await contract.methods
          .candidateVotes(electionId, candidate)
          .call();
        
        return {
          candidate: candidate,
          votes: parseInt(votes)
        };
      })
    );
    
    // Calculate percentages
    const totalVotes = parseInt(election.totalVotes);
    const resultsWithPercentage = results.map(r => ({
      ...r,
      percentage: totalVotes > 0 ? (r.votes / totalVotes * 100).toFixed(2) : 0
    }));
    
    // Sort by votes
    resultsWithPercentage.sort((a, b) => b.votes - a.votes);
    
    return {
      success: true,
      electionId: electionId,
      title: election.title,
      totalVotes: totalVotes,
      results: resultsWithPercentage,
      winner: resultsWithPercentage[0]?.candidate || null
    };
  } catch (error) {
    console.error('Error getting results:', error);
    throw error;
  }
};

/**
 * Close an election (only creator)
 * @param {number} electionId - Election ID
 * @returns {Promise<Object>} Transaction receipt
 */
export const closeElectionOnChain = async (electionId) => {
  if (!contract) throw new Error('Contract not loaded');
  
  const account = await getCurrentAccount();
  
  try {
    const receipt = await contract.methods
      .closeElection(electionId)
      .send({ 
        from: account,
        gas: 100000 
      });
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error closing election:', error);
    
    if (error.message.includes('Only creator')) {
      throw new Error('Only the election creator can close this election');
    }
    
    throw error;
  }
};

/**
 * Listen for contract events
 * @param {string} eventName - Event name to listen for
 * @param {Function} callback - Callback function
 */
export const subscribeToEvent = (eventName, callback) => {
  if (!contract) throw new Error('Contract not loaded');
  
  contract.events[eventName]()
    .on('data', callback)
    .on('error', console.error);
};

/**
 * Get contract address
 * @returns {string} Contract address
 */
export const getContractAddress = () => contractAddress;

/**
 * Get Web3 instance
 * @returns {Object} Web3 instance
 */
export const getWeb3Instance = () => web3;

/**
 * Convert Wei to Ether
 * @param {string|number} wei - Amount in Wei
 * @returns {string} Amount in Ether
 */
export const weiToEther = (wei) => {
  if (!web3) return '0';
  return web3.utils.fromWei(wei.toString(), 'ether');
};

/**
 * Convert Ether to Wei
 * @param {string|number} ether - Amount in Ether
 * @returns {string} Amount in Wei
 */
export const etherToWei = (ether) => {
  if (!web3) return '0';
  return web3.utils.toWei(ether.toString(), 'ether');
};

export default {
  initWeb3,
  loadContract,
  getCurrentAccount,
  getNetworkId,
  registerVoterOnChain,
  isVoterRegistered,
  getVoterInfo,
  createElectionOnChain,
  getAllElectionsFromChain,
  getElectionFromChain,
  castVoteOnChain,
  hasVotedInElection,
  getElectionResults,
  closeElectionOnChain,
  subscribeToEvent,
  getContractAddress,
  getWeb3Instance,
  weiToEther,
  etherToWei
};
