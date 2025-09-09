#!/bin/bash

# This script should be run ON THE SERVER after SSH
# SSH: ssh root@72.60.28.175
# Password: Bobby321&Gloria321Watkins?

echo "🚀 GangRun Printing - Server Deployment Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check Dokploy status
echo -e "${YELLOW}Step 1: Checking Dokploy status...${NC}"
docker ps | grep dokploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dokploy is running${NC}"
else
    echo -e "${RED}❌ Dokploy is not running. Starting it...${NC}"
    docker start dokploy
fi

# Step 2: Check for existing gangrun containers
echo -e "${YELLOW}Step 2: Checking for existing containers...${NC}"
docker ps -a | grep gangrun
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Found existing gangrun containers. Cleaning up...${NC}"
    docker stop $(docker ps -aq --filter name=gangrun) 2>/dev/null
    docker rm $(docker ps -aq --filter name=gangrun) 2>/dev/null
fi

# Step 3: Clone repository manually for testing
echo -e "${YELLOW}Step 3: Cloning latest code...${NC}"
cd /tmp
rm -rf gangrun-test
git clone https://github.com/iradwatkins/gangrunprinting.git gangrun-test
cd gangrun-test

# Step 4: Create .env file
echo -e "${YELLOW}Step 4: Creating environment file...${NC}"
cat > .env << 'EOF'
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@172.17.0.1:5432/gangrun_db
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NODE_ENV=production
AUTH_TRUST_HOST=true
ADMIN_EMAIL=iradwatkins@gmail.com

# Google OAuth - REPLACE THESE
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_SECRET

# Square
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g

# SendGrid
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
EOF

# Step 5: Build Docker image
echo -e "${YELLOW}Step 5: Building Docker image...${NC}"
docker build -t gangrunprinting:latest .

# Step 6: Create PostgreSQL database if not exists
echo -e "${YELLOW}Step 6: Setting up PostgreSQL...${NC}"
# Check if postgres container exists
if docker ps | grep -q postgres; then
    echo "PostgreSQL found. Creating database..."
    docker exec postgres psql -U postgres -c "CREATE DATABASE gangrun_db;" 2>/dev/null || echo "Database might already exist"
    docker exec postgres psql -U postgres -c "CREATE USER gangrun_user WITH PASSWORD 'GangRun2024Secure';" 2>/dev/null || echo "User might already exist"
    docker exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE gangrun_db TO gangrun_user;" 2>/dev/null
else
    echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
    docker run -d \
        --name postgres \
        -e POSTGRES_USER=gangrun_user \
        -e POSTGRES_PASSWORD=GangRun2024Secure \
        -e POSTGRES_DB=gangrun_db \
        -p 5432:5432 \
        postgres:15-alpine
    sleep 5
fi

# Step 7: Run the application
echo -e "${YELLOW}Step 7: Starting application...${NC}"
docker run -d \
    --name gangrunprinting \
    -p 3000:3000 \
    --env-file .env \
    --restart unless-stopped \
    gangrunprinting:latest

# Step 8: Wait for app to start
echo -e "${YELLOW}Step 8: Waiting for application to start...${NC}"
sleep 10

# Step 9: Run migrations
echo -e "${YELLOW}Step 9: Running database migrations...${NC}"
docker exec gangrunprinting npx prisma migrate deploy

# Step 10: Seed database
echo -e "${YELLOW}Step 10: Seeding database...${NC}"
docker exec gangrunprinting npx tsx scripts/seed-all-data.ts

# Step 11: Configure Traefik routing
echo -e "${YELLOW}Step 11: Configuring Traefik routing...${NC}"
cat > /tmp/gangrun-traefik.yml << 'EOF'
http:
  routers:
    gangrunprinting:
      rule: "Host(`gangrunprinting.com`) || Host(`www.gangrunprinting.com`)"
      service: gangrunprinting
      tls:
        certResolver: letsencrypt
      middlewares:
        - redirect-www
  services:
    gangrunprinting:
      loadBalancer:
        servers:
          - url: "http://gangrunprinting:3000"
  middlewares:
    redirect-www:
      redirectRegex:
        regex: "^https://www\\.(.*)"
        replacement: "https://$${1}"
        permanent: true
EOF

# Copy to Traefik config directory if it exists
if [ -d "/etc/traefik/dynamic" ]; then
    cp /tmp/gangrun-traefik.yml /etc/traefik/dynamic/gangrun.yml
    echo -e "${GREEN}✅ Traefik configuration updated${NC}"
fi

# Step 12: Check deployment
echo -e "${YELLOW}Step 12: Checking deployment status...${NC}"
docker ps | grep gangrunprinting
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application is running!${NC}"
    echo ""
    echo "Test locally:"
    echo "  curl http://localhost:3000"
    echo ""
    echo "Test domain:"
    echo "  https://gangrunprinting.com"
else
    echo -e "${RED}❌ Application failed to start. Checking logs...${NC}"
    docker logs gangrunprinting --tail 50
fi

echo ""
echo -e "${GREEN}Deployment script complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit https://gangrunprinting.com"
echo "2. Login with iradwatkins@gmail.com"
echo "3. Should redirect to /admin/dashboard"