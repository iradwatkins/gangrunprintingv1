/**
 * Test product creation with pre-created session cookie
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://gangrunprinting.com';
const SESSION_ID = 'f3874fb5dc6c8b52a14ab31daa37a8633640ba78';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name) {
  const fs = require('fs');
  const dir = '/root/websites/gangrunprinting/test-screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `${dir}/session-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 ${filename}`);
  return filename;
}

async function testProductCreation() {
  console.log('🚀 Product Creation Test with Session Cookie');
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
    console.log('1. Setting session cookie...');
    await page.setCookie({
      name: 'auth_session',
      value: SESSION_ID,
      domain: 'gangrunprinting.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });

    // Verify authentication
    console.log('2. Verifying authentication...');
    await page.goto(`${BASE_URL}/api/auth/me`, { waitUntil: 'networkidle2' });
    const authCheck = await page.evaluate(() => document.body.textContent);
    console.log('   Auth response:', authCheck);

    const authData = JSON.parse(authCheck);
    if (!authData.user || authData.user.role !== 'ADMIN') {
      console.log('❌ Authentication failed');
      return { success: false, error: 'Not authenticated as admin' };
    }

    console.log(`✅ Authenticated as: ${authData.user.email} (${authData.user.role})`);

    // Navigate to product creation page
    console.log('\n3. Navigating to product creation page...');
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await wait(3000);
    await takeScreenshot(page, '01-page-loaded');

    // Setup listeners
    const logs = [];
    const apiCalls = [];

    page.on('console', msg => {
      const text = msg.text();
      logs.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        console.log(`   🔴 Console: ${text}`);
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const method = response.request().method();
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {}
        apiCalls.push({ method, url, status, body });
        if (method === 'POST' || status >= 400) {
          console.log(`   🌐 ${method} ${url.split('/api/')[1]} → ${status}`);
        }
      }
    });

    // Check page state
    const pageState = await page.evaluate(() => {
      const isLoading = document.body.textContent.includes('Verifying admin access');
      const hasQuickFill = !!Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Quick Fill')
      );
      const hasCreateButton = !!Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Create Product')
      );

      return {
        title: document.title,
        isLoading,
        hasQuickFill,
        hasCreateButton,
        formExists: !!document.querySelector('input[name="name"]')
      };
    });

    console.log('4. Page state:', JSON.stringify(pageState, null, 2));

    if (pageState.isLoading) {
      console.log('⏳ Still loading, waiting 10 seconds...');
      await wait(10000);
      await takeScreenshot(page, '02-after-extra-wait');

      const stillLoading = await page.evaluate(() =>
        document.body.textContent.includes('Verifying admin access')
      );

      if (stillLoading) {
        console.log('❌ Page stuck on loading');
        return { success: false, error: 'Page stuck loading' };
      }
    }

    if (!pageState.hasQuickFill || !pageState.hasCreateButton) {
      console.log('❌ Form not loaded');
      return { success: false, error: 'Form not loaded', pageState };
    }

    // Click Quick Fill
    console.log('\n5. Clicking Quick Fill...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Quick Fill')
      );
      if (button) button.click();
    });

    await wait(2000);
    await takeScreenshot(page, '03-after-quick-fill');

    // Get form values
    const formValues = await page.evaluate(() => {
      const getValue = (sel) => document.querySelector(sel)?.value || null;
      return {
        name: getValue('input[name="name"]'),
        sku: getValue('input[name="sku"]'),
        categoryId: getValue('select[name="categoryId"]'),
        description: getValue('textarea[name="description"]')
      };
    });

    console.log('6. Form values:', JSON.stringify(formValues, null, 2));

    if (!formValues.name || !formValues.categoryId) {
      console.log('❌ Form not properly filled');
      return { success: false, error: 'Form not filled', formValues };
    }

    // Click Create Product
    console.log('\n7. Clicking Create Product...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Create Product') && !btn.disabled
      );
      if (button) button.click();
    });

    // Wait for response
    console.log('8. Waiting for response...');
    await wait(5000);
    await takeScreenshot(page, '04-after-create');

    const finalUrl = page.url();
    console.log('9. Final URL:', finalUrl);

    // Check toasts
    const toasts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="status"], .toast')).map(t => t.textContent.trim())
    );
    console.log('10. Toasts:', toasts);

    // Analyze results
    const productCreated = apiCalls.some(c => c.url.includes('/api/products') && c.method === 'POST' && c.status === 201);
    const apiError = apiCalls.find(c => c.url.includes('/api/products') && c.method === 'POST' && c.status >= 400);
    const redirected = finalUrl.includes('/admin/products') && !finalUrl.includes('/new');

    console.log('\n📊 Results:');
    console.log(`   Product created: ${productCreated}`);
    console.log(`   Redirected: ${redirected}`);
    console.log(`   API error: ${!!apiError}`);

    if (apiError) {
      console.log('\n❌ API Error Details:');
      console.log(JSON.stringify(apiError.body, null, 2));
    }

    // Log all POST /api/products calls
    const productApiCalls = apiCalls.filter(c => c.url.includes('/api/products') && c.method === 'POST');
    if (productApiCalls.length > 0) {
      console.log('\n📡 Product API Calls:');
      productApiCalls.forEach(call => {
        console.log(`   ${call.method} ${call.url} → ${call.status}`);
        console.log('   Response:', JSON.stringify(call.body, null, 2));
      });
    }

    // Log console errors
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length > 0) {
      console.log('\n🔴 Console Errors:');
      errors.forEach(err => console.log(`   ${err.text}`));
    }

    if (productCreated) {
      console.log('\n✅ PRODUCT CREATED SUCCESSFULLY!');
      return { success: true, productCreated: true, redirected };
    } else if (apiError) {
      console.log('\n❌ PRODUCT CREATION FAILED');
      return { success: false, apiError: apiError.body, toasts };
    } else {
      console.log('\n⚠️  NO API CALL DETECTED');
      return { success: false, noApiCall: true, logs: errors };
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    return { success: false, fatalError: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

testProductCreation()
  .then(result => {
    console.log('\n' + '=' .repeat(60));
    console.log('FINAL RESULT:');
    console.log(JSON.stringify(result, null, 2));
    console.log('=' .repeat(60));

    if (result.success) {
      console.log('🎉 TEST PASSED!');
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal:', error);
    process.exit(1);
  });
