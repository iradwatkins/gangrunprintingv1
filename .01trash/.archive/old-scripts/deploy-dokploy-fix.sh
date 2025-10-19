#!/bin/bash

# Dokploy Authentication Fix Deployment Script
# This script helps deploy the authentication fixes to Dokploy

echo "=================================================="
echo "🚀 GangRun Printing - Authentication Fix Deployment"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found!${NC}"
    echo "Please run this script from the GangRun Printing project root."
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo ""
echo "1. Have you updated Dokploy environment variables?"
echo "   Required variables:"
echo "   - AUTH_SECRET"
echo "   - NEXTAUTH_SECRET (same value as AUTH_SECRET)"
echo "   - AUTH_GOOGLE_ID"
echo "   - AUTH_GOOGLE_SECRET"
echo "   - NEXTAUTH_URL=https://gangrunprinting.com"
echo "   - NEXT_PUBLIC_APP_URL=https://gangrunprinting.com"
echo "   - AUTH_TRUST_HOST=true"
echo ""
echo "2. Have you updated Google OAuth redirect URIs?"
echo "   Required URIs:"
echo "   - https://gangrunprinting.com/api/auth/callback/google"
echo "   - https://www.gangrunprinting.com/api/auth/callback/google"
echo ""
read -p "Have you completed the checklist above? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please complete the checklist before proceeding.${NC}"
    echo ""
    echo "📝 Instructions:"
    echo "1. Go to Dokploy UI"
    echo "2. Navigate to your GangRun Printing application"
    echo "3. Update Environment Variables (copy from DOKPLOY-ENV-VARS.txt)"
    echo "4. Update Google OAuth at https://console.cloud.google.com/apis/credentials"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
echo ""

# Git operations
echo -e "${YELLOW}📦 Preparing code for deployment...${NC}"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "Found uncommitted changes. Committing..."
    git add -A
    git commit -m "Fix: Authentication configuration for production

- Added NEXTAUTH_SECRET to docker-compose.yml
- Enhanced error handling in auth.ts
- Improved middleware secret handling
- Added production validation script

This fixes the recurring Google OAuth login error."
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo "No uncommitted changes found."
fi

# Push to remote
echo ""
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Code pushed to repository${NC}"

echo ""
echo "=================================================="
echo -e "${GREEN}🎯 DEPLOYMENT INSTRUCTIONS FOR DOKPLOY${NC}"
echo "=================================================="
echo ""
echo "Now follow these steps in Dokploy:"
echo ""
echo "1. Go to Dokploy UI (https://your-server:3000)"
echo ""
echo "2. Navigate to GangRun Printing application"
echo ""
echo "3. Click 'Deploy' or 'Rebuild'"
echo ""
echo "4. Select these options:"
echo "   - Build Type: Git Repository"
echo "   - Branch: main"
echo "   - ✅ No Cache (Force rebuild)"
echo ""
echo "5. Click 'Deploy' and wait for completion"
echo ""
echo "6. After deployment, SSH to server and run validation:"
echo "   ssh root@72.60.28.175"
echo "   cd /opt/gangrunprinting"
echo "   docker exec gangrunprinting-app node validate-auth-production.js"
echo ""
echo "=================================================="
echo -e "${YELLOW}📝 POST-DEPLOYMENT VERIFICATION${NC}"
echo "=================================================="
echo ""
echo "1. Clear browser cache completely"
echo "2. Visit https://gangrunprinting.com/auth/signin"
echo "3. Click 'Sign in with Google'"
echo "4. Should redirect to Google and back successfully"
echo ""
echo "If authentication still fails:"
echo "1. Check logs: docker logs gangrunprinting-app --tail 100"
echo "2. Verify env vars: docker exec gangrunprinting-app env | grep AUTH"
echo "3. Run validation: docker exec gangrunprinting-app node validate-auth-production.js"
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Script completed successfully!${NC}"
echo "=================================================="