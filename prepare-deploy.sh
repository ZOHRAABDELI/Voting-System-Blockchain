#!/bin/bash

# Deployment preparation script
# This script prepares your project for deployment

echo "🚀 Preparing Blockchain Voting System for Deployment"
echo "===================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "${YELLOW}Step 1: Checking Backend Dependencies${NC}"
echo "---------------------------------------"
if [ -f "requirements.txt" ] && grep -q "gunicorn" requirements.txt; then
    echo "✓ gunicorn found in requirements.txt"
else
    echo "⚠ Adding gunicorn to requirements.txt"
    echo "gunicorn==21.2.0" >> requirements.txt
fi

echo ""
echo "${YELLOW}Step 2: Checking Deployment Files${NC}"
echo "-----------------------------------"
files=("render.yaml" "gunicorn_config.py" "frontend/vercel.json" "frontend/.env.production" "frontend/netlify.toml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "⚠ $file missing (should be created)"
    fi
done

echo ""
echo "${YELLOW}Step 3: Testing Backend Locally${NC}"
echo "---------------------------------"
echo "Testing if Flask app starts..."
timeout 2 python app.py > /dev/null 2>&1 &
PID=$!
sleep 1
if ps -p $PID > /dev/null; then
    echo "✓ Flask app starts successfully"
    kill $PID 2>/dev/null
else
    echo "⚠ Flask app may have issues starting"
fi

echo ""
echo "${YELLOW}Step 4: Checking Frontend${NC}"
echo "--------------------------"
cd frontend
if [ -f "package.json" ]; then
    echo "✓ package.json found"
    if [ -d "node_modules" ]; then
        echo "✓ node_modules installed"
    else
        echo "⚠ node_modules not found - run 'npm install' in frontend/"
    fi
else
    echo "❌ package.json not found in frontend/"
fi
cd ..

echo ""
echo "${YELLOW}Step 5: Git Status${NC}"
echo "-------------------"
if [ -d ".git" ]; then
    echo "✓ Git repository initialized"
    
    # Check for uncommitted changes
    if git diff-index --quiet HEAD --; then
        echo "✓ No uncommitted changes"
    else
        echo "⚠ You have uncommitted changes. Commit before deploying:"
        echo "  git add ."
        echo "  git commit -m 'Prepare for deployment'"
        echo "  git push origin main"
    fi
else
    echo "❌ Not a git repository. Initialize with:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
fi

echo ""
echo "${GREEN}===================================================="
echo "Deployment Checklist:"
echo "===================================================="
echo ""
echo "Backend (Render.com):"
echo "  1. ✓ Push code to GitHub"
echo "  2. → Go to https://render.com"
echo "  3. → Create New Web Service"
echo "  4. → Connect your GitHub repository"
echo "  5. → Use these settings:"
echo "       - Build Command: pip install -r requirements.txt"
echo "       - Start Command: gunicorn -c gunicorn_config.py app:app"
echo "       - Add Disk: /opt/render/project/src/data (1GB)"
echo "  6. → Deploy!"
echo ""
echo "Frontend (Vercel):"
echo "  1. → Update frontend/.env.production with your Render URL"
echo "  2. → Go to https://vercel.com"
echo "  3. → Import your GitHub repository"
echo "  4. → Set Root Directory: frontend"
echo "  5. → Add Environment Variable:"
echo "       REACT_APP_API_URL=https://your-app.onrender.com/api"
echo "  6. → Deploy!"
echo ""
echo "📖 Full guide: See DEPLOYMENT.md"
echo "${NC}"
