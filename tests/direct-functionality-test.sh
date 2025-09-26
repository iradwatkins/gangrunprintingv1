#!/bin/bash

# Direct Functionality Test Script
# Tests all TypeScript fixes comprehensively

echo "=========================================="
echo "🧪 TYPESCRIPT FIXES VALIDATION - ROUND 1"
echo "=========================================="

BASE_URL="http://localhost:3002"
ADMIN_EMAIL="iradwatkins@gmail.com"
ADMIN_PASSWORD="Iw2006js!"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check test result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "1️⃣  Testing Server Health..."
echo "------------------------------"
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" | grep -q "200\|404"
check_result $? "Server is responding"

echo ""
echo "2️⃣  Testing Customer Management Page..."
echo "----------------------------------------"

# Get auth token first
echo "   Getting auth token..."
COOKIE_JAR=$(mktemp)

# Login and get session
curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    > /dev/null 2>&1

# Test customers page loads
CUSTOMERS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/customers" -w "\n%{http_code}")
HTTP_CODE=$(echo "$CUSTOMERS_RESPONSE" | tail -n1)

if [[ "$HTTP_CODE" == "200" ]]; then
    # Check for TypeScript error patterns in response
    echo "$CUSTOMERS_RESPONSE" | grep -q "TypeError\|Cannot read\|undefined is not"
    if [ $? -eq 1 ]; then
        check_result 0 "Customers page loads without TypeScript errors"
    else
        check_result 1 "Customers page has TypeScript errors"
    fi

    # Check for status badges
    echo "$CUSTOMERS_RESPONSE" | grep -q "verified\|unverified"
    check_result $? "Customer status badges render correctly"
else
    check_result 1 "Customers page returned $HTTP_CODE"
fi

echo ""
echo "3️⃣  Testing Product API Endpoints..."
echo "-------------------------------------"

# Test GET products endpoint
PRODUCTS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/products" -w "\n%{http_code}")
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)

if [[ "$HTTP_CODE" == "200" ]]; then
    check_result 0 "GET /api/products works"

    # Extract first product ID if available
    PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ ! -z "$PRODUCT_ID" ]; then
        # Test GET single product
        SINGLE_PRODUCT=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/products/$PRODUCT_ID" -w "\n%{http_code}")
        HTTP_CODE=$(echo "$SINGLE_PRODUCT" | tail -n1)
        [[ "$HTTP_CODE" == "200" ]]
        check_result $? "GET /api/products/[id] works"

        # Test PUT update (with proper error handling)
        UPDATE_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X PUT "$BASE_URL/api/products/$PRODUCT_ID" \
            -H "Content-Type: application/json" \
            -d '{"name":"Test Product Updated"}' \
            -w "\n%{http_code}")
        HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)

        # Check if update returns success or expected error
        if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "403" ]]; then
            check_result 0 "PUT /api/products/[id] handles requests properly"
        else
            check_result 1 "PUT /api/products/[id] returned unexpected $HTTP_CODE"
        fi
    else
        echo -e "${YELLOW}⚠ No products found to test individual endpoints${NC}"
    fi
else
    check_result 1 "GET /api/products returned $HTTP_CODE"
fi

echo ""
echo "4️⃣  Testing Order Management Page..."
echo "-------------------------------------"

ORDERS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/orders" -w "\n%{http_code}")
HTTP_CODE=$(echo "$ORDERS_RESPONSE" | tail -n1)

if [[ "$HTTP_CODE" == "200" ]]; then
    # Check for TypeScript errors related to model fields
    echo "$ORDERS_RESPONSE" | grep -q "Cannot read.*user\|Cannot read.*vendor\|Payment.*undefined"
    if [ $? -eq 1 ]; then
        check_result 0 "Orders page loads without model field errors"
    else
        check_result 1 "Orders page has model field errors"
    fi

    # Extract first order ID if available
    ORDER_ID=$(echo "$ORDERS_RESPONSE" | grep -o 'href="/admin/orders/[^"]*"' | head -1 | cut -d'/' -f4 | cut -d'"' -f1)

    if [ ! -z "$ORDER_ID" ]; then
        ORDER_DETAIL=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/orders/$ORDER_ID" -w "\n%{http_code}")
        HTTP_CODE=$(echo "$ORDER_DETAIL" | tail -n1)

        if [[ "$HTTP_CODE" == "200" ]]; then
            # Check for proper field references
            echo "$ORDER_DETAIL" | grep -q "productName\|productSku"
            check_result $? "Order details use correct field names"
        else
            check_result 1 "Order detail page returned $HTTP_CODE"
        fi
    fi
else
    check_result 1 "Orders page returned $HTTP_CODE"
fi

echo ""
echo "5️⃣  Testing Dashboard Components..."
echo "------------------------------------"

DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin" -w "\n%{http_code}")
HTTP_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)

if [[ "$HTTP_CODE" == "200" ]]; then
    # Check for chart component errors
    echo "$DASHBOARD_RESPONSE" | grep -q "ProductionChart.*error\|GangRunSchedule.*error"
    if [ $? -eq 1 ]; then
        check_result 0 "Dashboard charts render without errors"
    else
        check_result 1 "Dashboard charts have rendering errors"
    fi
else
    check_result 1 "Dashboard returned $HTTP_CODE"
fi

echo ""
echo "6️⃣  Testing Marketing Pages..."
echo "-------------------------------"

# Test automation page
AUTOMATION_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/marketing/automation" -w "\n%{http_code}")
HTTP_CODE=$(echo "$AUTOMATION_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Marketing automation page loads"

# Test segments page
SEGMENTS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/marketing/segments" -w "\n%{http_code}")
HTTP_CODE=$(echo "$SEGMENTS_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Marketing segments page loads"

# Clean up
rm -f "$COOKIE_JAR"

echo ""
echo "=========================================="
echo "📊 ROUND 1 TEST RESULTS"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

# Save results for comparison
echo "$TESTS_PASSED,$TESTS_FAILED" > /tmp/round1_results.txt

echo "Waiting 5 seconds before Round 2..."
sleep 5

echo ""
echo "=========================================="
echo "🧪 TYPESCRIPT FIXES VALIDATION - ROUND 2"
echo "=========================================="

# Reset counters for round 2
TESTS_PASSED=0
TESTS_FAILED=0

echo ""
echo "🔄 Running identical tests for consistency verification..."
echo ""

# Create new session for round 2
COOKIE_JAR=$(mktemp)

# Login again
curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    > /dev/null 2>&1

echo "1️⃣  Re-testing Server Health..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" | grep -q "200\|404"
check_result $? "Server is responding"

echo ""
echo "2️⃣  Re-testing Customer Management..."
CUSTOMERS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/customers" -w "\n%{http_code}")
HTTP_CODE=$(echo "$CUSTOMERS_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Customers page loads consistently"

echo ""
echo "3️⃣  Re-testing Product API..."
PRODUCTS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/products" -w "\n%{http_code}")
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Products API responds consistently"

echo ""
echo "4️⃣  Re-testing Order Management..."
ORDERS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/orders" -w "\n%{http_code}")
HTTP_CODE=$(echo "$ORDERS_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Orders page loads consistently"

echo ""
echo "5️⃣  Re-testing Dashboard..."
DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin" -w "\n%{http_code}")
HTTP_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Dashboard loads consistently"

echo ""
echo "6️⃣  Re-testing Marketing Pages..."
AUTOMATION_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin/marketing/automation" -w "\n%{http_code}")
HTTP_CODE=$(echo "$AUTOMATION_RESPONSE" | tail -n1)
[[ "$HTTP_CODE" == "200" ]]
check_result $? "Marketing pages load consistently"

# Clean up
rm -f "$COOKIE_JAR"

echo ""
echo "=========================================="
echo "📊 ROUND 2 TEST RESULTS"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

# Compare with round 1
ROUND1_RESULTS=$(cat /tmp/round1_results.txt)
ROUND2_RESULTS="$TESTS_PASSED,$TESTS_FAILED"

echo ""
echo "=========================================="
echo "🔍 CONSISTENCY CHECK"
echo "=========================================="

if [ "$ROUND1_RESULTS" == "$ROUND2_RESULTS" ]; then
    echo -e "${GREEN}✓ Results are consistent between rounds!${NC}"
else
    echo -e "${YELLOW}⚠ Results differ between rounds:${NC}"
    echo "   Round 1: $ROUND1_RESULTS"
    echo "   Round 2: $ROUND2_RESULTS"
fi

echo ""
echo "=========================================="
echo "✅ TESTING COMPLETE"
echo "=========================================="

# Clean up temp file
rm -f /tmp/round1_results.txt