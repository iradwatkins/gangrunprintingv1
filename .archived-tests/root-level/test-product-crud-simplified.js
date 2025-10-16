/**
 * Simplified Product CRUD Test - Focuses on product creation page functionality
 * This test assumes you're already logged in as admin in your browser
 * Or you can manually complete Google OAuth when the browser opens
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://gangrunprinting.com';

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to take screenshots
async function takeScreenshot(page, name) {
  const fs = require('fs');
  const screenshotDir = '/root/websites/gangrunprinting/test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const filename = `${screenshotDir}/product-crud-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot: ${filename}`);
  return filename;
}

// Test product creation functionality
async function testProductCreation(page) {
  console.log('\n📦 TEST: Product Creation Form');
  console.log('=' .repeat(60));

  try {
    // Navigate to product creation page
    console.log('📍 Navigating to /admin/products/new...');
    await page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await wait(2000); // Wait for React hydration
    await takeScreenshot(page, '1-product-new-page');

    // Check if we're redirected to login (not authenticated)
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
      console.log('⚠️  Not authenticated - need to log in first');
      console.log('🔐 Please log in via Google OAuth...');

      // Give user time to manually log in
      console.log('⏳ Waiting 30 seconds for manual login...');
      await wait(30000);

      // Try navigating again
      await page.goto(`${BASE_URL}/admin/products/new`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await wait(2000);
      await takeScreenshot(page, '2-after-manual-login');
    }

    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        h1Text: document.querySelector('h1')?.textContent,
        hasQuickFill: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Quick Fill')
        ),
        hasCreateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Create Product')
        ),
        hasNameInput: !!document.querySelector('input[name="name"]'),
        formSections: Array.from(document.querySelectorAll('h2, h3')).map(h => h.textContent),
      };
    });

    console.log('📄 Page Content:', JSON.stringify(pageContent, null, 2));

    if (!pageContent.hasCreateButton) {
      throw new Error('Create Product button not found - page may not have loaded correctly');
    }

    // Setup console listener for errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🔴 Browser Error:', msg.text());
      }
    });

    // Setup network listener for API calls
    const apiCalls = [];
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/products') || url.includes('/api/admin')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {
          try {
            body = await response.text();
          } catch (e2) {
            body = 'Could not read response';
          }
        }
        apiCalls.push({
          method: response.request().method(),
          url,
          status,
          body
        });
        console.log(`🌐 API: ${response.request().method()} ${url} - ${status}`);
      }
    });

    // Click Quick Fill if available
    if (pageContent.hasQuickFill) {
      console.log('🎯 Clicking Quick Fill...');
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Quick Fill')
        );
        if (button) button.click();
      });

      await wait(2000);
      await takeScreenshot(page, '3-after-quick-fill');
    } else {
      console.log('⚠️  Quick Fill button not found - form may need manual filling');
      return {
        success: false,
        error: 'Quick Fill button not found',
        pageContent
      };
    }

    // Get form state after Quick Fill
    const formState = await page.evaluate(() => {
      const getInputValue = (selector) => {
        const el = document.querySelector(selector);
        if (el && el.tagName === 'SELECT') return el.value;
        if (el && el.tagName === 'INPUT') return el.value;
        if (el && el.tagName === 'TEXTAREA') return el.value;
        return null;
      };

      return {
        name: getInputValue('input[name="name"]'),
        sku: getInputValue('input[name="sku"]'),
        categoryId: getInputValue('select[name="categoryId"]'),
        description: getInputValue('textarea[name="description"]'),
      };
    });

    console.log('📊 Form State:', JSON.stringify(formState, null, 2));

    // Verify form was filled
    if (!formState.name || !formState.categoryId) {
      console.log('❌ Form not properly filled after Quick Fill');
      return {
        success: false,
        error: 'Form not filled',
        formState
      };
    }

    // Click Create Product
    console.log('🚀 Clicking Create Product...');
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
    console.log('⏳ Waiting for API response...');
    await wait(5000);
    await takeScreenshot(page, '4-after-create-click');

    // Check final URL
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);

    // Check for toast messages
    const toastMessages = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"], .toast, [class*="toast"], [class*="Toaster"]'));
      return toasts.map(t => t.textContent);
    });

    console.log('📬 Toast Messages:', toastMessages);

    // Log API calls
    console.log('\n📡 API Calls Summary:');
    apiCalls.forEach((call, index) => {
      console.log(`  ${index + 1}. ${call.method} ${call.url}`);
      console.log(`     Status: ${call.status}`);
      if (call.status >= 400) {
        console.log(`     Error Response:`, JSON.stringify(call.body, null, 2));
      } else {
        console.log(`     Success Response:`, JSON.stringify(call.body, null, 2));
      }
    });

    // Log console errors
    if (consoleErrors.length > 0) {
      console.log('\n🔴 Console Errors:');
      consoleErrors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err}`);
      });
    }

    // Determine result
    const redirectedToList = finalUrl.includes('/admin/products') && !finalUrl.includes('/new');
    const hasSuccessToast = toastMessages.some(msg =>
      msg.toLowerCase().includes('success') || msg.toLowerCase().includes('created')
    );
    const hasErrorToast = toastMessages.some(msg =>
      msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed')
    );
    const apiSuccess = apiCalls.some(call => call.status === 201 || call.status === 200);
    const apiError = apiCalls.some(call => call.status >= 400);

    console.log('\n📊 Result Analysis:');
    console.log(`  Redirected to list: ${redirectedToList}`);
    console.log(`  Success toast: ${hasSuccessToast}`);
    console.log(`  Error toast: ${hasErrorToast}`);
    console.log(`  API success: ${apiSuccess}`);
    console.log(`  API error: ${apiError}`);

    if (redirectedToList && hasSuccessToast) {
      console.log('\n✅ PRODUCT CREATION SUCCESS!');
      return { success: true, redirected: true, hasToast: true };
    } else if (apiSuccess && !apiError) {
      console.log('\n✅ API SUCCESS - But UI may have issues');
      return { success: true, apiSuccess: true, uiIssue: !redirectedToList };
    } else if (hasErrorToast || apiError) {
      console.log('\n❌ PRODUCT CREATION FAILED');
      return {
        success: false,
        hasErrorToast,
        apiError,
        apiCalls,
        consoleErrors
      };
    } else if (apiCalls.length === 0) {
      console.log('\n❌ NO API CALL DETECTED - Form submission may have failed');
      return {
        success: false,
        noApiCall: true,
        consoleErrors
      };
    } else {
      console.log('\n⚠️  UNCERTAIN RESULT - Please check manually');
      return {
        success: false,
        uncertain: true,
        apiCalls,
        toastMessages,
        finalUrl
      };
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await takeScreenshot(page, 'error');
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Product Creation Test');
  console.log('=' .repeat(60));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  let browser;
  let result;

  try {
    // Launch browser in non-headless mode for manual authentication if needed
    browser = await puppeteer.launch({
      headless: 'new', // Use 'new' for headless, or false for visible browser
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Run the test
    result = await testProductCreation(page);

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    result = { success: false, fatalError: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print final result
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL RESULT');
  console.log('=' .repeat(60));
  console.log(JSON.stringify(result, null, 2));
  console.log('=' .repeat(60));

  if (result.success) {
    console.log('🎉 TEST PASSED!');
    process.exit(0);
  } else {
    console.log('❌ TEST FAILED');
    process.exit(1);
  }
}

// Run the test
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
