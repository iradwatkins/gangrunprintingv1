const puppeteer = require('puppeteer');

// REAL DATABASE IDs (verified)
const REAL_DATA = {
  paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
  quantityGroupId: 'cmg5i6poy000094pu856umjxa',
  sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
  turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk'
};

// 4 REAL Products to create
const PRODUCTS = [
  {
    category: 'BUSINESS_CARD',
    name: 'Premium Business Cards',
    description: 'High-quality premium business cards printed on professional card stock. Perfect for making a lasting impression.',
    basePrice: '29.99',
    setupFee: '5.00',
    active: true,
    featured: true
  },
  {
    category: 'FLYER',
    name: 'Marketing Flyers 8.5x11',
    description: 'Eye-catching marketing flyers printed in full color. Ideal for promotions, events, and advertising campaigns.',
    basePrice: '49.99',
    setupFee: '10.00',
    active: true,
    featured: true
  },
  {
    category: 'POSTCARD',
    name: 'Promotional Postcards',
    description: 'High-impact promotional postcards perfect for direct mail campaigns, event invitations, and customer outreach.',
    basePrice: '39.99',
    setupFee: '7.50',
    active: true,
    featured: false
  },
  {
    category: 'BROCHURE',
    name: 'Professional Brochures',
    description: 'Professionally designed tri-fold brochures that showcase your business, products, and services with stunning clarity.',
    basePrice: '79.99',
    setupFee: '15.00',
    active: true,
    featured: true
  }
];

async function createProduct(page, product, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating Product ${index + 1}/4: ${product.name}`);
  console.log('='.repeat(60));

  try {
    // Navigate to product creation page
    console.log('Navigating to /admin/products/new...');
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for form to load (or error/redirect)
    console.log('Waiting for form to load...');
    try {
      await page.waitForSelector('form', { timeout: 15000 });
    } catch (error) {
      // Check if we're stuck on auth verification
      const pageContent = await page.content();
      if (pageContent.includes('Verifying admin access')) {
        console.log('  ⚠️  Stuck on admin verification, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.waitForSelector('form', { timeout: 10000 });
      } else {
        throw error;
      }
    }

    // Fill in basic information
    console.log('Filling in product details...');

    // Category dropdown
    console.log(`  - Setting category: ${product.category}`);
    await page.waitForSelector('select[name="category"]', { timeout: 5000 });
    await page.select('select[name="category"]', product.category);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Product name
    console.log(`  - Setting name: ${product.name}`);
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    await page.type('input[name="name"]', product.name);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Description
    console.log(`  - Setting description`);
    await page.waitForSelector('textarea[name="description"]', { timeout: 5000 });
    await page.type('textarea[name="description"]', product.description);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Base price
    console.log(`  - Setting base price: $${product.basePrice}`);
    await page.waitForSelector('input[name="basePrice"]', { timeout: 5000 });
    await page.type('input[name="basePrice"]', product.basePrice);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Setup fee
    console.log(`  - Setting setup fee: $${product.setupFee}`);
    await page.waitForSelector('input[name="setupFee"]', { timeout: 5000 });
    await page.type('input[name="setupFee"]', product.setupFee);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Active checkbox
    if (product.active) {
      console.log('  - Setting as active');
      const activeCheckbox = await page.$('input[name="active"][type="checkbox"]');
      if (activeCheckbox) {
        const isChecked = await page.$eval('input[name="active"]', el => el.checked);
        if (!isChecked) {
          await activeCheckbox.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    // Featured checkbox
    if (product.featured) {
      console.log('  - Setting as featured');
      const featuredCheckbox = await page.$('input[name="featured"][type="checkbox"]');
      if (featuredCheckbox) {
        const isChecked = await page.$eval('input[name="featured"]', el => el.checked);
        if (!isChecked) {
          await featuredCheckbox.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    // Configuration - Paper Stock Set
    console.log(`  - Setting Paper Stock Set ID: ${REAL_DATA.paperStockSetId}`);
    const paperStockSelector = await page.$('select[name="paperStockSetId"]');
    if (paperStockSelector) {
      await page.select('select[name="paperStockSetId"]', REAL_DATA.paperStockSetId);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('    ⚠️  Paper Stock Set selector not found');
    }

    // Configuration - Quantity Group
    console.log(`  - Setting Quantity Group ID: ${REAL_DATA.quantityGroupId}`);
    const quantitySelector = await page.$('select[name="quantityGroupId"]');
    if (quantitySelector) {
      await page.select('select[name="quantityGroupId"]', REAL_DATA.quantityGroupId);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('    ⚠️  Quantity Group selector not found');
    }

    // Configuration - Size Group
    console.log(`  - Setting Size Group ID: ${REAL_DATA.sizeGroupId}`);
    const sizeSelector = await page.$('select[name="sizeGroupId"]');
    if (sizeSelector) {
      await page.select('select[name="sizeGroupId"]', REAL_DATA.sizeGroupId);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('    ⚠️  Size Group selector not found');
    }

    // Configuration - Turnaround Time Set
    console.log(`  - Setting Turnaround Time Set ID: ${REAL_DATA.turnaroundTimeSetId}`);
    const turnaroundSelector = await page.$('select[name="turnaroundTimeSetId"]');
    if (turnaroundSelector) {
      await page.select('select[name="turnaroundTimeSetId"]', REAL_DATA.turnaroundTimeSetId);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('    ⚠️  Turnaround Time Set selector not found');
    }

    // Take screenshot before submit
    const screenshotPath = `/root/websites/gangrunprinting/product-${index + 1}-before-submit.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  - Screenshot saved: ${screenshotPath}`);

    // Submit form
    console.log('Submitting form...');
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }

    // Click and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      submitButton.click()
    ]);

    // Check for success or error
    const currentUrl = page.url();
    console.log(`  - Current URL after submit: ${currentUrl}`);

    // Take screenshot after submit
    const screenshotAfterPath = `/root/websites/gangrunprinting/product-${index + 1}-after-submit.png`;
    await page.screenshot({ path: screenshotAfterPath, fullPage: true });
    console.log(`  - Screenshot saved: ${screenshotAfterPath}`);

    // Check for error messages
    const errorElement = await page.$('.error, [role="alert"], .text-red-500');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log(`  ❌ ERROR: ${errorText}`);
      return {
        success: false,
        product: product.name,
        error: errorText,
        url: currentUrl
      };
    }

    // Extract product ID from URL if redirected to product page
    let productId = null;
    if (currentUrl.includes('/admin/products/') && !currentUrl.includes('/new')) {
      const matches = currentUrl.match(/\/admin\/products\/([^\/]+)/);
      if (matches) {
        productId = matches[1];
      }
    }

    console.log(`  ✅ SUCCESS: Product created!`);
    if (productId) {
      console.log(`  - Product ID: ${productId}`);
    }

    return {
      success: true,
      product: product.name,
      productId: productId,
      url: currentUrl
    };

  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);

    // Take error screenshot
    const errorScreenshotPath = `/root/websites/gangrunprinting/product-${index + 1}-error.png`;
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`  - Error screenshot saved: ${errorScreenshotPath}`);

    return {
      success: false,
      product: product.name,
      error: error.message,
      url: page.url()
    };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('AUTOMATED PRODUCT CREATION SCRIPT');
  console.log('Target: https://gangrunprinting.com');
  console.log('Products to create: 4');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const results = [];

  try {
    // Check if we need to login first
    console.log('\nChecking authentication status...');
    await page.goto('https://gangrunprinting.com/admin/products', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/auth/login') || currentUrl.includes('/auth/signin')) {
      console.log('\n⚠️  Authentication required!');
      console.log('Please log in to the admin panel first in your browser, then run this script again.');
      console.log('Alternatively, you can modify this script to include login credentials.');
      await browser.close();
      return;
    }

    console.log('✅ Already authenticated, proceeding with product creation...\n');

    // Create each product
    for (let i = 0; i < PRODUCTS.length; i++) {
      const result = await createProduct(page, PRODUCTS[i], i);
      results.push(result);

      // Wait between products
      if (i < PRODUCTS.length - 1) {
        console.log('\nWaiting 2 seconds before next product...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful: ${successful.length}/${PRODUCTS.length}`);
    successful.forEach(r => {
      console.log(`   - ${r.product}${r.productId ? ` (ID: ${r.productId})` : ''}`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${PRODUCTS.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.product}: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }

  // Return results for further processing
  return results;
}

// Run the script
main().then((results) => {
  console.log('\n✅ Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
