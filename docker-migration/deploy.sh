#!/bin/bash

# GangrunPrinting Docker Migration Deployment Script
# This script deploys the new Docker containers outside of Dokploy

set -e

echo "========================================"
echo "GangrunPrinting Docker Migration Deploy"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root${NC}"
   exit 1
fi

# Base directory
BASE_DIR="/opt/docker-migration"

# Function to check port availability
check_port() {
    local port=$1
    if netstat -tulpn | grep -q ":$port "; then
        echo -e "${RED}Port $port is already in use!${NC}"
        return 1
    else
        echo -e "${GREEN}Port $port is available${NC}"
        return 0
    fi
}

# Function to check docker network
check_network() {
    if docker network ls | grep -q "new_web_network"; then
        echo -e "${YELLOW}Network new_web_network already exists${NC}"
    else
        echo "Creating new_web_network..."
        docker network create --driver bridge --subnet=172.30.0.0/16 new_web_network
        echo -e "${GREEN}Network created successfully${NC}"
    fi
}

# Main deployment
main() {
    echo ""
    echo "Step 1: Checking prerequisites..."
    echo "---------------------------------"
    
    # Check required ports
    echo "Checking port availability..."
    check_port 5433 || exit 1
    check_port 6380 || exit 1
    check_port 8080 || exit 1
    check_port 8443 || exit 1
    
    # Check/create network
    echo ""
    echo "Step 2: Setting up Docker network..."
    echo "------------------------------------"
    check_network
    
    # Deploy database containers
    echo ""
    echo "Step 3: Deploying database containers..."
    echo "----------------------------------------"
    cd $BASE_DIR/database
    
    if [ ! -f docker-compose.yml ]; then
        echo -e "${RED}docker-compose.yml not found in $BASE_DIR/database${NC}"
        exit 1
    fi
    
    docker-compose up -d
    echo "Waiting for databases to be ready..."
    sleep 10
    
    # Check database health
    docker exec new_postgres_db pg_isready -U iradwatkins && \
        echo -e "${GREEN}PostgreSQL is ready${NC}" || \
        echo -e "${YELLOW}PostgreSQL is starting...${NC}"
    
    docker exec new_redis_cache redis-cli ping && \
        echo -e "${GREEN}Redis is ready${NC}" || \
        echo -e "${YELLOW}Redis is starting...${NC}"
    
    # Deploy Caddy proxy
    echo ""
    echo "Step 4: Deploying Caddy proxy..."
    echo "---------------------------------"
    cd $BASE_DIR/proxy
    
    if [ ! -f docker-compose.yml ] || [ ! -f Caddyfile ]; then
        echo -e "${RED}Required files not found in $BASE_DIR/proxy${NC}"
        exit 1
    fi
    
    docker-compose up -d
    echo -e "${GREEN}Caddy proxy deployed${NC}"
    
    # Build and deploy application
    echo ""
    echo "Step 5: Building application image..."
    echo "-------------------------------------"
    cd /root/gangrunprinting-platform
    
    # Pull latest code
    git pull origin main
    
    # Build Docker image
    docker build -t gangrunprinting:new .
    echo -e "${GREEN}Application image built${NC}"
    
    # Deploy application
    echo ""
    echo "Step 6: Deploying application..."
    echo "---------------------------------"
    cd $BASE_DIR/sites/gangrunprinting
    
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found${NC}"
        echo "Please create .env file from .env.example and add your credentials"
        exit 1
    fi
    
    docker-compose up -d
    echo -e "${GREEN}Application deployed${NC}"
    
    # Show status
    echo ""
    echo "Step 7: Deployment Status"
    echo "-------------------------"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "new_"
    
    echo ""
    echo -e "${GREEN}========================================"
    echo "Deployment Complete!"
    echo "========================================${NC}"
    echo ""
    echo "Test the deployment:"
    echo "  curl -H 'Host: gangrunprinting.com' http://localhost:8080"
    echo ""
    echo "Once verified, you can:"
    echo "1. Update DNS to point to this server"
    echo "2. Stop Dokploy containers"
    echo "3. Update Caddy to use ports 80/443"
    echo "4. Remove 'new_' prefix from container names"
}

# Run main function
main