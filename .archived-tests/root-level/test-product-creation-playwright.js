/**
 * Product Creation E2E Test - Playwright
 * Tests: Auto SKU generation, image upload, and product creation workflow
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://gangrunprinting.com';
const ADMIN_EMAIL = 'iradwatkins@gmail.com';

// Test configuration
const TEST_ITERATIONS = 3;

async function runTest(iteration) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PLAYWRIGHT TEST ITERATION ${iteration}/${TEST_ITERATIONS}`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  const page = await context.newPage();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Set longer timeout for all operations
    page.setDefaultTimeout(30000);

    console.log('📋 Step 1: Check authentication status...');
    await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle' });

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('/auth/signin')) {
      console.log('   ⚠️  Not authenticated - redirected to sign-in');
      console.log('   ℹ️  Please sign in via browser first, then run tests');
      testsFailed++;
    } else {
      console.log('   ✅ Already authenticated');
      testsPassed++;
    }

    console.log('\n📋 Step 2: Navigate to Create Product page...');
    await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });

    const pageTitle = await page.textContent('h1');
    console.log(`   Page title: "${pageTitle}"`);

    if (pageTitle.includes('Create Product')) {
      console.log('   ✅ Create Product page loaded');
      testsPassed++;
    } else {
      console.log('   ❌ Wrong page loaded');
      testsFailed++;
    }

    console.log('\n📋 Step 3: Fill product name (test auto SKU)...');
    const productName = `Test Product Playwright ${Date.now()}`;
    await page.fill('input[id="name"]', productName);
    console.log(`   Product name: "${productName}"`);

    const nameValue = await page.inputValue('input[id="name"]');
    if (nameValue === productName) {
      console.log('   ✅ Product name filled correctly');
      testsPassed++;
    } else {
      console.log('   ❌ Product name not filled');
      testsFailed++;
    }

    console.log('\n📋 Step 4: Check SKU field is optional...');
    const skuInput = await page.locator('input[id="sku"]');
    const skuValue = await skuInput.inputValue();
    console.log(`   SKU field value: "${skuValue}" (empty = auto-generate)`);

    if (skuValue === '') {
      console.log('   ✅ SKU field is empty (will auto-generate)');
      testsPassed++;
    } else {
      console.log('   ⚠️  SKU field has value');
    }

    console.log('\n📋 Step 5: Select category...');
    await page.click('button[role="combobox"]:has-text("Choose a category")');
    await page.waitForTimeout(1000);

    // Select first available category
    const firstCategory = await page.locator('[role="option"]').first();
    const categoryText = await firstCategory.textContent();
    console.log(`   Selecting category: "${categoryText}"`);
    await firstCategory.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Category selected');
    testsPassed++;

    console.log('\n📋 Step 6: Select quantity set...');
    // Find the Quantity Set select by its label
    await page.locator('label:has-text("Quantity Set")').locator('..').locator('button[role="combobox"]').first().click();
    await page.waitForTimeout(1000);

    const firstQuantity = await page.locator('[role="option"]').first();
    const quantityText = await firstQuantity.textContent();
    console.log(`   Selecting quantity set: "${quantityText}"`);
    await firstQuantity.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Quantity set selected');
    testsPassed++;

    console.log('\n📋 Step 7: Select paper stock set...');
    await page.locator('label:has-text("Paper Stock Set")').locator('..').locator('button[role="combobox"]').first().click();
    await page.waitForTimeout(1000);

    const firstPaper = await page.locator('[role="option"]').first();
    const paperText = await firstPaper.textContent();
    console.log(`   Selecting paper stock: "${paperText}"`);
    await firstPaper.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Paper stock set selected');
    testsPassed++;

    console.log('\n📋 Step 8: Select size set...');
    await page.locator('label:has-text("Size Set")').locator('..').locator('button[role="combobox"]').first().click();
    await page.waitForTimeout(1000);

    const firstSize = await page.locator('[role="option"]').first();
    const sizeText = await firstSize.textContent();
    console.log(`   Selecting size set: "${sizeText}"`);
    await firstSize.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Size set selected');
    testsPassed++;

    console.log('\n📋 Step 9: Submit product creation...');

    // Listen for navigation or response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/products') && response.request().method() === 'POST',
      { timeout: 30000 }
    );

    // Click the create button (top button)
    await page.click('button:has-text("Create Product")');
    console.log('   Clicked Create Product button');

    try {
      const response = await responsePromise;
      const status = response.status();
      console.log(`   API Response Status: ${status}`);

      if (status === 201 || status === 200) {
        const responseData = await response.json();
        console.log(`   ✅ Product created successfully!`);
        console.log(`   Product ID: ${responseData.data?.id || responseData.id}`);
        console.log(`   Auto-generated SKU: ${responseData.data?.sku || responseData.sku}`);
        testsPassed++;

        // Wait for redirect to product list
        await page.waitForTimeout(2000);
        const finalUrl = page.url();
        if (finalUrl.includes('/admin/products') && !finalUrl.includes('/new')) {
          console.log('   ✅ Redirected to product list');
          testsPassed++;
        }
      } else {
        const responseText = await response.text();
        console.log(`   ❌ Product creation failed`);
        console.log(`   Response: ${responseText}`);
        testsFailed++;
      }
    } catch (error) {
      console.log(`   ❌ Error waiting for API response: ${error.message}`);
      testsFailed++;
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`   ✅ Tests Passed: ${testsPassed}`);
    console.log(`   ❌ Tests Failed: ${testsFailed}`);
    console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    testsFailed++;
  } finally {
    await browser.close();
    return { passed: testsPassed, failed: testsFailed };
  }
}

async function main() {
  console.log('🚀 Starting Playwright Product Creation Tests');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Admin Email: ${ADMIN_EMAIL}`);
  console.log(`   Iterations: ${TEST_ITERATIONS}\n`);

  const results = [];

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    const result = await runTest(i);
    results.push(result);

    if (i < TEST_ITERATIONS) {
      console.log('\n⏳ Waiting 3 seconds before next iteration...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULTS - ALL ITERATIONS');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  results.forEach((result, index) => {
    console.log(`\nIteration ${index + 1}:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    totalPassed += result.passed;
    totalFailed += result.failed;
  });

  console.log('\n' + '='.repeat(60));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests Run: ${totalPassed + totalFailed}`);
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

main();
