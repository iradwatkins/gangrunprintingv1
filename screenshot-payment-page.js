const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate to homepage
    console.log('Loading homepage...');
    await page.goto('https://gangrunprinting.com', { waitUntil: 'networkidle0', timeout: 30000 });

    // Inject test cart and checkout data into localStorage
    console.log('Injecting test cart data...');
    await page.evaluate(() => {
      // Add test cart item
      const testCart = {
        items: [{
          id: 'test-flyer-1',
          productId: '2',
          productName: 'Flyers - 8.5" x 11"',
          productSlug: 'flyers',
          quantity: 100,
          paperStockWeight: 1,
          price: 49.99,
          total: 49.99,
          configuration: {
            size: '8.5" x 11"',
            paperStock: '100lb Gloss Text',
            coating: 'None',
            turnaround: 'Standard'
          }
        }],
        itemCount: 1,
        subtotal: 49.99
      };

      // Add shipping info
      const shippingAddress = {
        fullName: 'Test Customer',
        address: '123 Test St',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        country: 'US',
        phone: '555-1234',
        email: 'test@example.com'
      };

      const shippingMethod = {
        carrier: 'FedEx',
        service: 'Ground',
        rate: {
          amount: 12.50,
          currency: 'USD'
        },
        estimatedDelivery: '5-7 business days'
      };

      // Store in sessionStorage (what the app uses)
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify(shippingAddress));
      sessionStorage.setItem('checkout_shipping_method', JSON.stringify(shippingMethod));
      sessionStorage.setItem('cart', JSON.stringify(testCart));

      console.log('✅ Test data injected');
    });

    // Now navigate to payment page
    console.log('Navigating to payment page...');
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for page to render
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page info
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      hasSquare: document.body.innerText.includes('Credit') || document.body.innerText.includes('Card'),
      hasCashApp: document.body.innerText.includes('Cash App'),
      hasPayPal: document.body.innerText.includes('PayPal'),
      hasPaymentMethod: document.body.innerText.includes('Select Payment Method'),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 0 && t.length < 100)
    }));

    console.log('\n📄 Page Info:');
    console.log('Title:', pageInfo.title);
    console.log('Has "Select Payment Method":', pageInfo.hasPaymentMethod);
    console.log('Has Square/Card:', pageInfo.hasSquare);
    console.log('Has Cash App:', pageInfo.hasCashApp);
    console.log('Has PayPal:', pageInfo.hasPayPal);
    console.log('\n🔘 Buttons found:');
    pageInfo.buttons.forEach(b => console.log('  -', b));

    // Take screenshot
    await page.screenshot({ path: 'payment-page-actual.png', fullPage: true });
    console.log('\n✅ Screenshot saved to payment-page-actual.png\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'payment-page-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
