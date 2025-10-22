#!/bin/bash

echo "🧪 Testing Southwest Cargo Shipping API - Los Angeles, CA"
echo "========================================"
echo ""
echo "📍 Testing Los Angeles, CA (Southwest Cargo airport: LAX)"
echo ""

curl -X POST https://gangrunprinting.com/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": {
      "street": "123 Main Street",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "US",
      "isResidential": true
    },
    "items": [
      {
        "productId": "test-product",
        "quantity": 100,
        "width": 3.5,
        "height": 2,
        "paperStockWeight": 0.0012
      }
    ]
  }' | jq '.'

echo ""
echo "========================================"
echo ""
echo "Expected result:"
echo "  ✅ FedEx rates (Ground, 2Day, Overnight)"
echo "  ✅ Southwest Cargo PICKUP (~\$80 for <50 lbs)"
echo "  ✅ Southwest Cargo DASH (~\$100 for <25 lbs)"
echo ""
echo "CA is in airport list, so Southwest should appear!"
