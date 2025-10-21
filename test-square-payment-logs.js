/**
 * Playwright test to capture Square Payment SDK console logs
 * This will help us debug the authorization error
 */

const { chromium } = require('playwright');

async function testSquarePaymentLogs() {
  console.log('🧪 Testing Square Payment SDK - Capturing Console Logs\n');
  console.log('='.repeat(80));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);

    // Print Square-related logs immediately
    if (text.includes('[Square]') || text.includes('[Cash App]') || text.includes('square') || text.includes('Square')) {
      console.log(`📋 ${text}`);
    }
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  // Capture network errors
  page.on('requestfailed', request => {
    console.log(`🌐 NETWORK ERROR: ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('\n📍 Step 1: Navigating to homepage...');
    await page.goto('https://gangrunprinting.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n📍 Step 2: Adding a product to cart...');
    // Click on a product (e.g., Business Cards)
    const productLink = page.locator('a[href*="/products/"]').first();
    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForTimeout(2000);

      // Try to add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log('\n📍 Step 3: Navigating to checkout/payment page...');
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    console.log('\n📍 Step 4: Looking for Square payment option...');

    // Wait for payment methods to load
    await page.waitForSelector('button, a', { timeout: 10000 });

    // Look for Square/Credit Card payment button
    const squareButton = page.locator('button:has-text("Credit"), button:has-text("Square"), button:has-text("Card")').first();

    if (await squareButton.count() > 0) {
      console.log('\n📍 Step 5: Clicking Square payment method...');
      await squareButton.click();

      console.log('\n⏳ Waiting 15 seconds for Square SDK initialization...');
      await page.waitForTimeout(15000);

      console.log('\n📍 Step 6: Checking for Square card container...');
      const cardContainer = page.locator('#square-card-container');
      if (await cardContainer.count() > 0) {
        console.log('✅ Square card container found!');
      } else {
        console.log('❌ Square card container NOT found');
      }
    } else {
      console.log('⚠️  Square payment button not found on page');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY OF CONSOLE LOGS:\n');

    // Filter and display Square-related logs
    const squareLogs = consoleLogs.filter(log =>
      log.includes('[Square]') ||
      log.includes('[Cash App]') ||
      log.toLowerCase().includes('square') ||
      log.toLowerCase().includes('payment')
    );

    if (squareLogs.length > 0) {
      console.log('🔍 Square SDK Logs:');
      squareLogs.forEach((log, i) => {
        console.log(`  ${i + 1}. ${log}`);
      });
    } else {
      console.log('⚠️  No Square SDK logs captured');
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    // Take a screenshot
    await page.screenshot({ path: 'square-payment-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: square-payment-test.png');

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Test completed! Check the logs above for Square SDK details.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'square-payment-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: square-payment-error.png');
  } finally {
    console.log('\n⏸️  Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run the test
testSquarePaymentLogs().catch(console.error);
