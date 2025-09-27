#!/bin/bash

# Upload Configuration Verification Script
# Prevents ERR_CONNECTION_CLOSED issues from recurring

echo "================================================"
echo "🔍 Upload Configuration Verification"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES_FOUND=0

echo "1️⃣  Checking PM2 Configuration..."
echo "--------------------------------"
# Check if PM2 process exists and get interpreter args
PM2_ARGS=$(pm2 info gangrunprinting 2>/dev/null | grep "interpreter args")
if [[ "$PM2_ARGS" == *"max-old-space-size=2048"* ]]; then
    echo -e "${GREEN}✅ Node.js memory configured: 2048MB${NC}"
else
    echo -e "${RED}❌ Node.js memory args missing or incorrect${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [[ "$PM2_ARGS" == *"max-http-header-size=32768"* ]]; then
    echo -e "${GREEN}✅ HTTP header size configured: 32768${NC}"
else
    echo -e "${RED}❌ HTTP header size not configured${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check ecosystem config for memory restart limit
if grep -q "max_memory_restart.*2G" ecosystem.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ PM2 memory restart limit: 2G${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 memory restart limit not verified in config${NC}"
fi

echo ""
echo "2️⃣  Checking Middleware Configuration..."
echo "---------------------------------------"
if grep -q "Connection.*keep-alive" middleware.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Keep-alive headers found in middleware${NC}"
else
    echo -e "${RED}❌ Keep-alive headers missing in middleware${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if grep -q "x-body-size-limit.*20mb" middleware.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Body size limit configured (20mb)${NC}"
else
    echo -e "${RED}❌ Body size limit not configured${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "3️⃣  Checking Upload Route Configuration..."
echo "-----------------------------------------"
UPLOAD_ROUTE="src/app/api/products/upload-image/route.ts"
if [ -f "$UPLOAD_ROUTE" ]; then
    if grep -q "maxDuration = 60" "$UPLOAD_ROUTE" 2>/dev/null; then
        echo -e "${GREEN}✅ Upload route timeout: 60 seconds${NC}"
    else
        echo -e "${RED}❌ Upload route timeout not set to 60${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi

    if grep -q "timeout.*30000" "$UPLOAD_ROUTE" 2>/dev/null; then
        echo -e "${GREEN}✅ Form parsing timeout: 30 seconds${NC}"
    else
        echo -e "${YELLOW}⚠️  Form parsing timeout may be too short${NC}"
    fi
else
    echo -e "${RED}❌ Upload route file not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "4️⃣  Checking Ecosystem Configuration..."
echo "---------------------------------------"
if [ -f "ecosystem.config.js" ]; then
    if grep -q "max_memory_restart.*2G" ecosystem.config.js; then
        echo -e "${GREEN}✅ Ecosystem memory limit: 2G${NC}"
    else
        echo -e "${RED}❌ Ecosystem memory limit not 2G${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi

    if grep -q "kill_timeout.*60000" ecosystem.config.js; then
        echo -e "${GREEN}✅ Kill timeout: 60 seconds${NC}"
    else
        echo -e "${RED}❌ Kill timeout not configured${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${RED}❌ ecosystem.config.js not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "5️⃣  Testing Upload Endpoint..."
echo "------------------------------"
# Create a small test file
echo "test" > /tmp/test-upload.txt
UPLOAD_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -F "file=@/tmp/test-upload.txt" \
    http://localhost:3002/api/products/upload-image 2>/dev/null)

if [ "$UPLOAD_TEST" = "401" ] || [ "$UPLOAD_TEST" = "400" ]; then
    echo -e "${GREEN}✅ Upload endpoint responding (HTTP $UPLOAD_TEST)${NC}"
elif [ "$UPLOAD_TEST" = "000" ]; then
    echo -e "${RED}❌ Upload endpoint not responding (connection failed)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${YELLOW}⚠️  Upload endpoint returned: HTTP $UPLOAD_TEST${NC}"
fi
rm -f /tmp/test-upload.txt

echo ""
echo "================================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Upload configuration is correct!${NC}"
    echo "================================================"
    exit 0
else
    echo -e "${RED}❌ ISSUES FOUND: $ISSUES_FOUND configuration problems detected${NC}"
    echo "================================================"
    echo ""
    echo "🔧 TO FIX:"
    echo "1. Review /docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md"
    echo "2. Run: pm2 delete gangrunprinting && pm2 start ecosystem.config.js"
    echo "3. Test with: node test-upload.js"
    echo ""
    exit 1
fi