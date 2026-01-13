import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Voter endpoints
export const registerVoter = async (name, email) => {
  const response = await api.post('/voters/register', { name, email });
  return response.data;
};

export const verifyVoter = async (voterId, secretKey) => {
  const response = await api.post('/voters/verify', {
    voter_id: voterId,
    secret_key: secretKey,
  });
  return response.data;
};

export const getVoter = async (voterId) => {
  const response = await api.get(`/voters/${voterId}`);
  return response.data;
};

// Election endpoints
export const getAllElections = async () => {
  const response = await api.get('/elections');
  return response.data;
};

export const getElection = async (electionId) => {
  const response = await api.get(`/elections/${electionId}`);
  return response.data;
};

export const createElection = async (title, description, candidates, creator) => {
  const response = await api.post('/elections', {
    title,
    description,
    candidates,
    creator,
  });
  return response.data;
};

export const castVote = async (electionId, voterId, secretKey, candidate, ethereumAddress = null) => {
  const response = await api.post(`/elections/${electionId}/vote`, {
    voter_id: voterId,
    secret_key: secretKey,
    candidate,
    ethereum_address: ethereumAddress,
  });
  return response.data;
};

export const getElectionResults = async (electionId) => {
  const response = await api.get(`/elections/${electionId}/results`);
  return response.data;
};

export const closeElection = async (electionId, creatorId) => {
  const response = await api.post(`/elections/${electionId}/close`, {
    creator_id: creatorId,
  });
  return response.data;
};

export const checkHasVoted = async (electionId, voterId) => {
  const response = await api.post(`/elections/${electionId}/has-voted`, {
    voter_id: voterId,
  });
  return response.data;
};

// Blockchain endpoints
export const getBlockchain = async () => {
  const response = await api.get('/blockchain');
  return response.data;
};

export const mineBlock = async (minerAddress = 'system') => {
  const response = await api.post('/mine', { miner_address: minerAddress });
  return response.data;
};

export const getTransactions = async (voterId = null) => {
  const params = voterId ? { voter_id: voterId } : {};
  const response = await api.get('/transactions', { params });
  return response.data;
};

export default api;
