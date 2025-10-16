#!/bin/bash

# Product Activity Monitor
# Watches Docker logs and API activity in real-time
# Usage: ./monitor-product-activity.sh

echo "=========================================="
echo "🔍 Product Activity Monitor"
echo "=========================================="
echo ""
echo "This script will monitor:"
echo "  - Docker container logs"
echo "  - API requests (product creation, updates, deletions)"
echo "  - Image upload activity"
echo "  - Authentication/session activity"
echo "  - Database operations"
echo "  - MinIO file upload operations"
echo ""
echo "📝 Logs will be saved to: product-activity-$(date +%Y%m%d-%H%M%S).log"
echo ""
echo "✅ Ready to monitor. Please perform your actions now..."
echo "   (Create product, upload images, save, etc.)"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo "=========================================="
echo ""

# Create log file with timestamp
LOG_FILE="product-activity-$(date +%Y%m%d-%H%M%S).log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start monitoring
log "=== MONITORING STARTED ==="
log ""

# Monitor Docker logs with filters for relevant activity
docker logs -f --tail=0 gangrunprinting_app 2>&1 | while read line; do
    # Filter for relevant log entries
    if echo "$line" | grep -iE "product|image|upload|POST|PUT|DELETE|PATCH|auth|session|error|failed|success|create|update|delete|minio|prisma|api/products"; then
        log "$line"
    fi
done
