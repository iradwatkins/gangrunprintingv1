/**
 * Product CRUD Test Suite - Using Puppeteer to test product creation
 * This script tests the complete product lifecycle: Create, Read, Update, Delete
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://gangrunprinting.com';
const ADMIN_EMAIL = 'iradwatkins@gmail.com';
const ADMIN_PASSWORD = 'Iw2006js!';
const LOGIN_URL = `${BASE_URL}/auth/signin`;

// Helper to wait and log
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to take screenshots for debugging
async function takeScreenshot(page, name) {
  const filename = `/root/websites/gangrunprinting/test-screenshots/product-crud-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
}

// Test 1: Login to admin panel
async function testLogin(browser) {
  console.log('\n🔐 TEST 1: Admin Login');
  console.log('=' .repeat(60));

  const page = await browser.newPage();

  try {
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📍 Navigating to login page...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    await takeScreenshot(page, '1-login-page');

    // Check if already logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/admin') || currentUrl.includes('/dashboard')) {
      console.log('✅ Already logged in!');
      return page;
    }

    // Fill login form
    console.log('📝 Filling login credentials...');
    await page.type('input[type="email"], input[name="email"]', ADMIN_EMAIL, { delay: 50 });
    await page.type('input[type="password"], input[name="password"]', ADMIN_PASSWORD, { delay: 50 });

    await takeScreenshot(page, '2-login-filled');

    // Click login button
    console.log('🚀 Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('button[type="submit"]'),
    ]);

    await takeScreenshot(page, '3-after-login');

    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);

    if (finalUrl.includes('/admin') || finalUrl.includes('/dashboard')) {
      console.log('✅ LOGIN SUCCESS!');
    } else {
      console.log('❌ LOGIN FAILED - not redirected to admin area');
      await takeScreenshot(page, '3-login-failed');
    }

    return page;
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    await takeScreenshot(page, 'error-login');
    throw error;
  }
}

// Test 2: Create a new product
async function testProductCreation(page) {
  console.log('\n📦 TEST 2: Product Creation');
  console.log('=' .repeat(60));

  try {
    // Navigate to product creation page
    console.log('📍 Navigating to /admin/products/new...');
    await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle2', timeout: 30000 });

    await wait(2000); // Wait for React to hydrate
    await takeScreenshot(page, '4-product-new-page');

    // Check if the page loaded correctly
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);

    // Wait for the form to be ready
    console.log('⏳ Waiting for form to load...');
    await page.waitForSelector('input[name="name"], input[placeholder*="Product"]', { timeout: 10000 });

    // Check if "Quick Fill (Test)" button exists
    const quickFillExists = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Quick Fill')
      );
      return !!button;
    });

    console.log(`🔍 Quick Fill button found: ${quickFillExists}`);

    if (quickFillExists) {
      console.log('🎯 Using Quick Fill for testing...');
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Quick Fill')
        );
        if (button) button.click();
      });

      await wait(2000); // Wait for form to fill
      await takeScreenshot(page, '5-after-quick-fill');
    } else {
      console.log('📝 Manually filling form fields...');

      // Fill basic info
      const testProductName = `Test Product ${Date.now()}`;
      const testProductSku = `TEST-${Date.now()}`;

      await page.type('input[name="name"]', testProductName, { delay: 50 });
      await page.type('input[name="sku"]', testProductSku, { delay: 50 });

      // Select category (first available option)
      const categorySelect = await page.$('select[name="categoryId"]');
      if (categorySelect) {
        await page.select('select[name="categoryId"]', await page.evaluate(sel => {
          const options = Array.from(sel.options).filter(opt => opt.value);
          return options.length > 0 ? options[0].value : '';
        }, categorySelect));
      }

      // Fill description
      await page.type('textarea[name="description"]', 'This is a test product created by automated testing.', { delay: 30 });

      await takeScreenshot(page, '5-form-filled-manual');
    }

    // Get form state before submission
    const formState = await page.evaluate(() => {
      const nameInput = document.querySelector('input[name="name"]');
      const skuInput = document.querySelector('input[name="sku"]');
      const categorySelect = document.querySelector('select[name="categoryId"]');

      return {
        name: nameInput ? nameInput.value : null,
        sku: skuInput ? skuInput.value : null,
        category: categorySelect ? categorySelect.value : null,
        hasCreateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Create Product')
        )
      };
    });

    console.log('📊 Form state before submission:', JSON.stringify(formState, null, 2));

    // Setup console log listener to capture errors
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        console.log('🔴 Browser Console Error:', msg.text());
      }
    });

    // Setup network request listener to capture API calls
    const apiCalls = [];
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/products')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {
          body = await response.text();
        }
        apiCalls.push({ url, status, body });
        console.log(`🌐 API Call: ${response.request().method()} ${url} - Status: ${status}`);
      }
    });

    // Click "Create Product" button
    console.log('🚀 Submitting product creation form...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Create Product') && !btn.disabled
      );
      if (button) {
        console.log('Clicking Create Product button');
        button.click();
      } else {
        console.error('Create Product button not found or disabled');
      }
    });

    // Wait for either success or error
    await wait(3000);
    await takeScreenshot(page, '6-after-submit');

    // Check if we're redirected to products list
    const currentUrl = page.url();
    console.log(`📍 Current URL after submit: ${currentUrl}`);

    // Check for toast notifications
    const toastMessages = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"], .toast, [class*="toast"]'));
      return toasts.map(t => t.textContent);
    });

    if (toastMessages.length > 0) {
      console.log('📬 Toast notifications:', toastMessages);
    }

    // Log all API calls
    console.log('\n📡 API Calls Summary:');
    apiCalls.forEach((call, index) => {
      console.log(`  ${index + 1}. ${call.url}`);
      console.log(`     Status: ${call.status}`);
      console.log(`     Response:`, JSON.stringify(call.body, null, 2));
    });

    // Log console errors
    const errors = logs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('\n🔴 Console Errors:');
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.text}`);
      });
    }

    // Determine test result
    if (currentUrl.includes('/admin/products') && !currentUrl.includes('/new')) {
      console.log('✅ PRODUCT CREATION SUCCESS - Redirected to products list!');
      return { success: true, productCreated: true };
    } else if (apiCalls.some(call => call.status === 201)) {
      console.log('✅ PRODUCT CREATION API SUCCESS - But not redirected');
      return { success: true, productCreated: true, notRedirected: true };
    } else if (apiCalls.some(call => call.status >= 400)) {
      console.log('❌ PRODUCT CREATION FAILED - API returned error');
      return { success: false, apiError: true, apiCalls };
    } else {
      console.log('❌ PRODUCT CREATION FAILED - No API call detected or unknown state');
      return { success: false, noApiCall: true, logs, currentUrl };
    }

  } catch (error) {
    console.error('❌ Product creation test failed:', error.message);
    await takeScreenshot(page, 'error-product-creation');
    throw error;
  }
}

// Test 3: Verify product was created
async function testProductList(page) {
  console.log('\n📋 TEST 3: Verify Product in List');
  console.log('=' .repeat(60));

  try {
    // Navigate to products list
    console.log('📍 Navigating to /admin/products...');
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle2', timeout: 30000 });

    await wait(2000);
    await takeScreenshot(page, '7-products-list');

    // Get all products from the page
    const products = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr, [data-testid*="product"], [class*="product-row"]'));
      return rows.map(row => row.textContent).slice(0, 5); // Get first 5 products
    });

    console.log('📦 Products found:', products.length);
    if (products.length > 0) {
      console.log('First few products:', products);
    }

    // Check if our test product exists
    const testProductExists = products.some(p => p.includes('Test Product'));

    if (testProductExists) {
      console.log('✅ TEST PRODUCT FOUND IN LIST!');
      return { success: true, productFound: true };
    } else {
      console.log('❌ Test product not found in list');
      return { success: false, productFound: false };
    }

  } catch (error) {
    console.error('❌ Product list test failed:', error.message);
    await takeScreenshot(page, 'error-product-list');
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Product CRUD Tests');
  console.log('=' .repeat(60));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`👤 Admin User: ${ADMIN_EMAIL}`);
  console.log('=' .repeat(60));

  // Create screenshots directory
  const fs = require('fs');
  const screenshotDir = '/root/websites/gangrunprinting/test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  let browser;
  let results = {
    login: null,
    creation: null,
    verification: null,
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ],
    });

    // Test 1: Login
    const page = await testLogin(browser);
    results.login = { success: true };

    // Test 2: Create Product
    results.creation = await testProductCreation(page);

    // Test 3: Verify Product
    if (results.creation.success) {
      results.verification = await testProductList(page);
    }

  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error);
    results.error = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print final results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('=' .repeat(60));
  console.log('1. Login:', results.login?.success ? '✅ PASS' : '❌ FAIL');
  console.log('2. Product Creation:', results.creation?.success ? '✅ PASS' : '❌ FAIL');
  console.log('3. Product Verification:', results.verification?.success ? '✅ PASS' : '❌ FAIL');
  console.log('=' .repeat(60));

  // Overall result
  const allPassed = results.login?.success && results.creation?.success && results.verification?.success;

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Check details above');
    console.log('\n📋 Detailed Results:', JSON.stringify(results, null, 2));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
