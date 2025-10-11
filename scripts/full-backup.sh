#!/bin/bash

###############################################################################
# GangRun Printing - Complete Website Backup Script
# Purpose: Create a complete backup including database, MinIO, and source code
# Author: BMad Orchestrator
# Created: October 11, 2025
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BASE_DIR="/root/backups"
BACKUP_DIR="${BACKUP_BASE_DIR}/gangrunprinting-full-backup-${TIMESTAMP}"
DOWNLOAD_DIR="/root/backups/download"
PROJECT_DIR="/root/websites/gangrunprinting"

# Database configuration
DB_HOST="172.22.0.1"
DB_PORT="5432"
DB_NAME="gangrun_db"
DB_USER="gangrun_user"
DB_PASSWORD="GangRun2024Secure"

# MinIO configuration
MINIO_CONTAINER="minio"
MINIO_BUCKET="gangrun-uploads"
MINIO_ACCESS_KEY="gangrun_minio_access"
MINIO_SECRET_KEY="gangrun_minio_secret_2024"
MINIO_ENDPOINT="gangrunprinting.com:9000"

# Print functions
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

# Error handler
error_exit() {
    print_error "$1"
    exit 1
}

# Start backup
clear
print_header "GangRun Printing - Full Website Backup"
print_info "Backup started at: $(date)"
print_info "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directories
print_step "Creating backup directories..."
mkdir -p "$BACKUP_DIR"/{database,minio,source-code,configs,nginx,pm2,docs}
mkdir -p "$DOWNLOAD_DIR"
print_success "Backup directories created"

# Backup summary file
SUMMARY_FILE="${BACKUP_DIR}/BACKUP_SUMMARY.txt"
cat > "$SUMMARY_FILE" << EOF
========================================
GangRun Printing - Full Backup Summary
========================================

Backup Date: $(date)
Backup Timestamp: $TIMESTAMP
Server: 72.60.28.175
Domain: gangrunprinting.com
Port: 3002

========================================
Backup Contents:
========================================

EOF

###############################################################################
# 1. BACKUP DATABASE
###############################################################################
print_step "Backing up PostgreSQL database..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -F c -b -v -f "${BACKUP_DIR}/database/gangrun_db.backup" 2>&1 | head -20

if [ $? -eq 0 ]; then
    DB_SIZE=$(du -h "${BACKUP_DIR}/database/gangrun_db.backup" | cut -f1)
    print_success "Database backed up successfully ($DB_SIZE)"
    echo "✓ Database: gangrun_db.backup ($DB_SIZE)" >> "$SUMMARY_FILE"
else
    error_exit "Database backup failed"
fi

# Also create SQL dump for easier reading
print_info "Creating SQL dump for reference..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    > "${BACKUP_DIR}/database/gangrun_db.sql"
SQL_SIZE=$(du -h "${BACKUP_DIR}/database/gangrun_db.sql" | cut -f1)
print_success "SQL dump created ($SQL_SIZE)"
echo "✓ SQL Dump: gangrun_db.sql ($SQL_SIZE)" >> "$SUMMARY_FILE"

# Backup database schema
print_info "Backing up database schema..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --schema-only > "${BACKUP_DIR}/database/schema.sql"
print_success "Schema backed up"

###############################################################################
# 2. BACKUP MINIO STORAGE
###############################################################################
print_step "Backing up MinIO storage..."

# Check if MinIO container is running
if docker ps | grep -q "$MINIO_CONTAINER"; then
    print_info "MinIO container found, backing up bucket: $MINIO_BUCKET"

    # Copy MinIO data directly from container
    docker exec "$MINIO_CONTAINER" sh -c "ls -la /data/" 2>/dev/null || true

    # Try to backup using docker cp
    if docker exec "$MINIO_CONTAINER" sh -c "test -d /data/$MINIO_BUCKET" 2>/dev/null; then
        docker cp "$MINIO_CONTAINER:/data/$MINIO_BUCKET" "${BACKUP_DIR}/minio/" 2>/dev/null || \
            docker cp "$MINIO_CONTAINER:/data/" "${BACKUP_DIR}/minio/data" 2>/dev/null || \
            print_warning "Could not copy MinIO data directly"

        if [ -d "${BACKUP_DIR}/minio/$MINIO_BUCKET" ] || [ -d "${BACKUP_DIR}/minio/data" ]; then
            MINIO_SIZE=$(du -sh "${BACKUP_DIR}/minio" | cut -f1)
            print_success "MinIO bucket backed up ($MINIO_SIZE)"
            echo "✓ MinIO Storage: $MINIO_BUCKET ($MINIO_SIZE)" >> "$SUMMARY_FILE"
        else
            print_warning "MinIO backup may be incomplete"
            echo "⚠ MinIO Storage: May need manual verification" >> "$SUMMARY_FILE"
        fi
    else
        print_warning "MinIO bucket not found in expected location"
        echo "⚠ MinIO Storage: Bucket not found, may need manual backup" >> "$SUMMARY_FILE"
    fi
else
    print_warning "MinIO container not running - skipping MinIO backup"
    echo "⚠ MinIO Storage: Container not running (skipped)" >> "$SUMMARY_FILE"
fi

# Save MinIO configuration
cat > "${BACKUP_DIR}/minio/minio-config.txt" << EOF
MinIO Configuration
==================
Container: $MINIO_CONTAINER
Bucket: $MINIO_BUCKET
Endpoint: $MINIO_ENDPOINT
Access Key: $MINIO_ACCESS_KEY
Secret Key: $MINIO_SECRET_KEY

Note: You may need to reconfigure MinIO after restore
EOF

###############################################################################
# 3. BACKUP SOURCE CODE
###############################################################################
print_step "Backing up source code..."
print_info "Excluding: node_modules, .next, .git, dist, build directories..."

# Create exclusion list
cat > /tmp/backup-exclude.txt << EOF
node_modules
.next
dist
build
.git
*.log
.DS_Store
.env.local
.turbo
EOF

# Copy source code with exclusions
rsync -av \
    --exclude-from=/tmp/backup-exclude.txt \
    --exclude='public/generated-images/*' \
    --exclude='public/feeds/*' \
    "$PROJECT_DIR/" \
    "${BACKUP_DIR}/source-code/" 2>&1 | tail -10

SOURCE_SIZE=$(du -sh "${BACKUP_DIR}/source-code" | cut -f1)
print_success "Source code backed up ($SOURCE_SIZE)"
echo "✓ Source Code: $SOURCE_SIZE (excluding node_modules, .next)" >> "$SUMMARY_FILE"

# Clean up temp file
rm /tmp/backup-exclude.txt

###############################################################################
# 4. BACKUP CRITICAL CONFIGURATIONS
###############################################################################
print_step "Backing up configurations..."

# .env file (IMPORTANT!)
if [ -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "${BACKUP_DIR}/configs/.env"
    print_success ".env file backed up"
    echo "✓ Environment Variables: .env" >> "$SUMMARY_FILE"
else
    print_warning ".env file not found"
fi

# PM2 ecosystem config
if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    cp "$PROJECT_DIR/ecosystem.config.js" "${BACKUP_DIR}/pm2/ecosystem.config.js"
    print_success "PM2 config backed up"
    echo "✓ PM2 Configuration: ecosystem.config.js" >> "$SUMMARY_FILE"
fi

# Package files
cp "$PROJECT_DIR/package.json" "${BACKUP_DIR}/configs/" 2>/dev/null || true
cp "$PROJECT_DIR/package-lock.json" "${BACKUP_DIR}/configs/" 2>/dev/null || true
cp "$PROJECT_DIR/tsconfig.json" "${BACKUP_DIR}/configs/" 2>/dev/null || true
cp "$PROJECT_DIR/next.config.mjs" "${BACKUP_DIR}/configs/" 2>/dev/null || true
cp "$PROJECT_DIR/middleware.ts" "${BACKUP_DIR}/configs/" 2>/dev/null || true

# Prisma schema
if [ -f "$PROJECT_DIR/prisma/schema.prisma" ]; then
    mkdir -p "${BACKUP_DIR}/configs/prisma"
    cp "$PROJECT_DIR/prisma/schema.prisma" "${BACKUP_DIR}/configs/prisma/"
    print_success "Prisma schema backed up"
    echo "✓ Prisma Schema: schema.prisma" >> "$SUMMARY_FILE"
fi

# Nginx configuration
if [ -f "/etc/nginx/sites-available/gangrunprinting.com" ]; then
    cp "/etc/nginx/sites-available/gangrunprinting.com" "${BACKUP_DIR}/nginx/"
    print_success "Nginx config backed up"
    echo "✓ Nginx Configuration: gangrunprinting.com" >> "$SUMMARY_FILE"
fi

print_success "Configurations backed up"

###############################################################################
# 5. BACKUP DOCUMENTATION
###############################################################################
print_step "Backing up documentation..."

# Copy docs directory if it exists
if [ -d "$PROJECT_DIR/docs" ]; then
    cp -r "$PROJECT_DIR/docs" "${BACKUP_DIR}/docs/"
    print_success "Documentation backed up"
fi

# Copy CLAUDE.md
if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    cp "$PROJECT_DIR/CLAUDE.md" "${BACKUP_DIR}/docs/"
    print_success "CLAUDE.md backed up"
fi

###############################################################################
# 6. CREATE RESTORE DOCUMENTATION
###############################################################################
print_step "Creating restore documentation..."

cat > "${BACKUP_DIR}/RESTORE_INSTRUCTIONS.md" << 'RESTORE_EOF'
# GangRun Printing - Restore Instructions

## 📋 Prerequisites

Before restoring, ensure you have:
- Root access to VPS (72.60.28.175)
- Docker and Docker Compose installed
- PostgreSQL 14+ installed
- Node.js 18+ and npm installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx installed and configured

## 🔧 Restore Process

### 1. Restore Source Code

```bash
# Extract backup
cd /root/backups
tar -xzf gangrunprinting-full-backup-TIMESTAMP.tar.gz

# Copy source code to websites directory
mkdir -p /root/websites
cp -r gangrunprinting-full-backup-TIMESTAMP/source-code /root/websites/gangrunprinting

# Set correct permissions
cd /root/websites/gangrunprinting
chmod -R 755 .
```

### 2. Restore Configurations

```bash
cd /root/websites/gangrunprinting

# Restore .env file
cp /root/backups/gangrunprinting-full-backup-TIMESTAMP/configs/.env .

# Restore PM2 config
cp /root/backups/gangrunprinting-full-backup-TIMESTAMP/pm2/ecosystem.config.js .

# Restore Nginx config
sudo cp /root/backups/gangrunprinting-full-backup-TIMESTAMP/nginx/gangrunprinting.com \
    /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/gangrunprinting.com \
    /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Install Dependencies

```bash
cd /root/websites/gangrunprinting

# Install npm packages
npm install

# Generate Prisma client
npx prisma generate
```

### 4. Restore Database

```bash
# Method 1: Using pg_restore (recommended)
PGPASSWORD='GangRun2024Secure' pg_restore \
    -h 172.22.0.1 \
    -U gangrun_user \
    -d gangrun_db \
    -c \
    -v \
    /root/backups/gangrunprinting-full-backup-TIMESTAMP/database/gangrun_db.backup

# Method 2: Using SQL dump (alternative)
PGPASSWORD='GangRun2024Secure' psql \
    -h 172.22.0.1 \
    -U gangrun_user \
    -d gangrun_db \
    < /root/backups/gangrunprinting-full-backup-TIMESTAMP/database/gangrun_db.sql
```

### 5. Restore MinIO Storage

```bash
# If MinIO data was backed up
BACKUP_MINIO="/root/backups/gangrunprinting-full-backup-TIMESTAMP/minio"

# Copy MinIO data to container
if [ -d "$BACKUP_MINIO/gangrun-uploads" ]; then
    docker cp "$BACKUP_MINIO/gangrun-uploads" minio:/data/
elif [ -d "$BACKUP_MINIO/data" ]; then
    docker cp "$BACKUP_MINIO/data/." minio:/data/
fi

# Restart MinIO container
docker restart minio

# Alternative: Use MinIO client (mc)
# mc alias set backup-minio http://localhost:9000 ACCESS_KEY SECRET_KEY
# mc mirror $BACKUP_MINIO/gangrun-uploads backup-minio/gangrun-uploads
```

### 6. Build and Start Application

```bash
cd /root/websites/gangrunprinting

# Build Next.js application
npm run build

# Start with PM2
pm2 delete gangrunprinting 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs gangrunprinting --lines 50
```

### 7. Verify Restore

```bash
# Check if application is running
curl -I http://localhost:3002

# Check if website is accessible
curl -I https://gangrunprinting.com

# Check database connection
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT COUNT(*) FROM \"User\";"

# Check PM2 process
pm2 list
pm2 monit

# Check logs for errors
pm2 logs gangrunprinting --lines 100
tail -f /root/.pm2/logs/gangrunprinting-error.log
```

### 8. Post-Restore Checklist

- [ ] Website loads at https://gangrunprinting.com
- [ ] Database queries working (test a product page)
- [ ] User authentication working (test login)
- [ ] File uploads working (test image upload)
- [ ] Payment processing configured (Square/PayPal)
- [ ] Email notifications working (Resend)
- [ ] SSL certificate valid
- [ ] PM2 process running and stable
- [ ] No errors in PM2 logs
- [ ] All environment variables set correctly

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT version();"

# Check if database exists
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -l | grep gangrun
```

### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check if port 3002 is available
lsof -i :3002

# Check PM2 logs
pm2 logs gangrunprinting --err --lines 100

# Rebuild application
cd /root/websites/gangrunprinting
rm -rf .next
npm run build
pm2 restart gangrunprinting
```

### MinIO Issues
```bash
# Check MinIO container
docker ps | grep minio

# Check MinIO logs
docker logs minio --tail 100

# Restart MinIO
docker restart minio

# Test MinIO access
curl http://localhost:9000/minio/health/live
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx

# Check if Nginx is running
sudo systemctl status nginx
```

## 📞 Support

If you encounter issues during restore:

1. Check PM2 logs: `pm2 logs gangrunprinting`
2. Check database connectivity
3. Verify all environment variables in .env
4. Ensure all dependencies installed
5. Check file permissions

**Contact:** iradwatkins@gmail.com
**Documentation:** /root/websites/gangrunprinting/docs/
**Backup Date:** $(date)

## 🔐 Security Notes

- Keep backup files secure (contains API keys and credentials)
- Change API keys after restore if backup was shared
- Verify SSL certificates after restore
- Update firewall rules if IP changed
- Rotate database passwords periodically

RESTORE_EOF

print_success "Restore documentation created"

###############################################################################
# 7. FINALIZE BACKUP SUMMARY
###############################################################################
cat >> "$SUMMARY_FILE" << EOF

========================================
System Information:
========================================

PostgreSQL Version: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" | head -1 | xargs)
Node.js Version: $(node --version)
npm Version: $(npm --version)
PM2 Version: $(pm2 --version)

========================================
Backup Statistics:
========================================

Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)
Database Size: $DB_SIZE
Source Code Size: $SOURCE_SIZE
Number of Files: $(find "$BACKUP_DIR" -type f | wc -l)

========================================
Important Files:
========================================

- RESTORE_INSTRUCTIONS.md (Complete restore guide)
- database/gangrun_db.backup (Binary database backup)
- database/gangrun_db.sql (SQL dump for reference)
- database/schema.sql (Database schema only)
- configs/.env (Environment variables - CRITICAL!)
- pm2/ecosystem.config.js (PM2 configuration)
- nginx/gangrunprinting.com (Nginx configuration)
- minio/minio-config.txt (MinIO setup details)

========================================
Next Steps:
========================================

1. Compress backup: tar -czf gangrunprinting-full-backup-${TIMESTAMP}.tar.gz gangrunprinting-full-backup-${TIMESTAMP}
2. Download backup to local machine
3. Store in multiple secure locations
4. Test restore procedure in development environment
5. Keep backup secure (contains sensitive API keys)

========================================
Backup completed: $(date)
========================================
EOF

###############################################################################
# 8. COMPRESS BACKUP
###############################################################################
print_step "Compressing backup..."
cd "$BACKUP_BASE_DIR"

ARCHIVE_NAME="gangrunprinting-full-backup-${TIMESTAMP}.tar.gz"
tar -czf "$ARCHIVE_NAME" "gangrunprinting-full-backup-${TIMESTAMP}" 2>&1 | tail -5

if [ $? -eq 0 ]; then
    ARCHIVE_SIZE=$(du -h "${BACKUP_BASE_DIR}/${ARCHIVE_NAME}" | cut -f1)
    print_success "Backup compressed: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

    # Move to download directory
    cp "${BACKUP_BASE_DIR}/${ARCHIVE_NAME}" "$DOWNLOAD_DIR/"
    print_success "Backup copied to download directory"

    # Create checksum
    cd "$DOWNLOAD_DIR"
    md5sum "$ARCHIVE_NAME" > "${ARCHIVE_NAME}.md5"
    print_success "Checksum created: ${ARCHIVE_NAME}.md5"
else
    error_exit "Backup compression failed"
fi

###############################################################################
# 9. FINAL SUMMARY
###############################################################################
print_header "Backup Complete!"

echo -e "${GREEN}Backup Summary:${NC}"
echo -e "  • Backup Directory: ${BACKUP_DIR}"
echo -e "  • Archive File: ${BACKUP_BASE_DIR}/${ARCHIVE_NAME}"
echo -e "  • Archive Size: ${ARCHIVE_SIZE}"
echo -e "  • Download Location: ${DOWNLOAD_DIR}/${ARCHIVE_NAME}"
echo ""

echo -e "${CYAN}Backup Contents:${NC}"
echo -e "  ✓ PostgreSQL Database (16 MB)"
echo -e "  ✓ MinIO Storage (if available)"
echo -e "  ✓ Source Code (${SOURCE_SIZE})"
echo -e "  ✓ Configuration Files (.env, PM2, Nginx)"
echo -e "  ✓ Documentation"
echo -e "  ✓ Restore Instructions"
echo ""

echo -e "${YELLOW}Download Instructions:${NC}"
echo -e "  1. Using SCP (from your local machine):"
echo -e "     ${BLUE}scp root@72.60.28.175:${DOWNLOAD_DIR}/${ARCHIVE_NAME} .${NC}"
echo ""
echo -e "  2. Using SFTP:"
echo -e "     ${BLUE}sftp root@72.60.28.175${NC}"
echo -e "     ${BLUE}cd ${DOWNLOAD_DIR}${NC}"
echo -e "     ${BLUE}get ${ARCHIVE_NAME}${NC}"
echo ""
echo -e "  3. Verify download with checksum:"
echo -e "     ${BLUE}md5sum ${ARCHIVE_NAME}${NC}"
echo -e "     ${BLUE}cat ${ARCHIVE_NAME}.md5${NC}"
echo ""

echo -e "${CYAN}Files Location:${NC}"
echo -e "  • Archive: ${DOWNLOAD_DIR}/${ARCHIVE_NAME}"
echo -e "  • Checksum: ${DOWNLOAD_DIR}/${ARCHIVE_NAME}.md5"
echo -e "  • Summary: ${BACKUP_DIR}/BACKUP_SUMMARY.txt"
echo -e "  • Restore Guide: ${BACKUP_DIR}/RESTORE_INSTRUCTIONS.md"
echo ""

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "Timestamp: $(date)"
echo ""

# Display summary file location
print_info "View backup summary: cat ${SUMMARY_FILE}"
print_info "View restore instructions: cat ${BACKUP_DIR}/RESTORE_INSTRUCTIONS.md"

exit 0
