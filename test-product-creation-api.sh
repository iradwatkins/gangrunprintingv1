#!/bin/bash

# Step 1: Login to get session cookie
echo "=== STEP 1: Logging in to get session cookie ==="
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST https://gangrunprinting.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "iradwatkins@gmail.com",
    "password": "Iw2006js!"
  }')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Step 2: Test product creation with real data
echo "=== STEP 2: Creating product with real data ==="

PRODUCT_DATA='{
  "name": "Test Product - API Investigation",
  "slug": "test-product-api-investigation",
  "description": "This is a test product created during API error investigation.",
  "categoryId": "cat_banner",
  "paperStockId": "cmg46sc60000f12ymdo48kpb0",
  "quantityGroupId": "cmg5i6poy000094pu856umjxa",
  "sizeGroupId": "b180aadd-1ed7-42e5-9640-9460a58e9f72",
  "turnaroundTimeGroupId": "cmg46sc7u001k12ymd9w3p9uk",
  "basePrice": 25.99,
  "isActive": true
}'

echo "Request Body:"
echo "$PRODUCT_DATA" | jq '.'
echo ""

# Make the request and capture full response
RESPONSE=$(curl -v -b cookies.txt -X POST https://gangrunprinting.com/api/products \
  -H "Content-Type: application/json" \
  -d "$PRODUCT_DATA" 2>&1)

echo "=== FULL RESPONSE ==="
echo "$RESPONSE"
echo ""

# Extract just the response body
BODY=$(echo "$RESPONSE" | sed -n '/^{/,/^}/p' | tail -1)

echo "=== RESPONSE BODY ==="
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Save to file
echo "$RESPONSE" > api-test-response.log
echo "Full response saved to: api-test-response.log"
