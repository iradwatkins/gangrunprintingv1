// Test direct product page access to see actual browser error
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🚀') || text.includes('productId') || text.includes('Error') || text.includes('Fetching')) {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${text}`);
    }
  });

  // Capture all errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(`[STACK] ${error.stack}`);
  });

  console.log('Navigating to product page...');
  await page.goto('https://gangrunprinting.com/products/asdfddddddddddddd-20', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Wait 3 seconds for client components to hydrate
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check page content
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== PAGE TEXT ===');
  console.log(pageText.substring(0, 500));

  // Check if configuration form is present
  const hasConfigForm = await page.evaluate(() => {
    return document.querySelector('[data-testid="product-configuration-form"]') !== null ||
           document.body.innerText.includes('Loading configuration') ||
           document.body.innerText.includes('Select Quantity');
  });

  console.log('\n=== RESULTS ===');
  console.log(`Configuration form present: ${hasConfigForm}`);

  await browser.close();
})();