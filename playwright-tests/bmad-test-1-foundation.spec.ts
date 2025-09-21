import { test, expect } from '@playwright/test'

test.describe('BMAD Test 1: Foundation Data Setup & Basic Product Creation', () => {
  // Real foundation data for commercial printing business
  const foundationData = {
    categories: [
      { name: 'Business Cards', description: 'Professional business cards and networking materials' },
      { name: 'Flyers & Brochures', description: 'Marketing materials and promotional items' },
      { name: 'Large Format Posters', description: 'Banners, posters, and large format printing' },
    ],
    paperStockSets: [
      {
        name: 'Standard Cardstock Set',
        description: 'Premium cardstock options for business cards',
        paperStocks: ['16pt Card Stock', '14pt Card Stock', '12pt Card Stock']
      },
      {
        name: 'Marketing Materials Set',
        description: 'Paper options for flyers and brochures',
        paperStocks: ['100lb Gloss Text', '80lb Gloss Text', '100lb Matte Text']
      }
    ],
    quantityGroups: [
      {
        name: 'Business Card Quantities',
        values: '100,250,500,1000,2500,5000',
        defaultValue: '500'
      },
      {
        name: 'Flyer Quantities',
        values: '25,50,100,250,500,1000,2500,5000,10000',
        defaultValue: '100'
      }
    ],
    sizeGroups: [
      {
        name: 'Business Card Sizes',
        values: '3.5" x 2" (Standard),3.5" x 2" (Rounded Corners)',
        defaultValue: '3.5" x 2" (Standard)'
      },
      {
        name: 'Flyer Sizes',
        values: '8.5" x 11",5.5" x 8.5",4.25" x 11"',
        defaultValue: '8.5" x 11"'
      }
    ],
    addOnSets: [
      {
        name: 'Premium Business Card Add-ons',
        description: 'Enhancement options for business cards'
      }
    ],
    turnaroundTimeSets: [
      {
        name: 'Standard Production Times',
        description: 'Regular production schedule'
      }
    ]
  }

  const testProduct = {
    name: 'Premium Business Cards - Test',
    sku: 'BC-TEST-001',
    description: 'High-quality business cards with premium cardstock and professional finishing.',
    shortDescription: 'Premium business cards for professionals',
    basePrice: 24.99,
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to admin and handle authentication
    await page.goto('https://gangrunprinting.com/admin')

    // Wait for page to load and check if we need to authenticate
    await page.waitForLoadState('networkidle')

    // If we're redirected to signin, we need to authenticate
    if (page.url().includes('/auth/signin')) {

      // For now, we'll assume authentication is handled externally
      // In a real test environment, you'd handle auth here
    }
  })

  test('Step 1: Create Foundation Categories', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/categories')

    for (const category of foundationData.categories) {
      // Click New Category button
      await page.click('text=New Category')

      // Fill in category details
      await page.fill('input[name="name"]', category.name)
      await page.fill('textarea[name="description"]', category.description)

      // Save category
      await page.click('button:has-text("Save")')

      // Wait for success and close modal
      await page.waitForSelector('text=success', { timeout: 5000 })
      await page.keyboard.press('Escape')

    }
  })

  test('Step 2: Create Paper Stock Sets', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/paper-stock-sets')

    for (const paperStockSet of foundationData.paperStockSets) {
      // Click New Paper Stock Set button
      await page.click('text=New Paper Stock Set')

      // Fill in paper stock set details
      await page.fill('input[name="name"]', paperStockSet.name)
      await page.fill('textarea[name="description"]', paperStockSet.description)

      // Save paper stock set
      await page.click('button:has-text("Save")')

      // Wait for success
      await page.waitForSelector('text=success', { timeout: 5000 })
      await page.keyboard.press('Escape')

    }
  })

  test('Step 3: Create Quantity Groups', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/quantities')

    for (const quantityGroup of foundationData.quantityGroups) {
      // Look for New or Add button
      const newButton = page.locator('button:has-text("New"), button:has-text("Add")')
      await newButton.first().click()

      // Fill in quantity group details
      await page.fill('input[name="name"]', quantityGroup.name)
      await page.fill('input[name="values"]', quantityGroup.values)
      await page.fill('input[name="defaultValue"]', quantityGroup.defaultValue)

      // Save quantity group
      await page.click('button:has-text("Save")')

    }
  })

  test('Step 4: Create Size Groups', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/sizes')

    for (const sizeGroup of foundationData.sizeGroups) {
      // Look for New or Add button
      const newButton = page.locator('button:has-text("New"), button:has-text("Add")')
      await newButton.first().click()

      // Fill in size group details
      await page.fill('input[name="name"]', sizeGroup.name)
      await page.fill('input[name="values"]', sizeGroup.values)
      await page.fill('input[name="defaultValue"]', sizeGroup.defaultValue)

      // Save size group
      await page.click('button:has-text("Save")')

    }
  })

  test('Step 5: Create Add-on Sets', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/addon-sets')

    for (const addOnSet of foundationData.addOnSets) {
      // Click New Add-on Set button
      const newButton = page.locator('button:has-text("New"), button:has-text("Add")')
      await newButton.first().click()

      // Fill in add-on set details
      await page.fill('input[name="name"]', addOnSet.name)
      await page.fill('textarea[name="description"]', addOnSet.description)

      // Save add-on set
      await page.click('button:has-text("Save")')

    }
  })

  test('Step 6: Create Turnaround Time Sets', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/turnaround-time-sets')

    for (const turnaroundTimeSet of foundationData.turnaroundTimeSets) {
      // Click New Turnaround Time Set button
      const newButton = page.locator('button:has-text("New"), button:has-text("Add")')
      await newButton.first().click()

      // Fill in turnaround time set details
      await page.fill('input[name="name"]', turnaroundTimeSet.name)
      await page.fill('textarea[name="description"]', turnaroundTimeSet.description)

      // Save turnaround time set
      await page.click('button:has-text("Save")')

    }
  })

  test('Step 7: Create Basic Test Product', async ({ page }) => {
    // Navigate to new product page
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Wait for page to load and APIs to respond
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow dropdowns to populate

    // Fill in basic product information
    await page.fill('input[name="name"]', testProduct.name)
    await page.fill('input[name="sku"]', testProduct.sku)
    await page.fill('textarea[name="description"]', testProduct.description)
    await page.fill('textarea[name="shortDescription"]', testProduct.shortDescription)
    await page.fill('input[name="basePrice"]', testProduct.basePrice.toString())

    // Select category (first category we created)
    const categorySelect = page.locator('select[name="categoryId"], button:has-text("Select category")')
    if (await categorySelect.count() > 0) {
      await categorySelect.click()
      await page.click('text=Business Cards')
    }

    // Select paper stock set (first one we created)
    const paperStockSelect = page.locator('select[name="selectedPaperStockSet"], button:has-text("Select paper stock set")')
    if (await paperStockSelect.count() > 0) {
      await paperStockSelect.click()
      await page.click('text=Standard Cardstock Set')
    }

    // Select quantity group
    const quantitySelect = page.locator('select[name="selectedQuantityGroup"], button:has-text("Select quantity group")')
    if (await quantitySelect.count() > 0) {
      await quantitySelect.click()
      await page.click('text=Business Card Quantities')
    }

    // Select size group
    const sizeSelect = page.locator('select[name="selectedSizeGroup"], button:has-text("Select size group")')
    if (await sizeSelect.count() > 0) {
      await sizeSelect.click()
      await page.click('text=Business Card Sizes')
    }

    // Save the product
    await page.click('button:has-text("Create Product")')

    // Wait for success message or redirect
    await page.waitForSelector('text=success', { timeout: 10000 })

    // Verify product was created by checking if we're redirected to product list or edit page
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/new')
  })

  test('Step 8: Verify Foundation Data APIs', async ({ page }) => {
    // Test all the APIs we fixed to ensure they return data now
    const apiTests = [
      { endpoint: '/api/product-categories', name: 'Categories' },
      { endpoint: '/api/paper-stock-sets', name: 'Paper Stock Sets' },
      { endpoint: '/api/quantity-groups', name: 'Quantity Groups' },
      { endpoint: '/api/size-groups', name: 'Size Groups' },
      { endpoint: '/api/addon-sets', name: 'Add-on Sets' },
      { endpoint: '/api/turnaround-time-sets', name: 'Turnaround Time Sets' }
    ]

    for (const apiTest of apiTests) {
      const response = await page.request.get(`https://gangrunprinting.com${apiTest.endpoint}`)
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

    }
  })
})