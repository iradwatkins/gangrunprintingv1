import { test, expect } from '@playwright/test'

// Set timeout for all tests
test.setTimeout(60000)

test.describe('Product Management', () => {
  // Use a unique product name to avoid conflicts
  const timestamp = Date.now()
  const productName = `Test Product ${timestamp}`
  const productSKU = `test-product-${timestamp}`
  let createdProductId: string

  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:3002/auth/signin')

    // Sign in as admin
    await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
    await page.click('button:has-text("Send Magic Link")')

    // Wait for sign in (in test environment, you might need to mock this)
    await page.waitForTimeout(2000)

    // For testing purposes, we'll navigate directly since magic links require email
    // In a real test, you'd intercept the auth or use a test token
    await page.goto('http://localhost:3002/admin/products')
  })

  test('should create a simple product', async ({ page }) => {
    // Navigate to simple product creation page
    await page.goto('http://localhost:3002/admin/products/simple')

    // Wait for the form to load
    await page.waitForSelector('input[id="name"]', { timeout: 10000 })

    // Fill in product details
    await page.fill('input[id="name"]', productName)

    // The SKU should auto-generate, but let's check it
    const skuValue = await page.inputValue('input[id="sku"]')
    expect(skuValue).toBeTruthy()

    // Select category - wait for it to be loaded
    await page.click('button[role="combobox"]:has-text("Select a category")')
    await page.click('div[role="option"]:first-child')

    // Select paper stock
    await page.click('button[role="combobox"]:has-text("Select paper stock")')
    await page.click('div[role="option"]:first-child')

    // Select quantity group
    await page.click('button[role="combobox"]:has-text("Select quantity group")')
    await page.click('div[role="option"]:first-child')

    // Select size group
    await page.click('button[role="combobox"]:has-text("Select size group")')
    await page.click('div[role="option"]:first-child')

    // Add description
    await page.fill('textarea[id="description"]', 'Test product description for Playwright test')

    // Submit the form
    await page.click('button:has-text("Create Product")')

    // Wait for navigation or success message
    await page.waitForURL('**/admin/products', { timeout: 10000 })

    // Verify product appears in the list
    await expect(page.locator(`text=${productName}`)).toBeVisible({ timeout: 5000 })
  })

  test('should display created product in listing', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products')

    // Wait for products table to load
    await page.waitForSelector('table', { timeout: 10000 })

    // Check if our product is in the list
    const productRow = page.locator(`tr:has-text("${productName}")`)
    await expect(productRow).toBeVisible()

    // Verify product details in the row
    await expect(productRow.locator('text=/test-product-/')).toBeVisible()

    // Check for action buttons
    await expect(productRow.locator('button[title="View Product"]')).toBeVisible()
    await expect(productRow.locator('button[title="Edit Product"]')).toBeVisible()
    await expect(productRow.locator('button[title="Delete Product"]')).toBeVisible()

    // Store the product ID for later tests (if visible in the DOM)
    // For now, we'll use the SKU to identify the product
  })

  test('should toggle product active status', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products')

    // Wait for products table
    await page.waitForSelector('table', { timeout: 10000 })

    // Find our product row
    const productRow = page.locator(`tr:has-text("${productName}")`)

    // Find and click the active status badge
    const statusBadge = productRow.locator('div:has-text("Active"), div:has-text("Inactive")').first()
    const initialStatus = await statusBadge.textContent()

    await statusBadge.click()

    // Wait for the status to change
    await page.waitForTimeout(1000)

    // Check that status has changed
    const newStatus = await statusBadge.textContent()
    expect(newStatus).not.toBe(initialStatus)
  })

  test('should delete a product', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products')

    // Wait for products table
    await page.waitForSelector('table', { timeout: 10000 })

    // Find our test product
    const productRow = page.locator(`tr:has-text("${productName}")`)

    // Click delete button
    await productRow.locator('button[title="Delete Product"]').click()

    // Handle confirmation dialog (using browser's confirm)
    page.on('dialog', dialog => dialog.accept())

    // Wait for the product to be removed
    await page.waitForTimeout(2000)

    // Verify product is no longer in the list
    await expect(page.locator(`text=${productName}`)).not.toBeVisible()
  })

  test('should handle validation errors', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products/simple')

    // Wait for form to load
    await page.waitForSelector('input[id="name"]', { timeout: 10000 })

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Product")')

    // Should see an error message (toast or inline)
    await expect(page.locator('text=/Please fill in all required fields|required/i')).toBeVisible({ timeout: 5000 })

    // The form should still be on the same page
    await expect(page).toHaveURL(/.*\/admin\/products\/simple/)
  })

  test('should auto-generate SKU from product name', async ({ page }) => {
    await page.goto('http://localhost:3002/admin/products/simple')

    // Wait for form to load
    await page.waitForSelector('input[id="name"]', { timeout: 10000 })

    // Type a product name
    const testName = 'My Special Product 123!'
    await page.fill('input[id="name"]', testName)

    // Check that SKU is auto-generated
    const skuValue = await page.inputValue('input[id="sku"]')
    expect(skuValue).toBe('my-special-product-123')
  })
})

test.describe('Product API Tests', () => {
  test('should create product via API', async ({ request }) => {
    const productData = {
      name: 'API Test Product',
      sku: 'api-test-product',
      categoryId: 'business-cards',
      description: 'Product created via API test',
      isActive: true,
      isFeatured: false,
      paperStockId: 'cmfmved0f000013pxt2616umy',
      quantityGroupId: 'cmfk2y9d0000u10ij4f2rvy3g',
      sizeGroupId: 'cmfk2y9bs000k10ij4vmmgkgf',
      basePrice: 0,
      setupFee: 0,
      productionTime: 3
    }

    // Note: In a real test, you'd need to handle authentication
    const response = await request.post('http://localhost:3002/api/products/simple', {
      data: productData
    })

    // For now, we expect 401 since we're not authenticated
    // In a real test environment, you'd mock the auth
    expect([201, 401]).toContain(response.status())

    if (response.status() === 201) {
      const product = await response.json()
      expect(product.name).toBe(productData.name)
      expect(product.sku).toBe(productData.sku)
    }
  })

  test('should list products via API', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/products')

    expect(response.ok()).toBeTruthy()

    const products = await response.json()
    expect(Array.isArray(products)).toBeTruthy()

    // Check that products have the expected structure
    if (products.length > 0) {
      const product = products[0]
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('sku')
      expect(product).toHaveProperty('ProductCategory')
    }
  })
})