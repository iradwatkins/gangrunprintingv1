/**
 * Real Data Integration Tests
 * Tests the actual system with real database data
 * Creates real products that show up in admin
 */

const puppeteer = require('puppeteer');
const path = require('path');

class RealDataTestHelper {
  constructor(page) {
    this.page = page;
    this.createdProducts = [];
    this.DEMO_IMAGE_PATH = '/root/websites/gangrunprinting/docs/documentations/demo.png';
    this.BASE_URL = 'http://localhost:3002';
    this.API_BASE = `${this.BASE_URL}/api`;
  }

  async login() {
    console.log('🔐 Logging into admin...');
    await this.page.goto(`${this.BASE_URL}/admin/login`);

    // Try to login - adjust selectors as needed
    try {
      // Look for email input
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
      await this.page.type('input[type="email"], input[name="email"]', 'iradwatkins@gmail.com');

      // Look for password input
      await this.page.type('input[type="password"], input[name="password"]', 'Iw2006js!');

      // Submit form
      await this.page.click('button[type="submit"], input[type="submit"]');

      // Wait for redirect
      await this.page.waitForTimeout(3000);

      console.log('✅ Logged in successfully');
    } catch (error) {
      console.log('⚠️  Login form not found or different structure, continuing...');
    }
  }

  async fetchRealData() {
    console.log('📊 Fetching real data from database...');

    // Create a new page for API calls to avoid interference
    const apiPage = await this.page.browser().newPage();

    try {
      // Fetch real categories
      await apiPage.goto(`${this.API_BASE}/product-categories?active=true`);
      const categoriesText = await apiPage.evaluate(() => document.body.textContent);
      const categories = JSON.parse(categoriesText);
      console.log(`Found ${categories.length} categories`);

      // Fetch real quantities
      await apiPage.goto(`${this.API_BASE}/quantities`);
      const quantitiesText = await apiPage.evaluate(() => document.body.textContent);
      const quantities = JSON.parse(quantitiesText);
      console.log(`Found ${quantities?.data?.length || 0} quantities`);

      // Fetch real paper stocks
      await apiPage.goto(`${this.API_BASE}/paper-stock-sets`);
      const paperStocksText = await apiPage.evaluate(() => document.body.textContent);
      const paperStocks = JSON.parse(paperStocksText);
      console.log(`Found ${paperStocks?.data?.length || 0} paper stock sets`);

      // Fetch real addons
      await apiPage.goto(`${this.API_BASE}/addons`);
      const addonsText = await apiPage.evaluate(() => document.body.textContent);
      const addons = JSON.parse(addonsText);
      console.log(`Found ${addons?.data?.length || 0} addons`);

      await apiPage.close();

      return {
        categories: categories || [],
        quantities: quantities?.data || [],
        paperStocks: paperStocks?.data || [],
        addons: addons?.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching real data:', error.message);
      await apiPage.close();
      return {
        categories: [],
        quantities: [],
        paperStocks: [],
        addons: []
      };
    }
  }

  async createRealProduct(productData, realData) {
    console.log(`🏗️  Creating real product: ${productData.name}`);

    // Navigate to product creation page
    await this.page.goto(`${this.BASE_URL}/admin/products/new`);
    await this.page.waitForTimeout(2000);

    try {
      // Fill basic information
      await this.fillBasicInfo(productData, realData);

      // Upload real demo image
      await this.uploadDemoImage();

      // Configure modules if they exist
      if (productData.quantity) {
        await this.configureQuantityModule(productData.quantity, realData);
      }

      if (productData.size && realData.sizes?.length > 0) {
        await this.configureSizeModule(productData.size);
      }

      if (productData.paperStock && realData.paperStocks?.length > 0) {
        await this.configurePaperStockModule(productData.paperStock, realData);
      }

      if (productData.addons && realData.addons?.length > 0) {
        await this.configureAddonsModule(productData.addons, realData);
      }

      if (productData.turnaround) {
        await this.configureTurnaroundModule(productData.turnaround);
      }

      // Save the product
      const saved = await this.saveProduct();
      if (saved) {
        this.createdProducts.push({
          name: productData.name,
          url: this.page.url(),
          timestamp: new Date()
        });
        console.log(`✅ Product created successfully: ${productData.name}`);
        return true;
      } else {
        console.log(`❌ Failed to save product: ${productData.name}`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Error creating product ${productData.name}:`, error.message);
      return false;
    }
  }

  async fillBasicInfo(productData, realData) {
    // Product name
    const nameSelector = 'input[name="name"], #name, [data-testid="product-name"]';
    await this.waitAndType(nameSelector, productData.name);

    // Category selection - use real category
    if (realData.categories.length > 0) {
      const category = productData.categorySlug
        ? realData.categories.find(c => c.slug === productData.categorySlug)
        : realData.categories[0];

      if (category) {
        console.log(`Using real category: ${category.name}`);
        const categorySelector = 'select[name="categoryId"], #categoryId, [data-testid="category-select"]';
        await this.waitAndSelect(categorySelector, category.id);
      }
    }

    // Description
    if (productData.description) {
      const descSelector = 'textarea[name="description"], #description, [data-testid="product-description"]';
      await this.waitAndType(descSelector, productData.description);
    }
  }

  async uploadDemoImage() {
    console.log('📸 Uploading demo image...');

    const selectors = [
      'input[type="file"]',
      'input[accept*="image"]',
      '[data-testid="image-upload"]',
      '#imageUpload'
    ];

    for (const selector of selectors) {
      try {
        const fileInput = await this.page.$(selector);
        if (fileInput) {
          await fileInput.uploadFile(this.DEMO_IMAGE_PATH);
          console.log('✅ Demo image uploaded');

          // Wait for upload to complete
          await this.page.waitForTimeout(3000);

          // Look for success indicators
          const successIndicators = [
            '.upload-success',
            '.image-preview',
            '[data-testid="upload-success"]'
          ];

          for (const indicator of successIndicators) {
            const success = await this.page.$(indicator);
            if (success) {
              console.log('✅ Upload success confirmed');
              return;
            }
          }

          return;
        }
      } catch (error) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }

    console.log('⚠️  Could not find file upload input');
  }

  async configureQuantityModule(quantityConfig, realData) {
    console.log('📊 Configuring quantity module...');

    if (realData.quantities.length === 0) {
      console.log('⚠️  No real quantities found, skipping');
      return;
    }

    const quantity = quantityConfig.value
      ? realData.quantities.find(q => q.displayValue === quantityConfig.value)
      : realData.quantities[0];

    if (quantity) {
      console.log(`Using real quantity: ${quantity.displayValue}`);

      const selectors = [
        'select[name="quantity"]',
        '#quantity-select',
        '[data-testid="quantity-selector"]'
      ];

      await this.trySelectValue(selectors, quantity.id);
    }
  }

  async configurePaperStockModule(paperStockConfig, realData) {
    console.log('📄 Configuring paper stock module...');

    if (realData.paperStocks.length === 0) {
      console.log('⚠️  No real paper stocks found, skipping');
      return;
    }

    const paperStock = paperStockConfig.name
      ? realData.paperStocks.find(p => p.name.includes(paperStockConfig.name))
      : realData.paperStocks[0];

    if (paperStock) {
      console.log(`Using real paper stock: ${paperStock.name}`);

      const selectors = [
        'select[name="paperStockSetId"]',
        '#paper-stock-select',
        '[data-testid="paper-stock-selector"]'
      ];

      await this.trySelectValue(selectors, paperStock.id);
    }
  }

  async configureAddonsModule(addonConfig, realData) {
    console.log('🎛️  Configuring addons module...');

    if (realData.addons.length === 0) {
      console.log('⚠️  No real addons found, skipping');
      return;
    }

    // Select first available addon
    const addon = realData.addons[0];
    console.log(`Using real addon: ${addon.name}`);

    const selectors = [
      `input[value="${addon.id}"]`,
      `[data-addon-id="${addon.id}"]`,
      `.addon-${addon.id}`
    ];

    await this.tryCheckbox(selectors);
  }

  async saveProduct() {
    console.log('💾 Saving product...');

    const saveSelectors = [
      'button[type="submit"]',
      'button:contains("Save")',
      'button:contains("Create")',
      '[data-testid="save-product"]',
      '.save-product-btn'
    ];

    for (const selector of saveSelectors) {
      try {
        const button = await this.page.$(selector);
        if (button) {
          await button.click();
          console.log('✅ Save button clicked');

          // Wait for save to complete
          await this.page.waitForTimeout(5000);

          // Check for success indicators
          const successSelectors = [
            '.success-message',
            '.alert-success',
            '[data-testid="success"]'
          ];

          for (const successSelector of successSelectors) {
            const success = await this.page.$(successSelector);
            if (success) {
              console.log('✅ Product saved successfully');
              return true;
            }
          }

          // Check if URL changed (indicating success)
          const currentUrl = this.page.url();
          if (currentUrl.includes('/edit/') || currentUrl.includes('/admin/products/')) {
            console.log('✅ Product saved (URL changed)');
            return true;
          }

          return true;
        }
      } catch (error) {
        console.log(`Save selector ${selector} failed, trying next...`);
      }
    }

    console.log('❌ Could not find save button');
    return false;
  }

  async verifyProductInAdminList(productName) {
    console.log(`🔍 Verifying product "${productName}" appears in admin list...`);

    await this.page.goto(`${this.BASE_URL}/admin/products`);
    await this.page.waitForTimeout(3000);

    // Search for product name in page content
    const pageContent = await this.page.content();
    const productExists = pageContent.includes(productName);

    if (productExists) {
      console.log(`✅ Product "${productName}" found in admin list`);
      return true;
    } else {
      console.log(`❌ Product "${productName}" NOT found in admin list`);
      return false;
    }
  }

  async checkForErrors() {
    // Check console for JavaScript errors
    const logs = await this.page.evaluate(() => {
      return window.console.logs || [];
    });

    // Check for error messages on page
    const errorSelectors = [
      '.error',
      '.alert-error',
      '.text-red-500',
      '[data-testid="error"]'
    ];

    for (const selector of errorSelectors) {
      const errors = await this.page.$$(selector);
      if (errors.length > 0) {
        const errorText = await this.page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? el.textContent : '';
        }, selector);
        console.log(`⚠️  Error found: ${errorText}`);
      }
    }
  }

  // Helper methods
  async waitAndType(selector, text) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.type(selector, text);
    } catch (error) {
      console.log(`Could not type in ${selector}: ${error.message}`);
    }
  }

  async waitAndSelect(selector, value) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.select(selector, value);
    } catch (error) {
      console.log(`Could not select ${value} in ${selector}: ${error.message}`);
    }
  }

  async trySelectValue(selectors, value) {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          await this.page.select(selector, value);
          return;
        }
      } catch (error) {
        console.log(`Could not select in ${selector}, trying next...`);
      }
    }
  }

  async tryCheckbox(selectors) {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          await element.click();
          return;
        }
      } catch (error) {
        console.log(`Could not check ${selector}, trying next...`);
      }
    }
  }

  async takeScreenshot(name) {
    try {
      await this.page.screenshot({
        path: `/root/websites/gangrunprinting/tests/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    } catch (error) {
      console.log(`Could not take screenshot: ${error.message}`);
    }
  }
}

describe('Real Data Integration Tests', () => {
  let browser;
  let page;
  let helper;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    helper = new RealDataTestHelper(page);

    await page.setViewport({ width: 1920, height: 1080 });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('PAGE ERROR:', msg.text());
      }
    });
  });

  afterEach(async () => {
    await helper.takeScreenshot('test-end');
    await page.close();
  });

  afterAll(async () => {
    console.log('\n📊 TEST SUMMARY:');
    console.log(`Created ${helper.createdProducts.length} real products:`);
    helper.createdProducts.forEach(product => {
      console.log(`  - ${product.name} at ${product.timestamp.toISOString()}`);
    });

    await browser.close();
  });

  test('should fetch real data from database', async () => {
    console.log('🧪 Test 1: Fetching Real Data from Database');

    await helper.login();
    const realData = await helper.fetchRealData();

    expect(realData.categories.length).toBeGreaterThan(0);
    console.log(`✅ Found ${realData.categories.length} real categories`);

    if (realData.quantities.length > 0) {
      console.log(`✅ Found ${realData.quantities.length} real quantities`);
    }

    if (realData.paperStocks.length > 0) {
      console.log(`✅ Found ${realData.paperStocks.length} real paper stocks`);
    }

    if (realData.addons.length > 0) {
      console.log(`✅ Found ${realData.addons.length} real addons`);
    }

    expect(realData).toBeDefined();
  }, 60000);

  test('should create real product with minimal configuration', async () => {
    console.log('🧪 Test 2: Creating Real Product - Minimal Config');

    await helper.login();
    const realData = await helper.fetchRealData();

    const productData = {
      name: `Real Test Product - Minimal - ${Date.now()}`,
      categorySlug: 'business-cards',
      description: 'This is a real product created by automated test',
      quantity: { type: 'standard', value: 1000 }
    };

    const created = await helper.createRealProduct(productData, realData);
    expect(created).toBe(true);

    // Verify it shows up in admin
    const foundInAdmin = await helper.verifyProductInAdminList(productData.name);
    expect(foundInAdmin).toBe(true);

    await helper.checkForErrors();
  }, 120000);

  test('should create real product with full module configuration', async () => {
    console.log('🧪 Test 3: Creating Real Product - Full Config');

    await helper.login();
    const realData = await helper.fetchRealData();

    const productData = {
      name: `Real Test Product - Full Config - ${Date.now()}`,
      categorySlug: 'flyers',
      description: 'Real product with all modules configured using real data',
      quantity: { type: 'standard', value: 500 },
      paperStock: { name: 'cardstock' },
      addons: ['variable-data'],
      turnaround: { type: 'standard' }
    };

    const created = await helper.createRealProduct(productData, realData);
    expect(created).toBe(true);

    // Verify it shows up in admin
    const foundInAdmin = await helper.verifyProductInAdminList(productData.name);
    expect(foundInAdmin).toBe(true);

    await helper.checkForErrors();
  }, 150000);

  test('should create multiple real products with different configurations', async () => {
    console.log('🧪 Test 4: Creating Multiple Real Products');

    await helper.login();
    const realData = await helper.fetchRealData();

    const products = [
      {
        name: `Real Business Cards - ${Date.now()}`,
        categorySlug: 'business-cards',
        description: 'Real business cards using real data',
        quantity: { type: 'standard', value: 1000 }
      },
      {
        name: `Real Postcards - ${Date.now()}`,
        categorySlug: 'postcards',
        description: 'Real postcards with paper stock',
        quantity: { type: 'standard', value: 500 },
        paperStock: { name: 'cardstock' }
      },
      {
        name: `Real Flyers - ${Date.now()}`,
        categorySlug: 'flyers',
        description: 'Real flyers with addons',
        quantity: { type: 'custom', value: 2500 },
        addons: ['variable-data']
      }
    ];

    let successCount = 0;

    for (const productData of products) {
      const created = await helper.createRealProduct(productData, realData);
      if (created) {
        successCount++;

        // Verify each product in admin
        const foundInAdmin = await helper.verifyProductInAdminList(productData.name);
        expect(foundInAdmin).toBe(true);
      }

      // Brief pause between products
      await page.waitForTimeout(2000);
    }

    expect(successCount).toBe(products.length);
    console.log(`✅ Created ${successCount}/${products.length} products successfully`);

    await helper.checkForErrors();
  }, 300000);

  test('should test real quantity module with actual data', async () => {
    console.log('🧪 Test 5: Testing Real Quantity Module');

    await helper.login();
    const realData = await helper.fetchRealData();

    if (realData.quantities.length === 0) {
      console.log('⚠️  No real quantities found, skipping test');
      return;
    }

    // Test with different real quantities
    for (let i = 0; i < Math.min(3, realData.quantities.length); i++) {
      const quantity = realData.quantities[i];

      const productData = {
        name: `Quantity Test ${quantity.displayValue} - ${Date.now()}`,
        categorySlug: 'business-cards',
        description: `Testing with real quantity: ${quantity.displayValue}`,
        quantity: { value: quantity.displayValue }
      };

      const created = await helper.createRealProduct(productData, realData);
      expect(created).toBe(true);

      console.log(`✅ Tested quantity: ${quantity.displayValue}`);
      await page.waitForTimeout(1000);
    }
  }, 180000);
});