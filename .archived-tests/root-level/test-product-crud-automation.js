/**
 * Automated Product CRUD Testing with Puppeteer
 * Tests product creation and deletion 3 times each
 */

const puppeteer = require('puppeteer');

const ADMIN_EMAIL = 'iradwatkins@gmail.com';
const ADMIN_PASSWORD = 'Iw2006js!';
const BASE_URL = 'https://gangrunprinting.com';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginAsAdmin(page) {
  console.log('🔐 Logging in as admin...');

  await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Wait for email input and fill it
  await page.waitForSelector('#email', { timeout: 5000 });
  await page.type('#email', ADMIN_EMAIL);

  // Check if password field exists (standard login)
  const passwordField = await page.$('#password');
  if (passwordField) {
    console.log('  - Using password login...');
    await page.type('#password', ADMIN_PASSWORD);

    // Click sign in button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
  } else {
    console.log('  - Magic link login - skipping for now...');
    throw new Error('Magic link login not supported in automation. Use email/password auth.');
  }

  // Verify we're logged in by checking for admin page access
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  const currentUrl = page.url();

  if (currentUrl.includes('/auth/signin')) {
    throw new Error('Login failed - still on signin page');
  }

  console.log('✅ Logged in successfully');
}

async function createProduct(page, testNumber) {
  const timestamp = Date.now();
  const productName = `Test Product ${testNumber} - ${timestamp}`;
  const productSku = `TEST-${testNumber}-${timestamp}`;

  console.log(`\n📝 Creating product ${testNumber}: ${productName}`);

  // Navigate to new product page
  await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Fill in basic product information
  console.log('  - Filling in product name...');
  await page.type('input[name="name"]', productName);

  console.log('  - Filling in SKU...');
  await page.type('input[name="sku"]', productSku);

  console.log('  - Setting base price...');
  await page.type('input[name="basePrice"]', '99.99');

  // Select category (if dropdown exists)
  try {
    console.log('  - Selecting category...');
    await page.click('select[name="categoryId"]');
    await page.select('select[name="categoryId"]', await page.evaluate(() => {
      const select = document.querySelector('select[name="categoryId"]');
      return select?.options[1]?.value || '';
    }));
  } catch (error) {
    console.log('  - Category selection skipped (not found)');
  }

  // Scroll to submit button
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);

  // Listen for network response
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/products') && response.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Click create/save button
  console.log('  - Clicking save button...');
  const saveButton = await page.$('button[type="submit"]');
  if (saveButton) {
    await saveButton.click();
  } else {
    throw new Error('Save button not found');
  }

  // Wait for response
  const response = await responsePromise;
  const status = response.status();

  if (status === 200 || status === 201) {
    const data = await response.json();
    console.log(`✅ Product created successfully!`);
    console.log(`  - Product ID: ${data.id || data.Id}`);
    return { id: data.id || data.Id, name: productName, sku: productSku };
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to create product: ${status} - ${errorText}`);
  }
}

async function deleteProduct(page, productId, productName) {
  console.log(`\n🗑️  Deleting product: ${productName}`);

  // Navigate to products list page
  await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Find the product row and delete button
  console.log('  - Finding delete button...');

  // Set up dialog handler for confirmation
  page.on('dialog', async dialog => {
    console.log('  - Confirming deletion...');
    await dialog.accept();
  });

  // Listen for delete API call
  const responsePromise = page.waitForResponse(
    response => response.url().includes(`/api/products/${productId}`) && response.request().method() === 'DELETE',
    { timeout: 10000 }
  );

  // Click delete button for this product
  const deleted = await page.evaluate((pid) => {
    // Find all product rows
    const rows = Array.from(document.querySelectorAll('tr'));
    for (const row of rows) {
      // Check if this row contains our product ID in a link
      const editLink = row.querySelector(`a[href="/admin/products/${pid}/edit"]`);
      if (editLink) {
        // Find delete button in this row
        const deleteBtn = row.querySelector('button[title="Delete Product"]');
        if (deleteBtn) {
          deleteBtn.click();
          return true;
        }
      }
    }
    return false;
  }, productId);

  if (!deleted) {
    throw new Error('Delete button not found for product');
  }

  console.log('  - Delete button clicked, waiting for response...');

  // Wait for delete response
  const response = await responsePromise;
  const status = response.status();

  if (status === 200) {
    console.log(`✅ Product deleted successfully!`);
    return true;
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to delete product: ${status} - ${errorText}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Product CRUD Automation Tests\n');
  console.log('=' .repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Enable console logging from browser
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  ❌ Browser Error:', msg.text());
    }
  });

  try {
    // Login once
    await loginAsAdmin(page);

    const createdProducts = [];

    // Test 1: Create 3 products
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: Creating 3 Products');
    console.log('='.repeat(60));

    for (let i = 1; i <= 3; i++) {
      try {
        const product = await createProduct(page, i);
        createdProducts.push(product);
        await sleep(1000); // Wait between creations
      } catch (error) {
        console.error(`❌ Failed to create product ${i}:`, error.message);
      }
    }

    console.log(`\n✅ Created ${createdProducts.length}/3 products successfully`);

    // Test 2: Delete 3 products
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Deleting 3 Products');
    console.log('='.repeat(60));

    let deletedCount = 0;
    for (const product of createdProducts) {
      try {
        await deleteProduct(page, product.id, product.name);
        deletedCount++;
        await sleep(1000); // Wait between deletions
      } catch (error) {
        console.error(`❌ Failed to delete product ${product.name}:`, error.message);
      }
    }

    console.log(`\n✅ Deleted ${deletedCount}/${createdProducts.length} products successfully`);

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Products Created: ${createdProducts.length}/3`);
    console.log(`Products Deleted: ${deletedCount}/${createdProducts.length}`);

    if (createdProducts.length === 3 && deletedCount === 3) {
      console.log('\n✅ ALL TESTS PASSED! Product CRUD is working correctly.');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.');
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Tests complete');
  }
}

// Run tests
runTests().catch(console.error);
