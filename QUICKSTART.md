# Quick Start Guide - Blockchain Voting System

## 🚀 Installation & Setup

### Method 1: Automated Setup (Recommended)
```bash
./setup.sh
```

### Method 2: Manual Setup

#### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Test the backend
python test.py

# Start the Flask server
python app.py
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

## 📝 Quick Usage Examples

### 1. Register a Voter
**API Call:**
```bash
curl -X POST http://localhost:5000/api/voters/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "voter_id": "abc123...",
  "secret_key": "xyz789...",
  "message": "Voter registered successfully. Please save your credentials!"
}
```

### 2. Create an Election
**API Call:**
```bash
curl -X POST http://localhost:5000/api/elections \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Council Election",
    "description": "Vote for your student council president",
    "candidates": ["Alice", "Bob", "Charlie"],
    "creator": "your-voter-id"
  }'
```

### 3. Cast a Vote
**API Call:**
```bash
curl -X POST http://localhost:5000/api/elections/{election_id}/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voter_id": "your-voter-id",
    "secret_key": "your-secret-key",
    "candidate": "Alice"
  }'
```

### 4. Get Election Results
**API Call:**
```bash
curl http://localhost:5000/api/elections/{election_id}/results
```

### 5. View Blockchain
**API Call:**
```bash
curl http://localhost:5000/api/blockchain
```

### 6. Mine a Block
**API Call:**
```bash
curl -X POST http://localhost:5000/api/mine \
  -H "Content-Type: application/json" \
  -d '{"miner_address": "miner1"}'
```

## 🌐 Frontend Pages

- **Home**: `http://localhost:3000/`
- **Register**: `http://localhost:3000/register`
- **Login**: `http://localhost:3000/login`
- **Elections**: `http://localhost:3000/elections`
- **Create Election**: `http://localhost:3000/create-election`
- **Blockchain Explorer**: `http://localhost:3000/blockchain`

## 🔧 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

**Import errors:**
```bash
# Ensure you're in the project root directory
cd /path/to/Voting-System-Blockchain

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Node modules issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 in use:**
```bash
# React will automatically suggest another port
# Or kill the process:
kill -9 $(lsof -ti:3000)
```

## 📊 Testing Workflow

### Test Backend
```bash
python test.py
```

### Test API Endpoints
```bash
# Check server health
curl http://localhost:5000/api/health

# Get all elections
curl http://localhost:5000/api/elections

# Get blockchain
curl http://localhost:5000/api/blockchain
```

## 🎯 Complete Workflow Example

1. **Start both servers:**
   ```bash
   # Terminal 1: Backend
   python app.py
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

2. **Register two voters** at `http://localhost:3000/register`
   - Save their credentials!

3. **Login as first voter**

4. **Create an election** with at least 2 candidates

5. **Vote as first voter**

6. **Logout and login as second voter**

7. **Vote as second voter**

8. **View results** on the election detail page

9. **Explore blockchain** at `/blockchain` page

10. **Mine a block** to commit all transactions

## 🔐 Important Notes

- **Save voter credentials**: Voter ID and Secret Key cannot be recovered
- **One vote per person**: Each voter can only vote once per election
- **Mine blocks regularly**: Pending transactions need to be mined to be committed
- **Anonymous voting**: Votes are hashed and cannot be traced back to voters

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🛠️ Development Tips

### Backend Development
```bash
# Run with auto-reload
export FLASK_ENV=development
python app.py
```

### Frontend Development
```bash
# Clear cache and rebuild
cd frontend
rm -rf build
npm run build
```

### View Logs
```bash
# Backend logs appear in terminal
# Frontend logs in browser console (F12)
```

## 📚 API Documentation

Full API documentation is available at: `http://localhost:5000/api/health`

All endpoints accept and return JSON data.

## 🎓 Educational Features

This project demonstrates:
- ✅ Blockchain data structure
- ✅ Proof-of-work consensus
- ✅ Cryptographic hashing
- ✅ Smart contracts
- ✅ REST API design
- ✅ React state management
- ✅ Secure authentication
- ✅ Anonymous voting systems

Enjoy exploring blockchain technology! 🚀
