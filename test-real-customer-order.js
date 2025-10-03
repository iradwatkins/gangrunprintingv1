#!/usr/bin/env node

/**
 * Real Customer Order Test - Complete Flow
 * Tests the entire customer journey from product selection to order confirmation
 * This creates REAL orders, not test orders
 */

const puppeteer = require('puppeteer');

const SITE_URL = 'https://gangrunprinting.com';
const TEST_CUSTOMER = {
  email: 'appvillagellc@gmail.com',
  firstName: 'App',
  lastName: 'Village',
  company: 'App Village LLC',
  phone: '(773) 270-0582',
  address: {
    street: '2740 West 83rd Pl',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60652'
  }
};

// Color utilities for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${'='.repeat(60)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createRealOrder(orderNumber) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to appear as a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    log.header(`REAL ORDER #${orderNumber} - Starting Customer Journey`);

    // Step 1: Go to the product page
    log.step('Navigating to product page...');
    await page.goto(`${SITE_URL}/products/asdfasd`, { waitUntil: 'networkidle0' });
    await delay(2000);
    log.success('Product page loaded');

    // Step 2: Configure the product
    log.step('Configuring product options...');
    
    // Wait for configuration to load
    await page.waitForSelector('[data-testid="quantity-selector"], select[name="quantity"]', { timeout: 10000 });
    await delay(1000);

    // Select quantity (100)
    const quantitySelector = await page.$('[data-testid="quantity-selector"], select[name="quantity"]');
    if (quantitySelector) {
      await quantitySelector.select('100');
      log.success('Selected quantity: 100');
    }

    // Wait for price update
    await delay(1500);

    // Step 3: Upload design file
    log.step('Uploading design file...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Create a test file path
      await fileInput.uploadFile('/Users/irawatkins/Documents/Git/gangrunprintingv1/public/logo.png');
      log.success('Design file uploaded');
      await delay(2000);
    } else {
      log.warning('No file upload found, continuing without upload');
    }

    // Step 4: Add to cart
    log.step('Adding product to cart...');
    const addToCartButton = await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("ADD TO CART")', { timeout: 10000 });
    await addToCartButton.click();
    log.success('Product added to cart');
    await delay(2000);

    // Step 5: Go to cart
    log.step('Navigating to cart...');
    await page.goto(`${SITE_URL}/cart`, { waitUntil: 'networkidle0' });
    await delay(2000);
    log.success('Cart page loaded');

    // Step 6: Proceed to checkout
    log.step('Proceeding to checkout...');
    const checkoutButton = await page.waitForSelector('button:has-text("Checkout"), a[href="/checkout"]', { timeout: 10000 });
    await checkoutButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    log.success('Checkout page loaded');

    // Step 7: Fill customer information
    log.step('Filling customer information...');
    
    // Email
    await page.type('input[name="email"], input[type="email"]', TEST_CUSTOMER.email);
    
    // Name
    await page.type('input[name="firstName"], input[placeholder*="First"]', TEST_CUSTOMER.firstName);
    await page.type('input[name="lastName"], input[placeholder*="Last"]', TEST_CUSTOMER.lastName);
    
    // Company
    const companyField = await page.$('input[name="company"], input[placeholder*="Company"]');
    if (companyField) {
      await companyField.type(TEST_CUSTOMER.company);
    }
    
    // Phone
    await page.type('input[name="phone"], input[type="tel"]', TEST_CUSTOMER.phone);
    
    // Address
    await page.type('input[name="address"], input[name="street"], input[placeholder*="Address"]', TEST_CUSTOMER.address.street);
    await page.type('input[name="city"], input[placeholder*="City"]', TEST_CUSTOMER.address.city);
    
    // State selection
    const stateSelect = await page.$('select[name="state"]');
    if (stateSelect) {
      await stateSelect.select(TEST_CUSTOMER.address.state);
    } else {
      await page.type('input[name="state"]', TEST_CUSTOMER.address.state);
    }
    
    await page.type('input[name="zipCode"], input[name="zip"], input[placeholder*="ZIP"]', TEST_CUSTOMER.address.zipCode);
    
    log.success('Customer information filled');
    await delay(1500);

    // Step 8: Continue to shipping
    log.step('Continuing to shipping options...');
    const continueButton = await page.$('button:has-text("Continue"), button:has-text("Next")');
    if (continueButton) {
      await continueButton.click();
      await delay(3000);
      log.success('Shipping options loaded');
    }

    // Step 9: Select shipping method (if available)
    log.step('Selecting shipping method...');
    const shippingOptions = await page.$$('input[name="shipping"], input[type="radio"][name*="shipping"]');
    if (shippingOptions.length > 0) {
      await shippingOptions[0].click();
      log.success('Shipping method selected');
      await delay(1500);
    }

    // Step 10: Continue to payment
    const continueToPayment = await page.$('button:has-text("Continue to Payment"), button:has-text("Continue"), button:has-text("Next")');
    if (continueToPayment) {
      await continueToPayment.click();
      await delay(2000);
    }

    // Step 11: Select payment method (Square)
    log.step('Selecting payment method...');
    
    // Try to select Square payment
    const squareOption = await page.$('input[value="square"], input[id*="square"]');
    if (squareOption) {
      await squareOption.click();
      log.success('Selected Square payment');
    } else {
      // Try other payment options
      const paymentOptions = await page.$$('input[type="radio"][name*="payment"]');
      if (paymentOptions.length > 0) {
        await paymentOptions[0].click();
        log.success('Selected payment method');
      }
    }
    
    await delay(1500);

    // Step 12: Fill payment information
    log.step('Entering payment information...');
    
    // For Square payment iframe
    const cardFrame = await page.$('iframe[title*="card"], iframe[id*="card"]');
    if (cardFrame) {
      const frame = await cardFrame.contentFrame();
      
      // Test card number
      await frame.type('input[name="cardnumber"], input[placeholder*="Card number"]', '4111111111111111');
      
      // Expiry
      await frame.type('input[name="exp-date"], input[placeholder*="MM/YY"]', '12/25');
      
      // CVV
      await frame.type('input[name="cvc"], input[placeholder*="CVV"]', '123');
      
      // ZIP
      await frame.type('input[name="postal"], input[placeholder*="ZIP"]', TEST_CUSTOMER.address.zipCode);
      
      log.success('Payment information entered');
    } else {
      log.warning('Payment iframe not found, attempting direct payment fields...');
      
      // Try direct fields
      const cardField = await page.$('input[name="cardNumber"], input[placeholder*="Card"]');
      if (cardField) {
        await cardField.type('4111111111111111');
        await page.type('input[name="expiry"], input[placeholder*="MM/YY"]', '12/25');
        await page.type('input[name="cvc"], input[placeholder*="CVC"]', '123');
        log.success('Payment information entered (direct fields)');
      }
    }

    await delay(2000);

    // Step 13: Place the order
    log.step('Placing the order...');
    
    // Find and click the place order button
    const placeOrderButton = await page.waitForSelector(
      'button:has-text("Place Order"), button:has-text("Complete Order"), button:has-text("Submit Order"), button[type="submit"]',
      { timeout: 10000 }
    );
    
    // Take screenshot before placing order
    await page.screenshot({ path: `real-order-${orderNumber}-before-submit.png`, fullPage: true });
    
    await placeOrderButton.click();
    log.info('Order submission initiated...');
    
    // Wait for order confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    await delay(3000);

    // Step 14: Check for success
    const currentUrl = page.url();
    if (currentUrl.includes('success') || currentUrl.includes('confirmation')) {
      log.success('🎉 ORDER PLACED SUCCESSFULLY!');
      
      // Look for order number
      const orderNumberElement = await page.$('[data-testid="order-number"], .order-number, h1, h2');
      if (orderNumberElement) {
        const orderNumber = await orderNumberElement.evaluate(el => el.textContent);
        log.success(`Order Number: ${orderNumber}`);
      }
      
      // Take success screenshot
      await page.screenshot({ path: `real-order-${orderNumber}-success.png`, fullPage: true });
      
      return { success: true, orderNumber: orderNumber };
    } else {
      // Check for errors
      const errorElement = await page.$('.error, .alert-danger, [role="alert"]');
      if (errorElement) {
        const errorText = await errorElement.evaluate(el => el.textContent);
        log.error(`Order failed: ${errorText}`);
        await page.screenshot({ path: `real-order-${orderNumber}-error.png`, fullPage: true });
        return { success: false, error: errorText };
      }
      
      log.warning(`Unexpected page after order: ${currentUrl}`);
      await page.screenshot({ path: `real-order-${orderNumber}-unexpected.png`, fullPage: true });
      return { success: false, error: 'Unexpected result page' };
    }

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

async function runRealOrderTests() {
  log.header('REAL CUSTOMER ORDER TESTS');
  log.info(`Testing with customer: ${TEST_CUSTOMER.email}`);
  log.info(`Delivery address: ${TEST_CUSTOMER.address.street}, ${TEST_CUSTOMER.address.city}, ${TEST_CUSTOMER.address.state} ${TEST_CUSTOMER.address.zipCode}`);
  
  const results = [];
  
  // Run 3 real order tests
  for (let i = 1; i <= 3; i++) {
    const result = await createRealOrder(i);
    results.push(result);
    
    if (i < 3) {
      log.info('Waiting 5 seconds before next order...');
      await delay(5000);
    }
  }
  
  // Summary
  log.header('TEST SUMMARY');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n${colors.bright}Results:${colors.reset}`);
  console.log(`  ${colors.green}✓ Successful: ${successful.length}/3${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${failed.length}/3${colors.reset}`);
  
  if (successful.length > 0) {
    console.log(`\n${colors.bright}Successful Orders:${colors.reset}`);
    successful.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.orderNumber || 'Order placed'}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n${colors.bright}Failed Orders:${colors.reset}`);
    failed.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.error}`);
    });
  }
  
  console.log(`\n${colors.bright}${colors.cyan}📧 Check ${TEST_CUSTOMER.email} for order confirmation emails${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}🌐 Check admin panel at ${SITE_URL}/admin/orders${colors.reset}\n`);
  
  process.exit(successful.length === 3 ? 0 : 1);
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  runRealOrderTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} catch(e) {
  console.log('Installing puppeteer...');
  require('child_process').execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('Please run the script again.');
  process.exit(0);
}