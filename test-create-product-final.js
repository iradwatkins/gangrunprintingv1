/**
 * Final test - Click Create Product and capture full details
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://gangrunprinting.com';
const SESSION_ID = 'f3874fb5dc6c8b52a14ab31daa37a8633640ba78';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name) {
  const fs = require('fs');
  const dir = '/root/websites/gangrunprinting/test-screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `${dir}/final-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 ${filename}`);
  return filename;
}

async function testProductCreation() {
  console.log('🚀 FINAL PRODUCT CREATION TEST');
  console.log('=' .repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set session cookie
    await page.setCookie({
      name: 'auth_session',
      value: SESSION_ID,
      domain: 'gangrunprinting.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });

    console.log('✅ Session cookie set');

    // Navigate to product creation page
    console.log('\n📍 Navigating to /admin/products/new...');
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await wait(3000);
    await takeScreenshot(page, '01-loaded');

    // Setup comprehensive monitoring
    const logs = [];
    const apiCalls = [];
    const networkErrors = [];

    page.on('console', msg => {
      const text = msg.text();
      logs.push({ type: msg.type(), text, timestamp: Date.now() });
      console.log(`   [${msg.type().toUpperCase()}] ${text}`);
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const method = response.request().method();
        const status = response.status();
        let body = null;
        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            body = await response.json();
          } else {
            body = await response.text();
          }
        } catch (e) {
          body = { error: 'Could not parse response', parseError: e.message };
        }

        const call = {
          method,
          url: url.replace(BASE_URL, ''),
          status,
          body,
          timestamp: Date.now()
        };

        apiCalls.push(call);

        if (method === 'POST' || status >= 400 || url.includes('/products')) {
          console.log(`   🌐 [API] ${method} ${call.url} → ${status}`);
          if (status >= 400) {
            console.log(`        Error: ${JSON.stringify(body, null, 2)}`);
          }
        }
      }
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure(),
        timestamp: Date.now()
      });
      console.log(`   ❌ [NETWORK] Request failed: ${request.url()}`);
    });

    // Click Quick Fill
    console.log('\n🎯 Clicking Quick Fill...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Quick Fill')
      );
      if (button) {
        console.log('Quick Fill button found, clicking...');
        button.click();
        return true;
      }
      console.error('Quick Fill button not found!');
      return false;
    });

    await wait(3000);
    await takeScreenshot(page, '02-after-quick-fill');

    // Verify form is filled by checking visible text
    const formVerification = await page.evaluate(() => {
      const getText = (label) => {
        const element = Array.from(document.querySelectorAll('*')).find(el =>
          el.textContent.trim().startsWith(label)
        );
        return element ? element.textContent : null;
      };

      const productNameDiv = document.body.innerHTML.includes('Test Product');
      const landingPageFolder = document.body.innerHTML.includes('Landing Page Folder');

      return {
        hasProductName: productNameDiv,
        hasCategory: landingPageFolder,
        bodyIncludes: {
          testProduct: document.body.innerHTML.includes('Test Product'),
          quantitySelected: document.body.innerHTML.includes('✓ Selected:'),
          configSummary: document.body.innerHTML.includes('Configuration Summary')
        }
      };
    });

    console.log('\n📋 Form verification:', JSON.stringify(formVerification, null, 2));

    if (!formVerification.hasProductName) {
      console.log('❌ Form not filled properly');
      return { success: false, error: 'Form not filled', formVerification };
    }

    console.log('✅ Form appears to be filled correctly');

    // Click Create Product button
    console.log('\n🚀 Clicking "Create Product" button...');

    const createButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      console.log(`Found ${buttons.length} buttons on page`);

      const createButton = buttons.find(btn => {
        const text = btn.textContent.trim();
        const isCreateButton = text === 'Create Product' || text.includes('Create Product');
        const isDisabled = btn.disabled;
        console.log(`Button: "${text}" | Disabled: ${isDisabled} | Match: ${isCreateButton}`);
        return isCreateButton && !isDisabled;
      });

      if (createButton) {
        console.log('✓ Found Create Product button, clicking...');
        createButton.click();
        return true;
      } else {
        console.error('✗ Create Product button not found or is disabled');
        return false;
      }
    });

    if (!createButtonClicked) {
      console.log('❌ Failed to click Create Product button');
      await takeScreenshot(page, '03-button-not-clicked');
      return { success: false, error: 'Button not clicked' };
    }

    console.log('✅ Create Product button clicked');

    // Wait for response (longer timeout for API call)
    console.log('\n⏳ Waiting for API response (10 seconds)...');
    await wait(10000);
    await takeScreenshot(page, '04-after-create');

    // Check final state
    const finalUrl = page.url();
    console.log('\n📍 Final URL:', finalUrl);

    // Look for toast notifications
    const toasts = await page.evaluate(() => {
      const toastSelectors = [
        '[role="status"]',
        '[role="alert"]',
        '.toast',
        '[class*="toast"]',
        '[class*="Toaster"]',
        '[data-sonner-toast]'
      ];

      const foundToasts = [];
      toastSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 0) {
            foundToasts.push({ selector, text });
          }
        });
      });

      return foundToasts;
    });

    console.log('\n📬 Toast notifications:', toasts.length > 0 ? JSON.stringify(toasts, null, 2) : 'None found');

    // Analyze API calls
    console.log('\n📡 API CALL ANALYSIS:');
    const productApiCalls = apiCalls.filter(c => c.url.includes('/products'));

    if (productApiCalls.length === 0) {
      console.log('   ⚠️  NO API CALLS TO /api/products DETECTED');
    } else {
      productApiCalls.forEach((call, i) => {
        console.log(`\n   ${i + 1}. ${call.method} ${call.url}`);
        console.log(`      Status: ${call.status}`);
        console.log(`      Response:`, JSON.stringify(call.body, null, 2));
      });
    }

    // Check for errors
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length > 0) {
      console.log('\n🔴 CONSOLE ERRORS:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.text}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log('\n🔴 NETWORK ERRORS:');
      networkErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.url}`);
        console.log(`       ${JSON.stringify(err.failure)}`);
      });
    }

    // Determine success
    const productCreated = apiCalls.some(c =>
      c.url.includes('/api/products') &&
      c.method === 'POST' &&
      c.status === 201
    );

    const apiError = apiCalls.find(c =>
      c.url.includes('/api/products') &&
      c.method === 'POST' &&
      c.status >= 400
    );

    const redirected = finalUrl.includes('/admin/products') && !finalUrl.includes('/new');

    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTS:');
    console.log('=' .repeat(60));
    console.log(`Product created (API 201): ${productCreated}`);
    console.log(`API error: ${!!apiError}`);
    console.log(`Redirected to list: ${redirected}`);
    console.log(`Total API calls: ${apiCalls.length}`);
    console.log(`Console errors: ${errors.length}`);
    console.log(`Network errors: ${networkErrors.length}`);

    if (productCreated) {
      console.log('\n🎉 ✅ PRODUCT CREATED SUCCESSFULLY!');
      return {
        success: true,
        productCreated: true,
        redirected,
        productData: productApiCalls.find(c => c.status === 201)?.body
      };
    } else if (apiError) {
      console.log('\n❌ PRODUCT CREATION FAILED - API ERROR');
      return {
        success: false,
        apiError: apiError.body,
        status: apiError.status
      };
    } else if (productApiCalls.length === 0) {
      console.log('\n❌ PRODUCT CREATION FAILED - NO API CALL');
      return {
        success: false,
        noApiCall: true,
        errors: errors.map(e => e.text),
        networkErrors
      };
    } else {
      console.log('\n⚠️  UNCERTAIN RESULT');
      return {
        success: false,
        uncertain: true,
        productApiCalls,
        finalUrl
      };
    }

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    if (browser) {
      const page = (await browser.pages())[0];
      if (page) await takeScreenshot(page, 'error');
    }
    return { success: false, fatalError: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

testProductCreation()
  .then(result => {
    console.log('\n' + '=' .repeat(60));
    console.log('FINAL RESULT:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('=' .repeat(60));

    if (result.success) {
      console.log('\n🎉 TEST PASSED - PRODUCTS CAN BE CREATED!');
      process.exit(0);
    } else {
      console.log('\n❌ TEST FAILED - ISSUE IDENTIFIED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
