const { chromium } = require('playwright');

async function debugTimeout() {
  console.log('Testing AdminAuthWrapper timeout behavior...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Block the auth API call to simulate network issues
  await page.route('**/api/auth/me', route => {
    console.log('Auth API call intercepted - simulating hang/timeout');
    // Don't fulfill or abort - let it hang to test timeout behavior
  });

  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(`[${new Date().toISOString()}] ${message}`);
  };

  page.on('console', msg => {
    log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    log(`PAGE ERROR: ${error.message}`);
  });

  try {
    log('Navigating to admin page with blocked auth API...');

    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait and check page state every 2 seconds for 12 seconds (timeout is 10s)
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(2000);
      const currentTime = new Date().toISOString();
      const pageText = await page.textContent('body');
      const currentUrl = page.url();

      log(`[${i * 2}s] URL: ${currentUrl}`);
      log(`[${i * 2}s] Loading state: ${pageText.includes('Verifying admin access')}`);
      log(`[${i * 2}s] Redirecting state: ${pageText.includes('Redirecting to sign in')}`);

      if (pageText.includes('Redirecting to sign in')) {
        log('Timeout behavior triggered correctly!');
        break;
      }
    }

    const finalUrl = page.url();
    const finalText = await page.textContent('body');

    log(`Final URL: ${finalUrl}`);
    log(`Final state: ${finalText.substring(0, 200)}`);

  } catch (error) {
    log(`Test error: ${error.message}`);
  }

  await browser.close();
  log('Timeout test completed');
}

// Run the test
debugTimeout().catch(console.error);