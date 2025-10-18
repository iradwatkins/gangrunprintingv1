const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing complete checkout flow with Southwest Cargo...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture network requests
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/shipping/calculate')) {
      console.log('\n📡 Shipping API Response:');
      console.log(`   Status: ${response.status()}`);
      try {
        const data = await response.json();
        console.log(`   Rates returned: ${data.rates?.length || 0}`);
        if (data.rates) {
          data.rates.forEach((rate, i) => {
            console.log(`   ${i + 1}. ${rate.serviceName} - $${rate.rateAmount} (${rate.estimatedDays} days)`);
          });
        }
      } catch (e) {
        console.log(`   Could not parse response: ${e.message}`);
      }
    }
  });

  try {
    // Step 1: Go to product page
    console.log('📦 Step 1: Loading product page...');
    await page.goto('https://gangrunprinting.com/products/4x6-flyers-9pt-card-stock', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);
    console.log('✅ Product page loaded\n');

    // Step 2: Wait for and configure product
    console.log('⚙️  Step 2: Configuring product...');

    // Wait for quantity selector to appear
    try {
      await page.waitForSelector('select[name="quantity"], input[name="quantity"]', { timeout: 10000 });
      console.log('✅ Quantity selector found');

      // Try to select quantity
      const quantitySelect = await page.$('select[name="quantity"]');
      if (quantitySelect) {
        await page.selectOption('select[name="quantity"]', '5000');
        console.log('✅ Selected quantity: 5000');
      }
    } catch (e) {
      console.log('⚠️  Quantity selector not found, taking screenshot...');
      await page.screenshot({ path: 'product-page-issue.png', fullPage: true });
      console.log('   Screenshot saved: product-page-issue.png');

      // Check what's on the page
      const bodyText = await page.locator('body').textContent();
      if (bodyText.includes('Loading')) {
        console.log('❌ Page shows "Loading" - React hydration issue');
      }
    }

    await page.waitForTimeout(1000);

    // Step 3: Add to cart
    console.log('\n🛒 Step 3: Adding to cart...');
    const addToCartBtn = await page.$('button:has-text("Add to Cart")');

    if (addToCartBtn) {
      await addToCartBtn.click();
      console.log('✅ Clicked Add to Cart button');
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ Add to Cart button not found');
      await page.screenshot({ path: 'no-add-to-cart.png', fullPage: true });
    }

    // Step 4: Go to checkout
    console.log('\n💳 Step 4: Navigating to checkout...');
    await page.goto('https://gangrunprinting.com/checkout', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);
    console.log('✅ Checkout page loaded\n');

    // Step 5: Check for shipping options
    console.log('🔍 Step 5: Checking for Southwest Cargo...\n');

    const pageContent = await page.content();

    // Check for shipping section
    const hasShippingSection = pageContent.includes('Shipping') || pageContent.includes('shipping');
    console.log(`Shipping section present: ${hasShippingSection ? '✅ YES' : '❌ NO'}`);

    // Check for Southwest Cargo
    const hasSouthwest = pageContent.includes('Southwest Cargo');
    console.log(`Southwest Cargo text: ${hasSouthwest ? '✅ YES' : '❌ NO'}`);

    if (hasSouthwest) {
      const hasPickup = pageContent.includes('Southwest Cargo Pickup');
      const hasDash = pageContent.includes('Southwest Cargo Dash');
      console.log(`  - Pickup option: ${hasPickup ? '✅ YES' : '❌ NO'}`);
      console.log(`  - Dash option: ${hasDash ? '✅ YES' : '❌ NO'}`);
    }

    // Check for FedEx
    const hasFedEx = pageContent.includes('FedEx');
    console.log(`FedEx options present: ${hasFedEx ? '✅ YES' : '❌ NO'}`);

    // Check for "No products" message
    const hasNoProducts = pageContent.includes('No products selected');
    if (hasNoProducts) {
      console.log('\n⚠️  ISSUE: Checkout shows "No products selected"');
      console.log('   Cart is empty - product was not added successfully\n');
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-checkout.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: final-checkout.png');

    // Show all API calls made
    console.log('\n📡 API Calls Made:');
    if (apiRequests.length === 0) {
      console.log('   ❌ No API calls detected');
    } else {
      apiRequests.forEach(req => {
        console.log(`   ${req.method} ${req.url}`);
      });
    }

    console.log('\n✅ Test completed - waiting 5 seconds before closing...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
