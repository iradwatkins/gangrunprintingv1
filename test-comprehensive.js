#!/usr/bin/env node

/**
 * Comprehensive testing script for GangRun Printing
 * Tests all critical functionality
 */

const BASE_URL = 'http://localhost:3002';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testPassed(testName) {
  passedTests++;
  totalTests++;
  log(`  ✅ ${testName}`, colors.green);
}

function testFailed(testName, error) {
  failedTests++;
  totalTests++;
  log(`  ❌ ${testName}`, colors.red);
  if (error) {
    log(`     Error: ${error}`, colors.red);
  }
}

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

async function testHealthCheck() {
  log('\n📋 Testing Health Check...', colors.cyan);

  try {
    const data = await fetchJSON(`${BASE_URL}/api/health`);
    if (data.status === 'healthy') {
      testPassed('Health check endpoint');
    } else {
      testFailed('Health check endpoint', 'Status not healthy');
    }
  } catch (error) {
    testFailed('Health check endpoint', error.message);
  }
}

async function testProductsAPI() {
  log('\n📋 Testing Products API...', colors.cyan);

  try {
    // Test product listing
    const listData = await fetchJSON(`${BASE_URL}/api/products`);

    if (listData.success && listData.data) {
      testPassed('Product list endpoint');

      // Check for products
      if (listData.data.length > 0) {
        testPassed(`Found ${listData.data.length} products`);

        // Check first product structure
        const product = listData.data[0];

        // Check basic fields
        if (product.Name && product.Id) {
          testPassed('Product has basic fields (Name, Id)');
        } else {
          testFailed('Product missing basic fields');
        }

        // Check configuration groups
        const hasConfig =
          (product.productSizeGroups && product.productSizeGroups.length > 0) ||
          (product.productQuantityGroups && product.productQuantityGroups.length > 0) ||
          (product.productPaperStockSets && product.productPaperStockSets.length > 0);

        if (hasConfig) {
          testPassed('Product has configuration groups');
        } else {
          testFailed('Product missing configuration groups');
        }

        // Test individual product endpoint
        const detailData = await fetchJSON(`${BASE_URL}/api/products/${product.Id}`);

        if (detailData.success && detailData.data) {
          testPassed('Product detail endpoint');

          // Check for detailed configuration
          const detail = detailData.data;
          if (detail.productSizeGroups || detail.productQuantityGroups) {
            testPassed('Product detail includes configuration');
          } else {
            testFailed('Product detail missing configuration');
          }
        } else {
          testFailed('Product detail endpoint');
        }
      } else {
        testFailed('No products found in database');
      }
    } else {
      testFailed('Product list endpoint', 'Invalid response format');
    }
  } catch (error) {
    testFailed('Products API', error.message);
  }
}

async function testConfigurationAPIs() {
  log('\n📋 Testing Configuration APIs...', colors.cyan);

  const endpoints = [
    { name: 'Paper Stock Sets', url: '/api/paper-stock-sets' },
    { name: 'Size Groups', url: '/api/size-groups' },
    { name: 'Quantity Groups', url: '/api/quantity-groups' },
    { name: 'Turnaround Time Sets', url: '/api/turnaround-time-sets' },
    { name: 'AddOn Sets', url: '/api/addon-sets' },
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await fetchJSON(`${BASE_URL}${endpoint.url}`);
      if (data && (Array.isArray(data) || data.data)) {
        testPassed(`${endpoint.name} API`);
      } else {
        testFailed(`${endpoint.name} API`, 'Invalid response');
      }
    } catch (error) {
      testFailed(`${endpoint.name} API`, error.message);
    }
  }
}

async function testAuthentication() {
  log('\n📋 Testing Authentication...', colors.cyan);

  try {
    // Test session check
    const response = await fetch(`${BASE_URL}/api/auth/me`);

    if (response.status === 401 || response.status === 200) {
      testPassed('Auth check endpoint responds');
    } else {
      testFailed('Auth check endpoint', `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    testFailed('Authentication API', error.message);
  }
}

async function testWebPages() {
  log('\n📋 Testing Web Pages...', colors.cyan);

  const pages = [
    { name: 'Homepage', url: '/' },
    { name: 'Products Page', url: '/products' },
    { name: 'Admin Login', url: '/auth/signin' },
    { name: 'Cart', url: '/cart' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' },
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.url}`);

      if (response.ok) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html>')) {
          testPassed(`${page.name} loads`);
        } else {
          testFailed(`${page.name}`, 'Invalid HTML response');
        }
      } else {
        testFailed(`${page.name}`, `HTTP ${response.status}`);
      }
    } catch (error) {
      testFailed(`${page.name}`, error.message);
    }
  }
}

async function testDatabaseIntegrity() {
  log('\n📋 Testing Database Integrity...', colors.cyan);

  try {
    // Check products have proper relationships
    const products = await fetchJSON(`${BASE_URL}/api/products`);

    if (products.success && products.data) {
      let configuredProducts = 0;
      let unconfiguredProducts = 0;

      for (const product of products.data) {
        const hasConfig =
          (product.productSizeGroups && product.productSizeGroups.length > 0) ||
          (product.productQuantityGroups && product.productQuantityGroups.length > 0) ||
          (product.productPaperStockSets && product.productPaperStockSets.length > 0);

        if (hasConfig) {
          configuredProducts++;
        } else {
          unconfiguredProducts++;
        }
      }

      log(`  📊 Configured products: ${configuredProducts}/${products.data.length}`, colors.yellow);

      if (configuredProducts === products.data.length) {
        testPassed('All products have configuration');
      } else if (configuredProducts > 0) {
        testFailed('Some products missing configuration', `${unconfiguredProducts} products not configured`);
      } else {
        testFailed('No products have configuration');
      }
    }
  } catch (error) {
    testFailed('Database integrity check', error.message);
  }
}

async function runAllTests() {
  log('\n🚀 Starting Comprehensive Testing Suite for GangRun Printing', colors.magenta);
  log('=' .repeat(60), colors.magenta);

  // Wait a bit for the server to be ready
  log('\n⏳ Waiting for server to be ready...', colors.yellow);
  await new Promise(resolve => setTimeout(resolve, 3000));

  await testHealthCheck();
  await testProductsAPI();
  await testConfigurationAPIs();
  await testAuthentication();
  await testWebPages();
  await testDatabaseIntegrity();

  // Summary
  log('\n' + '=' .repeat(60), colors.magenta);
  log('📊 Test Summary:', colors.magenta);
  log(`  Total Tests: ${totalTests}`, colors.blue);
  log(`  Passed: ${passedTests}`, colors.green);
  log(`  Failed: ${failedTests}`, colors.red);

  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  if (failedTests === 0) {
    log(`\n✅ ALL TESTS PASSED! (${successRate}% success rate)`, colors.green);
  } else {
    log(`\n⚠️  SOME TESTS FAILED (${successRate}% success rate)`, colors.yellow);
    log('   Please review the failures above.', colors.yellow);
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, colors.red);
  process.exit(1);
});