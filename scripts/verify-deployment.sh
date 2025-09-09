#!/bin/bash

# GangRun Printing - Deployment Verification Script
# Run this after deploying to verify everything is working

echo "========================================="
echo "GangRun Printing Deployment Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="gangrunprinting.com"
API_ENDPOINT="https://$DOMAIN/api/health"
TIMEOUT=10

# Function to check endpoint
check_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        echo -e "${RED}✗ FAILED${NC} (Connection timeout)"
        return 1
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $response)"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    echo -n "Checking SSL certificate... "
    
    if echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        echo -e "${GREEN}✓ Valid SSL certificate${NC}"
        return 0
    else
        echo -e "${RED}✗ SSL certificate issue${NC}"
        return 1
    fi
}

echo "1. CHECKING CONNECTIVITY"
echo "------------------------"
check_endpoint "https://$DOMAIN" "Homepage"
check_endpoint "$API_ENDPOINT" "Health API"
check_ssl
echo ""

echo "2. CHECKING CRITICAL PAGES"
echo "--------------------------"
check_endpoint "https://$DOMAIN/products" "Products page"
check_endpoint "https://$DOMAIN/cart" "Cart page"
check_endpoint "https://$DOMAIN/checkout" "Checkout page"
check_endpoint "https://$DOMAIN/admin" "Admin dashboard"
echo ""

echo "3. CHECKING API ENDPOINTS"
echo "-------------------------"
check_endpoint "https://$DOMAIN/api/products" "Products API"
check_endpoint "https://$DOMAIN/api/notifications/vapid-public-key" "Push notifications"
echo ""

echo "4. CHECKING PWA FEATURES"
echo "------------------------"
check_endpoint "https://$DOMAIN/manifest.json" "PWA manifest"
check_endpoint "https://$DOMAIN/sw.js" "Service worker"
echo ""

echo "5. DEPLOYMENT CHECKLIST"
echo "-----------------------"
echo "Please verify manually:"
echo "□ Database migrations completed"
echo "□ Square webhook configured"
echo "□ Environment variables set in Dokploy"
echo "□ Email sending works (SendGrid)"
echo "□ File uploads work (MinIO)"
echo "□ N8N workflows configured"
echo ""

echo "========================================="
echo "Verification complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Test complete checkout flow"
echo "2. Verify email notifications"
echo "3. Test admin functionality"
echo "4. Monitor error logs in Dokploy"