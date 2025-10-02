#!/bin/bash

echo "🔄 FORCE DEPLOYMENT OF REACT HOOKS FIX"
echo "======================================"

# 1. Stop all processes
echo "1. Stopping all related processes..."
pm2 delete gangrunprinting 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "PORT=3002" 2>/dev/null || true
pkill -f "gangrunprinting" 2>/dev/null || true

# 2. Wait for processes to die
echo "2. Waiting for processes to terminate..."
sleep 3

# 3. Clear any port locks
echo "3. Clearing port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
sleep 2

# 4. Clear Next.js cache
echo "4. Clearing Next.js cache..."
rm -rf .next/cache 2>/dev/null || true

# 5. Rebuild application
echo "5. Rebuilding application..."
npm run build

# 6. Start fresh
echo "6. Starting fresh PM2 instance..."
pm2 start ecosystem.config.js

# 7. Wait and check status
echo "7. Waiting for startup..."
sleep 10
pm2 status

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "🌐 Test at: https://gangrunprinting.com/products/professional-business-flyers-1759173065305"