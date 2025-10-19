#!/bin/bash

# GangRun Printing - Server Deployment Helper Script
# Run this on your LOCAL machine to help deploy via SSH

echo "🚀 GangRun Printing - Dokploy Deployment Helper"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Server details
SERVER="72.60.28.175"
USER="root"

echo -e "${YELLOW}This script will help you deploy to Dokploy via SSH${NC}"
echo ""

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
AUTH_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}Generated secure credentials:${NC}"
echo "Database Password: $DB_PASSWORD"
echo "Auth Secret: $AUTH_SECRET"
echo ""

# Create environment file content
cat > /tmp/gangrun.env << EOF
# Production Environment Variables for Dokploy
DATABASE_URL=postgresql://gangrun_user:${DB_PASSWORD}@gangrun-postgres:5432/gangrun_db
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_URL=https://gangrunprinting.com
ADMIN_EMAIL=iradwatkins@gmail.com
NODE_ENV=production
AUTH_TRUST_HOST=true

# Add your Google OAuth credentials here:
AUTH_GOOGLE_ID=YOUR_GOOGLE_OAUTH_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_OAUTH_SECRET

# Optional services (add later if needed):
# SENDGRID_API_KEY=
# SQUARE_ACCESS_TOKEN=
# MINIO_ENDPOINT=minio
# MINIO_PORT=9000
EOF

echo -e "${BLUE}Step 1: SSH into the server${NC}"
echo "Run this command:"
echo -e "${GREEN}ssh ${USER}@${SERVER}${NC}"
echo ""
echo "Password: Bobby321&Gloria321Watkins?"
echo ""

echo -e "${BLUE}Step 2: Check Dokploy containers${NC}"
echo "Once logged in, run these commands:"
echo ""
cat << 'COMMANDS'
# Check if Dokploy is running
docker ps | grep dokploy

# Check existing containers
docker ps -a | grep gangrun

# If you see old gangrun containers, remove them:
docker stop $(docker ps -aq --filter name=gangrun) 2>/dev/null
docker rm $(docker ps -aq --filter name=gangrun) 2>/dev/null

# Check Dokploy logs
docker logs dokploy 2>&1 | tail -20
COMMANDS

echo ""
echo -e "${BLUE}Step 3: Access Dokploy Web UI${NC}"
echo "Open browser: http://72.60.28.175:3000"
echo ""

echo -e "${BLUE}Step 4: In Dokploy, create the application:${NC}"
echo ""
echo "PROJECT: gangrunprinting"
echo "APPLICATION NAME: gangrunprinting-app"
echo ""
echo "REPOSITORY SETTINGS:"
echo "  Repository: https://github.com/iradwatkins/gangrunprinting.git"
echo "  Branch: main"
echo "  Build Command: npm ci && npm run build"
echo "  Start Command: npm start"
echo "  Port: 3000"
echo ""

echo -e "${BLUE}Step 5: Create PostgreSQL Service in Dokploy:${NC}"
echo ""
echo "SERVICE NAME: gangrun-postgres"
echo "Database: gangrun_db"
echo "Username: gangrun_user"
echo "Password: ${DB_PASSWORD}"
echo ""

echo -e "${BLUE}Step 6: Add Environment Variables in Dokploy:${NC}"
echo ""
echo "Copy this block to Environment Variables:"
echo "----------------------------------------"
cat /tmp/gangrun.env
echo "----------------------------------------"
echo ""

echo -e "${BLUE}Step 7: Configure Domain in Dokploy:${NC}"
echo ""
echo "Domain: gangrunprinting.com"
echo "SSL: Enable (Let's Encrypt)"
echo ""

echo -e "${BLUE}Step 8: Deploy the Application:${NC}"
echo ""
echo "Click the 'Deploy' button in Dokploy"
echo ""

echo -e "${BLUE}Step 9: After deployment, initialize database:${NC}"
echo ""
echo "In Dokploy terminal for the app, run:"
echo "npx prisma migrate deploy"
echo "npx tsx scripts/seed-all-data.ts"
echo ""

echo -e "${YELLOW}Environment variables saved to: /tmp/gangrun.env${NC}"
echo -e "${YELLOW}Keep this file for reference!${NC}"
echo ""

echo -e "${GREEN}Ready to deploy! Follow the steps above.${NC}"