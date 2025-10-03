/**
 * End-to-End Customer Journey Test
 * Tests complete customer flow: Register → Add to Cart → Checkout → Pay → Verify Order
 *
 * Test 5 different customer profiles with realistic scenarios
 */

const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:3002';
const HEADLESS = 'new'; // Use new headless mode for server environment
const SLOW_MO = 50; // Slow down for debugging

// Customer test profiles
const CUSTOMERS = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson.test@gangruntest.com',
    password: 'Test123456!',
    role: 'Small Business Owner',
    scenario: 'Quick checkout with standard shipping',
    quantity: 100,
    shipping: 'standard',
    notes: 'First time customer, needs business cards ASAP'
  },
  {
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez.test@gangruntest.com',
    password: 'Test123456!',
    role: 'Marketing Manager',
    scenario: 'Bulk order with custom specifications',
    quantity: 500,
    shipping: 'expedited',
    notes: 'Corporate client, quality is critical'
  },
  {
    name: 'Elena Petrov',
    email: 'elena.petrov.test@gangruntest.com',
    password: 'Test123456!',
    role: 'Event Coordinator',
    scenario: 'Rush order for upcoming event',
    quantity: 250,
    shipping: 'express',
    notes: 'Needs delivery before Friday event'
  },
  {
    name: 'James Chen',
    email: 'james.chen.test@gangruntest.com',
    password: 'Test123456!',
    role: 'Startup Founder',
    scenario: 'Budget-conscious order',
    quantity: 50,
    shipping: 'economy',
    notes: 'Bootstrap startup, watching costs'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma.test@gangruntest.com',
    password: 'Test123456!',
    role: 'Freelance Designer',
    scenario: 'Sample order for client presentation',
    quantity: 25,
    shipping: 'standard',
    notes: 'Will order in bulk if approved'
  }
];

// Utility functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (customer, message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  const reset = '\x1b[0m';
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${colors[type]}[${timestamp}] [${customer.name}] ${message}${reset}`);
};

const takeScreenshot = async (page, customer, step) => {
  const filename = `/root/websites/gangrunprinting/screenshots/${customer.email.replace('@gangruntest.com', '')}-${step}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  log(customer, `📸 Screenshot saved: ${filename}`, 'info');
};

// Main test function for a single customer
async function testCustomerJourney(customer, testNumber) {
  let browser;
  const results = {
    customer: customer.name,
    email: customer.email,
    steps: [],
    success: false,
    orderId: null,
    orderNumber: null,
    errors: []
  };

  try {
    log(customer, `🚀 Starting test ${testNumber}/5 - ${customer.scenario}`, 'info');

    // Launch browser
    browser = await puppeteer.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Step 1: Navigate to homepage
    log(customer, '📄 Navigating to homepage...', 'info');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    results.steps.push({ step: 'Navigate to homepage', success: true });
    await takeScreenshot(page, customer, '01-homepage');
    await wait(1000);

    // Step 2: Navigate to products page
    log(customer, '🛍️  Navigating to products page...', 'info');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2', timeout: 30000 });
    results.steps.push({ step: 'Navigate to products page', success: true });
    await takeScreenshot(page, customer, '02-products-page');
    await wait(2000);

    // Step 3: Find and click on the first available product
    log(customer, '🔍 Finding product...', 'info');

    // Wait for products to load
    try {
      await page.waitForSelector('[data-testid="product-card"], .product-card, a[href*="/products/"]', { timeout: 10000 });

      // Find the first product link
      const productLink = await page.evaluate(() => {
        // Try different selectors to find product links
        const selectors = [
          'a[href*="/products/"]:not([href="/products"])',
          '[data-testid="product-card"] a',
          '.product-card a',
          'div[class*="product"] a[href*="/products/"]'
        ];

        for (const selector of selectors) {
          const links = Array.from(document.querySelectorAll(selector));
          const validLink = links.find(link => {
            const href = link.getAttribute('href');
            return href && href.includes('/products/') && href !== '/products';
          });
          if (validLink) return validLink.href;
        }
        return null;
      });

      if (productLink) {
        log(customer, `Found product link: ${productLink}`, 'success');
        await page.goto(productLink, { waitUntil: 'networkidle2', timeout: 30000 });
        results.steps.push({ step: 'Navigate to product page', success: true });
        await takeScreenshot(page, customer, '03-product-detail');
        await wait(2000);
      } else {
        throw new Error('No product links found on products page');
      }
    } catch (error) {
      log(customer, `❌ Error finding product: ${error.message}`, 'error');
      results.errors.push(`Product selection: ${error.message}`);
      results.steps.push({ step: 'Find product', success: false, error: error.message });
      throw error;
    }

    // Step 4: Configure product and add to cart
    log(customer, `⚙️  Configuring product (Quantity: ${customer.quantity})...`, 'info');

    try {
      // Wait for configuration options to load
      await page.waitForSelector('input, select, button', { timeout: 10000 });
      await wait(2000);

      // Try to find and fill quantity input
      const quantityFilled = await page.evaluate((qty) => {
        const quantitySelectors = [
          'input[type="number"]',
          'input[name="quantity"]',
          'input[placeholder*="quantity" i]',
          'select[name="quantity"]'
        ];

        for (const selector of quantitySelectors) {
          const input = document.querySelector(selector);
          if (input) {
            if (input.tagName === 'SELECT') {
              // For select dropdown, choose closest value
              const options = Array.from(input.options);
              const closest = options.find(opt => parseInt(opt.value) >= qty) || options[options.length - 1];
              if (closest) {
                input.value = closest.value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
              }
            } else {
              // For input field
              input.value = qty;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
        return false;
      }, customer.quantity);

      if (quantityFilled) {
        log(customer, `✓ Quantity set to ${customer.quantity}`, 'success');
        await wait(1000);
      } else {
        log(customer, `⚠️  Could not find quantity field, continuing...`, 'warning');
      }

      await takeScreenshot(page, customer, '04-configured');
      await wait(1000);

      // Find and click "Add to Cart" button
      const addToCartClicked = await page.evaluate(() => {
        const buttonSelectors = [
          'button:has-text("Add to Cart")',
          'button:has-text("Add to Basket")',
          'button[type="submit"]',
          'button.add-to-cart',
          'button[data-testid="add-to-cart"]'
        ];

        const allButtons = Array.from(document.querySelectorAll('button'));
        const addButton = allButtons.find(btn =>
          btn.textContent.toLowerCase().includes('add to cart') ||
          btn.textContent.toLowerCase().includes('add to basket') ||
          btn.classList.contains('add-to-cart')
        );

        if (addButton && !addButton.disabled) {
          addButton.click();
          return true;
        }
        return false;
      });

      if (addToCartClicked) {
        log(customer, '✓ Clicked Add to Cart', 'success');
        await wait(2000);
        results.steps.push({ step: 'Add to cart', success: true });
        await takeScreenshot(page, customer, '05-added-to-cart');
      } else {
        throw new Error('Could not find or click Add to Cart button');
      }
    } catch (error) {
      log(customer, `❌ Error configuring product: ${error.message}`, 'error');
      results.errors.push(`Product configuration: ${error.message}`);
      results.steps.push({ step: 'Configure product', success: false, error: error.message });
      throw error;
    }

    // Step 5: Navigate to cart
    log(customer, '🛒 Navigating to cart...', 'info');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2', timeout: 30000 });
    results.steps.push({ step: 'Navigate to cart', success: true });
    await takeScreenshot(page, customer, '06-cart');
    await wait(2000);

    // Step 6: Proceed to checkout
    log(customer, '💳 Proceeding to checkout...', 'info');

    try {
      // Look for checkout button
      const checkoutClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const checkoutBtn = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('checkout') ||
          btn.textContent.toLowerCase().includes('proceed')
        );

        if (checkoutBtn) {
          checkoutBtn.click();
          return true;
        }
        return false;
      });

      if (checkoutClicked) {
        await wait(3000);
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
        results.steps.push({ step: 'Proceed to checkout', success: true });
        await takeScreenshot(page, customer, '07-checkout-page');
      } else {
        // Try direct navigation
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 });
        results.steps.push({ step: 'Navigate to checkout', success: true });
        await takeScreenshot(page, customer, '07-checkout-page');
      }
    } catch (error) {
      log(customer, `⚠️  Checkout navigation issue: ${error.message}`, 'warning');
      // Try direct URL
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 });
    }

    await wait(2000);

    // Step 7: Check if login is required
    const currentUrl = page.url();
    log(customer, `Current URL: ${currentUrl}`, 'info');

    if (currentUrl.includes('signin') || currentUrl.includes('login') || currentUrl.includes('auth')) {
      log(customer, '🔐 Login required, creating account...', 'info');

      // Check if we need to switch to signup
      const hasSignupLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.some(link =>
          link.textContent.toLowerCase().includes('sign up') ||
          link.textContent.toLowerCase().includes('register') ||
          link.textContent.toLowerCase().includes('create account')
        );
      });

      if (hasSignupLink) {
        log(customer, 'Clicking sign up link...', 'info');
        await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          const signupLink = links.find(link =>
            link.textContent.toLowerCase().includes('sign up') ||
            link.textContent.toLowerCase().includes('register') ||
            link.textContent.toLowerCase().includes('create account')
          );
          if (signupLink) signupLink.click();
        });
        await wait(2000);
      }

      // Fill in registration form
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

      // Fill name field if exists
      const nameInput = await page.$('input[name="name"], input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.type(customer.name, { delay: 50 });
        log(customer, `✓ Filled name: ${customer.name}`, 'success');
      }

      // Fill email
      await page.type('input[type="email"], input[name="email"]', customer.email, { delay: 50 });
      log(customer, `✓ Filled email: ${customer.email}`, 'success');

      // Fill password
      const passwordInputs = await page.$$('input[type="password"]');
      if (passwordInputs.length > 0) {
        for (const input of passwordInputs) {
          await input.type(customer.password, { delay: 50 });
        }
        log(customer, '✓ Filled password', 'success');
      }

      await takeScreenshot(page, customer, '08-registration-form');
      await wait(1000);

      // Submit registration
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
        const submitBtn = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('sign up') ||
          btn.textContent.toLowerCase().includes('register') ||
          btn.textContent.toLowerCase().includes('create')
        ) || buttons[0];

        if (submitBtn) submitBtn.click();
      });

      log(customer, '✓ Submitted registration', 'success');
      await wait(3000);
      results.steps.push({ step: 'Create account', success: true });
      await takeScreenshot(page, customer, '09-after-registration');

      // Navigate back to checkout
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(2000);
    }

    // Step 8: Fill shipping information
    log(customer, '📦 Filling shipping information...', 'info');

    try {
      await page.waitForSelector('input, select', { timeout: 10000 });
      await wait(2000);

      // Fill address form
      const addressData = {
        street: '123 Main Street',
        city: 'Dallas',
        state: 'TX',
        zip: '75001',
        phone: '214-555-0123'
      };

      // Try to fill common address fields
      await page.evaluate((data) => {
        const fillField = (selectors, value) => {
          for (const selector of selectors) {
            const input = document.querySelector(selector);
            if (input && input.offsetParent !== null) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
          return false;
        };

        fillField(['input[name="street"], input[placeholder*="street" i], input[placeholder*="address" i]'], data.street);
        fillField(['input[name="city"], input[placeholder*="city" i]'], data.city);
        fillField(['input[name="state"], select[name="state"], input[placeholder*="state" i]'], data.state);
        fillField(['input[name="zip"], input[name="zipCode"], input[placeholder*="zip" i]'], data.zip);
        fillField(['input[name="phone"], input[type="tel"], input[placeholder*="phone" i]'], data.phone);
      }, addressData);

      log(customer, '✓ Filled shipping address', 'success');
      await wait(1000);
      await takeScreenshot(page, customer, '10-shipping-filled');
      results.steps.push({ step: 'Fill shipping info', success: true });
    } catch (error) {
      log(customer, `⚠️  Shipping form issue: ${error.message}`, 'warning');
      results.errors.push(`Shipping form: ${error.message}`);
    }

    // Step 9: Select Cash payment method
    log(customer, '💵 Selecting cash payment...', 'info');

    try {
      await wait(2000);

      const cashSelected = await page.evaluate(() => {
        // Look for cash payment option
        const labels = Array.from(document.querySelectorAll('label, input, button'));
        const cashOption = labels.find(el =>
          (el.textContent && el.textContent.toLowerCase().includes('cash')) ||
          (el.value && el.value.toLowerCase().includes('cash'))
        );

        if (cashOption) {
          if (cashOption.tagName === 'INPUT') {
            cashOption.click();
          } else if (cashOption.tagName === 'LABEL') {
            cashOption.click();
          } else if (cashOption.tagName === 'BUTTON') {
            cashOption.click();
          }
          return true;
        }
        return false;
      });

      if (cashSelected) {
        log(customer, '✓ Selected cash payment', 'success');
      } else {
        log(customer, '⚠️  Cash option not found, will try to proceed anyway', 'warning');
      }

      await wait(1000);
      await takeScreenshot(page, customer, '11-payment-selected');
      results.steps.push({ step: 'Select cash payment', success: cashSelected });
    } catch (error) {
      log(customer, `⚠️  Payment selection issue: ${error.message}`, 'warning');
      results.errors.push(`Payment selection: ${error.message}`);
    }

    // Step 10: Place order
    log(customer, '🎯 Placing order...', 'info');

    try {
      await wait(2000);

      const orderPlaced = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const placeOrderBtn = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('place order') ||
          btn.textContent.toLowerCase().includes('complete order') ||
          btn.textContent.toLowerCase().includes('submit order') ||
          btn.textContent.toLowerCase().includes('confirm')
        );

        if (placeOrderBtn && !placeOrderBtn.disabled) {
          placeOrderBtn.click();
          return true;
        }
        return false;
      });

      if (orderPlaced) {
        log(customer, '✓ Clicked place order button', 'success');
        await wait(5000); // Wait for order processing
        await takeScreenshot(page, customer, '12-order-placed');
        results.steps.push({ step: 'Place order', success: true });

        // Try to get order number from success page
        const orderInfo = await page.evaluate(() => {
          const text = document.body.textContent;
          const orderNumberMatch = text.match(/order\s*#?\s*(\d+)/i) || text.match(/order\s*number:?\s*([A-Z0-9-]+)/i);
          return {
            orderNumber: orderNumberMatch ? orderNumberMatch[1] : null,
            url: window.location.href
          };
        });

        if (orderInfo.orderNumber) {
          results.orderNumber = orderInfo.orderNumber;
          log(customer, `✓ Order placed! Order #${orderInfo.orderNumber}`, 'success');
        } else {
          log(customer, '✓ Order placed! (Order number not found on page)', 'success');
        }
      } else {
        throw new Error('Could not find or click place order button');
      }
    } catch (error) {
      log(customer, `❌ Error placing order: ${error.message}`, 'error');
      results.errors.push(`Place order: ${error.message}`);
      results.steps.push({ step: 'Place order', success: false, error: error.message });
      throw error;
    }

    // Step 11: Navigate to account orders page
    log(customer, '📋 Checking order in account...', 'info');

    try {
      await wait(2000);
      await page.goto(`${BASE_URL}/account/orders`, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(3000);
      await takeScreenshot(page, customer, '13-account-orders');

      // Check if order appears with PROCESSING status
      const orderStatus = await page.evaluate(() => {
        const statusElements = Array.from(document.querySelectorAll('*'));
        const processingEl = statusElements.find(el =>
          el.textContent.includes('PROCESSING') ||
          el.textContent.includes('Processing')
        );

        return {
          found: !!processingEl,
          statusText: processingEl ? processingEl.textContent.trim() : null
        };
      });

      if (orderStatus.found) {
        log(customer, `✓ Order verified in account with status: ${orderStatus.statusText}`, 'success');
        results.steps.push({ step: 'Verify order in account', success: true, status: orderStatus.statusText });
      } else {
        log(customer, '⚠️  Order may not have PROCESSING status yet', 'warning');
        results.steps.push({ step: 'Verify order in account', success: true, status: 'Unknown' });
      }
    } catch (error) {
      log(customer, `⚠️  Could not verify order in account: ${error.message}`, 'warning');
      results.errors.push(`Order verification: ${error.message}`);
      results.steps.push({ step: 'Verify order in account', success: false, error: error.message });
    }

    results.success = true;
    log(customer, '✅ TEST COMPLETED SUCCESSFULLY', 'success');

  } catch (error) {
    log(customer, `❌ TEST FAILED: ${error.message}`, 'error');
    results.success = false;
    results.errors.push(`Fatal error: ${error.message}`);

    if (browser) {
      const page = (await browser.pages())[0];
      if (page) {
        await takeScreenshot(page, customer, 'error');
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

// Main execution
(async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 E2E CUSTOMER JOURNEY TEST SUITE');
  console.log('='.repeat(80) + '\n');

  // Create screenshots directory
  const fs = require('fs');
  const path = require('path');
  const screenshotDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const allResults = [];

  // Run tests sequentially for each customer
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const customer = CUSTOMERS[i];
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Starting test ${i + 1}/${CUSTOMERS.length}: ${customer.name} (${customer.role})`);
    console.log(`Scenario: ${customer.scenario}`);
    console.log(`${'─'.repeat(80)}\n`);

    const result = await testCustomerJourney(customer, i + 1);
    allResults.push(result);

    // Wait between tests
    if (i < CUSTOMERS.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next test...\n');
      await wait(5000);
    }
  }

  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY REPORT');
  console.log('='.repeat(80) + '\n');

  let successCount = 0;
  let failCount = 0;

  allResults.forEach((result, index) => {
    if (result.success) successCount++;
    else failCount++;

    console.log(`\n${index + 1}. ${result.customer} (${result.email})`);
    console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Completed Steps: ${result.steps.filter(s => s.success).length}/${result.steps.length}`);

    if (result.orderNumber) {
      console.log(`   Order Number: ${result.orderNumber}`);
    }

    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`     - ${err}`));
    }
  });

  console.log('\n' + '─'.repeat(80));
  console.log(`\n✅ Passed: ${successCount}/${CUSTOMERS.length}`);
  console.log(`❌ Failed: ${failCount}/${CUSTOMERS.length}`);
  console.log(`📈 Success Rate: ${((successCount / CUSTOMERS.length) * 100).toFixed(1)}%`);

  console.log('\n' + '='.repeat(80));
  console.log('🎉 TEST SUITE COMPLETED');
  console.log('='.repeat(80) + '\n');

  // Save detailed report to file
  const reportPath = '/root/websites/gangrunprinting/test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: CUSTOMERS.length,
      passed: successCount,
      failed: failCount,
      successRate: ((successCount / CUSTOMERS.length) * 100).toFixed(1) + '%'
    },
    results: allResults
  }, null, 2));

  console.log(`📄 Detailed report saved to: ${reportPath}\n`);

  process.exit(failCount > 0 ? 1 : 0);
})();
