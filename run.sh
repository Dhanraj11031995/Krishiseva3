#!/bin/bash
echo "🌾 Starting KrishiSeva v3..."
echo ""

# Check if backend deps installed
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

# Check if frontend deps installed
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo "Starting backend on port 5000..."
cd backend && node server.js &
BACKEND_PID=$!
sleep 2

echo "Starting frontend on port 3000..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo "  KrishiSeva v3 is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000/api"
echo ""
echo "  Demo: farmer1 / farmer123"
echo "  Admin: admin / admin123"
echo "  Register: http://localhost:3000/register"
echo "  Admin Setup: http://localhost:3000/admin-setup"
echo "======================================"

wait $BACKEND_PID $FRONTEND_PID
