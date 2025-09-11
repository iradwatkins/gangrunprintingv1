#!/bin/bash

# GangrunPrinting VPS Setup Script - Fresh Install
# Run this on a clean Ubuntu VPS to set up the entire infrastructure

set -e

echo "================================================"
echo "GangrunPrinting VPS Setup - Fresh Installation"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root${NC}"
   exit 1
fi

# Update system
echo -e "${BLUE}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl git wget net-tools

# Install Docker
echo -e "${BLUE}Step 2: Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
echo -e "${BLUE}Step 3: Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Create directory structure
echo -e "${BLUE}Step 4: Creating directory structure...${NC}"
mkdir -p /opt/{proxy,database,sites/gangrunprinting}

# Create Docker network
echo -e "${BLUE}Step 5: Creating Docker network...${NC}"
docker network create --driver bridge --subnet=172.30.0.0/16 web_network

# Setup PostgreSQL and Redis
echo -e "${BLUE}Step 6: Setting up database services...${NC}"
cat > /opt/database/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  web_network:
    external: true

services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: iradwatkins
      POSTGRES_PASSWORD: Iw2006js!
      POSTGRES_DB: gangrun_db
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    networks:
      web_network:
        ipv4_address: 172.30.0.10
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U iradwatkins"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    restart: unless-stopped
    ports:
      - '6379:6379'
    networks:
      web_network:
        ipv4_address: 172.30.0.11
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
EOF

# Setup Caddy proxy
echo -e "${BLUE}Step 7: Setting up Caddy proxy...${NC}"
cat > /opt/proxy/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  web_network:
    external: true

services:
  caddy:
    image: caddy:2-alpine
    container_name: caddy_proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data:/data
      - ./config:/config
    networks:
      web_network:
        ipv4_address: 172.30.0.5
    environment:
      - CADDY_ADMIN=0.0.0.0:2019
EOF

# Create Caddyfile
cat > /opt/proxy/Caddyfile << 'EOF'
# Caddyfile for GangrunPrinting.com

gangrunprinting.com {
    reverse_proxy 172.30.0.21:3000 {
        header_up Host {http.request.host}
        header_up X-Real-IP {http.request.remote}
        header_up X-Forwarded-For {http.request.remote}
        header_up X-Forwarded-Proto {http.request.scheme}
    }
}

www.gangrunprinting.com {
    redir https://gangrunprinting.com{uri} permanent
}
EOF

# Setup GangrunPrinting application
echo -e "${BLUE}Step 8: Setting up GangrunPrinting application...${NC}"
cat > /opt/sites/gangrunprinting/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  web_network:
    external: true

services:
  app:
    image: gangrunprinting:latest
    container_name: gangrunprinting_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://iradwatkins:Iw2006js!@172.30.0.10:5432/gangrun_db
      - REDIS_URL=redis://172.30.0.11:6379
      - NEXTAUTH_URL=https://gangrunprinting.com
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
    networks:
      web_network:
        ipv4_address: 172.30.0.21
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
EOF

# Create environment template
cat > /opt/sites/gangrunprinting/.env.example << 'EOF'
# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Square Payment Processing
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=
SQUARE_APPLICATION_ID=
SQUARE_WEBHOOK_SIGNATURE=

# Cloudflare R2 Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=gangrunprinting-files
R2_PUBLIC_URL=https://files.gangrunprinting.com

# Email (SendGrid)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@gangrunprinting.com
EMAIL_SUPPORT=support@gangrunprinting.com
EOF

# Clone the repository
echo -e "${BLUE}Step 9: Cloning GangrunPrinting repository...${NC}"
cd /opt/sites/gangrunprinting
git clone https://github.com/iradwatkins/gangrunprinting.git app
cd app

# Build Docker image
echo -e "${BLUE}Step 10: Building Docker image...${NC}"
docker build -t gangrunprinting:latest .

# Start database services
echo -e "${BLUE}Step 11: Starting database services...${NC}"
cd /opt/database
docker-compose up -d
sleep 10

# Start Caddy proxy
echo -e "${BLUE}Step 12: Starting Caddy proxy...${NC}"
cd /opt/proxy
docker-compose up -d

# Final instructions
echo -e "${GREEN}================================================"
echo "VPS Setup Complete!"
echo "================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy your .env file to /opt/sites/gangrunprinting/.env"
echo "2. Add your Square API credentials"
echo "3. Configure Cloudflare R2 credentials"
echo "4. Start the application:"
echo "   cd /opt/sites/gangrunprinting"
echo "   docker-compose up -d"
echo ""
echo "5. Update your DNS to point to this server's IP"
echo ""
echo "Current services status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"