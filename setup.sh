#!/bin/bash

echo "======================================"
echo "  Blockchain Voting System Setup"
echo "======================================"
echo ""

# Check Python installation
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
echo "Python $(python3 --version) found"
echo ""

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi
echo "Node.js $(node --version) found"
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo "  1. Backend:  python app.py"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "Or use the start script:"
echo "  chmod +x start.sh"
echo "  ./start.sh"
echo ""
