#!/bin/bash

# GangRun Printing Restore Script
# This script restores from a backup created by backup.sh

# Configuration
BACKUP_DIR="/var/backups/gangrunprinting"

# Database credentials
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-gangrun_db}"
DB_USER="${DB_USER:-gangrun_user}"

# MinIO credentials
MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio.agistaffers.com}"
MINIO_BUCKET="${MINIO_BUCKET:-gangrun-files}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY}"

echo "====================================="
echo "GangRun Printing Restore Script"
echo "====================================="

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo "✓ $1 successful"
    else
        echo "✗ $1 failed"
        exit 1
    fi
}

# List available backups
echo "Available backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print NR". "$9" ("$5")"}'

# Ask user to select backup
echo ""
read -p "Enter the backup filename to restore (or full path): " BACKUP_FILE

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ] && [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "✗ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# If only filename provided, prepend backup directory
if [ ! -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

echo "Selected backup: $BACKUP_FILE"

# Confirmation
echo ""
echo "⚠️  WARNING: This will restore the following:"
echo "  - Database: $DB_NAME"
echo "  - MinIO bucket: $MINIO_BUCKET"
echo "  - Configuration files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Create temporary directory for extraction
TEMP_DIR="/tmp/gangrun_restore_$$"
mkdir -p "$TEMP_DIR"

# Extract master backup
echo "1. Extracting backup archive..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
check_status "Archive extraction"

# Find the database backup
DB_BACKUP=$(find "$TEMP_DIR" -name "*.dump.gz" | head -1)
if [ -z "$DB_BACKUP" ]; then
    echo "✗ Database backup not found in archive"
    exit 1
fi

# 2. Restore PostgreSQL Database
echo "2. Restoring PostgreSQL database..."

# Drop existing connections to the database
echo "  Disconnecting existing connections..."
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null

# Drop and recreate database
echo "  Dropping existing database..."
PGPASSWORD="$DB_PASSWORD" dropdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --if-exists \
    "$DB_NAME"

echo "  Creating new database..."
PGPASSWORD="$DB_PASSWORD" createdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    "$DB_NAME"
check_status "Database recreation"

# Decompress and restore database
echo "  Restoring database data..."
gunzip -c "$DB_BACKUP" | PGPASSWORD="$DB_PASSWORD" pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-privileges \
    --verbose
check_status "Database restore"

# 3. Restore MinIO files
MINIO_BACKUP=$(find "$TEMP_DIR" -name "minio_*.tar.gz" | head -1)
if [ -n "$MINIO_BACKUP" ] && command -v mc &> /dev/null; then
    echo "3. Restoring MinIO files..."
    
    # Extract MinIO backup
    MINIO_TEMP="$TEMP_DIR/minio_restore"
    mkdir -p "$MINIO_TEMP"
    tar -xzf "$MINIO_BACKUP" -C "$MINIO_TEMP"
    
    # Configure MinIO client
    mc alias set gangrun-restore "https://$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4 2>/dev/null
    
    # Clear existing bucket (optional - uncomment if you want to clear first)
    # echo "  Clearing existing bucket..."
    # mc rm -r --force "gangrun-restore/$MINIO_BUCKET"
    
    # Restore files to MinIO
    echo "  Uploading files to MinIO..."
    mc mirror "$MINIO_TEMP" "gangrun-restore/$MINIO_BUCKET" --overwrite
    check_status "MinIO restore"
else
    echo "3. Skipping MinIO restore (backup not found or mc not installed)"
fi

# 4. Restore configuration files (optional)
CONFIG_BACKUP=$(find "$TEMP_DIR" -name "config_*.tar.gz" | head -1)
if [ -n "$CONFIG_BACKUP" ]; then
    echo "4. Configuration files found in backup"
    echo "  Location: $CONFIG_BACKUP"
    echo "  Note: Configuration files should be manually reviewed and restored"
    
    # Extract config files for review
    CONFIG_TEMP="$TEMP_DIR/config_restore"
    mkdir -p "$CONFIG_TEMP"
    tar -xzf "$CONFIG_BACKUP" -C "$CONFIG_TEMP"
    echo "  Extracted to: $CONFIG_TEMP"
fi

# 5. Run Prisma migrations to ensure schema is up to date
echo "5. Running database migrations..."
if [ -f "/app/prisma/schema.prisma" ]; then
    cd /app
    npx prisma generate
    npx prisma db push --accept-data-loss
    check_status "Database migrations"
fi

# 6. Restart application
echo "6. Restarting application..."
# If using PM2
if command -v pm2 &> /dev/null; then
    pm2 restart gangrunprinting
fi

# If using Docker via Dokploy
# docker restart gangrunprinting-app

# Clean up temporary files
echo "7. Cleaning up..."
rm -rf "$TEMP_DIR"

echo "====================================="
echo "Restore completed successfully!"
echo "====================================="
echo ""
echo "Please verify:"
echo "  1. Application is running correctly"
echo "  2. Database contains expected data"
echo "  3. Files are accessible in MinIO"
echo "  4. Configuration is correct"

exit 0