#!/bin/bash
echo ""
echo "======================================================"
echo "  CloudKitchen Pro — Multi-Cloud Kitchen Platform"
echo "  AI/ML | 5 Roles | 9 Modules | Real-Time WebSockets"
echo "======================================================"
echo ""

# Check Python
echo "[1/4] Checking Python..."
if ! command -v python3 &>/dev/null; then
    echo "ERROR: python3 not found. Install Python 3.8+"
    exit 1
fi
python3 --version

# Install deps
echo "[2/4] Installing dependencies..."
pip3 install flask flask-sqlalchemy flask-bcrypt flask-login flask-socketio eventlet --quiet

echo "[3/4] Starting server..."
echo ""
echo "  URL: http://localhost:5000"
echo ""
echo "  DEMO ACCOUNTS:"
echo "  admin@cloudkitchen.com       / Admin@123      (Super Admin)"
echo "  kitchen1@cloudkitchen.com    / Kitchen@123    (Kitchen Manager)"
echo "  chef1@cloudkitchen.com       / Chef@123       (Chef)"
echo "  delivery1@cloudkitchen.com   / Delivery@123   (Delivery Agent)"
echo "  customer1@cloudkitchen.com   / Customer@123   (Customer)"
echo ""
echo "======================================================"

# Open browser on Mac
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open http://localhost:5000) &
fi

python3 app.py
