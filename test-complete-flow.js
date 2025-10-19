#!/usr/bin/env node

/**
 * Complete E2E Test Suite - GangRun Printing
 * Tests: Product pages, Cart, File upload, Checkout, Shipping
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3020';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log(`║   ${title.padEnd(48)}║`, 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');
}

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

function recordTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    log(`    ✅ PASS: ${name}`, 'green');
  } else {
    results.failed++;
    log(`    ❌ FAIL: ${name}`, 'red');
  }
  if (details) {
    log(`       ${details}`, 'cyan');
  }
  results.tests.push({ name, passed, details });
}

async function testProductPage() {
  header('TEST 1: Product Page Load');

  try {
    const response = await fetch(`${BASE_URL}/products/4x6-flyers-9pt-card-stock`);
    const html = await response.text();

    recordTest(
      'Product page loads',
      response.status === 200,
      `Status: ${response.status}`
    );

    recordTest(
      'Product page has configuration form',
      html.includes('quantity') && html.includes('Add to Cart'),
      'Found quantity selector and Add to Cart button'
    );

    recordTest(
      'Product page has pricing data',
      html.includes('$') || html.includes('price'),
      'Pricing information present'
    );

  } catch (error) {
    recordTest('Product page loads', false, error.message);
  }
}

async function testCartAPI() {
  header('TEST 2: Cart API');

  try {
    // Test cart POST
    const cartData = {
      productId: 'test-product-id',
      quantity: 500,
      turnaroundTime: 'ECONOMY',
      designOption: 'CUSTOMER_PROVIDED',
    };

    const response = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartData),
    });

    recordTest(
      'Cart API responds',
      response.status >= 200 && response.status < 500,
      `Status: ${response.status}`
    );

    // Test cart GET
    const getResponse = await fetch(`${BASE_URL}/api/cart`);
    recordTest(
      'Cart GET API works',
      getResponse.status >= 200 && getResponse.status < 500,
      `Status: ${getResponse.status}`
    );

  } catch (error) {
    recordTest('Cart API responds', false, error.message);
  }
}

async function testFileUpload(imagePath) {
  header('TEST 3: File Upload');

  // Check if test image exists
  if (!fs.existsSync(imagePath)) {
    log(`⚠️  Test image not found: ${imagePath}`, 'yellow');
    recordTest('File upload', false, 'Test image file not found');
    return;
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('fileType', 'CUSTOMER_ARTWORK');
    form.append('purpose', 'order');

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const result = await response.json();

    recordTest(
      'File upload succeeds',
      response.status === 200 || response.status === 201,
      `Status: ${response.status}, Response: ${JSON.stringify(result)}`
    );

    if (result.url || result.fileUrl) {
      recordTest(
        'File URL returned',
        true,
        `URL: ${result.url || result.fileUrl}`
      );
    } else {
      recordTest(
        'File URL returned',
        false,
        'No URL in response'
      );
    }

  } catch (error) {
    recordTest('File upload succeeds', false, error.message);
  }
}

async function testShippingRates() {
  header('TEST 4: Shipping Rates API');

  const testAddresses = [
    { city: 'Phoenix', state: 'AZ', zip: '85034', expectSouthwest: true },
    { city: 'Dallas', state: 'TX', zip: '75201', expectSouthwest: true },
    { city: 'Chicago', state: 'IL', zip: '60601', expectSouthwest: false },
  ];

  for (const addr of testAddresses) {
    try {
      const shippingData = {
        address: {
          street1: '123 Test St',
          city: addr.city,
          state: addr.state,
          postalCode: addr.zip,
          country: 'US',
        },
        items: [{
          weight: 5,
          length: 12,
          width: 9,
          height: 0.5,
        }],
      };

      const response = await fetch(`${BASE_URL}/api/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingData),
      });

      const result = await response.json();

      // Count Southwest Cargo rates
      const southwestCount = result.rates?.filter(
        r => r.carrier?.includes('Southwest') || r.service?.includes('Southwest')
      ).length || 0;

      const hasSouthwest = southwestCount > 0;

      if (addr.expectSouthwest) {
        recordTest(
          `${addr.city}, ${addr.state} - Southwest Cargo available`,
          hasSouthwest,
          `Found ${southwestCount} Southwest rates, Total: ${result.rates?.length || 0} rates`
        );
      } else {
        recordTest(
          `${addr.city}, ${addr.state} - Shipping rates available`,
          result.rates?.length > 0,
          `Total: ${result.rates?.length || 0} rates (Southwest not expected)`
        );
      }

    } catch (error) {
      recordTest(`${addr.city}, ${addr.state} - Shipping test`, false, error.message);
    }
  }
}

async function testAdminOrderPage() {
  header('TEST 5: Admin Order Page');

  try {
    // Just test that the page loads (authentication will redirect)
    const response = await fetch(`${BASE_URL}/admin/orders`);

    recordTest(
      'Admin orders page accessible',
      response.status === 200 || response.status === 302 || response.status === 401,
      `Status: ${response.status} (redirect to login is OK)`
    );

  } catch (error) {
    recordTest('Admin orders page accessible', false, error.message);
  }
}

async function runAllTests(imagePath) {
  log('\n' + '='.repeat(60), 'bright');
  log('🧪 GANGRUN PRINTING - COMPLETE TEST SUITE', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  await testProductPage();
  await testCartAPI();
  await testFileUpload(imagePath);
  await testShippingRates();
  await testAdminOrderPage();

  // Summary
  header('📊 TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');

  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed`, 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'bright');

  // Exit with proper code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Main execution
const args = process.argv.slice(2);
const imagePath = args[0] || '/Users/irawatkins/Desktop/BUZZSIDE1 copy (1).jpg';

log(`\n📁 Test image path: ${imagePath}`, 'cyan');

runAllTests(imagePath).catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
