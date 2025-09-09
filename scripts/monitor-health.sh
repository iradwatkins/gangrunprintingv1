#!/bin/bash

# GangRun Printing - Health Monitoring Script
# Run this periodically to monitor site health

echo "========================================="
echo "GangRun Printing Health Monitor"
echo "Started: $(date)"
echo "========================================="
echo ""

# Configuration
DOMAIN="gangrunprinting.com"
LOG_FILE="/tmp/gangrun-health.log"
ALERT_EMAIL="iradwatkins@gmail.com"
CHECK_INTERVAL=60  # seconds between checks
MAX_CHECKS=0  # 0 for infinite

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_checks=0
failed_checks=0
successful_checks=0

# Function to check endpoint health
check_health() {
    local url=$1
    local description=$2
    local start_time=$(date +%s%N)
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//')
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} $description: ${GREEN}OK${NC} (${response_time}ms)"
        return 0
    else
        echo -e "${RED}✗${NC} $description: ${RED}FAILED${NC} (HTTP $http_code)"
        echo "$(date) - $description FAILED (HTTP $http_code)" >> "$LOG_FILE"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Database connection: "
    
    # Create a simple Node.js script to test database
    cat << 'EOF' > /tmp/check-db.js
const https = require('https');
https.get('https://gangrunprinting.com/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const health = JSON.parse(data);
            if (health.database === 'connected') {
                console.log('OK');
                process.exit(0);
            } else {
                console.log('FAILED');
                process.exit(1);
            }
        } catch {
            console.log('FAILED');
            process.exit(1);
        }
    });
}).on('error', () => {
    console.log('FAILED');
    process.exit(1);
});
EOF
    
    if node /tmp/check-db.js 2>/dev/null; then
        echo -e "${GREEN}OK${NC}"
        rm /tmp/check-db.js
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        rm /tmp/check-db.js
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    echo -n "Memory usage: "
    
    if command -v free &> /dev/null; then
        mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
        if [ "$mem_usage" -lt 80 ]; then
            echo -e "${GREEN}${mem_usage}%${NC}"
        elif [ "$mem_usage" -lt 90 ]; then
            echo -e "${YELLOW}${mem_usage}%${NC}"
        else
            echo -e "${RED}${mem_usage}%${NC}"
        fi
    else
        echo "N/A"
    fi
}

# Function to send alert
send_alert() {
    local message=$1
    echo "$(date) - ALERT: $message" >> "$LOG_FILE"
    echo -e "${RED}ALERT: $message${NC}"
    
    # Send email alert if configured (requires mail command)
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "GangRun Printing Health Alert" "$ALERT_EMAIL"
    fi
}

# Main monitoring loop
echo "Starting continuous monitoring..."
echo "Press Ctrl+C to stop"
echo ""

trap 'echo -e "\n${YELLOW}Monitoring stopped${NC}"; exit 0' INT

while true; do
    total_checks=$((total_checks + 1))
    
    echo -e "${BLUE}Check #$total_checks - $(date +%H:%M:%S)${NC}"
    echo "------------------------"
    
    all_healthy=true
    
    # Check main endpoints
    if ! check_health "https://$DOMAIN" "Homepage"; then
        all_healthy=false
        failed_checks=$((failed_checks + 1))
    fi
    
    if ! check_health "https://$DOMAIN/api/health" "API Health"; then
        all_healthy=false
    fi
    
    if ! check_health "https://$DOMAIN/products" "Products Page"; then
        all_healthy=false
    fi
    
    # Check database
    check_database
    
    # Check system resources
    check_memory
    
    if $all_healthy; then
        successful_checks=$((successful_checks + 1))
        echo -e "${GREEN}All systems operational${NC}"
    else
        send_alert "Health check failed at $(date)"
    fi
    
    # Calculate uptime
    if [ $total_checks -gt 0 ]; then
        uptime_percent=$(( successful_checks * 100 / total_checks ))
        echo -e "Uptime: ${uptime_percent}% ($successful_checks/$total_checks checks)"
    fi
    
    echo ""
    
    # Check if we should stop
    if [ $MAX_CHECKS -gt 0 ] && [ $total_checks -ge $MAX_CHECKS ]; then
        echo "Maximum checks reached. Stopping."
        break
    fi
    
    # Wait before next check
    sleep $CHECK_INTERVAL
done

echo ""
echo "========================================="
echo "Monitoring Summary"
echo "========================================="
echo "Total checks: $total_checks"
echo "Successful: $successful_checks"
echo "Failed: $failed_checks"
echo "Uptime: ${uptime_percent}%"
echo "Log file: $LOG_FILE"