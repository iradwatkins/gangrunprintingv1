const puppeteer = require('puppeteer');

(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 1: Payment Page with Cart + Shipping Data');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Step 1: Start fresh session
    console.log('1️⃣ Starting fresh browser session...');
    await page.goto('https://gangrunprinting.com', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Homepage loaded\n');

    // Step 2: Inject cart and shipping data
    console.log('2️⃣ Injecting test cart and shipping data...');
    await page.evaluate(() => {
      const cart = {
        items: [{
          id: 'test-1',
          productId: '2',
          productName: 'Flyers',
          productSlug: 'flyers',
          quantity: 100,
          price: 49.99,
          total: 49.99,
          paperStockWeight: 1,
          configuration: { size: '8.5x11', turnaround: 'Standard' }
        }],
        itemCount: 1,
        subtotal: 49.99
      };

      const shipping = {
        fullName: 'Test User',
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

      localStorage.setItem('cart', JSON.stringify(cart));
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify(shipping));
      sessionStorage.setItem('checkout_shipping_method', JSON.stringify(shippingMethod));
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
    console.log('4️⃣ Analyzing payment page content...\n');

    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      return {
        title: document.title,
        hasSelectPayment: bodyText.includes('Select Payment Method'),
        hasIncompleteCheckout: bodyText.includes('Incomplete Checkout'),
        hasCreditCard: bodyText.includes('Credit') || bodyText.includes('Debit') || bodyText.includes('Card'),
        hasCashApp: bodyText.includes('Cash App'),
        hasPayPal: bodyText.includes('PayPal'),
        hasScanQR: bodyText.includes('Scan QR'),
        buttons: Array.from(document.querySelectorAll('button'))
          .map(b => b.textContent.trim())
          .filter(t => t.length > 0 && t.length < 100)
      };
    });

    console.log('📄 Page Analysis:');
    console.log('   "Select Payment Method":', pageData.hasSelectPayment ? '✅ YES' : '❌ NO');
    console.log('   "Incomplete Checkout":', pageData.hasIncompleteCheckout ? '⚠️ YES (ERROR)' : '✅ NO');
    console.log('   Credit/Debit Card:', pageData.hasCreditCard ? '✅ YES' : '❌ NO');
    console.log('   Cash App:', pageData.hasCashApp ? '✅ YES' : '❌ NO');
    console.log('   PayPal:', pageData.hasPayPal ? '✅ YES' : '❌ NO');

    console.log('\n🔘 Payment-related buttons:');
    pageData.buttons.forEach(btn => {
      if (btn.toLowerCase().includes('cash') ||
          btn.toLowerCase().includes('paypal') ||
          btn.toLowerCase().includes('card') ||
          btn.toLowerCase().includes('payment')) {
        console.log('   ⭐', btn);
      }
    });

    await page.screenshot({ path: 'test1-payment-page.png', fullPage: true });
    console.log('\n✅ Screenshot: test1-payment-page.png\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 TEST 1 RESULTS');
    console.log('═══════════════════════════════════════════════════════════');

    if (pageData.hasSelectPayment && pageData.hasCashApp && pageData.hasPayPal) {
      console.log('✅ PASS: All payment options present');
    } else if (pageData.hasIncompleteCheckout) {
      console.log('❌ FAIL: "Incomplete Checkout" error shown');
    } else {
      console.log('⚠️ PARTIAL: Missing payment options');
      console.log('   Cash App:', pageData.hasCashApp ? '✅' : '❌');
      console.log('   PayPal:', pageData.hasPayPal ? '✅' : '❌');
    }
    console.log('═══════════════════════════════════════════════════════════\n\n');

  } catch (error) {
    console.error('❌ TEST 1 ERROR:', error.message);
    await page.screenshot({ path: 'test1-error.png', fullPage: true });
  }

  await browser.close();

  // TEST 2
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 2: Cash App QR Code Display');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser2 = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page2 = await browser2.newPage();
  await page2.setViewport({ width: 1920, height: 1080 });

  try {
    await page2.goto('https://gangrunprinting.com', { waitUntil: 'networkidle0' });

    await page2.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify({
        items: [{
          id: 'test-cashapp',
          productId: '2',
          productName: 'Test Flyers',
          quantity: 100,
          price: 99.99,
          total: 99.99,
          paperStockWeight: 1
        }],
        itemCount: 1,
        subtotal: 99.99
      }));

      sessionStorage.setItem('checkout_shipping_address', JSON.stringify({
        fullName: 'Test',
        address: '123 St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }));

      sessionStorage.setItem('checkout_shipping_method', JSON.stringify({
        carrier: 'FedEx',
        rate: { amount: 25.00 }
      }));
    });

    await page2.goto('https://gangrunprinting.com/checkout/payment', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const cashAppButton = await page2.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Cash App'))?.textContent.trim();
    });

    if (cashAppButton) {
      console.log(`✅ Found Cash App button: "${cashAppButton}"\n`);

      await page2.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        buttons.find(b => b.textContent.includes('Cash App'))?.click();
      });

      await new Promise(resolve => setTimeout(resolve, 4000));

      const qrData = await page2.evaluate(() => {
        const bodyText = document.body.innerText;
        const cashAppLink = Array.from(document.querySelectorAll('a'))
          .find(a => a.href && a.href.includes('cash.app'));

        return {
          hasQR: bodyText.includes('QR') || bodyText.includes('Scan'),
          cashAppUrl: cashAppLink?.href,
          amounts: bodyText.match(/\$[\d,]+\.\d{2}/g) || []
        };
      });

      console.log('📱 QR Code Check:');
      console.log('   QR text present:', qrData.hasQR ? '✅' : '❌');
      console.log('   Cash App link:', qrData.cashAppUrl || '❌ None');
      console.log('   Amounts found:', qrData.amounts.join(', '));

      await page2.screenshot({ path: 'test2-cashapp-qr.png', fullPage: true });

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📊 TEST 2 RESULTS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(qrData.hasQR && qrData.cashAppUrl ? '✅ PASS: QR code displays' : '❌ FAIL');
      console.log('═══════════════════════════════════════════════════════════');
    } else {
      console.log('❌ Cash App button NOT FOUND');
      await page2.screenshot({ path: 'test2-no-button.png', fullPage: true });
    }

  } catch (error) {
    console.error('❌ TEST 2 ERROR:', error.message);
  }

  await browser2.close();
  console.log('\n🏁 Tests complete!\n');
})();
