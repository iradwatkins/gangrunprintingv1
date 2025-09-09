#!/bin/bash

# Deployment script for GangRun Printing
# Run this after deploying the containers

echo "🚀 GangRun Printing - Post-Deployment Setup"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running on server
if [ ! -f /.dockerenv ] && [ "$HOSTNAME" != "gangrunprinting-app" ]; then
    echo -e "${YELLOW}This script should be run on the server or inside the container${NC}"
    echo ""
    echo "To run on server:"
    echo "  ssh root@72.60.28.175"
    echo "  cd /var/lib/dokploy/projects/gangrunprinting"
    echo "  ./scripts/deploy.sh"
    echo ""
    echo "Or run inside container:"
    echo "  docker exec gangrunprinting-app ./scripts/deploy.sh"
    exit 1
fi

# Function to check if container is running
check_container() {
    if docker ps | grep -q $1; then
        echo -e "${GREEN}✓${NC} $1 is running"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not running"
        return 1
    fi
}

# Function to run command in container
run_in_container() {
    docker exec gangrunprinting-app $@
}

echo ""
echo "1. Checking containers..."
echo "--------------------------"
check_container "gangrunprinting-postgres"
check_container "gangrunprinting-app"
check_container "gangrunprinting-minio"

echo ""
echo "2. Running database migrations..."
echo "----------------------------------"
if run_in_container npx prisma migrate deploy; then
    echo -e "${GREEN}✓${NC} Migrations completed"
else
    echo -e "${RED}✗${NC} Migration failed"
    echo "Trying to generate Prisma client..."
    run_in_container npx prisma generate
    run_in_container npx prisma migrate deploy
fi

echo ""
echo "3. Seeding categories..."
echo "-------------------------"
if run_in_container npx tsx src/scripts/seed-categories.ts; then
    echo -e "${GREEN}✓${NC} Categories seeded"
else
    echo -e "${YELLOW}⚠${NC} Category seeding failed (may already exist)"
fi

echo ""
echo "4. Creating MinIO bucket..."
echo "----------------------------"
# Create MinIO bucket if it doesn't exist
docker exec gangrunprinting-minio mc alias set local http://localhost:9000 gangrun_admin GangRunMinio2024! 2>/dev/null
if docker exec gangrunprinting-minio mc mb local/gangrun-files 2>/dev/null; then
    echo -e "${GREEN}✓${NC} MinIO bucket created"
else
    echo -e "${YELLOW}⚠${NC} MinIO bucket already exists or creation failed"
fi

echo ""
echo "5. Testing application health..."
echo "---------------------------------"
sleep 5
if curl -f http://localhost:3002/api/health 2>/dev/null | grep -q "ok"; then
    echo -e "${GREEN}✓${NC} Application is healthy"
else
    echo -e "${RED}✗${NC} Health check failed"
    echo ""
    echo "Checking application logs..."
    docker logs gangrunprinting-app --tail 20
fi

echo ""
echo "==========================================="
echo -e "${GREEN}Deployment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit https://gangrunprinting.com"
echo "2. Login with Google or magic link"
echo "3. Access admin panel at /admin"
echo ""
echo "If site shows 502, restart the app:"
echo "  docker restart gangrunprinting-app"
echo ""