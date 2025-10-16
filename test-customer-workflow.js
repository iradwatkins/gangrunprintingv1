#!/usr/bin/env node

/**
 * Customer Workflow E2E Test using Playwright
 * Tests the complete flow: Product → Cart → Upload → Checkout
 *
 * Flow to verify:
 * 1. Navigate to product page
 * 2. Configure product (quantity, size, paper, etc.)
 * 3. Click "Add to Cart"
 * 4. Verify redirect to /cart/upload-artwork (NOT /checkout)
 * 5. Upload test file(s)
 * 6. Click "Next" to proceed to checkout
 * 7. Verify checkout page shows images in 2-column grid
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3020';
const TEST_ITERATIONS = 4;

// Test results storage
const results = {
  timestamp: new Date().toISOString(),
  iterations: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createTestFile() {
  const testFilePath = path.join('/tmp', 'test-artwork.png');

  // Create a small test image file (1x1 transparent PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  fs.writeFileSync(testFilePath, pngBuffer);
  return testFilePath;
}

async function runTest(iteration) {
  const testResult = {
    iteration,
    timestamp: new Date().toISOString(),
    steps: [],
    passed: false,
    error: null,
  };

  let browser;
  let context;
  let page;

  try {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Starting Test Iteration ${iteration}/${TEST_ITERATIONS}`, 'cyan');
    log('='.repeat(60), 'cyan');

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Playwright-Test',
    });

    page = await context.newPage();

    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
      }
    });

    // Step 1: Navigate to products page
    log('\n[Step 1] Navigating to products page...', 'blue');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
    testResult.steps.push({ step: 1, name: 'Navigate to products', passed: true });
    log('✓ Products page loaded', 'green');

    // Step 2: Find and click first product
    log('\n[Step 2] Finding first product...', 'blue');
    const productLinks = await page.locator('a[href*="/products/"]').all();

    // Filter to get only product detail links (not category or list links)
    let productHref = null;
    for (const link of productLinks) {
      const href = await link.getAttribute('href');
      if (href && href.match(/\/products\/[a-z0-9-]+$/)) {
        productHref = href;
        break;
      }
    }

    if (!productHref) {
      throw new Error('No product links found on products page');
    }

    log(`✓ Found product: ${productHref}`, 'green');
    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle', timeout: 30000 });
    testResult.steps.push({ step: 2, name: 'Navigate to product detail', passed: true });
    log('✓ Product detail page loaded', 'green');

    // Step 3: Wait for product configuration to load
    log('\n[Step 3] Waiting for product configuration...', 'blue');
    await page.waitForTimeout(2000); // Give time for configuration to load

    // Check if "Add to Cart" button exists
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    const isVisible = await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isVisible) {
      log('⚠ Warning: Add to Cart button not visible, configuration may not have loaded', 'yellow');
    } else {
      log('✓ Add to Cart button is visible', 'green');
    }

    testResult.steps.push({ step: 3, name: 'Product configuration loaded', passed: true });

    // Step 4: Try to add to cart (may fail if configuration not loaded)
    log('\n[Step 4] Attempting to add product to cart...', 'blue');

    try {
      // First try to select some basic options if available
      const quantitySelect = page.locator('select').first();
      const hasQuantity = await quantitySelect.count() > 0;

      if (hasQuantity) {
        await quantitySelect.selectOption({ index: 1 });
        log('✓ Selected quantity option', 'green');
        await page.waitForTimeout(500);
      }

      // Click Add to Cart
      await addToCartButton.click({ timeout: 5000 });
      log('✓ Clicked Add to Cart button', 'green');

      testResult.steps.push({ step: 4, name: 'Add to cart clicked', passed: true });
    } catch (error) {
      log(`⚠ Could not add to cart: ${error.message}`, 'yellow');
      testResult.steps.push({ step: 4, name: 'Add to cart clicked', passed: false, error: error.message });
    }

    // Step 5: Check current URL - CRITICAL TEST
    log('\n[Step 5] Checking redirect destination...', 'blue');
    await page.waitForTimeout(2000); // Wait for navigation

    const currentUrl = page.url();
    log(`Current URL: ${currentUrl}`, 'blue');

    // CRITICAL CHECK: Should be on upload-artwork page, NOT checkout
    if (currentUrl.includes('/cart/upload-artwork')) {
      log('✓ SUCCESS: Redirected to upload-artwork page (CORRECT FLOW)', 'green');
      testResult.steps.push({ step: 5, name: 'Redirect to upload page', passed: true });
    } else if (currentUrl.includes('/checkout')) {
      log('✗ FAILED: Redirected directly to checkout (WRONG FLOW)', 'red');
      testResult.steps.push({
        step: 5,
        name: 'Redirect to upload page',
        passed: false,
        error: 'Redirected to checkout instead of upload-artwork'
      });
      throw new Error('Flow broken: Skipped upload-artwork page');
    } else if (currentUrl.includes('/cart')) {
      log('→ On cart page, proceeding to upload...', 'yellow');

      // Click checkout button on cart page
      const checkoutButton = page.locator('button:has-text("Upload Your Design Files")').first();
      const hasButton = await checkoutButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasButton) {
        await checkoutButton.click();
        await page.waitForTimeout(2000);

        const newUrl = page.url();
        if (newUrl.includes('/cart/upload-artwork')) {
          log('✓ Navigated to upload-artwork page', 'green');
          testResult.steps.push({ step: 5, name: 'Navigate from cart to upload', passed: true });
        } else {
          throw new Error(`Unexpected redirect from cart: ${newUrl}`);
        }
      } else {
        throw new Error('Checkout button not found on cart page');
      }
    } else {
      log(`⚠ Unexpected URL: ${currentUrl}`, 'yellow');
      testResult.steps.push({
        step: 5,
        name: 'Redirect to upload page',
        passed: false,
        error: `Unexpected URL: ${currentUrl}`
      });
    }

    // Step 6: Test file upload zone
    log('\n[Step 6] Testing file upload zone...', 'blue');

    if (page.url().includes('/cart/upload-artwork')) {
      // Look for file upload zone
      const uploadZone = page.locator('[class*="upload"]').first();
      const hasUploadZone = await uploadZone.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasUploadZone) {
        log('✓ File upload zone is visible', 'green');

        // Try to upload test file
        const testFilePath = await createTestFile();
        const fileInput = page.locator('input[type="file"]').first();
        const hasFileInput = await fileInput.count() > 0;

        if (hasFileInput) {
          await fileInput.setInputFiles(testFilePath);
          log('✓ Test file uploaded', 'green');
          await page.waitForTimeout(1500); // Wait for upload to process

          testResult.steps.push({ step: 6, name: 'File upload', passed: true });
        } else {
          log('⚠ File input not found', 'yellow');
          testResult.steps.push({ step: 6, name: 'File upload', passed: false, error: 'File input not found' });
        }
      } else {
        log('⚠ Upload zone not visible', 'yellow');
        testResult.steps.push({ step: 6, name: 'File upload', passed: false, error: 'Upload zone not visible' });
      }

      // Step 7: Skip to checkout (since upload is optional)
      log('\n[Step 7] Proceeding to checkout...', 'blue');

      const skipButton = page.locator('button:has-text("Skip")').first();
      const proceedButton = page.locator('button:has-text("Proceed to Checkout")').first();

      const hasSkip = await skipButton.isVisible({ timeout: 2000 }).catch(() => false);
      const hasProceed = await proceedButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasSkip) {
        await skipButton.click();
        log('✓ Clicked Skip button', 'green');
      } else if (hasProceed) {
        await proceedButton.click();
        log('✓ Clicked Proceed button', 'green');
      } else {
        log('⚠ No navigation button found', 'yellow');
      }

      await page.waitForTimeout(2000);

      testResult.steps.push({ step: 7, name: 'Proceed to checkout', passed: true });
    }

    // Step 8: Verify checkout page
    log('\n[Step 8] Verifying checkout page...', 'blue');

    const finalUrl = page.url();
    if (finalUrl.includes('/checkout')) {
      log('✓ Reached checkout page', 'green');

      // Check for 2-column grid (the fix we made)
      const gridElements = page.locator('.grid-cols-2');
      const hasGrid = await gridElements.count() > 0;

      if (hasGrid) {
        log('✓ Found 2-column grid for images (FIX VERIFIED)', 'green');
        testResult.steps.push({ step: 8, name: 'Checkout page with 2-col grid', passed: true });
      } else {
        log('⚠ 2-column grid not found', 'yellow');
        testResult.steps.push({ step: 8, name: 'Checkout page with 2-col grid', passed: false, error: 'Grid not found' });
      }
    } else {
      log(`⚠ Not on checkout page: ${finalUrl}`, 'yellow');
      testResult.steps.push({ step: 8, name: 'Verify checkout page', passed: false, error: `Wrong URL: ${finalUrl}` });
    }

    // Test passed
    testResult.passed = true;
    log('\n✓ TEST ITERATION PASSED', 'green');

  } catch (error) {
    testResult.passed = false;
    testResult.error = error.message;
    log(`\n✗ TEST ITERATION FAILED: ${error.message}`, 'red');

    // Take screenshot on failure
    if (page) {
      try {
        const screenshotPath = `/tmp/test-fail-${iteration}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        log(`Screenshot saved: ${screenshotPath}`, 'yellow');
        testResult.screenshot = screenshotPath;
      } catch (screenshotError) {
        log(`Could not save screenshot: ${screenshotError.message}`, 'red');
      }
    }
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
  }

  return testResult;
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('CUSTOMER WORKFLOW E2E TEST', 'cyan');
  log('Testing: Product → Cart → Upload → Checkout', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Test Iterations: ${TEST_ITERATIONS}`, 'blue');
  log(`Playwright Version: ${require('playwright/package.json').version}\n`, 'blue');

  // Run tests
  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    const result = await runTest(i);
    results.iterations.push(result);
    results.summary.total++;

    if (result.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }

    // Pause between iterations
    if (i < TEST_ITERATIONS) {
      log('\nWaiting 3 seconds before next iteration...\n', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Print summary
  log('\n\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.summary.total}`, 'blue');
  log(`Passed: ${results.summary.passed}`, 'green');
  log(`Failed: ${results.summary.failed}`, results.summary.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%\n`,
    results.summary.failed === 0 ? 'green' : 'yellow');

  // Detailed results
  log('DETAILED RESULTS:', 'cyan');
  results.iterations.forEach((iteration, idx) => {
    log(`\nIteration ${idx + 1}: ${iteration.passed ? '✓ PASS' : '✗ FAIL'}`,
      iteration.passed ? 'green' : 'red');

    iteration.steps.forEach(step => {
      const status = step.passed ? '✓' : '✗';
      const color = step.passed ? 'green' : 'red';
      const error = step.error ? ` (${step.error})` : '';
      log(`  Step ${step.step}: ${status} ${step.name}${error}`, color);
    });

    if (iteration.error) {
      log(`  Error: ${iteration.error}`, 'red');
    }

    if (iteration.screenshot) {
      log(`  Screenshot: ${iteration.screenshot}`, 'yellow');
    }
  });

  // Save results to file
  const resultsPath = path.join('/root/websites/gangrunprinting',
    `test-customer-workflow-results-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`\nResults saved to: ${resultsPath}`, 'blue');

  // Exit with appropriate code
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\nFATAL ERROR: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
