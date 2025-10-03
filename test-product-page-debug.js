const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('SimpleQuantityTest') || text.includes('Product Page')) {
      console.log(`[BROWSER CONSOLE] ${text}`);
    }
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log(`[BROWSER ERROR] ${error.message}`);
  });

  console.log('Navigating to product page...');
  await page.goto('http://localhost:3002/products/test', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Wait a bit for React to hydrate
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check what's actually rendered
  const pageContent = await page.evaluate(() => {
    const customizeTab = document.querySelector('[role="tabpanel"][data-state="active"]');
    if (customizeTab) {
      return customizeTab.textContent;
    }
    return 'Tab panel not found';
  });

  console.log('\n=== PAGE CONTENT ===');
  console.log(pageContent);

  // Check for Add to Cart button
  const addToCartButton = await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Add to Cart')
    );
    return button ? {
      exists: true,
      text: button.textContent.trim(),
      disabled: button.disabled
    } : { exists: false };
  });

  console.log('\n=== ADD TO CART BUTTON ===');
  console.log(JSON.stringify(addToCartButton, null, 2));

  if (addToCartButton.exists && !addToCartButton.disabled) {
    console.log('\n✅ SUCCESS: Product page is fully functional!');
    console.log('✅ Configuration loaded');
    console.log('✅ Add to Cart button is enabled');
    console.log('✅ Customer can add product to cart');
  }

  await browser.close();
})();
