#!/bin/bash

###############################################################################
# Solidity Contract Compilation and Deployment Script
# 
# This script automates the process of:
# 1. Installing dependencies (Hardhat, Web3 libraries)
# 2. Compiling Solidity contracts
# 3. Generating bytecode and ABI
# 4. Optionally deploying to local or test network
###############################################################################

set -e  # Exit on error

echo "========================================="
echo "  Blockchain Voting System Setup"
echo "  Solidity Contract Compilation"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to solidity directory
cd "$(dirname "$0")"
SOLIDITY_DIR="$(pwd)/contracts/solidity"

echo -e "${BLUE}📁 Working directory: $SOLIDITY_DIR${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "$SOLIDITY_DIR/node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    cd "$SOLIDITY_DIR"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    echo ""
fi

cd "$SOLIDITY_DIR"

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
npx hardhat clean
echo ""

# Compile contracts
echo -e "${BLUE}🔨 Compiling Solidity contracts...${NC}"
npx hardhat compile
echo ""

# Run compilation info script
echo -e "${BLUE}📊 Generating compilation report...${NC}"
node scripts/compile-info.js
echo ""

# Check if deployment is requested
if [ "$1" == "--deploy" ]; then
    echo -e "${YELLOW}🚀 Deployment mode selected${NC}"
    echo ""
    
    if [ "$2" == "localhost" ]; then
        echo -e "${BLUE}📡 Deploying to local Hardhat network...${NC}"
        echo -e "${YELLOW}⚠️  Make sure Hardhat node is running: npx hardhat node${NC}"
        read -p "Press Enter to continue..."
        npx hardhat run scripts/deploy.js --network localhost
    elif [ "$2" == "sepolia" ]; then
        echo -e "${BLUE}📡 Deploying to Sepolia testnet...${NC}"
        echo -e "${YELLOW}⚠️  Make sure .env file is configured with SEPOLIA_RPC_URL and PRIVATE_KEY${NC}"
        read -p "Press Enter to continue..."
        npx hardhat run scripts/deploy.js --network sepolia
    else
        echo -e "${YELLOW}ℹ️  To deploy, run:${NC}"
        echo "  Local:   ./setup-solidity.sh --deploy localhost"
        echo "  Sepolia: ./setup-solidity.sh --deploy sepolia"
    fi
else
    echo -e "${GREEN}✅ Compilation complete!${NC}"
    echo ""
    echo -e "${BLUE}📄 Generated files:${NC}"
    echo "  - Bytecode: artifacts/VotingSystem.sol/VotingSystem.json"
    echo "  - ABI: artifacts/VotingSystem.sol/VotingSystem.json"
    echo ""
    echo -e "${YELLOW}ℹ️  Next steps:${NC}"
    echo "  1. Start local blockchain: ${BLUE}cd contracts/solidity && npx hardhat node${NC}"
    echo "  2. Deploy contract: ${BLUE}./setup-solidity.sh --deploy localhost${NC}"
    echo "  3. Update Python backend with contract address and ABI"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "========================================="
