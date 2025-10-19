#!/bin/bash
#
# GangRun Printing - Simple Deployment Script  
# Usage: ./deploy.sh
#

set -e  # Exit on error

echo "========================================"
echo "  GangRun Printing Deployment"
echo "========================================"
echo ""

# Step 1: Kill any existing build processes
echo "[1/6] Killing existing build processes..."
killall -9 docker-compose 2>/dev/null || true
sleep 2

# Step 2: Stop and remove app container
echo "[2/6] Stopping app container..."
docker-compose stop app 2>/dev/null || true
docker-compose rm -f app 2>/dev/null || true

# Step 3: Build fresh (no cache)
echo "[3/6] Building fresh image (this may take 2-3 minutes)..."
docker-compose build --no-cache app

# Step 4: Start all containers
echo "[4/6] Starting containers..."
docker-compose up -d

# Step 5: Wait for health check
echo "[5/6] Waiting for application to be healthy..."
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker ps | grep gangrunprinting_app | grep -q healthy; then
        echo "✓ Application is healthy!"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo "  Waiting... ($ELAPSED/$TIMEOUT seconds)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "⚠ Warning: Health check timeout. Showing logs..."
    docker logs --tail=20 gangrunprinting_app
    exit 1
fi

# Step 6: Show status
echo "[6/6] Deployment complete!"
echo ""
echo "Status:"
docker ps --filter "name=gangrunprinting" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "✅ Deployment successful!"
echo "   Site: http://gangrunprinting.com (port 3020)"
echo ""
echo "View logs: docker logs -f gangrunprinting_app"
