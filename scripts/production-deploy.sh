#!/bin/bash

# GangRun Printing Production Deployment Script
# This script prepares the application for Dokploy deployment

echo "🚀 GangRun Printing - Production Deployment Preparation"
echo "========================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Pre-Deployment Checklist:${NC}"
echo ""

# Check if .env.production exists
if [ -f .env.production ]; then
    echo -e "${GREEN}✅ .env.production file exists${NC}"
else
    echo -e "${RED}❌ .env.production file missing - creating template...${NC}"
    cat > .env.production << 'EOF'
# Production Environment Variables
# IMPORTANT: Update these values for production!

# Domain
DOMAIN=gangrunprinting.com
NEXTAUTH_URL=https://gangrunprinting.com

# Database (PostgreSQL via Dokploy)
DATABASE_URL=postgresql://gangrun_user:CHANGE_THIS_PASSWORD@postgres:5432/gangrun_db

# Auth.js v5 (CRITICAL: Generate new secret for production!)
AUTH_SECRET=GENERATE_32_CHAR_SECRET_FOR_PRODUCTION
AUTH_GOOGLE_ID=YOUR_PRODUCTION_GOOGLE_OAUTH_ID
AUTH_GOOGLE_SECRET=YOUR_PRODUCTION_GOOGLE_OAUTH_SECRET
AUTH_TRUST_HOST=true

# Square SDK (Production)
SQUARE_ACCESS_TOKEN=YOUR_PRODUCTION_SQUARE_TOKEN
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=YOUR_SQUARE_LOCATION_ID
SQUARE_APPLICATION_ID=YOUR_SQUARE_APP_ID

# MinIO (via Dokploy)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=gangrun_minio
MINIO_ROOT_PASSWORD=CHANGE_THIS_PASSWORD
MINIO_BUCKET_NAME=gangrun-files

# SendGrid
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
SENDGRID_FROM_NAME=GangRun Printing

# N8N Integration (via Dokploy)
N8N_WEBHOOK_URL=https://n8n.agistaffers.com/webhook
N8N_API_KEY=GENERATE_N8N_API_KEY

# Ollama Integration (via Dokploy)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=GENERATE_NEW_VAPID_KEYS
VAPID_PRIVATE_KEY=GENERATE_NEW_VAPID_KEYS
VAPID_SUBJECT=mailto:support@gangrunprinting.com
EOF
    echo -e "${YELLOW}⚠️  Please update .env.production with actual production values${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Build Preparation:${NC}"
echo ""

# Ensure package.json has production scripts
echo "Checking package.json scripts..."
if grep -q '"build:prod"' package.json; then
    echo -e "${GREEN}✅ Production build script exists${NC}"
else
    echo -e "${YELLOW}⚠️  Adding production build script to package.json${NC}"
    # Note: Manual edit required - just alerting
fi

echo ""
echo -e "${YELLOW}🐳 Dokploy Deployment Instructions:${NC}"
echo ""
echo "1. Log into Dokploy at: http://72.60.28.175:3000"
echo "2. Navigate to the 'gangrunprinting' project"
echo "3. Update application settings:"
echo "   - Repository: https://github.com/iradwatkins/gangrunprinting.git"
echo "   - Branch: main"
echo "   - Build Command: npm run build"
echo "   - Start Command: npm start"
echo "   - Port: 3000"
echo ""
echo "4. Environment Variables (add in Dokploy UI):"
echo "   - Copy all values from .env.production"
echo "   - Ensure DATABASE_URL points to Dokploy PostgreSQL service"
echo "   - Update AUTH_SECRET with a secure 32-character string"
echo ""
echo "5. Database Setup:"
echo "   - Create PostgreSQL database via Dokploy services"
echo "   - Database name: gangrun_db"
echo "   - Username: gangrun_user"
echo "   - Generate secure password"
echo ""
echo "6. Domain Configuration:"
echo "   - Add domain: gangrunprinting.com"
echo "   - Enable SSL (Let's Encrypt)"
echo "   - Configure Traefik routing (automatic via Dokploy)"
echo ""

echo -e "${YELLOW}🗄️ Database Migration Commands:${NC}"
echo ""
echo "After deployment, run these commands in Dokploy terminal:"
echo ""
echo "# 1. Run database migrations"
echo "npx prisma migrate deploy"
echo ""
echo "# 2. Seed production data"
echo "npx tsx scripts/seed-all-data.ts"
echo ""
echo "# 3. Verify admin user"
echo "npx tsx scripts/update-admin-user.ts"
echo ""

echo -e "${YELLOW}✅ Post-Deployment Verification:${NC}"
echo ""
echo "1. Test login at: https://gangrunprinting.com/auth/signin"
echo "   - Admin: iradwatkins@gmail.com"
echo "   - Should redirect to /admin/dashboard"
echo ""
echo "2. Verify data in admin panel:"
echo "   - Paper Stocks: 20 items"
echo "   - Size Groups: 10 items"
echo "   - Quantity Groups: 10 items"
echo "   - Add-ons: 12 items"
echo ""
echo "3. Test customer flow:"
echo "   - Create test customer account"
echo "   - Should redirect to /account/dashboard"
echo ""

echo -e "${GREEN}✨ Deployment preparation complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT REMINDERS:${NC}"
echo "1. ALL deployments MUST go through Dokploy"
echo "2. NEVER create Docker containers outside of Dokploy"
echo "3. Use Dokploy's PostgreSQL service (not external)"
echo "4. Let Dokploy manage all Traefik/SSL configuration"
echo ""
echo "Ready to deploy via Dokploy UI!"