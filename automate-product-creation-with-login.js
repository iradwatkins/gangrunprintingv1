const puppeteer = require('puppeteer');

// REAL DATABASE IDs (verified)
const REAL_DATA = {
  paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
  quantityGroupId: 'cmg5i6poy000094pu856umjxa',
  sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
  turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk'
};

// Login credentials (from CLAUDE.md)
const ADMIN_CREDENTIALS = {
  email: 'iradwatkins@gmail.com',
  password: 'Iw2006js!'
};

// 4 REAL Products to create
const PRODUCTS = [
  {
    category: 'BUSINESS_CARD',
    name: 'Premium Business Cards',
    description: 'High-quality premium business cards printed on professional card stock. Perfect for making a lasting impression.',
    sku: 'BIZ-CARD-PREM-001',
    basePrice: 29.99,
    setupFee: 5.00,
    isActive: true,
    isFeatured: true
  },
  {
    category: 'FLYER',
    name: 'Marketing Flyers 8.5x11',
    description: 'Eye-catching marketing flyers printed in full color. Ideal for promotions, events, and advertising campaigns.',
    sku: 'FLYER-MKT-8511-001',
    basePrice: 49.99,
    setupFee: 10.00,
    isActive: true,
    isFeatured: true
  },
  {
    category: 'POSTCARD',
    name: 'Promotional Postcards',
    description: 'High-impact promotional postcards perfect for direct mail campaigns, event invitations, and customer outreach.',
    sku: 'POST-PROMO-001',
    basePrice: 39.99,
    setupFee: 7.50,
    isActive: true,
    isFeatured: false
  },
  {
    category: 'BROCHURE',
    name: 'Professional Brochures',
    description: 'Professionally designed tri-fold brochures that showcase your business, products, and services with stunning clarity.',
    sku: 'BROCH-PRO-TRI-001',
    basePrice: 79.99,
    setupFee: 15.00,
    isActive: true,
    isFeatured: true
  }
];

async function login(page) {
  console.log('\n' + '='.repeat(60));
  console.log('LOGGING IN TO ADMIN PANEL');
  console.log('='.repeat(60));

  try {
    console.log('Navigating to login page...');
    await page.goto('https://gangrunprinting.com/auth/signin', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Waiting for login form...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of login page
    await page.screenshot({ path: '/root/websites/gangrunprinting/login-page.png', fullPage: true });
    console.log('  - Login page screenshot saved');

    // Check for email input
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (!emailInput) {
      console.log('  ❌ Email input not found');
      return false;
    }

    console.log('Filling in credentials...');
    await page.type('input[type="email"], input[name="email"]', ADMIN_CREDENTIALS.email);
    await new Promise(resolve => setTimeout(resolve, 300));

    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    if (passwordInput) {
      await page.type('input[type="password"], input[name="password"]', ADMIN_CREDENTIALS.password);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Find and click submit button
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      console.log('  ❌ Submit button not found');
      return false;
    }

    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      submitButton.click()
    ]);

    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentUrl = page.url();
    console.log(`  - Current URL after login: ${currentUrl}`);

    // Check if we're logged in
    if (currentUrl.includes('/admin') || currentUrl === 'https://gangrunprinting.com/') {
      console.log('  ✅ Login successful!');
      return true;
    } else if (currentUrl.includes('/auth/signin')) {
      console.log('  ❌ Login failed - still on signin page');
      await page.screenshot({ path: '/root/websites/gangrunprinting/login-failed.png', fullPage: true });
      return false;
    } else {
      console.log('  ⚠️  Unexpected redirect, checking admin access...');
      // Try to navigate to admin page
      await page.goto('https://gangrunprinting.com/admin/products', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      const adminUrl = page.url();
      if (adminUrl.includes('/admin/products')) {
        console.log('  ✅ Admin access confirmed!');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Login error: ${error.message}`);
    return false;
  }
}

async function createProductViaAPI(page, product, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating Product ${index + 1}/4: ${product.name}`);
  console.log('='.repeat(60));

  try {
    // First, get categories
    console.log('Fetching categories...');
    const categoriesResponse = await page.evaluate(async (categoryName) => {
      try {
        const response = await fetch('/api/categories', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return { error: `HTTP ${response.status}: ${response.statusText}`, status: response.status };
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          return { error: 'Invalid JSON response', rawResponse: text.substring(0, 200) };
        }

        const category = data.find(c => c.name === categoryName);
        return { category, allCategories: data };
      } catch (error) {
        return { error: error.message };
      }
    }, product.category);

    if (categoriesResponse.error) {
      throw new Error(`Categories fetch failed: ${categoriesResponse.error}`);
    }

    console.log(`  - Found ${categoriesResponse.allCategories.length} categories`);

    let categoryId = null;
    if (categoriesResponse.category) {
      categoryId = categoriesResponse.category.id;
      console.log(`  - Category ID for ${product.category}: ${categoryId}`);
    } else {
      console.log(`  ⚠️  Category ${product.category} not found`);
      categoryId = categoriesResponse.allCategories[0]?.id;
      console.log(`  - Using fallback: ${categoriesResponse.allCategories[0]?.name} (${categoryId})`);
    }

    if (!categoryId) {
      throw new Error('No categories available');
    }

    // Prepare product data
    const productData = {
      name: product.name,
      sku: product.sku,
      description: product.description,
      categoryId: categoryId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      selectedQuantityGroup: REAL_DATA.quantityGroupId,
      selectedSizeGroup: REAL_DATA.sizeGroupId,
      selectedPaperStockSet: REAL_DATA.paperStockSetId,
      selectedTurnaroundTimeSet: REAL_DATA.turnaroundTimeSetId,
      basePrice: product.basePrice,
      setupFee: product.setupFee,
      selectedAddOnSet: null,
      imageUrl: null
    };

    console.log('Creating product via API...');

    // Make API call
    const result = await page.evaluate(async (data) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { rawResponse: responseText.substring(0, 500) };
        }

        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: responseData
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          statusText: 'Network Error',
          error: error.message
        };
      }
    }, productData);

    console.log(`  - API Response: ${result.status} ${result.statusText}`);

    if (!result.ok) {
      const errorMsg = result.data?.error || result.data?.rawResponse || result.error || 'Unknown error';
      console.log(`  ❌ ERROR: ${errorMsg}`);
      return {
        success: false,
        product: product.name,
        error: errorMsg,
        status: result.status
      };
    }

    const createdProduct = result.data?.data || result.data;
    console.log(`  ✅ SUCCESS: Product created!`);
    console.log(`  - Product ID: ${createdProduct.id}`);
    console.log(`  - SKU: ${createdProduct.sku}`);

    return {
      success: true,
      product: product.name,
      productId: createdProduct.id,
      sku: createdProduct.sku
    };

  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return {
      success: false,
      product: product.name,
      error: error.message
    };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('AUTOMATED PRODUCT CREATION WITH LOGIN');
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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const results = [];

  try {
    // Login first
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.log('\n❌ Login failed, cannot proceed with product creation');
      await browser.close();
      return [];
    }

    // Ensure we're on admin page
    console.log('\nNavigating to admin products page...');
    await page.goto('https://gangrunprinting.com/admin/products', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create products
    for (let i = 0; i < PRODUCTS.length; i++) {
      const result = await createProductViaAPI(page, PRODUCTS[i], i);
      results.push(result);

      if (i < PRODUCTS.length - 1) {
        console.log('\nWaiting 1 second before next product...');
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      console.log(`   - ${r.product}`);
      console.log(`     ID: ${r.productId}`);
      console.log(`     SKU: ${r.sku}`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${PRODUCTS.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.product}`);
        console.log(`     Error: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }

  return results;
}

// Run the script
main().then((results) => {
  console.log('\n✅ Script completed!');
  if (results && results.length > 0) {
    const successCount = results.filter(r => r.success).length;
    console.log(`\nResults: ${successCount}/${results.length} products created successfully`);
  }
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
