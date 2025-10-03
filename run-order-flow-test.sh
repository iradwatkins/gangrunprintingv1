#!/bin/bash

# Complete Customer Order Flow Test Runner
# Tests the specific product page and checkout flow as requested

echo "🧪 Starting Complete Customer Order Flow Test"
echo "================================================"
echo "🎯 Target URL: https://gangrunprinting.com/products/asdfasd"
echo "📧 Customer: appvillagellc@gmail.com"
echo "🔄 Running 5 test iterations"
echo "================================================"

# Create screenshots directory if it doesn't exist
mkdir -p screenshots/order-flow-test

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not found. Please install Node.js."
    exit 1
fi

# Check if Puppeteer is installed
if ! npm list puppeteer &> /dev/null; then
    echo "❌ Puppeteer is not installed. Installing..."
    npm install puppeteer
fi

echo "🚀 Starting test execution..."
echo ""

# Run the test
node test-complete-customer-order-flow.js

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "================================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests completed successfully!"
else
    echo "❌ Some tests failed. Check the detailed report for more information."
fi

echo "📄 Test report: order-flow-test-report.json"
echo "📸 Screenshots: screenshots/order-flow-test/"
echo "================================================"

exit $TEST_EXIT_CODE