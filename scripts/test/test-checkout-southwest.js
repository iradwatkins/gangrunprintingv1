const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting checkout test with Southwest Cargo verification...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to product page
    console.log('📦 Step 1: Navigating to 4x6 Flyers product page...');
    await page.goto('https://gangrunprinting.com/products/4x6-flyers-9pt-card-stock');
    await page.waitForLoadState('networkidle');

    // Wait for product configuration to load
    console.log('⏳ Waiting for product configuration...');
    await page.waitForSelector('select[name="quantity"]', { timeout: 10000 });

    // Step 2: Configure product
    console.log('⚙️  Step 2: Configuring product options...');
    await page.selectOption('select[name="quantity"]', '5000');
    await page.waitForTimeout(500);

    // Step 3: Add to cart
    console.log('🛒 Step 3: Adding to cart...');
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
    await addToCartButton.click();
    await page.waitForTimeout(2000);

    // Step 4: Go to checkout
    console.log('💳 Step 4: Navigating to checkout...');
    await page.goto('https://gangrunprinting.com/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 5: Check for Southwest Cargo in shipping options
    console.log('\n🔍 Step 5: Checking for Southwest Cargo shipping options...\n');

    const pageContent = await page.content();

    // Check for shipping section
    const shippingSection = await page.locator('text=Shipping Method').count();
    console.log(`Shipping Method section found: ${shippingSection > 0 ? '✅ YES' : '❌ NO'}`);

    // Check for Southwest Cargo text
    const hasSouthwestCargo = pageContent.includes('Southwest Cargo');
    console.log(`Southwest Cargo text found: ${hasSouthwestCargo ? '✅ YES' : '❌ NO'}`);

    // Check for specific Southwest Cargo services
    const hasPickup = pageContent.includes('Southwest Cargo Pickup');
    const hasDash = pageContent.includes('Southwest Cargo Dash');

    console.log(`Southwest Cargo Pickup: ${hasPickup ? '✅ YES' : '❌ NO'}`);
    console.log(`Southwest Cargo Dash: ${hasDash ? '✅ YES' : '❌ NO'}`);

    // Get all shipping options
    const shippingOptions = await page.locator('input[type="radio"][name*="shipping"], label:has-text("FedEx"), label:has-text("Southwest")').allTextContents();

    console.log('\n📋 All shipping options found:');
    if (shippingOptions.length > 0) {
      shippingOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.trim()}`);
      });
    } else {
      console.log('   ❌ No shipping options visible!');
    }

    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'checkout-southwest-test.png', fullPage: true });
    console.log('   Saved as: checkout-southwest-test.png');

    // Check console errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));

    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      console.log('\n🐛 Console messages:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: 'checkout-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
