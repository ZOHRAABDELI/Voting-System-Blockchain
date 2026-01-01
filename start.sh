#!/bin/bash

echo "🚀 Starting Blockchain Voting System..."
echo ""

# Start backend
echo "📦 Starting Flask backend server..."
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ System started successfully!"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait
