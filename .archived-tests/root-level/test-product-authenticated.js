/**
 * Authenticated Product CRUD Test
 * Uses Google OAuth to authenticate, then tests product creation
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://gangrunprinting.com';
const GOOGLE_EMAIL = 'iradwatkins@gmail.com';
const GOOGLE_PASSWORD = 'Iw2006js!';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name) {
  const fs = require('fs');
  const dir = '/root/websites/gangrunprinting/test-screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${dir}/auth-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 ${filename}`);
  return filename;
}

async function authenticateWithGoogle(page) {
  console.log('\n🔐 Authenticating with Google OAuth...');
  console.log('=' .repeat(60));

  try {
    // Go to signin page
    console.log('1. Navigating to signin page...');
    await page.goto(`${BASE_URL}/auth/signin`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await wait(2000);
    await takeScreenshot(page, '01-signin-page');

    // Click "Continue with Google"
    console.log('2. Clicking Google sign-in button...');
    await page.evaluate(() => {
      const googleButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Continue with Google')
      );
      if (googleButton) googleButton.click();
    });

    // Wait for Google OAuth popup or redirect
    await wait(3000);
    await takeScreenshot(page, '02-after-google-click');

    // Check if we're on Google's OAuth page
    const currentUrl = page.url();
    console.log('3. Current URL:', currentUrl);

    if (currentUrl.includes('accounts.google.com')) {
      console.log('4. On Google OAuth page - entering credentials...');
      await takeScreenshot(page, '03-google-oauth-page');

      // Enter email
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.type(GOOGLE_EMAIL, { delay: 100 });
        await takeScreenshot(page, '04-email-entered');

        // Click Next
        await page.keyboard.press('Enter');
        await wait(3000);
        await takeScreenshot(page, '05-after-email-submit');

        // Enter password
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.type(GOOGLE_PASSWORD, { delay: 100 });
          await takeScreenshot(page, '06-password-entered');

          // Submit
          await page.keyboard.press('Enter');
          await wait(5000);
          await takeScreenshot(page, '07-after-password-submit');
        }
      }

      // Wait for redirect back to our site
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      await wait(2000);
    }

    const finalUrl = page.url();
    console.log('5. Final URL after auth:', finalUrl);
    await takeScreenshot(page, '08-after-auth');

    // Verify authentication by checking /api/auth/me
    const authCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        return {
          status: response.status,
          user: data.user,
          authenticated: response.ok && data.user && data.user.role === 'ADMIN'
        };
      } catch (e) {
        return { status: 0, error: e.message, authenticated: false };
      }
    });

    console.log('6. Auth check result:', JSON.stringify(authCheck, null, 2));

    if (authCheck.authenticated) {
      console.log('✅ AUTHENTICATION SUCCESSFUL!');
      console.log(`   User: ${authCheck.user.email}`);
      console.log(`   Role: ${authCheck.user.role}`);
      return true;
    } else {
      console.log('❌ AUTHENTICATION FAILED');
      return false;
    }

  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    await takeScreenshot(page, 'error-auth');
    return false;
  }
}

async function testProductCreation(page) {
  console.log('\n📦 Testing Product Creation...');
  console.log('=' .repeat(60));

  try {
    // Navigate to product creation page
    console.log('1. Navigating to /admin/products/new...');
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for React to hydrate
    await wait(3000);
    await takeScreenshot(page, '10-product-page-loaded');

    // Setup listeners for debugging
    const logs = [];
    const apiCalls = [];

    page.on('console', msg => {
      const text = msg.text();
      logs.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        console.log('🔴 Console Error:', text);
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {
          try {
            body = await response.text();
          } catch (e2) {
            body = 'Could not read';
          }
        }
        apiCalls.push({ method: response.request().method(), url, status, body });
        console.log(`🌐 ${response.request().method()} ${url} → ${status}`);
      }
    });

    // Check if page loaded correctly
    const pageState = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        hasQuickFill: !!Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Quick Fill')
        ),
        hasCreateButton: !!Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Create Product')
        ),
        isLoading: document.body.textContent.includes('Verifying admin access'),
        formInputs: {
          name: !!document.querySelector('input[name="name"]'),
          sku: !!document.querySelector('input[name="sku"]'),
          category: !!document.querySelector('select[name="categoryId"]')
        }
      };
    });

    console.log('2. Page state:', JSON.stringify(pageState, null, 2));

    if (pageState.isLoading) {
      console.log('⏳ Page still loading, waiting 10 more seconds...');
      await wait(10000);
      await takeScreenshot(page, '11-after-extra-wait');

      // Check again
      const pageState2 = await page.evaluate(() => ({
        isLoading: document.body.textContent.includes('Verifying admin access'),
        hasForm: !!document.querySelector('input[name="name"]')
      }));

      if (pageState2.isLoading) {
        console.log('❌ Page stuck on loading screen');
        return { success: false, error: 'Page stuck loading', pageState };
      }
    }

    if (!pageState.hasQuickFill || !pageState.hasCreateButton) {
      console.log('❌ Form not loaded properly');
      return { success: false, error: 'Form not loaded', pageState };
    }

    // Click Quick Fill
    console.log('3. Clicking Quick Fill button...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Quick Fill')
      );
      if (button) button.click();
    });

    await wait(2000);
    await takeScreenshot(page, '12-after-quick-fill');

    // Get form values
    const formValues = await page.evaluate(() => {
      const getValue = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.value : null;
      };
      return {
        name: getValue('input[name="name"]'),
        sku: getValue('input[name="sku"]'),
        categoryId: getValue('select[name="categoryId"]'),
        description: getValue('textarea[name="description"]')
      };
    });

    console.log('4. Form values after Quick Fill:', JSON.stringify(formValues, null, 2));

    if (!formValues.name || !formValues.categoryId) {
      console.log('❌ Form not filled properly');
      return { success: false, error: 'Form not filled', formValues };
    }

    // Click Create Product
    console.log('5. Clicking Create Product button...');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Create Product') && !btn.disabled
      );
      if (button) {
        console.log('Clicking Create Product button');
        button.click();
      } else {
        console.error('Create Product button not found or disabled');
      }
    });

    // Wait for response
    console.log('6. Waiting for API response...');
    await wait(5000);
    await takeScreenshot(page, '13-after-create-click');

    // Check results
    const finalUrl = page.url();
    console.log('7. Final URL:', finalUrl);

    // Check for toasts
    const toastMessages = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"], .toast, [class*="toast"]'));
      return toasts.map(t => t.textContent.trim()).filter(t => t);
    });

    console.log('8. Toast messages:', toastMessages);

    // Log API calls
    console.log('\n📡 API Calls Summary:');
    apiCalls.forEach((call, i) => {
      console.log(`${i + 1}. ${call.method} ${call.url} → ${call.status}`);
      if (call.status >= 400 || call.status === 201) {
        console.log('   Response:', JSON.stringify(call.body, null, 2));
      }
    });

    // Log errors
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length > 0) {
      console.log('\n🔴 Console Errors:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err.text}`));
    }

    // Determine result
    const productCreated = apiCalls.some(c => c.url.includes('/api/products') && c.method === 'POST' && c.status === 201);
    const redirected = finalUrl.includes('/admin/products') && !finalUrl.includes('/new');
    const hasSuccess = toastMessages.some(m => m.toLowerCase().includes('success'));
    const hasError = toastMessages.some(m => m.toLowerCase().includes('error') || m.toLowerCase().includes('failed'));

    console.log('\n📊 Result Analysis:');
    console.log(`   API created product: ${productCreated}`);
    console.log(`   Redirected to list: ${redirected}`);
    console.log(`   Success toast: ${hasSuccess}`);
    console.log(`   Error toast: ${hasError}`);

    if (productCreated && redirected) {
      console.log('\n✅ PRODUCT CREATED SUCCESSFULLY!');
      return { success: true, productCreated: true, redirected: true };
    } else if (productCreated) {
      console.log('\n✅ PRODUCT CREATED (but not redirected)');
      return { success: true, productCreated: true, redirected: false };
    } else if (hasError) {
      console.log('\n❌ PRODUCT CREATION FAILED');
      return { success: false, error: 'API error', toastMessages, apiCalls: apiCalls.filter(c => c.status >= 400) };
    } else {
      console.log('\n⚠️  UNCERTAIN RESULT');
      return { success: false, uncertain: true, apiCalls, toastMessages };
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await takeScreenshot(page, 'error-product-test');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Authenticated Product CRUD Test');
  console.log('=' .repeat(60));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`👤 User: ${GOOGLE_EMAIL}`);
  console.log('=' .repeat(60));

  let browser;
  const results = {
    auth: null,
    productCreation: null
  };

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Step 1: Authenticate
    const authenticated = await authenticateWithGoogle(page);
    results.auth = { success: authenticated };

    if (!authenticated) {
      console.log('\n❌ Cannot proceed without authentication');
      return results;
    }

    // Step 2: Test product creation
    results.productCreation = await testProductCreation(page);

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    results.error = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print final results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('=' .repeat(60));
  console.log('1. Authentication:', results.auth?.success ? '✅ PASS' : '❌ FAIL');
  console.log('2. Product Creation:', results.productCreation?.success ? '✅ PASS' : '❌ FAIL');
  console.log('=' .repeat(60));

  console.log('\n📋 Detailed Results:');
  console.log(JSON.stringify(results, null, 2));

  if (results.auth?.success && results.productCreation?.success) {
    console.log('\n🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('\n❌ TESTS FAILED - Check details above');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
