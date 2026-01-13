# Decentralized Voting System on Ethereum Blockchain

A production-grade decentralized voting application built on Ethereum Sepolia testnet. This system ensures **transparent, secure, and immutable** voting where every vote is permanently recorded on the blockchain.

## 🎯 Project Overview

This is a **full-stack DApp (Decentralized Application)** that combines:
- **Smart Contract** (Solidity) - immutable voting logic on blockchain
- **Backend API** (Flask/Python) - handles business logic and blockchain interaction
- **Frontend** (React) - user-friendly voting interface with Web3 integration

**Why blockchain for voting?**
- ✅ **Transparency** - All votes recorded publicly on blockchain
- ✅ **Immutability** - Votes cannot be deleted or modified
- ✅ **Auditability** - Anyone can verify votes on Etherscan
- ✅ **No Trust Required** - Smart contract enforces rules automatically
- ✅ **Democratic Governance** - Code ensures fair voting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ETHEREUM SEPOLIA BLOCKCHAIN              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ VotingContract.sol (Smart Contract)                 │   │
│  │ - registerVoter()      - Register eligible voters   │   │
│  │ - createElection()     - Create elections           │   │
│  │ - castVote()          - Cast immutable votes        │   │
│  │ - getResults()        - Retrieve vote counts        │   │
│  │ - closeElection()     - End voting period           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
                    (Web3.py via Infura)
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│           BACKEND (Flask/Python)                             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ web3_manager.py - Blockchain Interaction Layer      │   │
│  │ - Connects via Infura RPC                           │   │
│  │ - Signs transactions with private key               │   │
│  │ - Waits for blockchain confirmation                 │   │
│  │ - Returns transaction hashes for verification       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ app.py - REST API Server                            │   │
│  │ - /api/voters/register     - User registration      │   │
│  │ - /api/elections           - Election management    │   │
│  │ - /api/elections/*/vote    - Vote casting          │   │
│  │ - /api/elections/*/results - Get results            │   │
│  │ - Hybrid mode: Blockchain + Local storage fallback  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ voting_contract.py - Business Logic                 │   │
│  │ - Election management (local storage)               │   │
│  │ - Vote validation & counting                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ data/ - JSON Storage                                │   │
│  │ - blockchain.json (local blockchain state)          │   │
│  │ - voting_data.json (election/vote records)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
                    (HTTP REST API)
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│           FRONTEND (React)                                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Components                                            │   │
│  │ - Home.js            - Landing page                 │   │
│  │ - Register.js        - Voter registration           │   │
│  │ - Login.js           - Authentication               │   │
│  │ - Elections.js       - View all elections           │   │
│  │ - ElectionDetail.js  - Vote interface + Etherscan  │   │
│  │ - CreateElection.js  - Election creation modal      │   │
│  │ - Blockchain.js      - Sepolia testnet explorer    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Integration                                           │   │
│  │ - api.js            - Backend API calls             │   │
│  │ - AuthContext.js    - Voter authentication state    │   │
│  │ - Shows transaction hashes with Etherscan links    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ External Integration                                 │   │
│  │ - MetaMask - Wallet integration for addresses       │   │
│  │ - Etherscan - Blockchain transaction explorer       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Why Each Was Chosen

### **Smart Contract Layer**
- **Solidity 0.8.19** - Industry standard for Ethereum smart contracts
  - Why: Mature, secure, audited ecosystem; immutable vote recording
  - Functions: Voter registration, election creation, vote casting, result calculation

### **Blockchain**
- **Ethereum Sepolia Testnet** - Free test network for development
  - **Why Sepolia?**
    - ✅ **Free test ETH** - Get from faucet at https://sepolia-faucet.pk910.de/
    - ✅ **No real money** - All transactions use worthless test ETH
    - ✅ **Production-equivalent** - Matches Ethereum mainnet behavior exactly
    - ✅ **Instant validation** - Blocks every ~12 seconds (fast feedback)
    - ✅ **Real blockchain** - Not a mock/local implementation
    - ✅ **Public ledger** - Everyone can verify on Etherscan
  - **Smart Contract Address**: `0xf5B28AdD93120536A1e70D13aD116778aefd6404`
  - **Live Verification**: https://sepolia.etherscan.io/address/0xf5B28AdD93120536A1e70D13aD116778aefd6404
  - **All transactions visible** in real-time on Etherscan as they're confirmed

### **Backend**
- **Flask 3.0** - Lightweight Python web framework
  - Why: Fast to prototype, integrates easily with Web3.py
  - Implements REST API for all voting operations

- **Web3.py 6.11** - Python Ethereum client library
  - Why: Sign transactions, interact with smart contracts, read blockchain state
  - Handles: Transaction signing with private key, contract ABI parsing, receipt waiting

- **Python 3.11** - Programming language
  - Why: Fast development, strong Web3 ecosystem, easy to maintain

- **JSON Storage** - Local persistence layer
  - Why: Fallback when blockchain unavailable, faster reads for duplicate vote checks

### **Frontend**
- **React 18** - Modern UI framework
  - Why: Component-based, efficient re-rendering, large ecosystem

- **Tailwind CSS** - Utility-first CSS framework
  - Why: Beautiful UI with minimal code, responsive design out-of-box

- **Axios** - HTTP client
  - Why: Simple, promise-based API calls to backend

- **React Router** - Client-side routing
  - Why: Multi-page SPA experience without page reloads

### **Infrastructure**
- **Infura** - Ethereum RPC provider
  - Why: Reliable, free tier, no need to run full node
  - Endpoint: https://sepolia.infura.io/v3/[API_KEY]

- **MetaMask** - Wallet integration
  - Why: Most popular Ethereum wallet, users can verify transactions

---

## 📋 How Everything Works (End-to-End)

**Note on "Real" vs "Simulated":**
- This system uses **real blockchain** - actual Ethereum Sepolia testnet
- Transactions are **real** - cryptographically signed, not fake
- Money is **fake** - test ETH has zero monetary value (it's just numbers for testing)
- Cost is **real** - computing resources are actually used (you'll see gas fees)
- Visibility is **real** - anyone can see votes on Etherscan forever

Think of it like a flight simulator: the physics are real, the computation is real, but the plane isn't real and you don't crash. Same here: blockchain is real, transactions are real, but the money is worthless test tokens.

### **1. User Registration**
```
User enters: Name, Email, Ethereum Address
         ↓
Frontend POST /api/voters/register
         ↓
Backend stores voter locally (voting_data.json)
         ↓
Backend calls web3_manager.register_voter()
         ↓
Smart contract records voter on blockchain
         ↓
Returns: voter_id, secret_key, transaction_hash
         ↓
User sees success modal with Etherscan link
```

**Why blockchain registration?**
- Ensures voter eligibility is on-chain
- Auditable: anyone can verify registered voters on Etherscan

### **2. Create Election**
```
Creator enters: Title, Description, Candidates, Dates
         ↓
Frontend POST /api/elections
         ↓
Backend stores election locally with UUID
         ↓
Backend calls web3_manager.create_election()
         ↓
Smart contract creates election on blockchain with ID
         ↓
Returns: election_id, transaction_hash
         ↓
Success modal shows Etherscan link
```

**Why blockchain storage?**
- Election parameters immutable: can't change candidates after creation
- Transparent: everyone can see all elections ever created

### **3. Cast Vote (THE CORE)**
```
Voter selects candidate
         ↓
Frontend POST /api/elections/{id}/vote
  - voter_id, secret_key, candidate, ethereum_address
         ↓
Backend validates:
  - Voter exists and authenticated (secret_key check)
  - Voter hasn't voted before (duplicate check in local storage)
  - Election is active (time-based check)
  - Candidate exists (index validation)
         ↓
Backend calls web3_manager.cast_vote()
         ↓
Web3Manager:
  1. Builds transaction: contract.castVote(electionId, candidateIndex)
  2. Signs with private key (owner account)
  3. Sends to Sepolia via Infura
  4. Waits for receipt confirmation
  5. Extracts transaction hash
         ↓
Smart contract:
  1. Verifies voter is registered
  2. Verifies voter hasn't voted
  3. Records vote immutably
  4. Increments vote count
  5. Emits VoteCast event
         ↓
Backend stores vote locally (backup)
         ↓
Returns: success=true, blockchain_tx=0x...
         ↓
Frontend displays:
  - Green success message
  - Transaction hash
  - "View on Etherscan" link
```

**Why this is secure:**
- Transaction signed with private key (only owner can send)
- Smart contract validates voter status on-chain
- Vote is immutable once in blockchain
- Can be verified by anyone

### **4. Get Results**
```
User clicks "Results" 
         ↓
Frontend GET /api/elections/{id}/results
         ↓
Backend calls web3_manager.get_results()
         ↓
Smart contract returns vote counts from blockchain
         ↓
Backend calculates percentages
         ↓
Returns vote counts and winner
         ↓
Frontend displays bar chart with percentages
```

**Why blockchain results?**
- Proven: votes actually exist on immutable ledger
- Auditable: anyone can verify vote counts match blockchain

### **5. Verify on Etherscan (Real-Time)**
```
User clicks "View on Etherscan"
         ↓
Navigates to: https://sepolia.etherscan.io/tx/{hash}
         ↓
See LIVE information:
  - From: Your wallet address
  - To: Contract address (0xf5B28AdD93120536A1e70D13aD116778aefd6404)
  - Method: castVote or createElection or registerVoter
  - Status: Success ✓
  - Gas used: Actual amount consumed (e.g., 0.000123 ETH)
  - Block: Which block included this transaction
  - Timestamp: Exact time it was mined
  - Block confirmation: How many blocks since (more = more secure)
```

**Check Contract in Real-Time:**
- **Smart Contract View**: https://sepolia.etherscan.io/address/0xf5B28AdD93120536A1e70D13aD116778aefd6404
- See all transactions ever sent to this contract
- View all votes recorded on the blockchain
- Check voter registrations and election creation
- Every vote is permanently recorded and visible to everyone

**Proof of Decentralization:**
- NOT controlled by app owner
- Visible to everyone immediately after blockchain confirms
- Immutable history (can't delete or modify)
- Cannot be faked - cryptographically signed by blockchain validators
- Public ledger - transparent and auditable

---

## 🚀 How to Run

### **Prerequisites**
- Python 3.11+
- Node.js 16+
- MetaMask wallet with Sepolia testnet
- **Ethereum address with test ETH** (get free from faucet below)

### **Step 0: Get Free Test ETH**

Before running, you need test ETH to pay for blockchain transactions:

1. Go to https://sepolia-faucet.pk910.de/
2. Enter your Ethereum address (from MetaMask)
3. Click "Send me 1 Sepolia ETH"
4. Wait ~30 seconds - you'll receive 1 test ETH
5. Check your balance at: https://sepolia.etherscan.io/address/[YOUR_ADDRESS]
   - Replace `[YOUR_ADDRESS]` with your actual address
   - You'll see the balance and all your transaction history

**Why test ETH?**
- Each blockchain operation costs a small amount of ETH (gas)
- Voter registration: ~0.0003 ETH
- Create election: ~0.0005 ETH
- Cast vote: ~0.0002 ETH
- 1 test ETH is enough for ~1000 votes!

### **Step 1: Setup Backend**
```bash
# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with:
# - WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/{YOUR_INFURA_KEY}
# - PRIVATE_KEY=0x{YOUR_PRIVATE_KEY}
# - CONTRACT_ADDRESS=0xf5B28AdD93120536A1e70D13aD116778aefd6404

# Run backend
python app.py
# Backend runs on http://localhost:5000
```

### **2. Setup Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Frontend runs on http://localhost:3000
```

### **Step 3: Test the System**
1. Go to http://localhost:3000
2. Register with your MetaMask address
3. Create an election
4. Vote on the election
5. **Check Etherscan to verify your transaction:**
   - Click "View on Etherscan" link in success message
   - See your vote recorded on blockchain in real-time
   - Transaction appears within 15 seconds after voting
   - Status will change from "Pending" → "Success" as block confirms

### **Step 4: Monitor Live Blockchain Activity**
Watch all voting system activity in real-time:
- **Contract Address**: https://sepolia.etherscan.io/address/0xf5B28AdD93120536A1e70D13aD116778aefd6404
- **Transaction List**: Shows every vote, registration, and election creation
- **Your Wallet**: https://sepolia.etherscan.io/address/[YOUR_ADDRESS]
  - Replace `[YOUR_ADDRESS]` with your Ethereum address
  - See your test ETH balance
  - View all transactions you've initiated

---

## 📁 Project Structure

```
├── app.py                          # Flask REST API server
├── deploy_contract.py              # Script to deploy smart contract
├── requirements.txt                # Python dependencies
│
├── contracts/
│   ├── VotingContract.sol          # Smart contract (Solidity)
│   ├── web3_manager.py             # Blockchain interaction layer
│   ├── voting_contract.py          # Business logic & storage
│   └── voting_contract_abi.json    # Contract ABI for Web3 calls
│
├── data/
│   ├── blockchain.json             # Local blockchain state
│   └── voting_data.json            # Elections and votes (backup)
│
├── frontend/
│   ├── public/
│   │   └── index.html              # HTML entry point
│   ├── src/
│   │   ├── App.js                  # Main React app
│   │   ├── api.js                  # Backend API client
│   │   ├── AuthContext.js          # Voter authentication state
│   │   ├── index.css               # Global styles
│   │   └── components/
│   │       ├── Home.js             # Landing page
│   │       ├── Register.js         # Voter registration
│   │       ├── Login.js            # Authentication
│   │       ├── Elections.js        # List elections
│   │       ├── ElectionDetail.js   # Vote interface
│   │       ├── CreateElection.js   # Create elections
│   │       ├── Blockchain.js       # Sepolia explorer view
│   │       ├── Navbar.js           # Navigation
│   │       └── ...
│   ├── package.json                # Node dependencies
│   ├── tailwind.config.js          # Tailwind configuration
│   └── postcss.config.js           # CSS processing
│
├── .env                            # Environment variables (GITIGNORED)
├── .env.example                    # Environment template
└── README.md                       # This file
```

---

## 🔐 Security Architecture

### **Private Key Management**
- Stored in `.env` file (not in git)
- Only used by backend to sign transactions
- Never exposed to frontend

### **Vote Integrity**
- Smart contract prevents double voting
- Each vote recorded immutably
- Voter eligibility verified on-chain

### **Authentication**
- Voter ID + Secret Key required
- Not blockchain-based (reduces gas costs)
- Hybrid approach: blockchain for immutability, local for speed

### **Transaction Verification**
- User can verify vote on Etherscan
- Blockchain proof that vote was cast
- No way to deny or delete vote

---

## 💰 Gas Costs (Sepolia Testnet)

All costs in test ETH (no real value):
- Register Voter: ~0.0003 ETH
- Create Election: ~0.0005 ETH
- Cast Vote: ~0.0002 ETH
- Get Results: Free (read operation)

**Total for full workflow: ~0.001 ETH**

---

## 🎓 Key Learning Outcomes

This project demonstrates:

1. **Blockchain Fundamentals**
   - Smart contracts ensure trust without intermediary
   - Transactions are immutable once confirmed
   - Public ledger enables transparency

2. **Web3 Integration**
   - Connecting to blockchain via RPC provider
   - Signing transactions with private keys
   - Parsing contract ABIs and calling functions
   - Waiting for transaction confirmation

3. **Full-Stack Development**
   - Backend: Flask REST API + Web3.py
   - Frontend: React with blockchain integration
   - Hybrid storage: blockchain + local fallback

4. **Real-World Security**
   - Private key management
   - Transaction signing
   - Input validation
   - Fallback mechanisms

---

## � Real-Time Blockchain Verification

This is the killer feature of the system: **complete transparency and auditability**.
**⚠️ Important Clarification: Real Blockchain, Fake Money**
- ✅ **Real Blockchain**: Every vote is recorded on actual Ethereum Sepolia testnet
- ✅ **Real Transactions**: Cryptographically signed, validated by thousands of nodes
- ✅ **Real Network**: Uses same consensus mechanism as mainnet Ethereum
- ⚠️ **Fake Money**: Test ETH has zero monetary value (it's not simulated, just worthless)
- ⚠️ **Test-Only**: Sepolia is specifically for development and testing

### **What You See on Etherscan (Real Example)**

When you cast a vote, you'll see something like this on Etherscan:

```
SEPOLIA TESTNET TRANSACTION

Transaction Hash:
  0xc6a0a865142f018bb0bb4accda4cc4da469ef86a577d2b418133cfdfe067acf6
  └─ Unique identifier for this transaction
  └─ Like a fingerprint - proves this exact transaction exists on blockchain
  └─ Can never be changed or deleted

Status: Success ✓
  └─ Transaction was accepted and recorded
  └─ All validations passed, vote is now permanent

Block: 10035117
  └─ Which block number contains this transaction
  └─ Blocks are like pages in a ledger (new page every ~12 seconds)
  └─ Once in a block, impossible to rewrite (would break entire chain)

Block Confirmations: 2
  └─ Number of blocks mined AFTER this transaction
  └─ More confirmations = more secure
  └─ After 12 confirmations, essentially 100% final

Timestamp: 16 secs ago (Jan-13-2026 01:30:24 PM UTC)
  └─ Exact time the transaction was mined into blockchain
  └─ Proof of when the vote was cast

From: 0xee1C27983b9a048DB27CAa58D166dc070A1C0704
  └─ Wallet address that initiated the vote
  └─ This is the voter's Ethereum address
  └─ Proves WHO cast the vote

To: 0xf5B28AdD93120536A1e70D13aD116778aefd6404
  └─ Smart contract address (our voting system)
  └─ This is where the vote is recorded
  └─ All votes for all elections go to this contract

Value: 0 ETH
  └─ Amount of ETH sent with transaction
  └─ For voting, no money changes hands (value is just the vote)
  └─ If it was 0.5 ETH, that means 0.5 test ETH transferred

Transaction Fee: 0.00002828724405948 ETH
  └─ Cost to execute the vote on blockchain
  └─ Called "gas" - payment to network validators
  └─ On testnet: worthless (test ETH = fake money)
  └─ On mainnet: would be real money (~$0.05-1.00 USD)
  └─ This proves we're NOT simulating - real computation required

Gas Price: 1.010619652 Gwei (0.000000001010619652 ETH)
  └─ Price per unit of computation
  └─ 1 Gwei = 1 billionth of an ETH
  └─ Network users bid for block space (higher price = faster inclusion)
```

### **Why This Proves It's Real (Not Simulated)**

| Aspect | Simulated System | Our System (Sepolia) |
|--------|-----------------|----------------------|
| **Blockchain** | Fake ledger in code | Real Ethereum network |
| **Transactions** | Pretend operations | Real cryptographic signatures |
| **Validators** | Imaginary nodes | 1000s of real Ethereum nodes |
| **Immutability** | Easily reversible | Cryptographically permanent |
| **Gas Costs** | Zero/fake | Real computation costs |
| **Public Visibility** | Hidden in app | Open to entire world on Etherscan |
| **Verification** | Trust the app | Verify with blockchain math |

**The key difference**: If we were simulating, the "blockchain" would be stored in our `data/blockchain.json` file and could be edited at any time. Instead, we're using the actual Ethereum network where no one can modify history.
### **Live Dashboard**
Every vote cast is immediately visible on the blockchain:

1. **Our Smart Contract**: https://sepolia.etherscan.io/address/0xf5B28AdD93120536A1e70D13aD116778aefd6404
   - Shows all transactions sent to our voting smart contract
   - Each row is a vote, election creation, or voter registration
   - Click any transaction to see full details

2. **What You Can See:**
   - **Timestamp** - Exact date/time transaction occurred
   - **From Address** - Who initiated the transaction
   - **Method** - What action (castVote, createElection, registerVoter)
   - **Status** - Success/Failure
   - **Gas Used** - How much test ETH it cost
   - **Block Number** - Which block contains this transaction
   - **Confirmations** - How many blocks have been mined after this one

3. **Get Test ETH:**
   - Free faucet: https://sepolia-faucet.pk910.de/
   - No credit card needed
   - Instant or within 30 seconds
   - 1 ETH is enough for ~1000 votes

### **Why This Proves Blockchain Integration**
- ✅ **Not mocked** - Real transactions on real blockchain
- ✅ **Publicly visible** - Anyone can check our contract address
- ✅ **Immutable** - Votes can't be changed or deleted
- ✅ **Verifiable** - Click the link, see the proof yourself
- ✅ **Decentralized** - Not controlled by us, enforced by Ethereum network

---

## �🔗 Useful Links

**Our System:**
- **Smart Contract** (Sepolia Testnet): https://sepolia.etherscan.io/address/0xf5B28AdD93120536A1e70D13aD116778aefd6404
- **Get Test ETH** (Sepolia Faucet): https://sepolia-faucet.pk910.de/

**External Resources:**
- **Etherscan Sepolia** (Blockchain Explorer): https://sepolia.etherscan.io
- **Infura Dashboard** (RPC Provider): https://infura.io
- **MetaMask** (Wallet): https://metamask.io
- **Solidity Docs** (Smart Contract Language): https://docs.soliditylang.org

---

## 📊 Project Summary

| Aspect | Technology | Why |
|--------|-----------|-----|
| Smart Contract | Solidity 0.8.19 | Ethereum standard, secure |
| Blockchain | Ethereum Sepolia | Free testnet, production-like |
| Backend | Flask + Web3.py | Fast, mature, Web3 ecosystem |
| Frontend | React + Tailwind | Modern, responsive, component-based |
| Storage | JSON + Blockchain | Hybrid: fast local + immutable on-chain |
| Wallet | MetaMask | Most popular, industry standard |
| Verification | Etherscan | Transparent, public ledger |

---

## 📝 Notes

- Contract address is hardcoded in code (could be made dynamic)
- Uses Sepolia testnet (not for production without upgrades)
- Single backend wallet owner (should be decentralized for production)
- All transactions public (privacy could be added with ZK-proofs)

---

**Built for: Decentralized, Transparent, Immutable Voting**

Proof that blockchain ensures trust through code, not people.