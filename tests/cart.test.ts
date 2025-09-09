import { test, expect } from '@playwright/test'

test.describe('Shopping Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open and close cart drawer', async ({ page }) => {
    // Click cart button
    await page.getByLabel(/Shopping cart/).click()
    
    // Check if cart drawer is visible
    await expect(page.getByRole('heading', { name: /Shopping Cart/ })).toBeVisible()
    
    // Close cart
    await page.getByRole('button', { name: 'Close' }).click()
    
    // Check if cart drawer is hidden
    await expect(page.getByRole('heading', { name: /Shopping Cart/ })).not.toBeVisible()
  })

  test('should add product to cart', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    
    // Click on first product
    await page.locator('.product-card').first().click()
    
    // Wait for product page to load
    await page.waitForLoadState('networkidle')
    
    // Upload a mock file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    // Select options
    await page.getByLabel('Size').click()
    await page.getByRole('option', { name: /Standard/ }).click()
    
    await page.getByLabel('Paper Type').click()
    await page.getByRole('option').first().click()
    
    await page.getByLabel('Quantity').click()
    await page.getByRole('option').first().click()
    
    // Add to cart
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Check if cart opens with item
    await expect(page.getByRole('heading', { name: /Shopping Cart/ })).toBeVisible()
    await expect(page.getByText('test-design.pdf')).toBeVisible()
  })

  test('should update quantity in cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products/1')
    
    // Upload file and add to cart
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Increase quantity
    await page.getByRole('button', { name: '+' }).click()
    
    // Check if quantity updated
    await expect(page.getByText('2')).toBeVisible()
  })

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products/1')
    
    // Upload file and add to cart
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Remove item
    await page.getByRole('button', { name: 'Delete' }).click()
    
    // Check if cart is empty
    await expect(page.getByText('Your cart is empty')).toBeVisible()
  })

  test('should proceed to checkout', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/1')
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Proceed to checkout
    await page.getByRole('button', { name: /Proceed to Checkout/ }).click()
    
    // Check if redirected to checkout page
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
  })

  test('should apply promo code', async ({ page }) => {
    // Navigate to cart page
    await page.goto('/cart')
    
    // Add item to cart first
    await page.goto('/products/1')
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Apply promo code
    await page.getByPlaceholder('Enter code').fill('SAVE10')
    await page.getByRole('button', { name: 'Apply' }).click()
    
    // Check if discount is applied
    await expect(page.getByText(/Discount.*10%/)).toBeVisible()
  })

  test('should persist cart items after page refresh', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/1')
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    })
    
    await page.getByRole('button', { name: /Add to Cart/ }).click()
    
    // Close cart
    await page.getByRole('button', { name: 'Close' }).click()
    
    // Refresh page
    await page.reload()
    
    // Open cart again
    await page.getByLabel(/Shopping cart/).click()
    
    // Check if item is still in cart
    await expect(page.getByText('test-design.pdf')).toBeVisible()
  })
})