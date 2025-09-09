#!/bin/bash

# GangRun Printing Production Setup Script
# This script helps configure the application for production deployment

echo "================================================"
echo "    GangRun Printing - Production Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate a secure random string
generate_secret() {
    openssl rand -base64 32
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists. Creating backup...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backup created${NC}"
fi

echo ""
echo "================================================"
echo "    Step 1: Square Payment Configuration"
echo "================================================"
echo ""
echo "To get your Square credentials:"
echo "1. Go to https://developer.squareup.com/apps"
echo "2. Select your application (or create one)"
echo "3. Navigate to 'Credentials' tab"
echo ""

read -p "Enter your Square Access Token: " SQUARE_ACCESS_TOKEN
read -p "Enter your Square Location ID: " SQUARE_LOCATION_ID
read -p "Enter your Square Application ID: " SQUARE_APPLICATION_ID
read -p "Environment (sandbox/production): " SQUARE_ENVIRONMENT

# Update .env file with Square credentials
sed -i.bak "s|SQUARE_ACCESS_TOKEN=.*|SQUARE_ACCESS_TOKEN=$SQUARE_ACCESS_TOKEN|" .env
sed -i.bak "s|SQUARE_LOCATION_ID=.*|SQUARE_LOCATION_ID=$SQUARE_LOCATION_ID|" .env
sed -i.bak "s|SQUARE_APPLICATION_ID=.*|SQUARE_APPLICATION_ID=$SQUARE_APPLICATION_ID|" .env
sed -i.bak "s|SQUARE_ENVIRONMENT=.*|SQUARE_ENVIRONMENT=$SQUARE_ENVIRONMENT|" .env

echo -e "${GREEN}✓ Square configuration updated${NC}"

echo ""
echo "================================================"
echo "    Step 2: SendGrid Email Configuration"
echo "================================================"
echo ""
echo "To get your SendGrid API key:"
echo "1. Go to https://app.sendgrid.com/settings/api_keys"
echo "2. Create a new API key with 'Mail Send' permissions"
echo ""

read -p "Enter your SendGrid API Key: " SENDGRID_API_KEY
read -p "Enter your From Email (e.g., orders@gangrunprinting.com): " SENDGRID_FROM_EMAIL
read -p "Enter your From Name (e.g., GangRun Printing): " SENDGRID_FROM_NAME

# Update .env file with SendGrid credentials
sed -i.bak "s|SENDGRID_API_KEY=.*|SENDGRID_API_KEY=$SENDGRID_API_KEY|" .env
sed -i.bak "s|SENDGRID_FROM_EMAIL=.*|SENDGRID_FROM_EMAIL=$SENDGRID_FROM_EMAIL|" .env
sed -i.bak "s|SENDGRID_FROM_NAME=.*|SENDGRID_FROM_NAME=$SENDGRID_FROM_NAME|" .env

echo -e "${GREEN}✓ SendGrid configuration updated${NC}"

echo ""
echo "================================================"
echo "    Step 3: Database Configuration"
echo "================================================"
echo ""
echo "Enter your PostgreSQL database URL"
echo "Format: postgresql://username:password@host:port/database"
echo ""

read -p "Enter your Database URL: " DATABASE_URL

# Update .env file with database URL
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env

echo -e "${GREEN}✓ Database configuration updated${NC}"

echo ""
echo "================================================"
echo "    Step 4: Authentication Secret"
echo "================================================"
echo ""

echo "Generating secure AUTH_SECRET..."
AUTH_SECRET=$(generate_secret)
sed -i.bak "s|AUTH_SECRET=.*|AUTH_SECRET=$AUTH_SECRET|" .env

echo -e "${GREEN}✓ AUTH_SECRET generated and saved${NC}"

echo ""
echo "================================================"
echo "    Step 5: N8N Webhook Configuration"
echo "================================================"
echo ""

read -p "Enter your N8N Webhook URL (e.g., https://n8n.agistaffers.com/webhook/gangrun): " N8N_WEBHOOK_URL
read -p "Enter your N8N API Key (optional, press Enter to skip): " N8N_API_KEY

# Update .env file with N8N configuration
sed -i.bak "s|N8N_WEBHOOK_URL=.*|N8N_WEBHOOK_URL=$N8N_WEBHOOK_URL|" .env
if [ ! -z "$N8N_API_KEY" ]; then
    sed -i.bak "s|N8N_API_KEY=.*|N8N_API_KEY=$N8N_API_KEY|" .env
fi

echo -e "${GREEN}✓ N8N configuration updated${NC}"

echo ""
echo "================================================"
echo "    Step 6: MinIO Configuration"
echo "================================================"
echo ""

read -p "MinIO Endpoint (default: 72.60.28.175): " MINIO_ENDPOINT
MINIO_ENDPOINT=${MINIO_ENDPOINT:-72.60.28.175}

read -p "MinIO Port (default: 9000): " MINIO_PORT
MINIO_PORT=${MINIO_PORT:-9000}

read -p "Use SSL for MinIO? (true/false, default: false): " MINIO_USE_SSL
MINIO_USE_SSL=${MINIO_USE_SSL:-false}

read -p "MinIO Access Key: " MINIO_ACCESS_KEY
read -p "MinIO Secret Key: " MINIO_SECRET_KEY

# Update .env file with MinIO configuration
sed -i.bak "s|MINIO_ENDPOINT=.*|MINIO_ENDPOINT=$MINIO_ENDPOINT|" .env
sed -i.bak "s|MINIO_PORT=.*|MINIO_PORT=$MINIO_PORT|" .env
sed -i.bak "s|MINIO_USE_SSL=.*|MINIO_USE_SSL=$MINIO_USE_SSL|" .env
sed -i.bak "s|MINIO_ACCESS_KEY=.*|MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY|" .env
sed -i.bak "s|MINIO_SECRET_KEY=.*|MINIO_SECRET_KEY=$MINIO_SECRET_KEY|" .env

echo -e "${GREEN}✓ MinIO configuration updated${NC}"

echo ""
echo "================================================"
echo "    Configuration Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Review your .env file to ensure all values are correct"
echo "2. Run database migrations: npm run prisma:migrate"
echo "3. Build the application: npm run build"
echo "4. Deploy to Dokploy"
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Backup of original .env saved with timestamp"