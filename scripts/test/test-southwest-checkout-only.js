const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Southwest Cargo on checkout page...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go directly to checkout page
    console.log('📍 Navigating to checkout page...');
    await page.goto('https://gangrunprinting.com/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'checkout-page.png', fullPage: true });
    console.log('📸 Screenshot saved: checkout-page.png\n');

    // Check page content
    const content = await page.content();

    console.log('🔍 Checking for Southwest Cargo...\n');
    console.log(`Southwest Cargo text present: ${content.includes('Southwest Cargo') ? '✅ YES' : '❌ NO'}`);
    console.log(`Southwest Cargo Pickup: ${content.includes('Southwest Cargo Pickup') ? '✅ YES' : '❌ NO'}`);
    console.log(`Southwest Cargo Dash: ${content.includes('Southwest Cargo Dash') ? '✅ YES' : '❌ NO'}`);

    // Look for all shipping-related text
    const shippingText = await page.locator('text=/shipping/i').allTextContents();
    console.log(`\n📋 Shipping-related elements: ${shippingText.length}`);

    // Check for FedEx (to confirm shipping section exists)
    console.log(`\n✈️  FedEx present: ${content.includes('FedEx') ? '✅ YES' : '❌ NO'}`);

    // Get network requests for shipping API
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/shipping')) {
        requests.push(request.url());
      }
    });

    await page.waitForTimeout(2000);

    console.log(`\n🌐 Shipping API calls made: ${requests.length}`);
    requests.forEach(url => console.log(`   - ${url}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
