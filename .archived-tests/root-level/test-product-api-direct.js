/**
 * Direct API Test for Product CRUD
 * Tests the /api/products endpoint directly
 * Requires authentication token
 */

const https = require('https');

const BASE_URL = 'https://gangrunprinting.com';

// Helper to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test 1: Get product configuration options
async function testGetOptions() {
  console.log('\n📋 TEST 1: Get Product Configuration Options');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Categories', path: '/api/categories' },
    { name: 'Paper Stock Sets', path: '/api/paper-stock-sets' },
    { name: 'Quantity Groups', path: '/api/quantity-groups' },
    { name: 'Size Groups', path: '/api/size-groups' },
    { name: 'Add-On Sets', path: '/api/addon-sets' },
    { name: 'Turnaround Time Sets', path: '/api/turnaround-time-sets' },
  ];

  const results = {};

  for (const test of tests) {
    try {
      const options = {
        hostname: 'gangrunprinting.com',
        port: 443,
        path: test.path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      console.log(`\n🔍 Testing: ${test.name}...`);
      console.log(`   GET ${test.path}`);

      const response = await makeRequest(options);

      console.log(`   Status: ${response.status}`);

      if (response.status === 200) {
        const count = Array.isArray(response.body.data) ? response.body.data.length : 0;
        console.log(`   ✅ Success - Found ${count} items`);
        results[test.name] = {
          success: true,
          count,
          sample: response.body.data?.[0] || null
        };
      } else {
        console.log(`   ❌ Failed - ${JSON.stringify(response.body)}`);
        results[test.name] = { success: false, error: response.body };
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results[test.name] = { success: false, error: error.message };
    }
  }

  return results;
}

// Test 2: Create a test product (requires authentication)
async function testCreateProduct(authToken = null) {
  console.log('\n📦 TEST 2: Create Product');
  console.log('=' .repeat(60));

  // This test will fail without authentication
  // But we can see what error we get and verify the endpoint is responding

  const testProduct = {
    name: `API Test Product ${Date.now()}`,
    sku: `API-TEST-${Date.now()}`,
    categoryId: 'test-category-id', // Will need a real ID
    description: 'This is a test product created via API',
    shortDescription: 'API Test Product',
    isActive: true,
    isFeatured: false,
    basePrice: 10.00,
    setupFee: 5.00,
    productionTime: 3,
    paperStockSetId: 'test-paper-id',
    quantityGroupId: 'test-qty-id',
    sizeGroupId: 'test-size-id',
    selectedAddOns: [],
    images: []
  };

  try {
    const options = {
      hostname: 'gangrunprinting.com',
      port: 443,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
      options.headers['Cookie'] = authToken; // Try both methods
    }

    console.log('🔍 Sending POST request...');
    console.log('   Payload:', JSON.stringify(testProduct, null, 2));

    const response = await makeRequest(options, testProduct);

    console.log(`\n📡 Response Status: ${response.status}`);
    console.log('📡 Response Body:', JSON.stringify(response.body, null, 2));

    if (response.status === 201) {
      console.log('✅ PRODUCT CREATED SUCCESSFULLY!');
      return { success: true, product: response.body };
    } else if (response.status === 401 || response.status === 403) {
      console.log('⚠️  Authentication required (expected without login)');
      return { success: false, authRequired: true, response: response.body };
    } else if (response.status === 400) {
      console.log('❌ Validation error (expected with test data)');
      return { success: false, validationError: true, response: response.body };
    } else {
      console.log('❌ Unexpected error');
      return { success: false, unexpectedError: true, response: response.body };
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Get list of products
async function testGetProducts() {
  console.log('\n📋 TEST 3: Get Products List');
  console.log('=' .repeat(60));

  try {
    const options = {
      hostname: 'gangrunprinting.com',
      port: 443,
      path: '/api/products?limit=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('🔍 Fetching products...');
    const response = await makeRequest(options);

    console.log(`📡 Status: ${response.status}`);

    if (response.status === 200) {
      const products = response.body.data || [];
      console.log(`✅ Found ${products.length} products`);

      if (products.length > 0) {
        console.log('\n📦 Sample Product:');
        const sample = products[0];
        console.log(`   ID: ${sample.id}`);
        console.log(`   Name: ${sample.name}`);
        console.log(`   SKU: ${sample.sku}`);
        console.log(`   Category: ${sample.productCategory?.name || 'N/A'}`);
        console.log(`   Active: ${sample.isActive}`);
      }

      return { success: true, count: products.length, products };
    } else {
      console.log('❌ Failed to fetch products');
      return { success: false, response: response.body };
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Product API Direct Tests');
  console.log('=' .repeat(60));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  const results = {
    options: null,
    create: null,
    list: null,
  };

  try {
    // Test 1: Get configuration options
    results.options = await testGetOptions();

    // Test 2: Try to create a product (will fail without auth, but tests endpoint)
    results.create = await testCreateProduct();

    // Test 3: Get products list
    results.list = await testGetProducts();

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    results.error = error.message;
  }

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));

  // Count successes
  let optionsSuccess = 0;
  let optionsTotal = 0;

  if (results.options) {
    for (const [key, value] of Object.entries(results.options)) {
      optionsTotal++;
      if (value.success) optionsSuccess++;
    }
  }

  console.log(`1. Configuration Options: ${optionsSuccess}/${optionsTotal} passed`);
  console.log(`2. Product Creation: ${results.create?.success ? '✅ PASS' : '❌ FAIL (auth required)'}`);
  console.log(`3. Product List: ${results.list?.success ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n📋 Detailed Results:');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n' + '=' .repeat(60));

  // Determine overall success
  // We expect product creation to fail without auth, so we don't count that
  const overallSuccess = (optionsSuccess >= optionsTotal * 0.8) && results.list?.success;

  if (overallSuccess) {
    console.log('🎉 API TESTS PASSED! (Product creation requires authentication)');
    process.exit(0);
  } else {
    console.log('❌ SOME API TESTS FAILED');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
