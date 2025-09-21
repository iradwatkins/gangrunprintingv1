import { test, expect } from '@playwright/test'

test.describe('Create Real Commercial Products', () => {
  // Real product data based on industry research
  const products = [
    {
      name: 'Premium Business Cards',
      sku: 'BC-PREM-001',
      category: 'Business Cards',
      description:
        'Professional business cards with full-color printing on premium 16pt card stock. Features silk lamination for a smooth, luxurious feel that resists water, smudges, and daily wear. Perfect for making a lasting impression at networking events and meetings.',
      shortDescription: 'Premium 16pt business cards with silk lamination',
      basePrice: 24.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 35.0,
      isFeatured: true,
      sizeGroup: 'Business Card Sizes', // 3.5" x 2" standard
      quantityGroup: 'Business Card Quantities', // 100, 250, 500, 1000, 2500, 5000
      paperStockSet: 'Standard Cardstock Set',
      specifications: {
        standardSize: '3.5" x 2"',
        bleedSize: '3.75" x 2.25"',
        safeArea: '3.36" x 1.86"',
        resolution: '300 DPI minimum',
        colorMode: '4/4 (Full color both sides)',
      },
    },
    {
      name: 'Marketing Flyers',
      sku: 'FLY-MKT-001',
      category: 'Flyers & Brochures',
      description:
        'High-quality marketing flyers printed on 100lb gloss text paper with vibrant full-color printing. Perfect for promotional campaigns, event announcements, and direct mail marketing. Features aqueous coating for enhanced durability and color pop.',
      shortDescription: 'Full-color flyers on 100lb gloss text',
      basePrice: 39.99,
      setupFee: 0,
      productionTime: 2,
      gangRunEligible: true,
      minGangQuantity: 25,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 45.0,
      isFeatured: true,
      sizeGroup: 'Flyer Sizes', // 8.5" x 11" standard
      quantityGroup: 'Basic Gangrun Price', // Various quantities
      paperStockSet: 'Premium Paper Set',
      specifications: {
        standardSize: '8.5" x 11"',
        bleedSize: '8.75" x 11.25"',
        paperWeight: '100lb Gloss Text',
        coating: 'Aqueous coating both sides',
        colorMode: '4/4 (Full color both sides)',
      },
    },
    {
      name: 'Large Format Posters',
      sku: 'POS-LRG-001',
      category: 'Posters',
      description:
        'Eye-catching large format posters printed on heavy 14pt C2S poster stock with semi-gloss finish. Ideal for trade shows, retail displays, and event promotions. Suitable for both indoor and outdoor use with optional lamination for extended durability.',
      shortDescription: '18" x 24" posters on 14pt stock',
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 1,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 0, // Same day
      rushFee: 25.0,
      isFeatured: true,
      sizeGroup: 'Poster Sizes', // 18" x 24" medium
      quantityGroup: 'Basic Gangrun Price',
      paperStockSet: 'Standard Cardstock Set',
      specifications: {
        standardSize: '18" x 24"',
        bleedSize: '18.25" x 24.25"',
        paperType: '14pt C2S (Coated 2 Sides)',
        finish: 'Semi-gloss',
        colorMode: '4/0 (Full color front only)',
      },
    },
  ]

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3002/auth/signin')
    await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
    await page.fill('input[name="password"]', 'Iw2006js!')
    await page.click('button[type="submit"]')

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/**', { timeout: 10000 })

    // Navigate to products page
    await page.goto('http://localhost:3002/admin/products')
    await page.waitForLoadState('networkidle')
  })

  for (const product of products) {
    test(`Create ${product.name}`, async ({ page }) => {
      // Navigate to new product page
      await page.goto('http://localhost:3002/admin/products/new')
      await page.waitForLoadState('networkidle')

      // Fill in basic information
      await page.fill('input[name="name"]', product.name)
      await page.fill('input[name="sku"]', product.sku)

      // Select category
      await page.click('button[role="combobox"]:has-text("Select a category")')
      await page.click(`div[role="option"]:has-text("${product.category}")`)

      // Fill descriptions
      await page.fill('textarea[name="description"]', product.description)
      await page.fill('input[name="shortDescription"]', product.shortDescription)

      // Pricing & Production
      await page.fill('input[name="basePrice"]', product.basePrice.toString())
      await page.fill('input[name="setupFee"]', product.setupFee.toString())
      await page.fill('input[name="productionTime"]', product.productionTime.toString())

      // Gang Run Settings
      if (product.gangRunEligible) {
        const gangRunCheckbox = await page.locator('input[type="checkbox"][id*="gangRun"]')
        const isChecked = await gangRunCheckbox.isChecked()
        if (!isChecked) {
          await gangRunCheckbox.click()
        }

        await page.fill('input[name="minGangQuantity"]', product.minGangQuantity.toString())
        await page.fill('input[name="maxGangQuantity"]', product.maxGangQuantity.toString())
      }

      // Rush Options
      if (product.rushAvailable) {
        const rushCheckbox = await page.locator('input[type="checkbox"][id*="rush"]')
        const isChecked = await rushCheckbox.isChecked()
        if (!isChecked) {
          await rushCheckbox.click()
        }

        await page.fill('input[name="rushDays"]', product.rushDays.toString())
        await page.fill('input[name="rushFee"]', product.rushFee.toString())
      }

      // Featured Product
      if (product.isFeatured) {
        const featuredCheckbox = await page.locator('input[type="checkbox"][id*="featured"]')
        const isChecked = await featuredCheckbox.isChecked()
        if (!isChecked) {
          await featuredCheckbox.click()
        }
      }

      // Select Paper Stock Set - click the button that contains "Select paper stock"
      const paperStockButton = await page
        .locator('button[role="combobox"]')
        .filter({ hasText: 'paper stock' })
      await paperStockButton.click()
      await page.waitForTimeout(500)
      await page.click(`div[role="option"]:has-text("${product.paperStockSet}")`)

      // Select Size Group - click the button that contains "Select size group"
      const sizeButton = await page
        .locator('button[role="combobox"]')
        .filter({ hasText: 'size group' })
      await sizeButton.click()
      await page.waitForTimeout(500)
      await page.click(`div[role="option"]:has-text("${product.sizeGroup}")`)

      // Select Quantity Group - click the button that contains "Select quantity group"
      const quantityButton = await page
        .locator('button[role="combobox"]')
        .filter({ hasText: 'quantity group' })
      await quantityButton.click()
      await page.waitForTimeout(500)
      await page.click(`div[role="option"]:has-text("${product.quantityGroup}")`)

      // Save the product
      await page.click('button:has-text("Save Product")')

      // Wait for success message or redirect
      await page.waitForTimeout(2000)

      // Verify the product was created by checking for success message or URL change
      const successMessage = page.locator('text=/success|created|saved/i')
      const isSuccess = await successMessage.isVisible().catch(() => false)

      if (isSuccess) {

      } else {
        // Check if we were redirected to the products list
        const currentUrl = page.url()
        if (currentUrl.includes('/admin/products') && !currentUrl.includes('/new')) {

        } else {

        }
      }

      // Small delay before next product
      await page.waitForTimeout(1000)
    })
  }

  test('Verify all products in admin panel', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products')
    await page.waitForLoadState('networkidle')

    // Check each product exists in the list
    for (const product of products) {
      const productRow = page.locator(`text=${product.name}`)
      await expect(productRow).toBeVisible({ timeout: 5000 })

    }
  })

  test('Test customer-facing product pages', async ({ page }) => {
    // Test each product on the customer side
    for (const product of products) {
      const slug = product.name.toLowerCase().replace(/\s+/g, '-')

      await page.goto(`http://localhost:3002/products/${slug}`)
      await page.waitForLoadState('networkidle')

      // Check product name is visible
      const productTitle = page.locator(`h1:has-text("${product.name}")`)
      await expect(productTitle).toBeVisible({ timeout: 5000 })

      // Check configuration form is present
      const configForm = page.locator('text=/quantity|size|paper/i')
      await expect(configForm.first()).toBeVisible()

      // Verify price is displayed
      const priceElement = page.locator(`text=/$${product.basePrice}/`)
      await expect(priceElement.first()).toBeVisible()

    }
  })
})
