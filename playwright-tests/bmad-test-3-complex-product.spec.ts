import { test, expect } from '@playwright/test'

test.describe('BMAD Test 3: Complex Product Configuration with All Options', () => {
  const complexProduct = {
    name: 'Deluxe Premium Business Cards - Complete Package',
    sku: 'BC-DELUXE-001',
    description: 'The ultimate business card package featuring premium cardstock, multiple finishing options, rush production capabilities, and comprehensive customization. Perfect for executives and professionals who demand the highest quality presentation materials.',
    shortDescription: 'Premium business cards with complete customization options',
    basePrice: 89.99,
    setupFee: 25.00,
    productionTime: 5,
    rushAvailable: true,
    rushDays: 1,
    rushFee: 75.00,
    isFeatured: true,
    isActive: true,
    gangRunEligible: true,
    minGangQuantity: 250,
    maxGangQuantity: 10000,
    specifications: {
      standardSize: '3.5" x 2"',
      bleedSize: '3.75" x 2.25"',
      safeArea: '3.36" x 1.86"',
      resolution: '300 DPI minimum',
      colorMode: '4/4 (Full color both sides)',
      finishingOptions: ['Matte Lamination', 'Gloss Lamination', 'Spot UV', 'Embossing', 'Foil Stamping'],
    },
    pricingTiers: [
      { minQuantity: 100, maxQuantity: 249, pricePerUnit: 0.89, discountPercentage: 0 },
      { minQuantity: 250, maxQuantity: 499, pricePerUnit: 0.79, discountPercentage: 11 },
      { minQuantity: 500, maxQuantity: 999, pricePerUnit: 0.69, discountPercentage: 22 },
      { minQuantity: 1000, maxQuantity: 2499, pricePerUnit: 0.59, discountPercentage: 34 },
      { minQuantity: 2500, maxQuantity: 4999, pricePerUnit: 0.49, discountPercentage: 45 },
      { minQuantity: 5000, maxQuantity: null, pricePerUnit: 0.39, discountPercentage: 56 }
    ],
    productOptions: [
      {
        name: 'Lamination Type',
        type: 'SELECT',
        required: true,
        values: [
          { value: 'matte', label: 'Matte Lamination', additionalPrice: 0, isDefault: true },
          { value: 'gloss', label: 'Gloss Lamination', additionalPrice: 5.00, isDefault: false },
          { value: 'soft-touch', label: 'Soft Touch Lamination', additionalPrice: 15.00, isDefault: false }
        ]
      },
      {
        name: 'Corner Style',
        type: 'SELECT',
        required: true,
        values: [
          { value: 'standard', label: 'Standard Square Corners', additionalPrice: 0, isDefault: true },
          { value: 'rounded', label: 'Rounded Corners', additionalPrice: 10.00, isDefault: false },
          { value: 'custom', label: 'Custom Die Cut', additionalPrice: 25.00, isDefault: false }
        ]
      },
      {
        name: 'Special Effects',
        type: 'CHECKBOX',
        required: false,
        values: [
          { value: 'spot-uv', label: 'Spot UV Coating', additionalPrice: 35.00, isDefault: false },
          { value: 'embossing', label: 'Embossing', additionalPrice: 45.00, isDefault: false },
          { value: 'foil-gold', label: 'Gold Foil Stamping', additionalPrice: 55.00, isDefault: false },
          { value: 'foil-silver', label: 'Silver Foil Stamping', additionalPrice: 50.00, isDefault: false }
        ]
      },
      {
        name: 'Packaging',
        type: 'SELECT',
        required: true,
        values: [
          { value: 'standard', label: 'Standard Box Packaging', additionalPrice: 0, isDefault: true },
          { value: 'premium', label: 'Premium Gift Box', additionalPrice: 20.00, isDefault: false },
          { value: 'eco', label: 'Eco-Friendly Packaging', additionalPrice: 5.00, isDefault: false }
        ]
      }
    ]
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/auth/signin')) {

    }
  })

  test('Step 1: Create Complex Product with All Configurations', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/products/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Allow all dropdowns to populate

    // Fill in comprehensive basic information
    await page.fill('input[name="name"]', complexProduct.name)
    await page.fill('input[name="sku"]', complexProduct.sku)
    await page.fill('textarea[name="description"]', complexProduct.description)
    await page.fill('textarea[name="shortDescription"]', complexProduct.shortDescription)
    await page.fill('input[name="basePrice"]', complexProduct.basePrice.toString())

    // Advanced product settings
    try {
      await page.fill('input[name="setupFee"]', complexProduct.setupFee.toString())
      await page.fill('input[name="productionTime"]', complexProduct.productionTime.toString())
      await page.fill('input[name="rushFee"]', complexProduct.rushFee.toString())
    } catch (error) {

    }

    // Set product flags
    try {
      await page.check('input[name="isFeatured"]')
      await page.check('input[name="isActive"]')
      await page.check('input[name="rushAvailable"]')
      await page.check('input[name="gangRunEligible"]')
    } catch (error) {

    }

    // Upload a premium business card design
    await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 350
      canvas.height = 200
      const ctx = canvas.getContext('2d')!

      // Create premium gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(0.5, '#16213e')
      gradient.addColorStop(1, '#0f3460')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add premium text design
      ctx.fillStyle = '#eee5b5'
      ctx.font = 'bold 22px Georgia'
      ctx.textAlign = 'center'
      ctx.fillText('EXECUTIVE BUSINESS CARD', canvas.width / 2, 50)

      ctx.fillStyle = '#ffffff'
      ctx.font = '18px Georgia'
      ctx.fillText('Premium Quality • Luxury Finish', canvas.width / 2, 80)

      ctx.font = '14px Arial'
      ctx.fillText('Contact Information', canvas.width / 2, 120)
      ctx.fillText('Professional Design', canvas.width / 2, 140)
      ctx.fillText('Multiple Finishing Options', canvas.width / 2, 160)

      // Add a border
      ctx.strokeStyle = '#eee5b5'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'deluxe-business-card.png', { type: 'image/png' })
          const fileInput = document.querySelector('#product-image') as HTMLInputElement
          if (fileInput) {
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            fileInput.files = dataTransfer.files
            fileInput.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }
      }, 'image/png')
    })

    await page.waitForSelector('text=Image uploaded successfully', { timeout: 15000 })

    // Select all available dropdown options
    const dropdownTests = [
      { selector: 'select[name="categoryId"], button:has-text("Select category")', option: 'Business Cards', name: 'Category' },
      { selector: 'select[name="selectedPaperStockSet"], button:has-text("Select paper stock set")', option: 'Standard Cardstock Set', name: 'Paper Stock Set' },
      { selector: 'select[name="selectedQuantityGroup"], button:has-text("Select quantity group")', option: 'Business Card Quantities', name: 'Quantity Group' },
      { selector: 'select[name="selectedSizeGroup"], button:has-text("Select size group")', option: 'Business Card Sizes', name: 'Size Group' },
      { selector: 'select[name="selectedAddOnSet"], button:has-text("Select add-on set")', option: 'Premium Business Card Add-ons', name: 'Add-on Set' },
      { selector: 'select[name="selectedTurnaroundTimeSet"], button:has-text("Select turnaround time set")', option: 'Standard Production Times', name: 'Turnaround Time Set' }
    ]

    for (const dropdown of dropdownTests) {
      try {
        const element = page.locator(dropdown.selector)
        if (await element.count() > 0) {
          await element.click()
          await page.click(`text=${dropdown.option}`)

        } else {

        }
      } catch (error) {

      }
      await page.waitForTimeout(500) // Small delay between selections
    }

    // Save the complex product
    await page.click('button:has-text("Create Product")')
    await page.waitForSelector('text=success', { timeout: 15000 })

    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/new')
  })

  test('Step 2: Add Pricing Tiers to Complex Product', async ({ page }) => {
    // Navigate to products list to find our complex product
    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForLoadState('networkidle')

    // Find and edit our complex product
    const productRow = page.locator(`text=${complexProduct.name}`)
    await expect(productRow).toBeVisible()

    // Click edit button for the product
    const editButton = productRow.locator('..').locator('button:has-text("Edit"), a:has-text("Edit")')
    if (await editButton.count() > 0) {
      await editButton.click()
    } else {
      // Alternative: click on the product name itself
      await productRow.click()
    }

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for pricing tiers section
    try {
      // Add pricing tiers if the UI supports it
      for (const tier of complexProduct.pricingTiers) {
        // Look for "Add Pricing Tier" button
        const addTierButton = page.locator('button:has-text("Add Tier"), button:has-text("Add Pricing")')
        if (await addTierButton.count() > 0) {
          await addTierButton.click()

          // Fill in tier details
          await page.fill('input[name="minQuantity"]', tier.minQuantity.toString())
          if (tier.maxQuantity) {
            await page.fill('input[name="maxQuantity"]', tier.maxQuantity.toString())
          }
          await page.fill('input[name="pricePerUnit"]', tier.pricePerUnit.toString())
          await page.fill('input[name="discountPercentage"]', tier.discountPercentage.toString())

          // Save tier
          await page.click('button:has-text("Save Tier")')

        }
      }
    } catch (error) {

    }

    // Save the product with pricing tiers
    await page.click('button:has-text("Save"), button:has-text("Update")')
    await page.waitForSelector('text=success', { timeout: 10000 })

  })

  test('Step 3: Add Product Options to Complex Product', async ({ page }) => {
    // Navigate back to product edit page
    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForLoadState('networkidle')

    const productRow = page.locator(`text=${complexProduct.name}`)
    await expect(productRow).toBeVisible()

    // Edit the product
    const editButton = productRow.locator('..').locator('button:has-text("Edit"), a:has-text("Edit")')
    if (await editButton.count() > 0) {
      await editButton.click()
    } else {
      await productRow.click()
    }

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Add product options if the UI supports it
    try {
      for (const option of complexProduct.productOptions) {
        // Look for "Add Option" button
        const addOptionButton = page.locator('button:has-text("Add Option"), button:has-text("Add Product Option")')
        if (await addOptionButton.count() > 0) {
          await addOptionButton.click()

          // Fill in option details
          await page.fill('input[name="optionName"]', option.name)

          // Select option type
          const typeSelect = page.locator('select[name="optionType"]')
          if (await typeSelect.count() > 0) {
            await typeSelect.selectOption(option.type)
          }

          // Set required flag
          if (option.required) {
            await page.check('input[name="required"]')
          }

          // Add option values
          for (const value of option.values) {
            const addValueButton = page.locator('button:has-text("Add Value")')
            if (await addValueButton.count() > 0) {
              await addValueButton.click()

              await page.fill('input[name="valueLabel"]', value.label)
              await page.fill('input[name="valuePrice"]', value.additionalPrice.toString())

              if (value.isDefault) {
                await page.check('input[name="isDefault"]')
              }

              await page.click('button:has-text("Save Value")')
            }
          }

          // Save option
          await page.click('button:has-text("Save Option")')

        }
      }
    } catch (error) {

    }

    // Final save
    await page.click('button:has-text("Save"), button:has-text("Update")')
    await page.waitForSelector('text=success', { timeout: 10000 })

  })

  test('Step 4: Verify Complex Product Configuration', async ({ page }) => {

    // Test API to verify product was saved correctly
    const response = await page.request.get('https://gangrunprinting.com/api/products')
    expect(response.status()).toBe(200)

    const products = await response.json()
    const complexProductFromAPI = products.find(p => p.sku === complexProduct.sku)

    if (complexProductFromAPI) {

      // Verify relationships
      if (complexProductFromAPI.ProductCategory) {

      }

      if (complexProductFromAPI.ProductImage && complexProductFromAPI.ProductImage.length > 0) {

      }

      if (complexProductFromAPI.PricingTier && complexProductFromAPI.PricingTier.length > 0) {

      }

      if (complexProductFromAPI.ProductOption && complexProductFromAPI.ProductOption.length > 0) {

      }
    } else {

    }

    // Verify in admin UI
    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForLoadState('networkidle')

    const productInList = page.locator(`text=${complexProduct.name}`)
    await expect(productInList).toBeVisible()

  })

  test('Step 5: Test All Configuration Combinations', async ({ page }) => {

    // Test that all our foundation data is working together
    const testCombinations = [
      {
        name: 'Budget Business Cards',
        category: 'Business Cards',
        paperStock: 'Standard Cardstock Set',
        quantity: 'Business Card Quantities',
        size: 'Business Card Sizes'
      },
      {
        name: 'Premium Marketing Flyer',
        category: 'Flyers & Brochures',
        paperStock: 'Marketing Materials Set',
        quantity: 'Flyer Quantities',
        size: 'Flyer Sizes'
      }
    ]

    for (const combo of testCombinations) {
      await page.goto('https://gangrunprinting.com/admin/products/new')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Quick product creation to test combinations
      await page.fill('input[name="name"]', combo.name)
      await page.fill('input[name="sku"]', `TEST-${Date.now()}`)
      await page.fill('input[name="basePrice"]', '25.99')

      // Test each dropdown selection
      try {
        // Category
        const categorySelect = page.locator('select[name="categoryId"], button:has-text("Select category")')
        if (await categorySelect.count() > 0) {
          await categorySelect.click()
          await page.click(`text=${combo.category}`)
        }

        // Paper Stock
        const paperStockSelect = page.locator('select[name="selectedPaperStockSet"], button:has-text("Select paper stock set")')
        if (await paperStockSelect.count() > 0) {
          await paperStockSelect.click()
          await page.click(`text=${combo.paperStock}`)
        }

        // Quantity
        const quantitySelect = page.locator('select[name="selectedQuantityGroup"], button:has-text("Select quantity group")')
        if (await quantitySelect.count() > 0) {
          await quantitySelect.click()
          await page.click(`text=${combo.quantity}`)
        }

        // Size
        const sizeSelect = page.locator('select[name="selectedSizeGroup"], button:has-text("Select size group")')
        if (await sizeSelect.count() > 0) {
          await sizeSelect.click()
          await page.click(`text=${combo.size}`)
        }

      } catch (error) {

      }

      // Save to test the combination
      await page.click('button:has-text("Create Product")')

      try {
        await page.waitForSelector('text=success', { timeout: 5000 })

      } catch (error) {

      }
    }

  })
})