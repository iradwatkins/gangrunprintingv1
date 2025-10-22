#!/bin/bash

echo "🧪 Testing Southwest Cargo Shipping API"
echo "========================================"
echo ""
echo "📍 Testing Chicago, IL address (2740 W 83rd Place, 60652)"
echo ""

curl -X POST https://gangrunprinting.com/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": {
      "street": "2740 W 83rd Place",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60652",
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
echo "✅ Test complete!"
echo ""
echo "Expected result:"
echo "  - Should show FedEx rates (Ground, 2Day, Overnight)"
echo "  - Should show Southwest Cargo rates (PICKUP and DASH)"
echo "  - Southwest Cargo rates should have carrier: 'SOUTHWEST_CARGO'"
