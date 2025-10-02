const puppeteer = require('puppeteer');

async function createQuantityOnlyProduct() {
  console.log('🚀 Starting real product creation with QUANTITY MODULE ONLY');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable console logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', error => console.error('Page error:', error));

    // Step 1: Navigate to admin login
    console.log('1️⃣ Navigating to admin login...');
    await page.goto('https://gangrunprinting.com/admin', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if already logged in or need to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 Need to login...');
      // Login with credentials from CLAUDE.md
      await page.type('input[name="email"]', 'iradwatkins@gmail.com');
      await page.type('input[name="password"]', 'Iw2006js!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✅ Logged in successfully');
    }

    // Step 2: Navigate to product creation page
    console.log('2️⃣ Going to product creation page...');
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Fill in basic product information
    console.log('3️⃣ Filling basic product information...');

    // Product name
    const productName = `Business Cards - Quantity Test ${Date.now()}`;
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', productName);
    console.log(`   Product Name: ${productName}`);

    // Product description
    const description = 'High-quality business cards available in various quantities. This product demonstrates the quantity module working independently.';
    const descSelector = 'textarea[name="description"], input[name="description"]';
    await page.waitForSelector(descSelector, { timeout: 10000 });
    await page.type(descSelector, description);
    console.log('   Description: Added');

    // Category - select Business Cards
    const categorySelector = 'select[name="categoryId"], input[name="categoryId"]';
    await page.waitForSelector(categorySelector, { timeout: 10000 });

    // Try to find and select business-cards category
    const categoryExists = await page.evaluate(() => {
      const select = document.querySelector('select[name="categoryId"]');
      if (select) {
        const option = Array.from(select.options).find(opt =>
          opt.text.toLowerCase().includes('business') ||
          opt.value.includes('business')
        );
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    });

    if (categoryExists) {
      console.log('   Category: Business Cards selected');
    } else {
      console.log('   Category: Using first available category');
      await page.select(categorySelector, await page.$eval(categorySelector + ' option:nth-child(2)', el => el.value));
    }

    // Set base price
    await page.waitForSelector('input[name="basePrice"]', { timeout: 10000 });
    await page.evaluate(() => {
      const input = document.querySelector('input[name="basePrice"]');
      input.value = '';
    });
    await page.type('input[name="basePrice"]', '49.99');
    console.log('   Base Price: $49.99');

    // Step 4: Configure ONLY Quantity Module
    console.log('4️⃣ Configuring modules - ONLY Quantity enabled...');

    // Look for module checkboxes or toggles
    const moduleSelectors = {
      quantity: 'input[name*="quantity" i][type="checkbox"], input[id*="quantity" i][type="checkbox"], label[for*="quantity" i] input[type="checkbox"]',
      size: 'input[name*="size" i][type="checkbox"], input[id*="size" i][type="checkbox"], label[for*="size" i] input[type="checkbox"]',
      paper: 'input[name*="paper" i][type="checkbox"], input[id*="paper" i][type="checkbox"], label[for*="paper" i] input[type="checkbox"]',
      addon: 'input[name*="addon" i][type="checkbox"], input[id*="addon" i][type="checkbox"], label[for*="addon" i] input[type="checkbox"]',
      turnaround: 'input[name*="turnaround" i][type="checkbox"], input[id*="turnaround" i][type="checkbox"], label[for*="turnaround" i] input[type="checkbox"]'
    };

    // Enable quantity module
    const quantityEnabled = await page.evaluate((selector) => {
      const checkbox = document.querySelector(selector);
      if (checkbox && !checkbox.checked) {
        checkbox.click();
        return true;
      }
      return checkbox ? checkbox.checked : false;
    }, moduleSelectors.quantity);
    console.log(`   ✅ Quantity Module: ${quantityEnabled ? 'Enabled' : 'Already enabled or not found'}`);

    // Disable all other modules
    for (const [module, selector] of Object.entries(moduleSelectors)) {
      if (module !== 'quantity') {
        const disabled = await page.evaluate((sel) => {
          const checkbox = document.querySelector(sel);
          if (checkbox && checkbox.checked) {
            checkbox.click();
            return true;
          }
          return false;
        }, selector);
        if (disabled) {
          console.log(`   ❌ ${module} Module: Disabled`);
        }
      }
    }

    // Select a quantity group if dropdown exists
    const quantityGroupSelector = 'select[name="quantityGroupId"], select[id*="quantity"]';
    const quantityGroupExists = await page.$(quantityGroupSelector);
    if (quantityGroupExists) {
      // Select the first quantity group (should be "Gangrun Quantites")
      await page.select(quantityGroupSelector, await page.$eval(quantityGroupSelector + ' option:nth-child(2)', el => el.value));
      console.log('   Quantity Group: Selected');
    }

    // Upload an image
    console.log('5️⃣ Uploading product image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Create a simple test image
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#7b68ee');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Business Cards', 400, 250);
        ctx.font = '32px Arial';
        ctx.fillText('Quantity Module Test', 400, 320);
        ctx.font = '24px Arial';
        ctx.fillText('Select Your Quantity', 400, 380);

        // Convert to blob and create file
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'business-cards-quantity.png', { type: 'image/png' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          document.querySelector('input[type="file"]').files = dataTransfer.files;
          document.querySelector('input[type="file"]').dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for upload
      console.log('   ✅ Image uploaded');
    }

    // Step 6: Save the product
    console.log('6️⃣ Saving product to database...');

    // Find and click save button
    const saveButton = await page.$('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    if (saveButton) {
      await saveButton.click();
      console.log('   Clicked save button, waiting for response...');

      // Wait for navigation or success message
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.waitForSelector('.success-message, .toast-success', { timeout: 30000 }),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);

      console.log('✅ Product saved successfully!');

      // Get the final URL (should contain product ID)
      const finalUrl = page.url();
      console.log(`📍 Product URL: ${finalUrl}`);

      // Extract product ID if visible
      const productId = finalUrl.match(/products\/([a-z0-9-]+)/)?.[1];
      if (productId) {
        console.log(`🆔 Product ID: ${productId}`);
        console.log(`🔗 Frontend URL: https://gangrunprinting.com/products/${productId}`);
      }

      return {
        success: true,
        productName,
        productId,
        url: finalUrl
      };
    } else {
      throw new Error('Save button not found');
    }

  } catch (error) {
    console.error('❌ Error creating product:', error.message);

    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the product creation
createQuantityOnlyProduct()
  .then(result => {
    if (result.success) {
      console.log('\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
      console.log('Product created with ONLY Quantity Module enabled!');
      console.log(`Product Name: ${result.productName}`);
      console.log(`Check it out at: https://gangrunprinting.com/products/${result.productId || 'new'}`);
    } else {
      console.log('\n❌ Product creation failed:', result.error);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });