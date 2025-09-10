#!/bin/bash

# AUTOMATED DEPLOYMENT SCRIPT FOR GANGRUN PRINTING
# This script deploys the application directly on the server

echo "🚀 GANGRUN PRINTING - AUTOMATED DEPLOYMENT"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Server details
SERVER="72.60.28.175"
SSH_USER="root"
SSH_PASS="Bobby321&Gloria321Watkins?"

echo -e "${YELLOW}This script will deploy GangRun Printing on the server${NC}"
echo ""

# Create remote deployment script
cat > /tmp/deploy-gangrun.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

echo "Starting deployment on server..."

# Stop and remove existing containers
echo "Cleaning up existing containers..."
docker stop gangrunprinting-app 2>/dev/null
docker rm gangrunprinting-app 2>/dev/null
docker stop postgres 2>/dev/null
docker rm postgres 2>/dev/null

# Create network if it doesn't exist
docker network create gangrun-network 2>/dev/null

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker run -d \
  --name postgres \
  --network gangrun-network \
  -e POSTGRES_USER=gangrun_user \
  -e POSTGRES_PASSWORD=GangRun2024Secure \
  -e POSTGRES_DB=gangrun_db \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:15-alpine

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
sleep 10

# Clone or update repository
echo "Getting latest code..."
cd /opt
rm -rf gangrunprinting
git clone https://github.com/iradwatkins/gangrunprinting.git
cd gangrunprinting

# Create .env file with production values
cat > .env << 'ENV_FILE'
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@postgres:5432/gangrun_db
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NEXT_PUBLIC_BASE_URL=https://gangrunprinting.com
AUTH_TRUST_HOST=true
ADMIN_EMAIL=iradwatkins@gmail.com
ADMIN_NAME=Ira Watkins
AUTH_GOOGLE_ID=180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
SENDGRID_FROM_NAME=GangRun Printing
TELEGRAM_BOT_TOKEN=7241850736:AAHqJYoWRzJdtFUclpdmosvVZN5C6DDbKL4
TELEGRAM_CHAT_ID=7154912264
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BIzmq1ShjRgxpW4XnHSh2IeXLK6_uLtNMAnnPNJNJ5Pj3DD7JRXFajvI7KZpoujH8J1ZE0Kl-Io5oa8rJRlCIlY
VAPID_PRIVATE_KEY=3e4BbIRQtOoayCLuW7zqWbXLqqxrHNM6pjc9jL8xvDk
VAPID_SUBJECT=mailto:support@gangrunprinting.com
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
TZ=America/Chicago
ENV_FILE

# Build and run with docker-compose
echo "Building and starting application..."
docker-compose up -d --build

# Wait for app to start
echo "Waiting for application to start..."
sleep 30

# Check if container is running
if docker ps | grep -q gangrunprinting-app; then
    echo "✅ Container is running"
    
    # Run database migrations
    echo "Running database migrations..."
    docker exec gangrunprinting-app npx prisma migrate deploy
    
    # Seed database
    echo "Seeding database..."
    docker exec gangrunprinting-app npx tsx scripts/seed-all-data.ts
    
    # Verify health
    echo "Checking health endpoint..."
    curl -s http://localhost:3000/api/health | grep healthy && echo "✅ Health check passed"
    
    # Configure Traefik routing (if needed)
    echo "Configuring Traefik routing..."
    cat > /etc/traefik/dynamic/gangrunprinting.yml << 'TRAEFIK'
http:
  routers:
    gangrunprinting:
      rule: "Host(\`gangrunprinting.com\`) || Host(\`www.gangrunprinting.com\`)"
      service: gangrunprinting
      tls:
        certResolver: letsencrypt
      entrypoints:
        - websecure
  services:
    gangrunprinting:
      loadBalancer:
        servers:
          - url: "http://gangrunprinting-app:3000"
TRAEFIK
    
    # Restart Traefik to apply changes
    docker restart traefik 2>/dev/null || echo "Traefik not found, skipping..."
    
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "Visit: https://gangrunprinting.com"
else
    echo "❌ Container failed to start"
    echo "Checking logs..."
    docker logs gangrunprinting-app --tail 50
fi
DEPLOY_SCRIPT

echo -e "${YELLOW}Deployment script created${NC}"
echo ""
echo "To deploy, run these commands:"
echo ""
echo -e "${GREEN}1. Copy script to server:${NC}"
echo "   scp /tmp/deploy-gangrun.sh root@72.60.28.175:/tmp/"
echo ""
echo -e "${GREEN}2. SSH to server:${NC}"
echo "   ssh root@72.60.28.175"
echo "   Password: Bobby321&Gloria321Watkins?"
echo ""
echo -e "${GREEN}3. Run deployment:${NC}"
echo "   bash /tmp/deploy-gangrun.sh"
echo ""
echo -e "${YELLOW}Or run this single command to deploy:${NC}"
echo ""
echo "sshpass -p 'Bobby321&Gloria321Watkins?' ssh -o StrictHostKeyChecking=no root@72.60.28.175 'bash -s' < /tmp/deploy-gangrun.sh"
echo ""
echo "Script saved to: /tmp/deploy-gangrun.sh"