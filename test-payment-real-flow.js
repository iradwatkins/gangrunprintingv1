const puppeteer = require('puppeteer');

(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 PAYMENT PAGE TEST - Real Cart Flow');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Step 1: Load homepage
    console.log('1️⃣ Loading homepage...');
    await page.goto('https://gangrunprinting.com', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Homepage loaded\n');

    // Step 2: Inject properly formatted cart data
    console.log('2️⃣ Injecting cart data (using CORRECT key: gangrun_cart)...');
    await page.evaluate(() => {
      const cartState = {
        items: [{
          id: 'test-1-' + Date.now(),
          productId: '2',
          name: 'Flyers - 8.5" x 11"',
          sku: 'FLY-8511',
          categoryName: 'Flyers',
          quantity: 100,
          price: 49.99,
          subtotal: 49.99,

          // CRITICAL: dimensions and paperStockWeight required by cart validation
          dimensions: {
            length: 11,
            width: 8.5,
            height: 0.1
          },
          paperStockWeight: 1, // Must be a positive number

          options: {
            size: '8.5" x 11"',
            paperStock: '100lb Gloss Text',
            coating: 'None',
            turnaround: 'Standard'
          }
        }],
        isOpen: false,
        lastUpdated: new Date().toISOString()
      };

      const shippingAddress = {
        fullName: 'Test Customer',
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        country: 'US',
        email: 'test@test.com',
        phone: '555-1234'
      };

      const shippingMethod = {
        carrier: 'FedEx',
        service: 'Ground',
        rate: { amount: 12.50, currency: 'USD' }
      };

      // Use CORRECT key for cart (gangrun_cart, not cart)
      localStorage.setItem('gangrun_cart', JSON.stringify(cartState));
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify(shippingAddress));
      sessionStorage.setItem('checkout_shipping_method', JSON.stringify(shippingMethod));

      console.log('✅ Cart state saved to localStorage (gangrun_cart)');
      console.log('✅ Shipping data saved to sessionStorage');
    });
    console.log('✅ Test data injected\n');

    // Step 3: Navigate to payment page
    console.log('3️⃣ Navigating to payment page...');
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Payment page loaded\n');

    // Step 4: Analyze page
    console.log('4️⃣ Analyzing payment page...\n');

    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // Check localStorage to verify cart loaded
      const cartInStorage = localStorage.getItem('gangrun_cart');
      const parsedCart = cartInStorage ? JSON.parse(cartInStorage) : null;

      return {
        title: document.title,
        bodyTextSample: bodyText.substring(0, 200),

        // Page content checks
        hasSelectPayment: bodyText.includes('Select Payment Method') || bodyText.includes('Complete Your Payment'),
        hasIncompleteCheckout: bodyText.includes('Incomplete Checkout'),

        // Payment options
        hasCreditCard: bodyText.includes('Credit') || bodyText.includes('Debit') || bodyText.includes('Card'),
        hasCashApp: bodyText.includes('Cash App'),
        hasPayPal: bodyText.includes('PayPal'),

        // All buttons
        allButtons: Array.from(document.querySelectorAll('button'))
          .map(b => b.textContent.trim())
          .filter(t => t && t.length > 0 && t.length < 100),

        // Cart verification
        cartInLocalStorage: !!cartInStorage,
        cartItemCount: parsedCart?.items?.length || 0,
        cartHasDimensions: parsedCart?.items?.[0]?.dimensions ? true : false,
        cartHasWeight: parsedCart?.items?.[0]?.paperStockWeight ? true : false,
      };
    });

    console.log('📄 Page Analysis:');
    console.log('   Title:', pageData.title);
    console.log('   Has "Complete Your Payment":', pageData.hasSelectPayment ? '✅ YES' : '❌ NO');
    console.log('   Has "Incomplete Checkout":', pageData.hasIncompleteCheckout ? '⚠️ YES (BAD)' : '✅ NO');
    console.log('\n💳 Payment Options:');
    console.log('   Credit/Debit Card:', pageData.hasCreditCard ? '✅ YES' : '❌ NO');
    console.log('   Cash App:', pageData.hasCashApp ? '✅ YES' : '❌ NO');
    console.log('   PayPal:', pageData.hasPayPal ? '✅ YES' : '❌ NO');

    console.log('\n🛒 Cart Data Verification:');
    console.log('   Cart in localStorage:', pageData.cartInLocalStorage ? '✅ YES' : '❌ NO');
    console.log('   Cart item count:', pageData.cartItemCount);
    console.log('   Cart has dimensions:', pageData.cartHasDimensions ? '✅ YES' : '❌ NO');
    console.log('   Cart has weight:', pageData.cartHasWeight ? '✅ YES' : '❌ NO');

    console.log('\n🔘 All Buttons Found:');
    pageData.allButtons.forEach((btn, i) => {
      console.log(`   ${i + 1}. ${btn}`);
    });

    await page.screenshot({ path: 'test-payment-real-flow.png', fullPage: true });
    console.log('\n✅ Screenshot saved: test-payment-real-flow.png\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════');

    if (pageData.hasIncompleteCheckout) {
      console.log('❌ FAIL: "Incomplete Checkout" error displayed');
      console.log('   This means cart/shipping data did not load correctly');
    } else if (pageData.hasSelectPayment && pageData.hasCashApp && pageData.hasPayPal) {
      console.log('✅ PASS: All payment options visible');
    } else {
      console.log('⚠️ PARTIAL: Payment page loaded but missing options');
      console.log('   Cash App:', pageData.hasCashApp ? '✅' : '❌');
      console.log('   PayPal:', pageData.hasPayPal ? '✅' : '❌');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await page.screenshot({ path: 'test-payment-error.png', fullPage: true });
  }

  await browser.close();
  console.log('🏁 Test complete!\n');
})();
