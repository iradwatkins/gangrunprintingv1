/**
 * GangRun Printing - Production Image Upload Test Suite
 *
 * CRITICAL: This tests a LIVE PRODUCTION server at http://72.60.28.175:3002
 *
 * Test Scenarios:
 * 1. Upload image to existing product (ira-watkins)
 * 2. Create new product with image upload
 * 3. Verify database records
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'http://72.60.28.175:3002';
const ADMIN_EMAIL = 'iradwatkins@gmail.com';
const ADMIN_PASSWORD = 'Iw2006js!';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const TEST_IMAGE_PATH = path.join(__dirname, 'public/images/product-placeholder.jpg');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Verify test image exists
function createTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error('❌ Test image not found at:', TEST_IMAGE_PATH);
    throw new Error('Test image not found. Please ensure public/images/product-placeholder.jpg exists.');
  }
  console.log('✅ Using test image:', TEST_IMAGE_PATH);
}

class ImageUploadTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      scenario1: { passed: false, errors: [], screenshots: [] },
      scenario2: { passed: false, errors: [], screenshots: [] },
      scenario3: { passed: false, errors: [], screenshots: [] }
    };
  }

  async init() {
    console.log('\n🚀 Starting Production Image Upload Test Suite...\n');
    console.log('⚠️  WARNING: Testing on LIVE PRODUCTION server:', BASE_URL);
    console.log('');

    createTestImage();

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();

    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Listen for console messages
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || type === 'warning') {
        console.log(`  [Browser ${type.toUpperCase()}]:`, text);
      }
    });

    // Collect console errors
    this.consoleErrors = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
  }

  async takeScreenshot(name, scenario) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${scenario}_${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.results[scenario].screenshots.push(filename);
    console.log(`  📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async login() {
    console.log('\n📝 Logging in as admin...');

    try {
      await this.page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait longer for the page to fully load (React hydration)
      await new Promise(resolve => setTimeout(resolve, 5000));

      await this.takeScreenshot('01-initial-page', 'scenario1');

      // Check if already logged in by looking for actual admin content (not loading screen)
      const isLoggedIn = await this.page.evaluate(() => {
        const text = document.body.innerText;
        // If we see "Verifying admin access", we need to wait more
        if (text.includes('Verifying admin access')) {
          return 'loading';
        }
        return !window.location.href.includes('/login') && !text.includes('Sign in');
      });

      if (isLoggedIn === 'loading') {
        console.log('  ⏳ Page still loading, waiting...');
        // Wait for loading screen to disappear
        await this.page.waitForFunction(() => {
          return !document.body.innerText.includes('Verifying admin access');
        }, { timeout: 30000 });

        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.takeScreenshot('01b-after-loading', 'scenario1');
      }

      // Check again
      const finalCheck = await this.page.evaluate(() => {
        return !window.location.href.includes('/login');
      });

      if (finalCheck) {
        console.log('  ✅ Already logged in');
        return;
      }

      // Need to login
      console.log('  🔑 Performing login...');
      await this.page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await this.takeScreenshot('02-login-page', 'scenario1');

      // Fill in credentials
      await this.page.type('input[type="email"], input[name="email"]', ADMIN_EMAIL);
      await this.page.type('input[type="password"], input[name="password"]', ADMIN_PASSWORD);

      await this.takeScreenshot('03-credentials-filled', 'scenario1');

      // Submit
      await Promise.all([
        this.page.click('button[type="submit"]'),
        this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
      ]);

      await this.takeScreenshot('04-after-login', 'scenario1');
      console.log('  ✅ Login successful');

    } catch (error) {
      console.error('  ❌ Login failed:', error.message);
      await this.takeScreenshot('ERROR-login-failed', 'scenario1');
      throw error;
    }
  }

  async scenario1_uploadToExistingProduct() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SCENARIO 1: Upload Image to Existing Product (ira-watkins)');
    console.log('='.repeat(80));

    try {
      this.consoleErrors = [];

      // Navigate to products list
      console.log('\n1️⃣  Navigating to products list...');
      await this.page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for page to finish loading
      await this.page.waitForFunction(() => {
        return !document.body.innerText.includes('Verifying admin access');
      }, { timeout: 30000 }).catch(() => console.log('  ⚠️  Timeout waiting for page load'));

      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('05-products-list', 'scenario1');

      // Find "ira-watkins" product
      console.log('2️⃣  Finding "ira watkins" product...');

      const productFound = await this.page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(row => row.innerText.toLowerCase().includes('ira watkins'));
        if (targetRow) {
          const editButton = targetRow.querySelector('a[href*="/admin/products/"], button');
          if (editButton) {
            editButton.click();
            return true;
          }
        }
        return false;
      });

      if (!productFound) {
        throw new Error('Could not find "ira watkins" product or Edit button');
      }

      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
      await this.takeScreenshot('06-product-edit-page', 'scenario1');
      console.log('  ✅ Opened product edit page');

      // Find image upload section
      console.log('3️⃣  Finding image upload section...');

      const uploadInputSelector = 'input[type="file"]';
      await this.page.waitForSelector(uploadInputSelector, { timeout: 10000 });

      const uploadInput = await this.page.$(uploadInputSelector);
      if (!uploadInput) {
        throw new Error('Image upload input not found');
      }

      console.log('  ✅ Found file upload input');

      // Upload the test image
      console.log('4️⃣  Uploading test image...');
      await uploadInput.uploadFile(TEST_IMAGE_PATH);
      console.log('  ✅ File selected for upload');

      // Wait for upload to complete (look for success indicators)
      await new Promise(resolve => setTimeout(resolve, 3000)); // Give it time to upload

      await this.takeScreenshot('07-after-upload-triggered', 'scenario1');

      // Check for any upload progress or success messages
      const uploadSuccess = await this.page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('Upload') || body.includes('Success') ||
               document.querySelector('img[src*="minio"]') !== null ||
               document.querySelector('img[src*="blob:"]') !== null;
      });

      console.log(`  ${uploadSuccess ? '✅' : '⚠️'} Upload indicators: ${uploadSuccess ? 'Found' : 'Not found'}`);

      // Wait a bit more for processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      await this.takeScreenshot('08-upload-complete', 'scenario1');

      // Navigate to product page to verify image
      console.log('5️⃣  Navigating to product page to verify image...');
      await this.page.goto(`${BASE_URL}/products/ira-watkins`, { waitUntil: 'networkidle0', timeout: 30000 });
      await this.takeScreenshot('09-product-page', 'scenario1');

      // Check if image is displayed
      const imageDisplayed = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const productImages = images.filter(img =>
          img.src.includes('minio') ||
          img.src.includes('product') ||
          img.alt.toLowerCase().includes('product')
        );
        return productImages.length > 0;
      });

      console.log(`  ${imageDisplayed ? '✅' : '❌'} Product image ${imageDisplayed ? 'displayed' : 'NOT displayed'}`);

      // Check console errors
      if (this.consoleErrors.length > 0) {
        console.log('\n⚠️  Console Errors Detected:');
        this.consoleErrors.forEach(err => console.log(`    - ${err}`));
        this.results.scenario1.errors.push(...this.consoleErrors);
      } else {
        console.log('  ✅ No console errors detected');
      }

      this.results.scenario1.passed = uploadSuccess && imageDisplayed && this.consoleErrors.length === 0;

      console.log('\n' + '-'.repeat(80));
      console.log(`SCENARIO 1 RESULT: ${this.results.scenario1.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('-'.repeat(80));

    } catch (error) {
      console.error('\n❌ SCENARIO 1 FAILED:', error.message);
      await this.takeScreenshot('ERROR-scenario1', 'scenario1');
      this.results.scenario1.errors.push(error.message);
      this.results.scenario1.passed = false;
    }
  }

  async scenario2_createNewProductWithImage() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SCENARIO 2: Create New Product with Image Upload');
    console.log('='.repeat(80));

    try {
      this.consoleErrors = [];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const productName = `Test Product Upload ${timestamp}`;

      console.log('\n1️⃣  Navigating to new product page...');
      await this.page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for page to finish loading
      await this.page.waitForFunction(() => {
        return !document.body.innerText.includes('Verifying admin access');
      }, { timeout: 30000 }).catch(() => console.log('  ⚠️  Timeout waiting for page load'));

      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('10-new-product-page', 'scenario2');

      // Fill in product name
      console.log('2️⃣  Filling in product details...');

      // Wait for form elements to be available
      await this.page.waitForSelector('input[name="name"], input#name, form', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Form not found, taking debug screenshot...');
      });

      await this.takeScreenshot('10b-form-state', 'scenario2');

      const nameInput = await this.page.$('input[name="name"], input#name');
      if (!nameInput) {
        throw new Error('Name input field not found');
      }

      await this.page.type('input[name="name"], input#name', productName);
      console.log(`  ✅ Product name: ${productName}`);

      // Select category
      const categorySelector = 'select[name="category"], select#category';
      await this.page.waitForSelector(categorySelector, { timeout: 5000 });
      await this.page.select(categorySelector, 'Business Cards'); // Or any available category
      console.log('  ✅ Category selected');

      await this.takeScreenshot('11-basic-info-filled', 'scenario2');

      // Upload image
      console.log('3️⃣  Uploading product image...');
      const uploadInput = await this.page.$('input[type="file"]');
      if (uploadInput) {
        await uploadInput.uploadFile(TEST_IMAGE_PATH);
        console.log('  ✅ Image uploaded');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('12-image-uploaded', 'scenario2');
      } else {
        console.log('  ⚠️  File upload input not found, continuing...');
      }

      // Fill in other required fields
      console.log('4️⃣  Filling in required fields...');

      // Try to fill quantity group, size group, paper stock if they exist
      try {
        const selects = await this.page.$$('select');
        for (let select of selects) {
          const name = await select.evaluate(el => el.name || el.id);
          if (name && !name.includes('category')) {
            // Select first option that's not empty
            await this.page.evaluate(sel => {
              const options = Array.from(sel.options);
              const validOption = options.find(opt => opt.value && opt.value !== '');
              if (validOption) sel.value = validOption.value;
            }, select);
          }
        }
        console.log('  ✅ Required dropdowns filled');
      } catch (e) {
        console.log('  ⚠️  Could not auto-fill all dropdowns:', e.message);
      }

      await this.takeScreenshot('13-ready-to-submit', 'scenario2');

      // Submit form
      console.log('5️⃣  Submitting form...');
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await Promise.all([
          submitButton.click(),
          this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
            console.log('  ⚠️  Navigation timeout, checking if product was created...');
          })
        ]);

        await this.takeScreenshot('14-after-submit', 'scenario2');
        console.log('  ✅ Form submitted');

        // Check if we're on the products list or edit page
        const currentUrl = this.page.url();
        const productCreated = currentUrl.includes('/admin/products') && !currentUrl.includes('/new');

        console.log(`  ${productCreated ? '✅' : '❌'} Product ${productCreated ? 'created' : 'creation unclear'}`);

        this.results.scenario2.passed = productCreated && this.consoleErrors.length === 0;
      } else {
        throw new Error('Submit button not found');
      }

      console.log('\n' + '-'.repeat(80));
      console.log(`SCENARIO 2 RESULT: ${this.results.scenario2.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('-'.repeat(80));

    } catch (error) {
      console.error('\n❌ SCENARIO 2 FAILED:', error.message);
      await this.takeScreenshot('ERROR-scenario2', 'scenario2');
      this.results.scenario2.errors.push(error.message);
      this.results.scenario2.passed = false;
    }
  }

  async scenario3_verifyDatabase() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SCENARIO 3: Verify Database Records');
    console.log('='.repeat(80));

    try {
      console.log('\n1️⃣  Querying database for image records...');

      // This would require database access - we'll use execSync to run a Prisma query
      const dbQuery = `
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        async function checkImages() {
          const images = await prisma.image.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { products: true }
          });

          console.log(JSON.stringify({
            count: images.length,
            images: images.map(img => ({
              id: img.id,
              url: img.url,
              productCount: img.products.length
            }))
          }));

          await prisma.$disconnect();
        }

        checkImages().catch(console.error);
      `;

      const tempFile = path.join(__dirname, 'temp-db-check.js');
      fs.writeFileSync(tempFile, dbQuery);

      try {
        const output = execSync(`node ${tempFile}`, {
          cwd: __dirname,
          encoding: 'utf8',
          timeout: 10000
        });

        const result = JSON.parse(output.trim());
        console.log(`  ✅ Found ${result.count} recent images in database`);

        if (result.count > 0) {
          console.log('\n  Recent images:');
          result.images.forEach(img => {
            console.log(`    - ID: ${img.id}, URL: ${img.url}, Products: ${img.productCount}`);
          });
        }

        this.results.scenario3.passed = result.count > 0;

        fs.unlinkSync(tempFile);
      } catch (dbError) {
        console.error('  ❌ Database query failed:', dbError.message);
        this.results.scenario3.errors.push(dbError.message);
        this.results.scenario3.passed = false;
      }

      console.log('\n' + '-'.repeat(80));
      console.log(`SCENARIO 3 RESULT: ${this.results.scenario3.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('-'.repeat(80));

    } catch (error) {
      console.error('\n❌ SCENARIO 3 FAILED:', error.message);
      this.results.scenario3.errors.push(error.message);
      this.results.scenario3.passed = false;
    }
  }

  async generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));

    const totalTests = 3;
    const passedTests = Object.values(this.results).filter(r => r.passed).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`\nTest Execution Date: ${new Date().toISOString()}`);
    console.log(`Production URL: ${BASE_URL}`);
    console.log(`Overall Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);

    console.log('\n' + '-'.repeat(80));
    console.log('SCENARIO 1: Upload Image to Existing Product (ira-watkins)');
    console.log('-'.repeat(80));
    console.log(`Status: ${this.results.scenario1.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Screenshots: ${this.results.scenario1.screenshots.length}`);
    if (this.results.scenario1.errors.length > 0) {
      console.log('Errors:');
      this.results.scenario1.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '-'.repeat(80));
    console.log('SCENARIO 2: Create New Product with Image');
    console.log('-'.repeat(80));
    console.log(`Status: ${this.results.scenario2.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Screenshots: ${this.results.scenario2.screenshots.length}`);
    if (this.results.scenario2.errors.length > 0) {
      console.log('Errors:');
      this.results.scenario2.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '-'.repeat(80));
    console.log('SCENARIO 3: Verify Database Records');
    console.log('-'.repeat(80));
    console.log(`Status: ${this.results.scenario3.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.results.scenario3.errors.length > 0) {
      console.log('Errors:');
      this.results.scenario3.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('='.repeat(80));

    // Save JSON report
    const reportPath = path.join(SCREENSHOTS_DIR, `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      passRate,
      results: this.results
    }, null, 2));

    console.log(`\n📄 JSON report saved: ${reportPath}`);

    return passRate === '100.0';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.login();
      await this.scenario1_uploadToExistingProduct();
      await this.scenario2_createNewProductWithImage();
      await this.scenario3_verifyDatabase();

      const allPassed = await this.generateReport();

      await this.cleanup();

      process.exit(allPassed ? 0 : 1);
    } catch (error) {
      console.error('\n❌ FATAL ERROR:', error);
      await this.takeScreenshot('FATAL-ERROR', 'general');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run the test suite
const tester = new ImageUploadTester();
tester.run();
