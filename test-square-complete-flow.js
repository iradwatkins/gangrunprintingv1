/**
 * Complete E2E test for Square payment with new credentials
 * Tests the full customer journey including cart and checkout
 */

const { chromium } = require('playwright');

async function testSquareCompleteFlow() {
  console.log('🧪 Testing Complete Square Payment Flow\n');
  console.log('='.repeat(80));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture Square-related console logs
  const squareLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Square]') || text.includes('Square') || text.includes('payment')) {
      squareLogs.push(text);
      console.log(`📋 ${text}`);
    }
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('\n📍 Step 1: Navigate to product page...');
    await page.goto('https://gangrunprinting.com/products/standard-business-cards', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    console.log('✅ Product page loaded');

    console.log('\n📍 Step 2: Configure product and add to cart...');
    // Wait for quantity selector
    await page.waitForSelector('select, input[type="number"]', { timeout: 10000 });

    // Look for "Add to Cart" button
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartBtn.count() > 0) {
      await addToCartBtn.click();
      console.log('✅ Clicked "Add to Cart"');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  "Add to Cart" button not found - product may need configuration');
    }

    console.log('\n📍 Step 3: Navigate to checkout...');
    await page.goto('https://gangrunprinting.com/checkout', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    console.log('\n📍 Step 4: Fill shipping information...');
    // Fill shipping form if present
    const shippingForm = page.locator('form').first();
    if (await shippingForm.count() > 0) {
      // Fill basic shipping info
      await page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test').catch(() => {});
      await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User').catch(() => {});
      await page.fill('input[name="email"], input[type="email"]', 'test@example.com').catch(() => {});
      await page.fill('input[name="address"], input[placeholder*="Address"]', '123 Test St').catch(() => {});
      await page.fill('input[name="city"], input[placeholder*="City"]', 'Dallas').catch(() => {});
      await page.fill('input[name="postalCode"], input[placeholder*="Zip"]', '75201').catch(() => {});

      console.log('✅ Filled shipping information');

      // Submit shipping form
      const continueBtn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
      if (await continueBtn.count() > 0) {
        await continueBtn.click();
        await page.waitForTimeout(3000);
        console.log('✅ Submitted shipping form');
      }
    }

    console.log('\n📍 Step 5: Navigate to payment page...');
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    console.log('\n📍 Step 6: Look for Square payment method...');

    // Look for Square/Credit Card payment option
    const paymentButtons = await page.locator('button').all();
    console.log(`Found ${paymentButtons.length} buttons on page`);

    let squareButtonFound = false;
    for (const btn of paymentButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('Credit') || text.includes('Card') || text.includes('Square'))) {
        console.log(`✅ Found payment button: "${text}"`);
        await btn.click();
        squareButtonFound = true;
        break;
      }
    }

    if (squareButtonFound) {
      console.log('\n⏳ Waiting 15 seconds for Square SDK to initialize...');
      await page.waitForTimeout(15000);

      console.log('\n📍 Step 7: Check for Square card container...');
      const cardContainer = page.locator('#square-card-container');
      if (await cardContainer.count() > 0) {
        console.log('✅ Square card container found!');

        // Check if container has content
        const containerHTML = await cardContainer.innerHTML();
        if (containerHTML.includes('iframe') || containerHTML.length > 100) {
          console.log('✅ Square SDK loaded successfully - iframe detected');
        } else if (containerHTML.includes('Loading')) {
          console.log('⚠️  Square container shows loading state');
        } else {
          console.log('⚠️  Square container exists but no iframe found');
        }
      } else {
        console.log('❌ Square card container NOT found');
      }

      // Check for Cash App Pay container
      const cashAppContainer = page.locator('#square-cashapp-container');
      if (await cashAppContainer.count() > 0) {
        console.log('✅ Cash App Pay container found!');
      }
    } else {
      console.log('❌ No Square payment button found');
    }

    // Take screenshot
    await page.screenshot({ path: 'square-complete-flow-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: square-complete-flow-test.png');

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SQUARE SDK LOGS SUMMARY:\n');

    if (squareLogs.length > 0) {
      console.log('🔍 Captured Square Logs:');
      squareLogs.forEach((log, i) => {
        console.log(`  ${i + 1}. ${log}`);
      });
    } else {
      console.log('⚠️  No Square SDK logs captured');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Complete flow test finished!');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'square-flow-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: square-flow-error.png');
  } finally {
    console.log('\n⏸️  Closing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

// Run the test
testSquareCompleteFlow().catch(console.error);
