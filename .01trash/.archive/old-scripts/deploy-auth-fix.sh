#!/bin/bash

# NextAuth v5 Google OAuth Fix Deployment Script
# This script deploys the authentication fix to production

echo "🔐 NextAuth v5 Google OAuth Fix Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This script will deploy the Google OAuth authentication fix${NC}"
echo ""

# Server details
SERVER="72.60.28.175"
SSH_USER="root"

echo -e "${GREEN}Step 1: Connecting to server and deploying...${NC}"
echo ""

# Create remote deployment script
ssh $SSH_USER@$SERVER << 'ENDSSH'
#!/bin/bash

echo "📦 Deploying authentication fix on server..."

# Navigate to project directory
cd /opt/gangrunprinting || { echo "Error: Project directory not found"; exit 1; }

# Pull latest changes
echo "🔄 Pulling latest code..."
git pull origin main

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Clean build cache
echo "🧹 Cleaning Docker cache..."
docker system prune -f
docker builder prune -f

# Rebuild with no cache
echo "🔨 Rebuilding application (no cache)..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for application to start
echo "⏳ Waiting for application to start (30 seconds)..."
sleep 30

# Check if container is running
if docker ps | grep -q gangrunprinting-app; then
    echo "✅ Container is running"
    
    # Check environment variables
    echo ""
    echo "🔍 Checking environment variables..."
    docker exec gangrunprinting-app env | grep -E "AUTH_SECRET|NEXTAUTH|GOOGLE" | head -10
    
    # Test auth endpoint
    echo ""
    echo "🔍 Testing auth endpoint..."
    curl -s https://gangrunprinting.com/api/auth/providers | grep -o '"google"' && echo "✅ Google provider configured" || echo "❌ Google provider not found"
    
    # Check logs for errors
    echo ""
    echo "📋 Recent auth-related logs:"
    docker logs gangrunprinting-app --tail 20 | grep -i "auth\|google\|oauth" || echo "No auth-related logs found"
else
    echo "❌ Container failed to start"
    echo "📋 Container logs:"
    docker logs gangrunprinting-app --tail 50
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update Google Cloud Console redirect URIs (if not done)"
echo "2. Clear your browser cache completely"
echo "3. Test login at https://gangrunprinting.com/auth/signin"

ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment script executed!${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Google Cloud Console Configuration${NC}"
echo "=========================================="
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Edit OAuth Client: 180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com"
echo ""
echo "Required Redirect URIs:"
echo "  • https://gangrunprinting.com/api/auth/callback/google"
echo "  • https://www.gangrunprinting.com/api/auth/callback/google"
echo ""
echo "Required JavaScript Origins:"
echo "  • https://gangrunprinting.com"
echo "  • https://www.gangrunprinting.com"
echo ""
echo -e "${YELLOW}Remember to:${NC}"
echo "  • Clear browser cache (Ctrl+Shift+Delete)"
echo "  • Wait 5-10 minutes for Google changes to propagate"
echo "  • Test at https://gangrunprinting.com/auth/signin"