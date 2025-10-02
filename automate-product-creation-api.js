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

async function createProductViaAPI(page, product, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating Product ${index + 1}/4: ${product.name}`);
  console.log('='.repeat(60));

  try {
    // First, we need to get the category ID
    console.log('Fetching categories...');
    const categoriesResponse = await page.evaluate(async (categoryName) => {
      const response = await fetch('/api/categories', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      const category = data.find(c => c.name === categoryName);
      return { category, allCategories: data };
    }, product.category);

    console.log(`  - Found ${categoriesResponse.allCategories.length} categories`);

    let categoryId = null;
    if (categoriesResponse.category) {
      categoryId = categoriesResponse.category.id;
      console.log(`  - Category ID for ${product.category}: ${categoryId}`);
    } else {
      console.log(`  ⚠️  Category ${product.category} not found, available categories:`,
        categoriesResponse.allCategories.map(c => c.name).join(', ')
      );
      // Use first available category as fallback
      categoryId = categoriesResponse.allCategories[0]?.id;
      console.log(`  - Using fallback category: ${categoriesResponse.allCategories[0]?.name} (${categoryId})`);
    }

    if (!categoryId) {
      throw new Error('No categories available');
    }

    // Prepare product data for API
    const productData = {
      name: product.name,
      sku: product.sku,
      description: product.description,
      categoryId: categoryId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,

      // Configuration
      selectedQuantityGroup: REAL_DATA.quantityGroupId,
      selectedSizeGroup: REAL_DATA.sizeGroupId,
      selectedPaperStockSet: REAL_DATA.paperStockSetId,
      selectedTurnaroundTimeSet: REAL_DATA.turnaroundTimeSetId,

      // Pricing (these might be calculated by the API)
      basePrice: product.basePrice,
      setupFee: product.setupFee,

      // Optional fields
      selectedAddOnSet: null,
      imageUrl: null
    };

    console.log('Creating product via API...');
    console.log('  - Product data:', JSON.stringify(productData, null, 2));

    // Make API call through the browser context to maintain authentication
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
          responseData = { rawResponse: responseText };
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

    console.log(`  - API Response Status: ${result.status} ${result.statusText}`);

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
      sku: createdProduct.sku,
      data: createdProduct
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
  console.log('AUTOMATED PRODUCT CREATION SCRIPT (API Method)');
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
    // Check authentication by visiting admin page
    console.log('\nChecking authentication status...');
    await page.goto('https://gangrunprinting.com/admin/products', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for either redirect to login or admin page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/auth/login') || currentUrl.includes('/auth/signin')) {
      console.log('\n❌ Authentication required!');
      console.log('Please log in to the admin panel first:');
      console.log('1. Open https://gangrunprinting.com/auth/signin in your browser');
      console.log('2. Log in as an admin user');
      console.log('3. Run this script again');
      await browser.close();
      return [];
    }

    console.log('✅ Already authenticated, proceeding with product creation...\n');

    // Create each product via API
    for (let i = 0; i < PRODUCTS.length; i++) {
      const result = await createProductViaAPI(page, PRODUCTS[i], i);
      results.push(result);

      // Wait between products
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
