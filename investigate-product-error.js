const { chromium } = require('playwright');
const fs = require('fs');

// Real data from database
const REAL_DATA = {
  categories: [
    { id: 'cat_banner', name: 'Banner', slug: 'banner' },
  ],
  paperStocks: [
    { id: 'cmg46sc60000f12ymdo48kpb0', name: '16pt C2S Cardstock' },
  ],
  quantityGroups: [
    { id: 'cmg5i6poy000094pu856umjxa', name: 'Standard Size' }
  ],
  sizeGroups: [
    { id: 'b180aadd-1ed7-42e5-9640-9460a58e9f72', name: 'Printing Sizes' }
  ],
  turnaroundGroups: [
    { id: 'cmg46sc7u001k12ymd9w3p9uk', name: 'Standard Turnaround Options' }
  ]
};

async function investigateProductError() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Capture network requests
  const apiRequests = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/products') && response.request().method() === 'POST') {
      const status = response.status();
      let body = null;
      try {
        body = await response.text();
      } catch (e) {
        body = 'Could not read response body';
      }

      const requestData = {
        url,
        status,
        method: response.request().method(),
        headers: await response.allHeaders(),
        body,
        requestBody: response.request().postData()
      };

      apiRequests.push(requestData);

      console.log('\n=== API RESPONSE CAPTURED ===');
      console.log('URL:', url);
      console.log('Status:', status);
      console.log('Request Body:', response.request().postData());
      console.log('Response Body:', body);
      console.log('============================\n');
    }
  });

  try {
    // Login first using Google OAuth or magic link
    console.log('=== STEP 1: Navigating to admin panel ===');
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.screenshot({ path: 'step1-initial-page.png' });
    console.log('Screenshot saved: step1-initial-page.png');

    // Check if we're redirected to login
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/auth/signin')) {
      console.log('\n=== STEP 2: Need to login - Using email magic link ===');

      // Try email login
      await page.fill('input[type="email"]', 'iradwatkins@gmail.com');
      await page.screenshot({ path: 'step2-email-filled.png' });

      console.log('Email filled, but magic link auth requires email check. Skipping automated login.');
      console.log('Manual login required for this test.');

      // Save current state
      await page.screenshot({ path: 'auth-required.png' });
      console.log('\nCannot proceed without authentication.');
      return;
    }

    // If we're already on the products page
    console.log('\n=== STEP 2: Already authenticated, proceeding to create product ===');

    // Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('Form loaded');

    // Fill the form
    console.log('\n=== STEP 3: Filling product form ===');

    await page.fill('input[name="name"]', 'Test Product - Playwright Investigation');
    await page.fill('input[name="slug"]', 'test-product-playwright-investigation');
    await page.fill('textarea[name="description"]', 'Test product for error investigation');

    // Select dropdowns
    await page.selectOption('select[name="categoryId"]', REAL_DATA.categories[0].id);
    await page.selectOption('select[name="paperStockId"]', REAL_DATA.paperStocks[0].id);
    await page.selectOption('select[name="quantityGroupId"]', REAL_DATA.quantityGroups[0].id);
    await page.selectOption('select[name="sizeGroupId"]', REAL_DATA.sizeGroups[0].id);
    await page.selectOption('select[name="turnaroundTimeGroupId"]', REAL_DATA.turnaroundGroups[0].id);

    await page.fill('input[name="basePrice"]', '25.99');

    await page.screenshot({ path: 'step3-form-filled.png' });
    console.log('Screenshot saved: step3-form-filled.png');

    // Submit form
    console.log('\n=== STEP 4: Submitting form ===');

    // Wait for the response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/products') && response.request().method() === 'POST',
      { timeout: 30000 }
    );

    await page.click('button[type="submit"]');

    try {
      const response = await responsePromise;
      console.log('\nAPI Response Status:', response.status());

      // Wait a bit for any error messages
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'step4-after-submit.png' });
      console.log('Screenshot saved: step4-after-submit.png');

      // Check for error messages on the page
      const errors = await page.$$eval('[role="alert"], .text-red-500, .text-red-600, .error',
        elements => elements.map(el => el.textContent)
      );

      if (errors.length > 0) {
        console.log('\n=== ERROR MESSAGES ON PAGE ===');
        errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
      }

    } catch (e) {
      console.log('No API response captured or timeout:', e.message);
    }

    // Save all captured requests
    if (apiRequests.length > 0) {
      fs.writeFileSync('api-requests.json', JSON.stringify(apiRequests, null, 2));
      console.log('\n=== API REQUESTS SAVED ===');
      console.log('File: api-requests.json');

      apiRequests.forEach((req, i) => {
        console.log(`\nRequest ${i + 1}:`);
        console.log('Status:', req.status);
        console.log('Response:', req.body);
      });
    }

  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error.message);
    console.error(error.stack);

    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('Error screenshot saved');

  } finally {
    await browser.close();
  }
}

investigateProductError().catch(console.error);
