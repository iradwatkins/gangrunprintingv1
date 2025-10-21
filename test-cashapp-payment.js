const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Testing Cash App Payment Flow...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Step 1: Go directly to payment page (assuming cart has items)
    console.log('1️⃣ Loading payment page...');
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('✅ Payment page loaded\n');

    // Step 2: Wait for page to fully render
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Check page content
    console.log('2️⃣ Checking page content...');
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page includes "Cash App":', pageText.includes('Cash App'));
    console.log('Page includes "Payment":', pageText.includes('Payment'));
    console.log('✅ Page content checked\n');

    // Step 4: Look for Cash App button
    console.log('3️⃣ Looking for Cash App payment button...');

    // Try multiple selectors
    const selectors = [
      'button:has-text("Cash App")',
      'button[class*="Cash"]',
      'div:has-text("Cash App - Scan QR Code")',
      'h3:has-text("Cash App")'
    ];

    let cashAppElement = null;
    for (const selector of selectors) {
      try {
        cashAppElement = await page.$(selector);
        if (cashAppElement) {
          console.log(`✅ Found Cash App element with selector: ${selector}\n`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    // If not found, look for any element with "Cash App" text
    if (!cashAppElement) {
      console.log('🔍 Searching for Cash App text in page...');
      cashAppElement = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.find(el => el.textContent.includes('Cash App'));
      });
    }

    if (!cashAppElement || cashAppElement.asElement() === null) {
      console.log('❌ Cash App payment option not found!');
      await page.screenshot({ path: 'cashapp-not-found.png', fullPage: true });
      console.log('Screenshot saved to cashapp-not-found.png');

      // Print available payment methods
      const buttons = await page.$$('button');
      console.log(`\nFound ${buttons.length} buttons on page`);

      throw new Error('Cash App payment option not available');
    }

    // Step 5: Click Cash App option
    console.log('4️⃣ Clicking Cash App payment option...');
    await cashAppElement.asElement().click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Cash App option clicked\n');

    // Step 6: Check for QR code
    console.log('5️⃣ Checking for QR code...');
    const qrCodeSelectors = [
      'img[alt*="Cash App"]',
      'img[alt*="QR"]',
      'canvas',
      'img[src*="data:image"]'
    ];

    let qrCode = null;
    for (const selector of qrCodeSelectors) {
      qrCode = await page.$(selector);
      if (qrCode) {
        console.log(`✅ QR code found with selector: ${selector}\n`);
        break;
      }
    }

    if (!qrCode) {
      console.log('⚠️ QR code not immediately visible, checking page content...');
      const hasQRText = await page.evaluate(() => {
        return document.body.innerText.includes('Scan') ||
               document.body.innerText.includes('QR');
      });
      console.log('Page mentions QR/Scan:', hasQRText);
    }

    // Step 7: Get payment amount
    console.log('6️⃣ Extracting payment amount...');
    const amounts = await page.evaluate(() => {
      const regex = /\$\d+\.\d{2}/g;
      const text = document.body.innerText;
      const matches = text.match(regex);
      return matches || [];
    });

    console.log('💰 Amounts found on page:', amounts);

    // Step 8: Check for Cash App link
    console.log('7️⃣ Checking for Cash App payment link...');
    const links = await page.$$eval('a', anchors =>
      anchors.map(a => a.href).filter(href => href.includes('cash.app'))
    );

    if (links.length > 0) {
      console.log('✅ Cash App link found:', links[0]);
      console.log('Amount in link:', links[0].match(/\d+\.\d{2}/)?.[0] || 'Not found');
    }

    // Step 9: Take screenshot
    await page.screenshot({ path: 'cashapp-test-result.png', fullPage: true });
    console.log('\n✅ Screenshot saved to cashapp-test-result.png\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ Payment page loaded');
    console.log('✅ Cash App option:', cashAppElement ? 'Found' : 'Not found');
    console.log('✅ QR Code:', qrCode ? 'Displayed' : 'Not visible');
    console.log('💰 Payment amounts:', amounts.join(', ') || 'None found');
    console.log('🔗 Cash App link:', links.length > 0 ? 'Yes' : 'No');
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
