#!/bin/bash

# Production Database Setup Script
# Run this INSIDE Dokploy container after deployment

echo "🗄️ GangRun Printing - Production Database Setup"
echo "==============================================="
echo ""

# Step 1: Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Step 3: Seed the database with production data
echo "🌱 Seeding production data..."
npx tsx scripts/seed-all-data.ts

# Step 4: Ensure admin user exists
echo "👤 Verifying admin user..."
npx tsx scripts/update-admin-user.ts

# Step 5: Clean up any duplicate categories
echo "🧹 Cleaning up data..."
npx tsx scripts/clean-and-reseed.ts

echo ""
echo "✅ Production database setup complete!"
echo ""
echo "📊 Verify the following in admin panel:"
echo "  - Login: iradwatkins@gmail.com"
echo "  - URL: https://gangrunprinting.com/admin/dashboard"
echo "  - Paper Stocks: 20"
echo "  - Size Groups: 10"
echo "  - Quantity Groups: 10"
echo "  - Add-ons: 12"
echo "  - Categories: 10"