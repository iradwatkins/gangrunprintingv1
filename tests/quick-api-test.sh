#!/bin/bash

BASE_URL="http://localhost:3002"
TIMESTAMP=$(date +%s)

echo "=========================================="
echo "     ADMIN API ENDPOINTS TEST"
echo "=========================================="

# Test Categories
echo -n "Testing Categories API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/product-categories)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Paper Stocks
echo -n "Testing Paper Stocks API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/paper-stocks)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Paper Stock Sets
echo -n "Testing Paper Stock Sets API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/paper-stock-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Quantities
echo -n "Testing Quantities API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/quantities)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Sizes
echo -n "Testing Sizes API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/sizes)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Add-ons
echo -n "Testing Add-ons API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/add-ons)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Add-on Sets
echo -n "Testing Add-on Sets API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/addon-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Turnaround Times
echo -n "Testing Turnaround Times API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/turnaround-times)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Turnaround Time Sets
echo -n "Testing Turnaround Time Sets API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/turnaround-time-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

# Test Products
echo -n "Testing Products API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/products)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo ""
echo "=========================================="
echo "     TESTING CREATE/UPDATE/DELETE"
echo "=========================================="

# Test CRUD for Add-on
echo -n "Testing Add-on CRUD... "
# Create
CREATE_RESULT=$(curl -s -X POST $BASE_URL/api/add-ons \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Addon $TIMESTAMP\",\"category\":\"COATING\",\"pricingType\":\"FLAT\",\"flatPrice\":25,\"isActive\":true}")
ADDON_ID=$(echo $CREATE_RESULT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$ADDON_ID" ]; then
  # Update
  UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/api/add-ons/$ADDON_ID \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Updated Test Addon $TIMESTAMP\"}")
  # Delete
  DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/api/add-ons/$ADDON_ID)
  if [ "$UPDATE_RESPONSE" = "200" ] && [ "$DELETE_RESPONSE" = "200" ]; then
    echo "✅ OK"
  else
    echo "❌ Failed (Update: $UPDATE_RESPONSE, Delete: $DELETE_RESPONSE)"
  fi
else
  echo "❌ Failed to create"
fi

# Test CRUD for Size
echo -n "Testing Size CRUD... "
# Create
CREATE_RESULT=$(curl -s -X POST $BASE_URL/api/sizes \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Size $TIMESTAMP\",\"width\":8.5,\"height\":11,\"unit\":\"INCH\",\"groupName\":\"Test\",\"isActive\":true}")
SIZE_ID=$(echo $CREATE_RESULT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$SIZE_ID" ]; then
  # Update
  UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/api/sizes/$SIZE_ID \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Updated Test Size $TIMESTAMP\"}")
  # Delete
  DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/api/sizes/$SIZE_ID)
  if [ "$UPDATE_RESPONSE" = "200" ] && [ "$DELETE_RESPONSE" = "200" ]; then
    echo "✅ OK"
  else
    echo "❌ Failed (Update: $UPDATE_RESPONSE, Delete: $DELETE_RESPONSE)"
  fi
else
  echo "❌ Failed to create"
fi

# Test CRUD for Quantity
echo -n "Testing Quantity CRUD... "
# Create
CREATE_RESULT=$(curl -s -X POST $BASE_URL/api/quantities \
  -H "Content-Type: application/json" \
  -d "{\"quantity\":$((RANDOM % 10000)),\"displayName\":\"Test Qty $TIMESTAMP\",\"groupName\":\"Test\",\"isActive\":true}")
QTY_ID=$(echo $CREATE_RESULT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$QTY_ID" ]; then
  # Update
  UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/api/quantities/$QTY_ID \
    -H "Content-Type: application/json" \
    -d "{\"displayName\":\"Updated Test Qty $TIMESTAMP\"}")
  # Delete
  DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/api/quantities/$QTY_ID)
  if [ "$UPDATE_RESPONSE" = "200" ] && [ "$DELETE_RESPONSE" = "200" ]; then
    echo "✅ OK"
  else
    echo "❌ Failed (Update: $UPDATE_RESPONSE, Delete: $DELETE_RESPONSE)"
  fi
else
  echo "❌ Failed to create"
fi

# Test CRUD for Turnaround Time
echo -n "Testing Turnaround Time CRUD... "
# Create
CREATE_RESULT=$(curl -s -X POST $BASE_URL/api/turnaround-times \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Turnaround $TIMESTAMP\",\"businessDays\":5,\"price\":50,\"isDefault\":false,\"isActive\":true}")
TT_ID=$(echo $CREATE_RESULT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$TT_ID" ]; then
  # Update
  UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/api/turnaround-times/$TT_ID \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Updated Test Turnaround $TIMESTAMP\"}")
  # Delete
  DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/api/turnaround-times/$TT_ID)
  if [ "$UPDATE_RESPONSE" = "200" ] && [ "$DELETE_RESPONSE" = "200" ]; then
    echo "✅ OK"
  else
    echo "❌ Failed (Update: $UPDATE_RESPONSE, Delete: $DELETE_RESPONSE)"
  fi
else
  echo "❌ Failed to create"
fi

echo ""
echo "=========================================="
echo "     TESTING ADMIN PAGES"
echo "=========================================="

# Test Admin Pages
echo -n "Testing Categories Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/categories)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Paper Stocks Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/paper-stocks)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Paper Stock Sets Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/paper-stock-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Quantities Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/quantities)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Sizes Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/sizes)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Add-ons Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/add-ons)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Add-on Sets Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/addon-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Turnaround Times Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/turnaround-times)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Turnaround Time Sets Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/turnaround-time-sets)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo -n "Testing Products Page... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/products)
if [ "$RESPONSE" = "200" ]; then echo "✅ OK"; else echo "❌ Failed ($RESPONSE)"; fi

echo ""
echo "=========================================="
echo "     TEST COMPLETE"
echo "=========================================="