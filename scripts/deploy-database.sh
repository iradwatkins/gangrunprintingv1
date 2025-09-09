#!/bin/bash

# GangRun Printing - Database Deployment Script
# Run this in Dokploy terminal after deployment

echo "========================================="
echo "GangRun Printing Database Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run command with status
run_command() {
    local cmd=$1
    local description=$2
    
    echo -n "$description... "
    
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Success${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        echo "Error running: $cmd"
        return 1
    fi
}

echo "1. CHECKING DATABASE CONNECTION"
echo "-------------------------------"
run_command "npx prisma db pull --force" "Testing database connection"
echo ""

echo "2. RUNNING MIGRATIONS"
echo "--------------------"
run_command "npx prisma migrate deploy" "Applying database migrations"
echo ""

echo "3. GENERATING PRISMA CLIENT"
echo "---------------------------"
run_command "npx prisma generate" "Generating Prisma client"
echo ""

echo "4. SEEDING DATABASE (Optional)"
echo "------------------------------"
echo -e "${YELLOW}Do you want to seed the database with sample data? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    run_command "npx prisma db seed" "Seeding database"
else
    echo "Skipping database seeding"
fi
echo ""

echo "5. VERIFYING SETUP"
echo "------------------"
echo "Running verification queries..."

# Test query using Prisma
cat << 'EOF' > /tmp/test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        // Test basic connection
        const userCount = await prisma.user.count();
        console.log(`✓ Users table accessible (${userCount} users)`);
        
        const productCount = await prisma.product.count();
        console.log(`✓ Products table accessible (${productCount} products)`);
        
        const orderCount = await prisma.order.count();
        console.log(`✓ Orders table accessible (${orderCount} orders)`);
        
        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('✗ Database test failed:', error.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

testConnection();
EOF

node /tmp/test-db.js
rm /tmp/test-db.js
echo ""

echo "========================================="
echo "Database setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify tables in database"
echo "2. Test application functionality"
echo "3. Monitor for any database errors"
echo ""
echo "Useful commands:"
echo "- View tables: npx prisma studio"
echo "- Reset database: npx prisma migrate reset"
echo "- Create backup: pg_dump \$DATABASE_URL > backup.sql"