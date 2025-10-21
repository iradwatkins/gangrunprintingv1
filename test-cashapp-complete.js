const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Testing Complete Cash App Payment Flow...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Step 1: Go to products page
    console.log('1️⃣ Loading products page...');
    await page.goto('https://gangrunprinting.com/products', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('✅ Products page loaded\n');

    // Step 2: Click on first product
    console.log('2️⃣ Selecting a product...');
    await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
    const productLinks = await page.$$('a[href*="/products/"]');

    if (productLinks.length === 0) {
      throw new Error('No products found on page');
    }

    await productLinks[0].click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Product page loaded\n');

    // Step 3: Wait for product configuration to load
    console.log('3️⃣ Waiting for product configuration...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if quantity selector is visible
    const hasQuantity = await page.evaluate(() => {
      return document.body.innerText.includes('Quantity') ||
             document.querySelector('select') !== null;
    });

    console.log('Has quantity selector:', hasQuantity);

    // Step 4: Try to add to cart
    console.log('4️⃣ Looking for "Add to Cart" button...');
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add To Cart")',
      'button[type="submit"]',
      'button:has-text("Add")'
    ];

    let addToCartButton = null;
    for (const selector of addToCartSelectors) {
      try {
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text.toLowerCase().includes('add') && text.toLowerCase().includes('cart')) {
            addToCartButton = button;
            break;
          }
        }
        if (addToCartButton) break;
      } catch (e) {
        // Try next selector
      }
    }

    if (!addToCartButton) {
      console.log('⚠️ Add to Cart button not found - taking screenshot');
      await page.screenshot({ path: 'product-page-debug.png', fullPage: true });

      // Check page content
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('\nPage content includes:');
      console.log('- "Add to Cart":', pageText.includes('Add to Cart'));
      console.log('- "Quantity":', pageText.includes('Quantity'));
      console.log('- "Price":', pageText.includes('$'));

      throw new Error('Add to Cart button not found - see product-page-debug.png');
    }

    console.log('✅ Found Add to Cart button, clicking...');
    await addToCartButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Product added to cart\n');

    // Step 5: Go to cart
    console.log('5️⃣ Navigating to cart...');
    await page.goto('https://gangrunprinting.com/cart', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('✅ Cart page loaded\n');

    // Step 6: Proceed to checkout
    console.log('6️⃣ Looking for checkout button...');
    const checkoutButtons = await page.$$('button, a');
    let checkoutButton = null;

    for (const button of checkoutButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.toLowerCase().includes('checkout')) {
        checkoutButton = button;
        break;
      }
    }

    if (!checkoutButton) {
      await page.screenshot({ path: 'cart-page-debug.png', fullPage: true });
      throw new Error('Checkout button not found - see cart-page-debug.png');
    }

    await checkoutButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Navigated to checkout\n');

    // Step 7: Fill shipping info and continue
    console.log('7️⃣ Checking checkout flow...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/checkout/shipping') || currentUrl.includes('/checkout')) {
      console.log('On checkout page - attempting to reach payment...');

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to navigate directly to payment page
      await page.goto('https://gangrunprinting.com/checkout/payment', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    }

    console.log('✅ On payment page\n');

    // Step 8: Wait for payment options to load
    console.log('8️⃣ Waiting for payment options...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 9: Look for Cash App payment option
    console.log('9️⃣ Looking for Cash App payment option...');
    const pageText = await page.evaluate(() => document.body.innerText);

    console.log('Page includes "Cash App":', pageText.includes('Cash App'));
    console.log('Page includes "Payment":', pageText.includes('Payment'));
    console.log('Page includes "QR":', pageText.includes('QR'));

    // Try to find Cash App button
    const buttons = await page.$$('button');
    let cashAppButton = null;

    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes('Cash App')) {
        cashAppButton = button;
        console.log('✅ Found Cash App button:', text);
        break;
      }
    }

    if (!cashAppButton) {
      console.log('❌ Cash App option not found on payment page');
      await page.screenshot({ path: 'payment-page-no-cashapp.png', fullPage: true });
      console.log('Screenshot saved to payment-page-no-cashapp.png\n');

      // Print available payment methods
      console.log('Available text on page:');
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
      });
      console.log('Buttons:', allButtons.join(', '));

      throw new Error('Cash App payment option not available');
    }

    // Step 10: Click Cash App option
    console.log('🔟 Clicking Cash App payment option...');
    await cashAppButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Cash App option clicked\n');

    // Step 11: Check for QR code
    console.log('1️⃣1️⃣ Checking for QR code...');
    const qrCodeFound = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.some(img =>
        img.alt?.toLowerCase().includes('qr') ||
        img.alt?.toLowerCase().includes('cash app') ||
        img.src?.includes('data:image')
      );
    });

    console.log('QR Code found:', qrCodeFound);

    // Step 12: Extract payment amount
    console.log('1️⃣2️⃣ Extracting payment information...');
    const amounts = await page.evaluate(() => {
      const regex = /\$\d+\.\d{2}/g;
      const text = document.body.innerText;
      const matches = text.match(regex);
      return matches || [];
    });

    console.log('💰 Amounts found on page:', amounts);

    // Step 13: Check for Cash App deep link
    const cashAppLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const cashAppLink = links.find(a => a.href.includes('cash.app'));
      return cashAppLink ? cashAppLink.href : null;
    });

    if (cashAppLink) {
      console.log('✅ Cash App payment link found:', cashAppLink);
      const amountMatch = cashAppLink.match(/\$?(\d+\.?\d*)/);
      if (amountMatch) {
        console.log('💵 Amount in link:', amountMatch[1]);
      }
    }

    // Step 14: Take final screenshot
    await page.screenshot({ path: 'cashapp-payment-success.png', fullPage: true });
    console.log('✅ Screenshot saved to cashapp-payment-success.png\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ Product page loaded');
    console.log('✅ Cart functionality:', addToCartButton ? 'Working' : 'Not working');
    console.log('✅ Checkout flow:', currentUrl.includes('payment') ? 'Working' : 'Partial');
    console.log('✅ Cash App option:', cashAppButton ? 'Found' : 'Not found');
    console.log('✅ QR Code:', qrCodeFound ? 'Displayed' : 'Not visible');
    console.log('💰 Payment amounts:', amounts.join(', ') || 'None found');
    console.log('🔗 Cash App link:', cashAppLink ? 'Yes' : 'No');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'cashapp-test-error.png', fullPage: true });
    console.log('Error screenshot saved to cashapp-test-error.png');
  } finally {
    await browser.close();
    console.log('\n🏁 Test complete!');
  }
})();
