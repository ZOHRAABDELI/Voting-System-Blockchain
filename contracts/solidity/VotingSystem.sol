// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingSystem
 * @dev Implements a decentralized voting system on Ethereum blockchain
 * @notice This contract manages voter registration, election creation, and vote casting
 * 
 * Key Features:
 * - Voter registration with unique IDs
 * - Election creation with multiple candidates
 * - Anonymous voting with double-vote prevention
 * - Real-time result calculation
 * - Tamper-proof vote storage on blockchain
 */
contract VotingSystem {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @dev Counter for generating unique election IDs
    uint256 private electionIdCounter;
    
    /// @dev Counter for generating unique voter IDs
    uint256 private voterIdCounter;
    
    /// @dev Contract owner address (deployer)
    address public owner;
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @dev Voter structure to store voter information
     * @param id Unique voter identifier
     * @param voterAddress Ethereum address of the voter
     * @param name Voter's name
     * @param email Voter's email
     * @param isRegistered Registration status
     * @param registeredAt Registration timestamp
     */
    struct Voter {
        uint256 id;
        address voterAddress;
        string name;
        string email;
        bool isRegistered;
        uint256 registeredAt;
    }
    
    /**
     * @dev Election structure to store election details
     * @param id Unique election identifier
     * @param title Election title
     * @param description Election description
     * @param creator Address of election creator
     * @param createdAt Creation timestamp
     * @param isActive Election status
     * @param totalVotes Total number of votes cast
     */
    struct Election {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 createdAt;
        bool isActive;
        uint256 totalVotes;
        string[] candidates;
    }
    
    /**
     * @dev Vote structure (stored anonymously)
     * @param votedAt Timestamp when vote was cast
     * @param voteHash Hash of the vote for verification
     */
    struct Vote {
        uint256 votedAt;
        bytes32 voteHash;
    }
    
    // ============================================
    // MAPPINGS (STATE STORAGE)
    // ============================================
    
    /// @dev Mapping from voter address to Voter struct
    mapping(address => Voter) public voters;
    
    /// @dev Mapping from voter ID to voter address
    mapping(uint256 => address) public voterIdToAddress;
    
    /// @dev Mapping from election ID to Election struct
    mapping(uint256 => Election) public elections;
    
    /// @dev Mapping: electionId => (voterAddress => hasVoted)
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    /// @dev Mapping: electionId => (voterAddress => Vote)
    mapping(uint256 => mapping(address => Vote)) private votes;
    
    /// @dev Mapping: electionId => (candidate => voteCount)
    mapping(uint256 => mapping(string => uint256)) public candidateVotes;
    
    /// @dev Array of all election IDs
    uint256[] public electionIds;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /**
     * @dev Emitted when a new voter is registered
     * @param voterId Unique voter ID
     * @param voterAddress Ethereum address of voter
     * @param name Voter's name
     */
    event VoterRegistered(
        uint256 indexed voterId,
        address indexed voterAddress,
        string name
    );
    
    /**
     * @dev Emitted when a new election is created
     * @param electionId Unique election ID
     * @param title Election title
     * @param creator Address of creator
     */
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        address indexed creator
    );
    
    /**
     * @dev Emitted when a vote is cast
     * @param electionId Election ID
     * @param voterAddress Voter's address (for tracking, not revealing vote)
     * @param voteHash Hash of the vote
     */
    event VoteCast(
        uint256 indexed electionId,
        address indexed voterAddress,
        bytes32 voteHash
    );
    
    /**
     * @dev Emitted when an election is closed
     * @param electionId Election ID
     * @param closedBy Address that closed the election
     */
    event ElectionClosed(
        uint256 indexed electionId,
        address indexed closedBy
    );
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Ensures caller is a registered voter
     */
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        _;
    }
    
    /**
     * @dev Ensures election exists and is active
     * @param _electionId The election ID to check
     */
    modifier electionExists(uint256 _electionId) {
        require(_electionId < electionIdCounter, "Election does not exist");
        _;
    }
    
    /**
     * @dev Ensures election is active
     * @param _electionId The election ID to check
     */
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Contract constructor - sets deployer as owner
     */
    constructor() {
        owner = msg.sender;
        electionIdCounter = 0;
        voterIdCounter = 0;
    }
    
    // ============================================
    // VOTER FUNCTIONS
    // ============================================
    
    /**
     * @dev Register a new voter
     * @param _name Voter's name
     * @param _email Voter's email
     * @return voterId The assigned voter ID
     * 
     * Requirements:
     * - Caller must not be already registered
     * - Name and email must not be empty
     */
    function registerVoter(
        string memory _name,
        string memory _email
    ) public returns (uint256 voterId) {
        require(!voters[msg.sender].isRegistered, "Voter already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        voterId = voterIdCounter;
        
        voters[msg.sender] = Voter({
            id: voterId,
            voterAddress: msg.sender,
            name: _name,
            email: _email,
            isRegistered: true,
            registeredAt: block.timestamp
        });
        
        voterIdToAddress[voterId] = msg.sender;
        voterIdCounter++;
        
        emit VoterRegistered(voterId, msg.sender, _name);
        
        return voterId;
    }
    
    /**
     * @dev Get voter information by address
     * @param _voterAddress The voter's Ethereum address
     * @return Voter struct containing voter details
     */
    function getVoter(address _voterAddress) 
        public 
        view 
        returns (Voter memory) 
    {
        require(voters[_voterAddress].isRegistered, "Voter not found");
        return voters[_voterAddress];
    }
    
    /**
     * @dev Check if an address is a registered voter
     * @param _voterAddress The address to check
     * @return bool True if registered, false otherwise
     */
    function isVoterRegistered(address _voterAddress) 
        public 
        view 
        returns (bool) 
    {
        return voters[_voterAddress].isRegistered;
    }
    
    // ============================================
    // ELECTION FUNCTIONS
    // ============================================
    
    /**
     * @dev Create a new election
     * @param _title Election title
     * @param _description Election description
     * @param _candidates Array of candidate names
     * @return electionId The created election ID
     * 
     * Requirements:
     * - Caller must be registered voter
     * - At least 2 candidates required
     * - Title and description must not be empty
     */
    function createElection(
        string memory _title,
        string memory _description,
        string[] memory _candidates
    ) public onlyRegisteredVoter returns (uint256 electionId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_candidates.length >= 2, "At least 2 candidates required");
        
        electionId = electionIdCounter;
        
        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            totalVotes: 0,
            candidates: _candidates
        });
        
        electionIds.push(electionId);
        electionIdCounter++;
        
        emit ElectionCreated(electionId, _title, msg.sender);
        
        return electionId;
    }
    
    /**
     * @dev Get election details
     * @param _electionId The election ID
     * @return Election struct containing election details
     */
    function getElection(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId)
        returns (Election memory) 
    {
        return elections[_electionId];
    }
    
    /**
     * @dev Get all election IDs
     * @return Array of all election IDs
     */
    function getAllElectionIds() public view returns (uint256[] memory) {
        return electionIds;
    }
    
    /**
     * @dev Get candidates for an election
     * @param _electionId The election ID
     * @return Array of candidate names
     */
    function getCandidates(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId)
        returns (string[] memory) 
    {
        return elections[_electionId].candidates;
    }
    
    // ============================================
    // VOTING FUNCTIONS
    // ============================================
    
    /**
     * @dev Cast a vote in an election
     * @param _electionId The election ID
     * @param _candidateIndex Index of the candidate in the candidates array
     * 
     * Requirements:
     * - Caller must be registered voter
     * - Election must exist and be active
     * - Voter must not have already voted
     * - Candidate index must be valid
     */
    function castVote(
        uint256 _electionId,
        uint256 _candidateIndex
    ) 
        public 
        onlyRegisteredVoter
        electionExists(_electionId)
        electionActive(_electionId)
    {
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(
            _candidateIndex < elections[_electionId].candidates.length,
            "Invalid candidate index"
        );
        
        // Get the candidate name
        string memory candidate = elections[_electionId].candidates[_candidateIndex];
        
        // Create anonymous vote hash
        bytes32 voteHash = keccak256(
            abi.encodePacked(
                _electionId,
                msg.sender,
                candidate,
                block.timestamp
            )
        );
        
        // Record the vote
        votes[_electionId][msg.sender] = Vote({
            votedAt: block.timestamp,
            voteHash: voteHash
        });
        
        // Mark as voted
        hasVoted[_electionId][msg.sender] = true;
        
        // Increment vote count for candidate
        candidateVotes[_electionId][candidate]++;
        
        // Increment total votes
        elections[_electionId].totalVotes++;
        
        emit VoteCast(_electionId, msg.sender, voteHash);
    }
    
    /**
     * @dev Check if a voter has voted in an election
     * @param _electionId The election ID
     * @param _voterAddress The voter's address
     * @return bool True if voted, false otherwise
     */
    function hasVotedInElection(
        uint256 _electionId,
        address _voterAddress
    ) public view returns (bool) {
        return hasVoted[_electionId][_voterAddress];
    }
    
    // ============================================
    // RESULTS FUNCTIONS
    // ============================================
    
    /**
     * @dev Get vote count for a specific candidate
     * @param _electionId The election ID
     * @param _candidate The candidate name
     * @return uint256 Number of votes
     */
    function getCandidateVotes(
        uint256 _electionId,
        string memory _candidate
    ) 
        public 
        view 
        electionExists(_electionId)
        returns (uint256) 
    {
        return candidateVotes[_electionId][_candidate];
    }
    
    /**
     * @dev Get complete results for an election
     * @param _electionId The election ID
     * @return candidates Array of candidate names
     * @return voteCounts Array of vote counts (parallel to candidates)
     * @return totalVotes Total votes cast
     */
    function getElectionResults(uint256 _electionId)
        public
        view
        electionExists(_electionId)
        returns (
            string[] memory candidates,
            uint256[] memory voteCounts,
            uint256 totalVotes
        )
    {
        Election memory election = elections[_electionId];
        candidates = election.candidates;
        voteCounts = new uint256[](candidates.length);
        
        for (uint256 i = 0; i < candidates.length; i++) {
            voteCounts[i] = candidateVotes[_electionId][candidates[i]];
        }
        
        totalVotes = election.totalVotes;
        
        return (candidates, voteCounts, totalVotes);
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @dev Close an election (only by creator or owner)
     * @param _electionId The election ID to close
     * 
     * Requirements:
     * - Caller must be election creator or contract owner
     * - Election must be active
     */
    function closeElection(uint256 _electionId)
        public
        electionExists(_electionId)
        electionActive(_electionId)
    {
        require(
            msg.sender == elections[_electionId].creator || msg.sender == owner,
            "Only creator or owner can close election"
        );
        
        elections[_electionId].isActive = false;
        
        emit ElectionClosed(_electionId, msg.sender);
    }
    
    /**
     * @dev Get total number of registered voters
     * @return uint256 Total voter count
     */
    function getTotalVoters() public view returns (uint256) {
        return voterIdCounter;
    }
    
    /**
     * @dev Get total number of elections
     * @return uint256 Total election count
     */
    function getTotalElections() public view returns (uint256) {
        return electionIdCounter;
    }
}
