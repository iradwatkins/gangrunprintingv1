# Complete Customer Order Flow Test Suite

This test suite automates the complete customer order flow on the GangRun Printing website using Puppeteer to ensure the checkout process works correctly.

## Test Overview

**Target URL:** https://gangrunprinting.com/products/asdfasd  
**Customer Info:** appvillagellc@gmail.com, Test Customer, (773) 123-4567  
**Address:** 2740 West 83rd Pl, Chicago, IL 60652

## Test Steps

1. Navigate to the product page
2. Add product to cart (using default configuration)
3. Navigate to cart page
4. Proceed to checkout
5. Fill customer information
6. Continue to shipping step
7. Select shipping method and continue to payment
8. Choose "Test Cash Payment" method
9. Complete the order
10. Capture order confirmation

## Available Test Scripts

### 1. Single Test Run (Recommended First)
```bash
node test-single-order-flow.js
```
- Runs one complete test iteration
- Good for validation and debugging
- Faster execution for quick checks

### 2. Complete 5-Iteration Test
```bash
node test-complete-customer-order-flow-fixed.js
```
- Runs 5 complete test iterations
- Tests consistency and reliability
- Generates comprehensive report

### 3. Original Test (For Reference)
```bash
node test-complete-customer-order-flow.js
```
- Original version (may have issues with multi-step checkout)
- Kept for comparison

## Test Features

- **Screenshots:** Captures screenshots at each step
- **Error Handling:** Graceful error handling with detailed logging
- **Progress Tracking:** Real-time progress updates with colored output
- **Detailed Reporting:** JSON reports with step-by-step results
- **Multi-step Checkout:** Properly handles Information → Shipping → Payment → Review flow

## Configuration

You can modify these settings in the test files:

```javascript
const HEADLESS = false; // Set to true for headless mode
const SLOW_MO = 150;    // Milliseconds between actions
const VIEWPORT = { width: 1920, height: 1080 };
```

## Output Files

### Screenshots
- **Location:** `screenshots/order-flow-test-fixed/`
- **Naming:** `test-{run}-{step}-{description}-{timestamp}.png`
- **Types:** Each step + error screenshots

### Reports
- **File:** `order-flow-test-report-fixed.json`
- **Contains:** 
  - Test metadata
  - Summary statistics
  - Detailed results for each test run
  - Step-by-step success/failure data

## Troubleshooting

### Common Issues

1. **Product Configuration Not Loading**
   - Test waits for configuration elements to load
   - Falls back to adding to cart with default options

2. **Multi-step Checkout Issues**
   - Test properly handles Information → Shipping → Payment flow
   - Looks for "Continue to..." buttons at each step

3. **Payment Method Not Found**
   - Test searches for "Test Cash Payment", "Cash Payment", or "Cash"
   - Logs available payment options for debugging

4. **Browser Launch Issues**
   - Make sure Puppeteer is installed: `npm install puppeteer`
   - Try headless mode if GUI issues occur

### Debug Mode

Set `HEADLESS = false` in the test file to watch the browser automation in real-time.

## Expected Results

A successful test run should:
- Complete all 9 steps successfully
- Generate an order number or confirmation
- Create screenshots for each step
- Show "✅ TEST COMPLETED SUCCESSFULLY!" message

## Report Analysis

Check the JSON report for:
- **Success Rate:** Should be close to 100% for a working checkout flow
- **Failed Steps:** Identify which parts of checkout are problematic
- **Error Messages:** Specific issues encountered during testing

## Requirements

- Node.js (v14 or higher)
- Puppeteer (installed via npm)
- Internet connection
- Working GangRun Printing website at https://gangrunprinting.com

## Notes

- Tests use real website interaction but with test customer data
- Each test run is independent (separate browser instance)
- Screenshots help identify exactly where issues occur
- Tests are designed to be non-destructive (using test payment method)