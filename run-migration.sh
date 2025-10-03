#!/bin/bash

# =====================================================
# Safe Migration Runner for Broker Order System
# =====================================================

set -e  # Exit on error

echo "========================================="
echo "GangRun Printing: Broker Order Migration"
echo "========================================="
echo ""

# Database credentials
DB_HOST="172.22.0.1"
DB_PORT="5432"
DB_NAME="gangrun_db"
DB_USER="gangrun_user"
export PGPASSWORD="GangRun2024Secure"

# Check if database is accessible
echo "✓ Checking database connection..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Database connected successfully"
else
  echo "  ✗ Cannot connect to database"
  exit 1
fi

# Backup database
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo "✓ Creating backup: $BACKUP_FILE"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > "/root/backups/$BACKUP_FILE"
if [ $? -eq 0 ]; then
  echo "  ✓ Backup created successfully"
else
  echo "  ✗ Backup failed!"
  exit 1
fi

# Show current order statuses
echo ""
echo "✓ Current order statuses:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT status, COUNT(*) FROM \"Order\" GROUP BY status ORDER BY COUNT(*) DESC;"

# Confirm migration
echo ""
read -p "Ready to run migration? This will update OrderStatus enum. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Migration cancelled."
  exit 0
fi

# Run migration
echo ""
echo "✓ Running migration..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/migrate-broker-order-system.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "========================================="
  echo "✓ MIGRATION SUCCESSFUL!"
  echo "========================================="
  echo ""
  echo "Next steps:"
  echo "  1. npx prisma generate"
  echo "  2. pm2 restart gangrunprinting"
  echo "  3. Test admin dashboard"
  echo ""
  echo "Backup saved at: /root/backups/$BACKUP_FILE"
else
  echo ""
  echo "✗ MIGRATION FAILED!"
  echo "Restore from backup: psql -h $DB_HOST -U $DB_USER -d $DB_NAME < /root/backups/$BACKUP_FILE"
  exit 1
fi
