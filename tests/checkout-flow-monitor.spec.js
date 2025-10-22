/**
 * Comprehensive Checkout Flow Test with Sentry Integration
 *
 * This script follows the entire payment process and captures all errors
 * including CSP violations, JavaScript errors, and network failures.
 *
 * Usage: node test-checkout-flow-with-sentry.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://gangrunprinting.com';
const TEST_PRODUCT = '/products/4x6-flyers-9pt-card-stock';
const RESULTS_DIR = './checkout-test-results';

// Create results directory
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

class CheckoutTester {
  constructor() {
    this.errors = [];
    this.cspViolations = [];
    this.networkErrors = [];
    this.paymentErrors = [];
    this.steps = [];
    this.screenshots = [];
  }

  async init() {
    console.log('🚀 Initializing Checkout Flow Test...\n');

    this.browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // Temporarily disable to see actual errors
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    this.page = await this.browser.newPage();

    // Set up monitoring
    this.setupErrorMonitoring();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();
  }

  setupErrorMonitoring() {
    // Console errors
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        this.errors.push({
          type: 'console_error',
          message: text,
          timestamp: new Date().toISOString(),
          location: msg.location()
        });
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'warning' && text.includes('CSP') || text.includes('Content Security Policy')) {
        this.cspViolations.push({
          message: text,
          timestamp: new Date().toISOString()
        });
        console.log(`⚠️  CSP Warning: ${text}`);
      }
    });

    // Page errors (uncaught exceptions)
    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`💥 Page Error: ${error.message}`);
    });

    // Request failures
    this.page.on('requestfailed', request => {
      this.networkErrors.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure().errorText,
        timestamp: new Date().toISOString()
      });
      console.log(`🌐 Request Failed: ${request.url()} - ${request.failure().errorText}`);
    });

    // CSP violations via CDP
    const client = this.page._client();
    client.on('Security.securityStateChanged', event => {
      if (event.securityState === 'insecure') {
        this.cspViolations.push({
          type: 'security_state_changed',
          event: event,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  setupNetworkMonitoring() {
    this.page.on('response', response => {
      const status = response.status();
      const url = response.url();

      // Log failed responses
      if (status >= 400) {
        this.networkErrors.push({
          type: 'http_error',
          url: url,
          status: status,
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
        console.log(`🔴 HTTP ${status}: ${url}`);
      }
    });
  }

  setupPerformanceMonitoring() {
    // Monitor long tasks
    this.page.evaluateOnNewDocument(() => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.log(`⏱️  Long Task: ${entry.duration}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    });
  }

  async takeScreenshot(name) {
    const filename = `${Date.now()}-${name}.png`;
    const filepath = path.join(RESULTS_DIR, filename);
    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });
    this.screenshots.push({ name, filepath, timestamp: new Date().toISOString() });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  async recordStep(name, status, details = {}) {
    this.steps.push({
      name,
      status,
      details,
      timestamp: new Date().toISOString(),
      errors: [...this.errors],
      cspViolations: [...this.cspViolations]
    });

    const icon = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⏳';
    console.log(`${icon} ${name}`);
  }

  async testProductPage() {
    await this.recordStep('Navigate to Product Page', 'started');

    try {
      await this.page.goto(`${SITE_URL}${TEST_PRODUCT}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.takeScreenshot('01-product-page');

      // Check for product elements
      const hasTitle = await this.page.$('h1');
      const hasPrice = await this.page.$('[class*="price"], [data-testid="price"]');
      const hasAddToCart = await this.page.$('button:has-text("Add to Cart"), button[type="submit"]');

      if (!hasTitle) {
        await this.recordStep('Navigate to Product Page', 'failure', { reason: 'No product title found' });
        return false;
      }

      await this.recordStep('Navigate to Product Page', 'success', {
        hasTitle: !!hasTitle,
        hasPrice: !!hasPrice,
        hasAddToCart: !!hasAddToCart
      });

      return true;
    } catch (error) {
      await this.recordStep('Navigate to Product Page', 'failure', { error: error.message });
      return false;
    }
  }

  async testProductConfiguration() {
    await this.recordStep('Configure Product', 'started');

    try {
      // Wait for configuration options to load
      await this.page.waitForSelector('select, [role="combobox"]', { timeout: 10000 });

      // Take screenshot of configuration options
      await this.takeScreenshot('02-product-configuration');

      // Try to select options
      const selects = await this.page.$$('select');
      console.log(`   Found ${selects.length} dropdowns`);

      // Select first option in each dropdown
      for (let i = 0; i < Math.min(selects.length, 3); i++) {
        const select = selects[i];
        const options = await select.$$('option');
        if (options.length > 1) {
          await select.select(1); // Select second option (first is usually placeholder)
          await this.page.waitForTimeout(500); // Wait for price update
        }
      }

      await this.takeScreenshot('03-configured-product');

      await this.recordStep('Configure Product', 'success', {
        dropdownCount: selects.length
      });

      return true;
    } catch (error) {
      await this.recordStep('Configure Product', 'failure', { error: error.message });
      await this.takeScreenshot('error-configuration');
      return false;
    }
  }

  async testAddToCart() {
    await this.recordStep('Add to Cart', 'started');

    try {
      // Find and click Add to Cart button
      const addToCartButton = await this.page.$('button:has-text("Add to Cart"), button[type="submit"]');

      if (!addToCartButton) {
        await this.recordStep('Add to Cart', 'failure', { reason: 'Add to Cart button not found' });
        return false;
      }

      await addToCartButton.click();
      await this.page.waitForTimeout(2000);

      await this.takeScreenshot('04-added-to-cart');

      await this.recordStep('Add to Cart', 'success');
      return true;
    } catch (error) {
      await this.recordStep('Add to Cart', 'failure', { error: error.message });
      await this.takeScreenshot('error-add-to-cart');
      return false;
    }
  }

  async testCheckoutNavigation() {
    await this.recordStep('Navigate to Checkout', 'started');

    try {
      // Try multiple ways to get to checkout
      const checkoutSelectors = [
        'a[href="/checkout"]',
        'a[href*="checkout"]',
        'button:has-text("Checkout")',
        'button:has-text("Proceed")'
      ];

      let clicked = false;
      for (const selector of checkoutSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          await element.click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        // Try direct navigation
        await this.page.goto(`${SITE_URL}/checkout`, { waitUntil: 'networkidle2' });
      }

      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('05-checkout-page');

      const url = this.page.url();
      const isCheckout = url.includes('checkout');

      await this.recordStep('Navigate to Checkout', isCheckout ? 'success' : 'failure', {
        currentUrl: url
      });

      return isCheckout;
    } catch (error) {
      await this.recordStep('Navigate to Checkout', 'failure', { error: error.message });
      await this.takeScreenshot('error-checkout-navigation');
      return false;
    }
  }

  async testPaymentPage() {
    await this.recordStep('Load Payment Page', 'started');

    try {
      // Check if we need to fill shipping info first
      const url = this.page.url();

      if (url.includes('shipping')) {
        // Fill shipping form
        await this.fillShippingForm();
      }

      // Navigate to payment page
      if (!url.includes('payment')) {
        await this.page.goto(`${SITE_URL}/checkout/payment`, { waitUntil: 'networkidle2' });
      }

      await this.page.waitForTimeout(3000); // Wait for payment forms to initialize
      await this.takeScreenshot('06-payment-page');

      // Check for payment method elements
      const hasSquareCard = await this.page.$('#card-container, [id*="square-card"]');
      const hasCashApp = await this.page.$('#cash-app-pay, [id*="cash-app"]');

      console.log(`   Square Card: ${hasSquareCard ? 'Found' : 'Not found'}`);
      console.log(`   Cash App Pay: ${hasCashApp ? 'Found' : 'Not found'}`);

      // Wait a bit more to see if Cash App Pay loads
      await this.page.waitForTimeout(5000);
      await this.takeScreenshot('07-payment-page-loaded');

      // Check for Cash App Pay specific errors
      const cashAppErrors = this.errors.filter(e =>
        e.message && e.message.toLowerCase().includes('cash app')
      );

      if (cashAppErrors.length > 0) {
        console.log('\n🚨 Cash App Pay Errors:');
        cashAppErrors.forEach(err => {
          console.log(`   - ${err.message}`);
        });
        this.paymentErrors.push(...cashAppErrors);
      }

      await this.recordStep('Load Payment Page', 'success', {
        hasSquareCard: !!hasSquareCard,
        hasCashApp: !!hasCashApp,
        cashAppErrors: cashAppErrors.length
      });

      return true;
    } catch (error) {
      await this.recordStep('Load Payment Page', 'failure', { error: error.message });
      await this.takeScreenshot('error-payment-page');
      return false;
    }
  }

  async fillShippingForm() {
    console.log('   📝 Filling shipping form...');

    const testData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '5555555555',
      address1: '123 Test St',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345',
      country: 'US'
    };

    // Fill form fields
    for (const [field, value] of Object.entries(testData)) {
      const input = await this.page.$(`input[name="${field}"], input[id="${field}"]`);
      if (input) {
        await input.type(value);
      }
    }

    // Click continue/next button
    const continueButton = await this.page.$('button:has-text("Continue"), button:has-text("Next")');
    if (continueButton) {
      await continueButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  generateReport() {
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        duration: this.steps.length > 0
          ? new Date(this.steps[this.steps.length - 1].timestamp) - new Date(this.steps[0].timestamp)
          : 0
      },
      summary: {
        totalSteps: this.steps.length,
        successfulSteps: this.steps.filter(s => s.status === 'success').length,
        failedSteps: this.steps.filter(s => s.status === 'failure').length,
        totalErrors: this.errors.length,
        cspViolations: this.cspViolations.length,
        networkErrors: this.networkErrors.length,
        paymentErrors: this.paymentErrors.length
      },
      steps: this.steps,
      errors: this.errors,
      cspViolations: this.cspViolations,
      networkErrors: this.networkErrors,
      paymentErrors: this.paymentErrors,
      screenshots: this.screenshots
    };

    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CHECKOUT FLOW TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n⏱️  Test Duration: ${report.testRun.duration}ms`);
    console.log(`✅ Successful Steps: ${report.summary.successfulSteps}/${report.summary.totalSteps}`);
    console.log(`❌ Failed Steps: ${report.summary.failedSteps}/${report.summary.totalSteps}`);
    console.log(`\n🐛 Total Errors: ${report.summary.totalErrors}`);
    console.log(`⚠️  CSP Violations: ${report.summary.cspViolations}`);
    console.log(`🌐 Network Errors: ${report.summary.networkErrors}`);
    console.log(`💳 Payment Errors: ${report.summary.paymentErrors}`);

    if (report.cspViolations.length > 0) {
      console.log('\n🚨 CSP VIOLATIONS:');
      report.cspViolations.forEach((violation, i) => {
        console.log(`\n${i + 1}. ${violation.message.substring(0, 200)}...`);
      });
    }

    if (report.paymentErrors.length > 0) {
      console.log('\n💳 PAYMENT-SPECIFIC ERRORS:');
      report.paymentErrors.forEach((error, i) => {
        console.log(`\n${i + 1}. ${error.message}`);
      });
    }

    console.log(`\n📸 Screenshots saved in: ${RESULTS_DIR}`);
    console.log('='.repeat(60) + '\n');
  }

  async run() {
    try {
      await this.init();

      // Run test steps
      const success = await this.testProductPage();
      if (!success) {
        console.log('\n⚠️  Stopping test - Product page failed to load');
        return;
      }

      await this.testProductConfiguration();
      await this.testAddToCart();
      await this.testCheckoutNavigation();
      await this.testPaymentPage();

      // Keep browser open for manual inspection
      console.log('\n⏸️  Test complete. Browser will remain open for 60 seconds for inspection...');
      await this.page.waitForTimeout(60000);

    } catch (error) {
      console.error('\n💥 Test failed with error:', error);
      await this.takeScreenshot('error-fatal');
    } finally {
      // Generate and save report
      const report = this.generateReport();
      this.printSummary(report);

      const reportPath = path.join(RESULTS_DIR, `report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Full report saved to: ${reportPath}\n`);

      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the test
(async () => {
  const tester = new CheckoutTester();
  await tester.run();
})();
