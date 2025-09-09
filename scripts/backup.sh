#!/bin/bash

# GangRun Printing Backup Script
# This script should be run via cron for automated backups
# Suggested cron: 0 2 * * * /path/to/backup.sh (daily at 2 AM)

# Configuration
BACKUP_DIR="/var/backups/gangrunprinting"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Database credentials (should be set as environment variables or in .env)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-gangrun_db}"
DB_USER="${DB_USER:-gangrun_user}"

# MinIO credentials
MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio.agistaffers.com}"
MINIO_BUCKET="${MINIO_BUCKET:-gangrun-files}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/files"
mkdir -p "$BACKUP_DIR/config"

echo "====================================="
echo "GangRun Printing Backup"
echo "Date: $DATE"
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

# 1. Backup PostgreSQL Database
echo "1. Backing up PostgreSQL database..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --format=custom \
    --verbose \
    --file="$BACKUP_DIR/database/gangrun_db_$DATE.dump"
check_status "Database backup"

# Compress database backup
gzip "$BACKUP_DIR/database/gangrun_db_$DATE.dump"
check_status "Database compression"

# 2. Backup uploaded files from MinIO
echo "2. Backing up MinIO files..."
if command -v mc &> /dev/null; then
    # Configure MinIO client if not already configured
    mc alias set gangrun-backup "https://$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4 2>/dev/null
    
    # Mirror the bucket to local backup
    mc mirror "gangrun-backup/$MINIO_BUCKET" "$BACKUP_DIR/files/minio_$DATE" --overwrite
    check_status "MinIO backup"
    
    # Create tar archive of MinIO files
    tar -czf "$BACKUP_DIR/files/minio_$DATE.tar.gz" -C "$BACKUP_DIR/files" "minio_$DATE"
    rm -rf "$BACKUP_DIR/files/minio_$DATE"
    check_status "MinIO compression"
else
    echo "⚠ MinIO client (mc) not installed. Skipping MinIO backup."
fi

# 3. Backup configuration files
echo "3. Backing up configuration files..."
CONFIG_FILES=(
    "/app/.env.production"
    "/app/prisma/schema.prisma"
    "/app/package.json"
    "/app/next.config.js"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/config/"
        echo "  ✓ Backed up $(basename $file)"
    fi
done

# Create config archive
tar -czf "$BACKUP_DIR/config/config_$DATE.tar.gz" -C "$BACKUP_DIR/config" .
check_status "Configuration backup"

# 4. Create master backup archive
echo "4. Creating master backup archive..."
MASTER_BACKUP="gangrun_backup_$DATE.tar.gz"
tar -czf "$BACKUP_DIR/$MASTER_BACKUP" \
    -C "$BACKUP_DIR" \
    "database/gangrun_db_$DATE.dump.gz" \
    "files/minio_$DATE.tar.gz" \
    "config/config_$DATE.tar.gz"
check_status "Master archive creation"

# 5. Upload to remote storage (optional - configure your preferred backup destination)
echo "5. Uploading to remote storage..."
# Example: Upload to another MinIO bucket
if command -v mc &> /dev/null; then
    mc cp "$BACKUP_DIR/$MASTER_BACKUP" "gangrun-backup/backups/"
    check_status "Remote upload"
fi

# Example: Upload to S3 (requires AWS CLI)
# aws s3 cp "$BACKUP_DIR/$MASTER_BACKUP" "s3://your-backup-bucket/gangrunprinting/"

# Example: Upload to Google Cloud Storage (requires gsutil)
# gsutil cp "$BACKUP_DIR/$MASTER_BACKUP" "gs://your-backup-bucket/gangrunprinting/"

# 6. Clean up old backups
echo "6. Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type f -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete
check_status "Cleanup"

# 7. Send notification (optional)
echo "7. Sending notification..."
if [ -n "$BACKUP_NOTIFICATION_WEBHOOK" ]; then
    curl -X POST "$BACKUP_NOTIFICATION_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{
            \"service\": \"GangRun Printing\",
            \"event\": \"backup_completed\",
            \"timestamp\": \"$DATE\",
            \"file\": \"$MASTER_BACKUP\",
            \"size\": \"$(du -h $BACKUP_DIR/$MASTER_BACKUP | cut -f1)\"
        }"
fi

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$MASTER_BACKUP" | cut -f1)

echo "====================================="
echo "Backup completed successfully!"
echo "File: $MASTER_BACKUP"
echo "Size: $BACKUP_SIZE"
echo "Location: $BACKUP_DIR"
echo "====================================="

# Log backup details
echo "$DATE | $MASTER_BACKUP | $BACKUP_SIZE | SUCCESS" >> "$BACKUP_DIR/backup.log"

exit 0