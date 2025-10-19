#!/bin/bash

# GangRun Printing Production Deployment Script
# Docker Compose Deployment (NO Dokploy, Clerk, Convex, or Supabase)

set -e

echo "🚀 GangRun Printing Production Deployment"
echo "=========================================="
echo "Tech Stack: Next.js 15 + Lucia Auth + Prisma + PostgreSQL"
echo "Deployment: Docker Compose"
echo "Port: 3002"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're on the production server
if [[ "$(hostname -I | xargs)" != *"72.60.28.175"* ]] && [[ "$(hostname)" != *"gangrun"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: This doesn't appear to be the production server${NC}"
    echo "Expected: 72.60.28.175"
    echo "Current: $(hostname -I | xargs)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check required files
echo -e "${BLUE}📋 Checking required files...${NC}"

if [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}❌ docker-compose.production.yml not found${NC}"
    exit 1
fi

if [ ! -f ".env.production.template" ]; then
    echo -e "${RED}❌ .env.production.template not found${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required files present${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
    echo "Creating from template..."
    cp .env.production.template .env.production
    chmod 600 .env.production
    echo -e "${RED}🔧 IMPORTANT: Edit .env.production with your production values before continuing!${NC}"
    echo "Required variables:"
    echo "  - POSTGRES_PASSWORD"
    echo "  - AUTH_SECRET"
    echo "  - REDIS_PASSWORD"
    echo "  - MINIO_SECRET_KEY"
    echo "  - SQUARE_ACCESS_TOKEN"
    echo "  - RESEND_API_KEY"
    echo "  - GOOGLE_CLIENT_SECRET (if using OAuth)"
    echo ""
    read -p "Press Enter when you've configured .env.production..."
fi

# Check Docker installation
echo -e "${BLUE}🐳 Checking Docker installation...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}✅ Docker environment ready${NC}"

# Stop existing services if running
echo -e "${BLUE}🛑 Stopping existing services...${NC}"
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Clean up old containers and images
echo -e "${BLUE}🧹 Cleaning up old containers...${NC}"
docker system prune -f

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Check service health
echo -e "${BLUE}🔍 Checking service health...${NC}"

# PostgreSQL
echo "Checking PostgreSQL..."
if docker-compose -f docker-compose.production.yml exec -T gangrun-postgres pg_isready -U gangrun_user; then
    echo -e "${GREEN}✅ PostgreSQL ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL not ready${NC}"
    exit 1
fi

# Redis
echo "Checking Redis..."
if docker-compose -f docker-compose.production.yml exec -T gangrun-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis ready${NC}"
else
    echo -e "${RED}❌ Redis not ready${NC}"
    exit 1
fi

# MinIO
echo "Checking MinIO..."
if docker-compose -f docker-compose.production.yml exec -T gangrun-minio curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MinIO ready${NC}"
else
    echo -e "${RED}❌ MinIO not ready${NC}"
    exit 1
fi

# Database setup
echo -e "${BLUE}🗄️  Setting up database...${NC}"

# Generate Prisma client
echo "Generating Prisma client..."
docker-compose -f docker-compose.production.yml exec -T gangrun-app npx prisma generate

# Deploy database schema
echo "Deploying database schema..."
docker-compose -f docker-compose.production.yml exec -T gangrun-app npx prisma db push

# Create admin user if needed
echo "Setting up admin user..."
docker-compose -f docker-compose.production.yml exec -T gangrun-app npx prisma db seed 2>/dev/null || echo "Seed data already exists or skipped"

echo -e "${GREEN}✅ Database setup complete${NC}"

# Test application health
echo -e "${BLUE}🔍 Testing application health...${NC}"
sleep 10

if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application health check passed${NC}"
else
    echo -e "${RED}❌ Application health check failed${NC}"
    echo "Checking logs..."
    docker-compose -f docker-compose.production.yml logs gangrun-app --tail=20
    exit 1
fi

# Display service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.production.yml ps

# Display useful information
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo -e "${BLUE}📍 Local Access:${NC} http://localhost:3002"
echo -e "${BLUE}🌐 Production URL:${NC} https://gangrunprinting.com (after DNS/SSL setup)"
echo -e "${BLUE}🗄️  MinIO Console:${NC} http://72.60.28.175:9001"
echo -e "${BLUE}🔧 N8N Integration:${NC} http://72.60.28.175:5678"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Configure DNS to point gangrunprinting.com to 72.60.28.175"
echo "2. Set up SSL certificate with Let's Encrypt"
echo "3. Configure MinIO bucket and policies"
echo "4. Import N8N workflows from docs/bmad/shards/"
echo "5. Test all functionality"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "• View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "• Restart app: docker-compose -f docker-compose.production.yml restart gangrun-app"
echo "• Stop all: docker-compose -f docker-compose.production.yml down"
echo "• Database console: docker-compose -f docker-compose.production.yml exec gangrun-postgres psql -U gangrun_user -d gangrun_production"
echo ""
echo -e "${GREEN}✨ GangRun Printing is now live on port 3002!${NC}"