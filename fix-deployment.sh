#!/bin/bash

# FIX DEPLOYMENT SCRIPT - Fixes Service Worker and Auth Issues
# Run this on the production server

echo "🔧 GANGRUN PRINTING - FIX DEPLOYMENT SCRIPT"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This script will fix the service worker and authentication issues${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${GREEN}Step 1: Pulling latest code from GitHub...${NC}"
cd /opt/gangrunprinting || { echo "Error: Project directory not found"; exit 1; }
git pull origin main

# Step 2: Stop current containers
echo -e "${GREEN}Step 2: Stopping current containers...${NC}"
docker-compose down

# Step 3: Clean Docker cache
echo -e "${GREEN}Step 3: Cleaning Docker build cache...${NC}"
docker system prune -f
docker builder prune -f

# Step 4: Rebuild with no cache
echo -e "${GREEN}Step 4: Rebuilding application (no cache)...${NC}"
docker-compose build --no-cache

# Step 5: Start containers
echo -e "${GREEN}Step 5: Starting containers...${NC}"
docker-compose up -d

# Step 6: Wait for app to be ready
echo -e "${GREEN}Step 6: Waiting for application to start...${NC}"
sleep 30

# Step 7: Check if service worker files exist
echo -e "${GREEN}Step 7: Checking service worker files...${NC}"
docker exec gangrunprinting-app ls -la /app/public/ | grep -E "(sw-offline|sw-push|sw\.js)" || echo "Warning: Some service worker files may be missing"

# Step 8: Run database migrations
echo -e "${GREEN}Step 8: Running database migrations...${NC}"
docker exec gangrunprinting-app npx prisma migrate deploy

# Step 9: Test health endpoint
echo -e "${GREEN}Step 9: Testing health endpoint...${NC}"
curl -s http://localhost:3000/api/health | grep healthy && echo -e "${GREEN}✅ Health check passed${NC}" || echo -e "${RED}❌ Health check failed${NC}"

# Step 10: Check logs for errors
echo -e "${GREEN}Step 10: Checking logs for errors...${NC}"
docker logs gangrunprinting-app --tail 20

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT FIX COMPLETE!${NC}"
echo ""
echo "Next steps:"
echo "1. Update Google OAuth redirect URIs (see GOOGLE-OAUTH-FIX.md)"
echo "2. Clear browser cache and cookies"
echo "3. Test at https://gangrunprinting.com"
echo ""
echo "If issues persist:"
echo "- Check docker logs: docker logs gangrunprinting-app --tail 50"
echo "- Verify files: docker exec gangrunprinting-app ls -la /app/public/"
echo "- Check environment: docker exec gangrunprinting-app env | grep AUTH"