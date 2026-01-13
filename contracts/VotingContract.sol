// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VotingContract
 * @dev Implements a voting system on the Ethereum blockchain
 */
contract VotingContract {
    
    // Structs
    struct Election {
        uint id;
        string title;
        string description;
        address creator;
        uint startTime;
        uint endTime;
        bool active;
        string[] candidates;
        uint totalVotes;
    }
    
    struct Vote {
        uint electionId;
        address voter;
        uint candidateIndex;
        uint timestamp;
    }
    
    // State variables
    mapping(uint => Election) public elections;
    mapping(uint => mapping(address => bool)) public hasVoted; // electionId => voterAddress => hasVoted
    mapping(uint => mapping(uint => uint)) public voteCount; // electionId => candidateIndex => count
    mapping(address => bool) public registeredVoters;
    
    uint public electionCount = 0;
    Vote[] public voteHistory;
    
    address public owner;
    
    // Events
    event ElectionCreated(
        uint indexed electionId,
        string title,
        address indexed creator,
        uint startTime,
        uint endTime
    );
    
    event VoterRegistered(
        address indexed voter,
        uint timestamp
    );
    
    event VoteCast(
        uint indexed electionId,
        address indexed voter,
        uint candidateIndex,
        uint timestamp
    );
    
    event ElectionClosed(
        uint indexed electionId,
        uint timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Voter not registered");
        _;
    }
    
    modifier electionExists(uint electionId) {
        require(electionId < electionCount, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint electionId) {
        require(elections[electionId].active, "Election is not active");
        require(
            block.timestamp >= elections[electionId].startTime,
            "Election has not started"
        );
        require(
            block.timestamp <= elections[electionId].endTime,
            "Election has ended"
        );
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Functions
    
    /**
     * @dev Register a voter on the blockchain
     */
    function registerVoter(address voterAddress) external onlyOwner {
        require(!registeredVoters[voterAddress], "Voter already registered");
        registeredVoters[voterAddress] = true;
        emit VoterRegistered(voterAddress, block.timestamp);
    }
    
    /**
     * @dev Create a new election
     * @param title The title of the election
     * @param description Description of the election
     * @param candidates Array of candidate names
     * @param startTime Unix timestamp for election start
     * @param endTime Unix timestamp for election end
     */
    function createElection(
        string memory title,
        string memory description,
        string[] memory candidates,
        uint startTime,
        uint endTime
    ) external returns (uint) {
        require(candidates.length >= 2, "At least 2 candidates required");
        require(startTime < endTime, "Start time must be before end time");
        require(endTime > block.timestamp, "End time must be in the future");
        
        uint electionId = electionCount;
        
        elections[electionId] = Election({
            id: electionId,
            title: title,
            description: description,
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            active: true,
            candidates: candidates,
            totalVotes: 0
        });
        
        electionCount++;
        
        emit ElectionCreated(
            electionId,
            title,
            msg.sender,
            startTime,
            endTime
        );
        
        return electionId;
    }
    
    /**
     * @dev Cast a vote in an election
     * @param electionId The ID of the election
     * @param candidateIndex The index of the candidate to vote for
     */
    function castVote(uint electionId, uint candidateIndex)
        external
        onlyRegisteredVoter
        electionExists(electionId)
        electionActive(electionId)
    {
        require(
            !hasVoted[electionId][msg.sender],
            "Voter has already voted in this election"
        );
        require(
            candidateIndex < elections[electionId].candidates.length,
            "Invalid candidate index"
        );
        
        hasVoted[electionId][msg.sender] = true;
        voteCount[electionId][candidateIndex]++;
        elections[electionId].totalVotes++;
        
        // Store vote in history
        voteHistory.push(Vote({
            electionId: electionId,
            voter: msg.sender,
            candidateIndex: candidateIndex,
            timestamp: block.timestamp
        }));
        
        emit VoteCast(
            electionId,
            msg.sender,
            candidateIndex,
            block.timestamp
        );
    }
    
    /**
     * @dev Close an election
     * @param electionId The ID of the election
     */
    function closeElection(uint electionId)
        external
        electionExists(electionId)
    {
        require(
            msg.sender == elections[electionId].creator || msg.sender == owner,
            "Only creator or owner can close election"
        );
        require(elections[electionId].active, "Election already closed");
        
        elections[electionId].active = false;
        
        emit ElectionClosed(electionId, block.timestamp);
    }
    
    /**
     * @dev Get election details
     * @param electionId The ID of the election
     */
    function getElection(uint electionId)
        external
        view
        electionExists(electionId)
        returns (Election memory)
    {
        return elections[electionId];
    }
    
    /**
     * @dev Get vote results for an election
     * @param electionId The ID of the election
     */
    function getResults(uint electionId)
        external
        view
        electionExists(electionId)
        returns (uint[] memory results)
    {
        uint candidateCount = elections[electionId].candidates.length;
        results = new uint[](candidateCount);
        
        for (uint i = 0; i < candidateCount; i++) {
            results[i] = voteCount[electionId][i];
        }
        
        return results;
    }
    
    /**
     * @dev Get all candidates for an election
     * @param electionId The ID of the election
     */
    function getCandidates(uint electionId)
        external
        view
        electionExists(electionId)
        returns (string[] memory)
    {
        return elections[electionId].candidates;
    }
    
    /**
     * @dev Check if a voter has voted in an election
     * @param electionId The ID of the election
     * @param voterAddress The address of the voter
     */
    function hasVoterVoted(uint electionId, address voterAddress)
        external
        view
        electionExists(electionId)
        returns (bool)
    {
        return hasVoted[electionId][voterAddress];
    }
    
    /**
     * @dev Get total elections count
     */
    function getElectionCount() external view returns (uint) {
        return electionCount;
    }
    
    /**
     * @dev Get vote history length
     */
    function getVoteHistoryLength() external view returns (uint) {
        return voteHistory.length;
    }
    
    /**
     * @dev Check if an address is a registered voter
     * @param voterAddress The address to check
     */
    function isVoterRegistered(address voterAddress)
        external
        view
        returns (bool)
    {
        return registeredVoters[voterAddress];
    }
}
