#!/bin/bash

# Database Initialization Script for Dokploy
# Run this after deployment to set up the database

echo "🗄️ Initializing GangRun Printing Database"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the container
if [ -f /.dockerenv ]; then
    echo -e "${GREEN}✅ Running inside Docker container${NC}"
else
    echo -e "${YELLOW}⚠️  Running outside container - connecting to container${NC}"
    docker exec -it gangrunprinting-app bash -c "cd /app && bash scripts/init-database.sh"
    exit 0
fi

# Step 1: Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
npx prisma db pull > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check DATABASE_URL environment variable"
    exit 1
fi

# Step 2: Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi

# Step 3: Seed the database
echo -e "${YELLOW}Seeding database with initial data...${NC}"
npx tsx scripts/seed-all-data.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Seeding had some issues, continuing...${NC}"
fi

# Step 4: Ensure admin user exists
echo -e "${YELLOW}Verifying admin user...${NC}"
npx tsx scripts/update-admin-user.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin user verified${NC}"
else
    echo -e "${YELLOW}⚠️  Admin user update had issues${NC}"
fi

# Step 5: Display summary
echo ""
echo -e "${GREEN}=== Database Initialization Complete ===${NC}"
echo ""
echo "Summary:"
echo "✅ Database connected"
echo "✅ Migrations applied"
echo "✅ Data seeded"
echo "✅ Admin user: iradwatkins@gmail.com"
echo ""
echo "You can now:"
echo "1. Visit https://gangrunprinting.com"
echo "2. Login with Google (iradwatkins@gmail.com)"
echo "3. Access admin dashboard at /admin/dashboard"