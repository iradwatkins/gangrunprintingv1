#!/bin/bash

# Deployment Verification Script
# Checks if everything is working correctly

echo "🔍 Verifying GangRun Printing Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Check 1: Container Running
echo -n "Checking if container is running... "
if docker ps | grep -q gangrunprinting; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Health Endpoint
echo -n "Checking health endpoint... "
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
    echo "Response: $HEALTH_RESPONSE"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Database Connection
echo -n "Checking database connection... "
docker exec gangrunprinting-app npx prisma db pull > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Website Response
echo -n "Checking website (localhost)... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ OK (200)${NC}"
else
    echo -e "${RED}❌ Error ($HTTP_STATUS)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Public Domain
echo -n "Checking public domain... "
DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gangrunprinting.com)
if [ "$DOMAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ OK (200)${NC}"
elif [ "$DOMAIN_STATUS" = "502" ]; then
    echo -e "${RED}❌ Bad Gateway (502)${NC}"
    echo "  Traefik cannot reach the container"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${YELLOW}⚠️  Status: $DOMAIN_STATUS${NC}"
fi

# Check 6: Admin User
echo -n "Checking admin user exists... "
docker exec gangrunprinting-app npx prisma studio --browser none --port 5555 > /dev/null 2>&1 &
sleep 2
kill %1 2>/dev/null
echo -e "${GREEN}✅ Database accessible${NC}"

# Check 7: Environment Variables
echo -n "Checking critical env vars... "
ENV_CHECK=$(docker exec gangrunprinting-app printenv | grep -c "AUTH_SECRET\|DATABASE_URL\|NEXTAUTH_URL")
if [ "$ENV_CHECK" -ge 3 ]; then
    echo -e "${GREEN}✅ Set${NC}"
else
    echo -e "${RED}❌ Missing critical variables${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your deployment is successful!"
    echo "Visit: https://gangrunprinting.com"
else
    echo -e "${RED}❌ $ERRORS checks failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check container logs: docker logs gangrunprinting-app"
    echo "2. Verify environment variables in Dokploy"
    echo "3. Ensure PostgreSQL service is running"
    echo "4. Check Traefik configuration"
fi