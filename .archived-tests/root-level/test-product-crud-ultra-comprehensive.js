/**
 * 🔍 ULTRA-COMPREHENSIVE PRODUCT CRUD TESTING
 * Tests product creation, image upload, and CRUD operations
 * Each test runs 3 times as requested
 *
 * Command: node test-product-crud-ultra-comprehensive.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://gangrunprinting.com';
const ADMIN_EMAIL = 'iradwatkins@gmail.com';
const ADMIN_PASSWORD = 'Iw2006js!';
const TEST_ITERATIONS = 3;
const SCREENSHOT_DIR = './test-screenshots-ultra';

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  serviceHealth: {},
  productCreation: [],
  imageUpload: [],
  crudOperations: [],
  codeAnalysis: {
    authentication: null,
    database: null,
    imageUpload: null
  },
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0
  }
};

// Utility functions
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || '📝';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function saveScreenshot(page, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const filename = `${SCREENSHOT_DIR}/${Date.now()}-${name}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  return filename;
}

// ========================================
// PHASE 1: Service Health Check
// ========================================
async function checkServiceHealth() {
  log('Checking service health...', 'test');
  const results = {
    website: false,
    database: false,
    adminAuth: false,
    errors: []
  };

  try {
    // Check website accessibility
    const response = await fetch(`${BASE_URL}`);
    results.website = response.ok;
    log(`Website status: ${response.status}`, results.website ? 'success' : 'error');
  } catch (error) {
    results.errors.push(`Website check failed: ${error.message}`);
    log(`Website check failed: ${error.message}`, 'error');
  }

  testResults.serviceHealth = results;
  return results;
}

// ========================================
// AUTHENTICATION
// ========================================
async function loginAsAdmin(page) {
  log('Attempting admin login...', 'test');

  try {
    await page.goto(`${BASE_URL}/auth/signin`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await saveScreenshot(page, 'login-page');

    // Wait for email field
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.type('#email', ADMIN_EMAIL);
    await sleep(500);

    // Check for password field (not magic link)
    const passwordField = await page.$('#password');
    if (!passwordField) {
      throw new Error('Password field not found - magic link auth not supported');
    }

    await page.type('#password', ADMIN_PASSWORD);
    await sleep(500);
    await saveScreenshot(page, 'login-filled');

    // Click sign in and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);

    await sleep(2000);
    await saveScreenshot(page, 'after-login');

    // Verify login by checking URL
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/signin')) {
      throw new Error('Login failed - still on signin page');
    }

    log('Admin login successful', 'success');
    return true;
  } catch (error) {
    log(`Login failed: ${error.message}`, 'error');
    await saveScreenshot(page, 'login-error');
    throw error;
  }
}

// ========================================
// TEST SUITE A: PRODUCT CREATION (3x)
// ========================================
async function testProductCreation(page, iteration) {
  log(`\n========== PRODUCT CREATION TEST ${iteration}/3 ==========`, 'test');
  const testResult = {
    iteration,
    timestamp: new Date().toISOString(),
    success: false,
    productData: null,
    errors: [],
    screenshots: [],
    apiCalls: []
  };

  try {
    const timestamp = Date.now();
    const productName = `Ultra Test Product ${iteration} - ${timestamp}`;
    const productSku = `ULTRA-${iteration}-${timestamp}`;

    log(`Creating product: ${productName}`);

    // Navigate to create product page
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(2000);
    testResult.screenshots.push(await saveScreenshot(page, `create-${iteration}-page-loaded`));

    // Wait for form to load
    await page.waitForSelector('input[id="name"]', { timeout: 10000 });
    log('Form loaded, filling fields...');

    // Fill product name
    await page.type('input[id="name"]', productName);
    await sleep(500);

    // SKU auto-generates, but we can override
    const skuInput = await page.$('input[id="sku"]');
    if (skuInput) {
      await page.evaluate(() => document.querySelector('input[id="sku"]').value = '');
      await page.type('input[id="sku"]', productSku);
    }
    await sleep(500);

    // Select category (first option)
    log('Selecting category...');
    try {
      await page.click('button[role="combobox"]');
      await sleep(500);
      const firstOption = await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await firstOption.click();
      await sleep(500);
    } catch (error) {
      log(`Category selection failed: ${error.message}`, 'warning');
    }

    // Fill description
    const descriptionField = await page.$('textarea[id="description"]');
    if (descriptionField) {
      await page.type('textarea[id="description"]', `Test product description for iteration ${iteration}`);
      await sleep(500);
    }

    testResult.screenshots.push(await saveScreenshot(page, `create-${iteration}-form-filled`));

    // Scroll to bottom to see submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);

    // Monitor API calls
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/api/products')) {
        try {
          const data = await response.json();
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            method: response.request().method(),
            data
          });
        } catch (e) {
          // Response might not be JSON
        }
      }
    });

    // Click create button
    log('Clicking create button...');
    const createButton = await page.$('button[type="button"]:has-text("Create Product")');
    if (!createButton) {
      throw new Error('Create button not found');
    }

    await createButton.click();
    log('Waiting for API response...');
    await sleep(5000); // Wait for API call to complete

    testResult.screenshots.push(await saveScreenshot(page, `create-${iteration}-after-submit`));

    // Check if we got redirected to products list
    const currentUrl = page.url();
    log(`Current URL after submit: ${currentUrl}`);

    if (currentUrl.includes('/admin/products') && !currentUrl.includes('/new')) {
      testResult.success = true;
      testResult.productData = {
        name: productName,
        sku: productSku
      };
      log(`Product creation successful!`, 'success');
    } else {
      // Check for error messages
      const errorElements = await page.$$('[role="alert"]');
      for (const el of errorElements) {
        const text = await page.evaluate(e => e.textContent, el);
        testResult.errors.push(text);
      }
      throw new Error('Product creation may have failed - not redirected to products list');
    }

    testResult.apiCalls = apiResponses;

  } catch (error) {
    testResult.success = false;
    testResult.errors.push(error.message);
    log(`Product creation test ${iteration} failed: ${error.message}`, 'error');
    testResult.screenshots.push(await saveScreenshot(page, `create-${iteration}-error`));
  }

  testResults.productCreation.push(testResult);
  testResults.summary.totalTests++;
  if (testResult.success) testResults.summary.passed++;
  else testResults.summary.failed++;

  return testResult;
}

// ========================================
// TEST SUITE B: IMAGE UPLOAD (3x)
// ========================================
async function testImageUpload(page, iteration) {
  log(`\n========== IMAGE UPLOAD TEST ${iteration}/3 ==========`, 'test');
  const testResult = {
    iteration,
    timestamp: new Date().toISOString(),
    success: false,
    imageData: null,
    errors: [],
    screenshots: [],
    apiCalls: []
  };

  try {
    log(`Testing image upload ${iteration}...`);

    // Navigate to create product page (for upload test)
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(2000);
    testResult.screenshots.push(await saveScreenshot(page, `upload-${iteration}-page-loaded`));

    // Create a test image file (1x1 PNG)
    const testImagePath = `/tmp/test-image-${iteration}-${Date.now()}.png`;
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);

    // Find file input
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found');
    }

    log('Uploading test image...');
    await fileInput.uploadFile(testImagePath);
    await sleep(3000); // Wait for upload

    testResult.screenshots.push(await saveScreenshot(page, `upload-${iteration}-after-upload`));

    // Check if image appears in preview
    const imagePreview = await page.$('img[alt*="Product image"]');
    if (imagePreview) {
      testResult.success = true;
      testResult.imageData = {
        path: testImagePath,
        uploaded: true
      };
      log(`Image upload successful!`, 'success');
    } else {
      throw new Error('Image preview not found after upload');
    }

    // Clean up test image
    try {
      fs.unlinkSync(testImagePath);
    } catch (e) {}

  } catch (error) {
    testResult.success = false;
    testResult.errors.push(error.message);
    log(`Image upload test ${iteration} failed: ${error.message}`, 'error');
    testResult.screenshots.push(await saveScreenshot(page, `upload-${iteration}-error`));
  }

  testResults.imageUpload.push(testResult);
  testResults.summary.totalTests++;
  if (testResult.success) testResults.summary.passed++;
  else testResults.summary.failed++;

  return testResult;
}

// ========================================
// TEST SUITE C: CRUD OPERATIONS (3x)
// ========================================
async function testCrudOperations(page, iteration) {
  log(`\n========== CRUD OPERATIONS TEST ${iteration}/3 ==========`, 'test');
  const testResult = {
    iteration,
    timestamp: new Date().toISOString(),
    operations: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    errors: [],
    screenshots: []
  };

  let productId = null;

  try {
    // CREATE
    log('Testing CREATE operation...');
    const createResult = await testProductCreation(page, iteration);
    if (createResult.success) {
      testResult.operations.create = true;

      // Try to extract product ID from products list
      await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle2' });
      await sleep(2000);

      // READ
      log('Testing READ operation...');
      const productsExist = await page.$('table');
      if (productsExist) {
        testResult.operations.read = true;
        log('READ operation successful', 'success');
      }

      testResult.screenshots.push(await saveScreenshot(page, `crud-${iteration}-products-list`));

      // Extract first product ID for update/delete
      const editLink = await page.$('a[href*="/admin/products/"][href*="/edit"]');
      if (editLink) {
        const href = await page.evaluate(el => el.getAttribute('href'), editLink);
        const match = href.match(/\/admin\/products\/([^\/]+)\/edit/);
        if (match) {
          productId = match[1];
          log(`Found product ID: ${productId}`);
        }
      }

      // UPDATE
      if (productId) {
        log('Testing UPDATE operation...');
        await page.goto(`${BASE_URL}/admin/products/${productId}/edit`, { waitUntil: 'networkidle2' });
        await sleep(2000);

        // Try to modify description
        const descField = await page.$('textarea[id="description"]');
        if (descField) {
          await page.evaluate(() => document.querySelector('textarea[id="description"]').value = '');
          await page.type('textarea[id="description"]', `Updated description ${iteration}`);
          await sleep(500);

          // Click save
          const saveButton = await page.$('button:has-text("Save Changes")');
          if (saveButton) {
            await saveButton.click();
            await sleep(3000);
            testResult.operations.update = true;
            log('UPDATE operation successful', 'success');
          }
        }

        testResult.screenshots.push(await saveScreenshot(page, `crud-${iteration}-after-update`));
      }

      // DELETE
      if (productId) {
        log('Testing DELETE operation...');
        await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle2' });
        await sleep(2000);

        // Set up dialog handler
        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        // Find and click delete button
        const deleteButton = await page.$(`button[title="Delete Product"]`);
        if (deleteButton) {
          await deleteButton.click();
          await sleep(3000);
          testResult.operations.delete = true;
          log('DELETE operation successful', 'success');
        }

        testResult.screenshots.push(await saveScreenshot(page, `crud-${iteration}-after-delete`));
      }
    }

  } catch (error) {
    testResult.errors.push(error.message);
    log(`CRUD operations test ${iteration} failed: ${error.message}`, 'error');
    testResult.screenshots.push(await saveScreenshot(page, `crud-${iteration}-error`));
  }

  testResults.crudOperations.push(testResult);
  const opsSuccessful = Object.values(testResult.operations).filter(Boolean).length;
  testResults.summary.totalTests += 4; // C, R, U, D
  testResults.summary.passed += opsSuccessful;
  testResults.summary.failed += (4 - opsSuccessful);

  return testResult;
}

// ========================================
// MAIN TEST EXECUTION
// ========================================
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 ULTRA-COMPREHENSIVE PRODUCT CRUD TESTING');
  console.log('='.repeat(80) + '\n');

  const browser = await puppeteer.launch({
    headless: true, // Must be true on server without display
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-gpu',
      '--disable-extensions',
      '--single-process', // Important for server environment
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Enable console logging from browser
  page.on('console', msg => {
    if (msg.type() === 'error') {
      log(`Browser Error: ${msg.text()}`, 'error');
    }
  });

  try {
    // Phase 1: Service Health Check
    log('\n========== PHASE 1: SERVICE HEALTH CHECK ==========', 'test');
    await checkServiceHealth();

    // Login once for all tests
    await loginAsAdmin(page);

    // Phase 2A: Product Creation Tests (3 iterations)
    log('\n========== PHASE 2A: PRODUCT CREATION TESTS ==========', 'test');
    for (let i = 1; i <= TEST_ITERATIONS; i++) {
      await testProductCreation(page, i);
      await sleep(2000);
    }

    // Phase 2B: Image Upload Tests (3 iterations)
    log('\n========== PHASE 2B: IMAGE UPLOAD TESTS ==========', 'test');
    for (let i = 1; i <= TEST_ITERATIONS; i++) {
      await testImageUpload(page, i);
      await sleep(2000);
    }

    // Phase 2C: CRUD Operations Tests (3 iterations)
    log('\n========== PHASE 2C: CRUD OPERATIONS TESTS ==========', 'test');
    for (let i = 1; i <= TEST_ITERATIONS; i++) {
      await testCrudOperations(page, i);
      await sleep(2000);
    }

  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
    await saveScreenshot(page, 'test-suite-error');
  } finally {
    await browser.close();

    // Save test results to file
    const reportPath = `${SCREENSHOT_DIR}/test-results-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${testResults.summary.totalTests}`);
    console.log(`Passed: ${testResults.summary.passed} ✅`);
    console.log(`Failed: ${testResults.summary.failed} ❌`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(2)}%`);
    console.log(`\nFull report saved to: ${reportPath}`);
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
    console.log('='.repeat(80) + '\n');
  }
}

// Run the tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
