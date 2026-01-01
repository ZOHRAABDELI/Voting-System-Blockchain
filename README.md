# Blockchain Voting System

A decentralized voting system built with Python blockchain backend and React frontend, featuring transparent and secure voting with immutable blockchain records.

## � Live Demo

**Want to see it in action?** Deploy for free in 30 minutes:
- 📖 [Quick Deployment Guide](DEPLOY_QUICKSTART.md) - Get live in 5 steps
- 📖 [Visual Deployment Guide](DEPLOY_VISUAL_GUIDE.md) - Step-by-step with screenshots
- 📖 [Complete Deployment Guide](DEPLOYMENT.md) - All options and details

## 🌟 Features

- **Voter Registration & Eligibility Control**: Secure voter registration with unique credentials
- **Anonymous Vote Submission**: Cast votes anonymously while maintaining integrity
- **Automatic Result Calculation**: Real-time vote counting and transparent results
- **Blockchain Transparency**: All transactions recorded immutably on blockchain
- **Tamper-Proof**: Prevents manipulation through proof-of-work validation
- **Data Persistence**: Automatic file-based storage - no database required

## 🏗️ Architecture

### Backend (Python)
- Custom blockchain implementation with proof-of-work
- Flask REST API server
- Smart contract for voting logic
- Anonymous voting using cryptographic hashing
- **File-based persistence** - Data survives server restarts

### Frontend (React + Tailwind CSS)
- Modern, responsive UI with animations
- Real-time election results
- Blockchain explorer
- Voter authentication system

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   ```
   
   The API server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   The frontend will open at `http://localhost:3000`

## 📖 Usage Guide

### 1. Register as a Voter
- Navigate to the Register page
- Enter your name and email
- Save your Voter ID and Secret Key (you'll need these to login)

### 2. Login
- Use your Voter ID and Secret Key to login
- Keep your credentials secure

### 3. Create an Election
- Click "Create Election" in the navbar
- Enter election title, description, and candidates (minimum 2)
- Submit to create the election

### 4. Vote
- Browse available elections
- Click on an election to view details
- Select your candidate and submit your vote
- Each voter can only vote once per election

### 5. View Results
- Results are displayed in real-time
- View vote counts and percentages
- See the winner

### 6. Explore Blockchain
- View all blocks in the blockchain
- See transaction history
- Mine new blocks to commit pending transactions

## 🔧 API Endpoints

### Voter Endpoints
- `POST /api/voters/register` - Register a new voter
- `POST /api/voters/verify` - Verify voter credentials
- `GET /api/voters/<voter_id>` - Get voter information

### Election Endpoints
- `GET /api/elections` - Get all elections
- `GET /api/elections/<election_id>` - Get specific election
- `POST /api/elections` - Create new election
- `POST /api/elections/<election_id>/vote` - Cast a vote
- `GET /api/elections/<election_id>/results` - Get election results
- `POST /api/elections/<election_id>/close` - Close an election

### Blockchain Endpoints
- `GET /api/blockchain` - Get entire blockchain
- `POST /api/mine` - Mine a new block
- `GET /api/transactions` - Get transaction history

## 🎯 Use Cases

- **Scientific Club Elections**: Democratic election of club officers
- **Course Polls**: Gather student feedback on courses
- **Project Evaluations**: Vote on best projects or presentations
- **Competition Judging**: Fair and transparent competition results

## 🔐 Security Features

1. **Anonymous Voting**: Votes are recorded with cryptographic hashes
2. **One Vote Per Person**: System prevents double voting
3. **Immutable Records**: Blockchain ensures votes cannot be altered
4. **Proof of Work**: Validates blockchain integrity
5. **Secure Credentials**: Each voter has unique ID and secret key
6. **Data Persistence**: Automatic saving to disk ensures data survives restarts

## 💾 Data Persistence

The system now includes **automatic file-based persistence**:

- **Blockchain data** is saved to `data/blockchain.json`
- **Voting data** is saved to `data/voting_data.json`
- Data is **automatically saved** after every operation (registration, voting, mining)
- Data is **automatically loaded** when the server starts
- No database required - simple JSON file storage
- Data persists across server restarts

### Manual Testing

Run the persistence test to verify functionality:
```bash
python test_persistence.py
```

### Data Location

All data is stored in the `data/` directory:
```
data/
├── blockchain.json      # Blockchain and transaction data
└── voting_data.json     # Elections, voters, and votes
```

**Note**: The `data/` directory is git-ignored by default. Remove from `.gitignore` if you want to commit data.

## 📊 Learning Outcomes

This project demonstrates:
- How blockchain ensures transparency in voting
- Prevention of vote manipulation through cryptography
- Democratic governance through decentralized systems
- Proof-of-work consensus mechanism
- Smart contract implementation for voting logic

## 🛠️ Technology Stack

**Backend:**
- Python 3
- Flask (Web Framework)
- Flask-CORS (Cross-Origin Resource Sharing)
- hashlib (Cryptographic hashing)
- JSON (Data serialization)

**Frontend:**
- React 18
- React Router (Navigation)
- Axios (HTTP client)
- Tailwind CSS (Styling)
- PostCSS & Autoprefixer

## 📁 Project Structure

```
Voting-System-Blockchain/
├── contracts/
│   ├── blockchain.py          # Blockchain implementation
│   └── voting_contract.py     # Voting smart contract
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Home.js
│   │   │   ├── Register.js
│   │   │   ├── Login.js
│   │   │   ├── Elections.js
│   │   │   ├── ElectionDetail.js
│   │   │   ├── CreateElection.js
│   │   │   └── Blockchain.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── api.js
│   │   ├── AuthContext.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── app.py                     # Flask API server
├── requirements.txt           # Python dependencies
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📝 License

This project is open source and available under the MIT License.

## 👥 Authors

Created for blockchain voting system demonstration and educational purposes.

## 🙏 Acknowledgments

- Built as part of blockchain technology coursework
- Demonstrates practical application of blockchain in voting systems
- Inspired by the need for transparent and secure voting mechanisms