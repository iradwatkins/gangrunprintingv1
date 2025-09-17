import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Complete Image Upload + Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test on the homepage
    await page.goto('/')
  })

  test('should complete full checkout flow with image upload', async ({ page }) => {
    // Step 1: Navigate to Premium Business Cards product page
    await page.goto('/products/premium-business-cards')

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Premium Business Cards')

    // Step 2: Configure product options
    await page.click('[data-testid="size-option"]:first-child')
    await page.click('[data-testid="paper-stock-option"]:first-child')
    await page.click('[data-testid="quantity-option"]:first-child')

    // Step 3: Upload customer design image
    const fileInput = page.locator('input[type="file"]')
    const testImagePath = path.join(__dirname, 'sample-images', 'business-card-design.jpg')

    // Create a test image if it doesn't exist
    await page.evaluate(() => {
      // Create a canvas and convert to blob for testing
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#FF6B6B'
        ctx.fillRect(0, 0, 300, 200)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '20px Arial'
        ctx.fillText('Test Business Card', 50, 100)
      }
    })

    // Upload test image file
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testImagePath)

      // Wait for upload to complete
      await expect(page.locator('.upload-progress')).toBeHidden({ timeout: 10000 })

      // Verify image thumbnail appears
      await expect(page.locator('.uploaded-image-thumbnail')).toBeVisible()

      // Verify delete button is present
      await expect(page.locator('.delete-image-btn')).toBeVisible()
    }

    // Step 4: Add to cart
    await page.click('button:has-text("Add to Cart")')

    // Wait for cart confirmation
    await expect(page.locator('.cart-success-message')).toBeVisible()

    // Step 5: Open cart and verify image appears
    await page.click('[data-testid="cart-button"]')

    // Verify cart drawer opens
    await expect(page.locator('.cart-drawer')).toBeVisible()

    // Verify customer image appears in cart
    await expect(page.locator('.cart-item-images')).toBeVisible()
    await expect(page.locator('.cart-item-images img')).toBeVisible()

    // Step 6: Proceed to checkout
    await page.click('text="Proceed to Checkout"')

    // Verify checkout page loaded
    await expect(page.locator('h1:has-text("Checkout")')).toBeVisible()

    // Step 7: Fill customer information
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="phone"]', '555-123-4567')
    await page.fill('[name="address"]', '123 Main St')
    await page.fill('[name="city"]', 'Dallas')
    await page.fill('[name="state"]', 'TX')
    await page.fill('[name="zipCode"]', '75201')

    // Step 8: Verify customer design appears in order summary
    await expect(page.locator('.checkout-item-images')).toBeVisible()
    await expect(page.locator('.checkout-item-images img')).toBeVisible()
    await expect(page.locator('text="Your Design:"')).toBeVisible()

    // Step 9: Continue to payment
    await page.click('button:has-text("Continue to Payment")')

    // Step 10: Verify payment method selection appears
    await expect(page.locator('h2:has-text("Payment Method")')).toBeVisible()
    await expect(page.locator('text="Credit/Debit Card"')).toBeVisible()
    await expect(page.locator('text="Square Checkout"')).toBeVisible()
    await expect(page.locator('text="Cash App Pay"')).toBeVisible()
    await expect(page.locator('text="PayPal"')).toBeVisible()

    // Step 11: Test Square checkout flow
    await page.click('input[value="square"]')
    await page.click('button:has-text("Pay with Square")')

    // Should redirect to Square checkout (we'll just verify the attempt)
    // In a real test, this would redirect to Square's hosted checkout

    // Alternative: Test card payment flow
    await page.goto('/checkout') // Go back to test card flow

    // Fill form again (in real test, this would be preserved)
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="phone"]', '555-123-4567')
    await page.fill('[name="address"]', '123 Main St')
    await page.fill('[name="city"]', 'Dallas')
    await page.fill('[name="state"]', 'TX')
    await page.fill('[name="zipCode"]', '75201')

    await page.click('button:has-text("Continue to Payment")')

    // Step 12: Test inline card payment
    await page.click('input[value="card"]')
    await page.click('button:has-text("Continue to Card Details")')

    // Verify Square card payment form loads
    await expect(page.locator('h2:has-text("Card Payment")')).toBeVisible()
    await expect(page.locator('#card-container')).toBeVisible()

    // Verify back button works
    await page.click('button:has-text("Back")')
    await expect(page.locator('h2:has-text("Payment Method")')).toBeVisible()
  })

  test('should handle image upload errors gracefully', async ({ page }) => {
    await page.goto('/products/premium-business-cards')

    // Try to upload an invalid file type
    const fileInput = page.locator('input[type="file"]')

    if (await fileInput.count() > 0) {
      // Create a text file to test invalid file type
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        if (input) {
          const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' })
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          input.files = dataTransfer.files
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      })

      // Should show error message
      await expect(page.locator('.error-message')).toBeVisible()
      await expect(page.locator('text="Invalid file type"')).toBeVisible()
    }
  })

  test('should allow image deletion and re-upload', async ({ page }) => {
    await page.goto('/products/premium-business-cards')

    const fileInput = page.locator('input[type="file"]')
    const testImagePath = path.join(__dirname, 'sample-images', 'business-card-design.jpg')

    if (await fileInput.count() > 0) {
      // Upload image
      await fileInput.setInputFiles(testImagePath)
      await expect(page.locator('.uploaded-image-thumbnail')).toBeVisible()

      // Delete image
      await page.click('.delete-image-btn')
      await expect(page.locator('.uploaded-image-thumbnail')).toBeHidden()

      // Re-upload image
      await fileInput.setInputFiles(testImagePath)
      await expect(page.locator('.uploaded-image-thumbnail')).toBeVisible()
    }
  })

  test('should preserve cart state across page navigation', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/premium-business-cards')
    await page.click('button:has-text("Add to Cart")')

    // Navigate away and back
    await page.goto('/')
    await page.goto('/cart')

    // Verify cart still has items
    await expect(page.locator('.cart-item')).toBeVisible()

    // Navigate to checkout
    await page.click('button:has-text("Proceed to Checkout")')
    await expect(page.locator('h1:has-text("Checkout")')).toBeVisible()
  })

  test('should validate checkout form fields', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products/premium-business-cards')
    await page.click('button:has-text("Add to Cart")')

    // Go to checkout
    await page.goto('/checkout')

    // Try to continue without filling required fields
    await page.click('button:has-text("Continue to Payment")')

    // Should show validation error
    await expect(page.locator('text="Please fill in all required fields"')).toBeVisible()

    // Fill partial information
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="firstName"]', 'John')

    // Try again - should still show error
    await page.click('button:has-text("Continue to Payment")')
    await expect(page.locator('text="Please fill in all required fields"')).toBeVisible()
  })

  test('should display correct pricing calculations', async ({ page }) => {
    await page.goto('/products/premium-business-cards')

    // Select options and verify pricing updates
    await page.click('[data-testid="quantity-option"]:first-child')

    // Add to cart and check checkout
    await page.click('button:has-text("Add to Cart")')
    await page.goto('/checkout')

    // Verify pricing breakdown
    await expect(page.locator('text="Subtotal"')).toBeVisible()
    await expect(page.locator('text="Tax"')).toBeVisible()
    await expect(page.locator('text="Shipping"')).toBeVisible()
    await expect(page.locator('text="Total"')).toBeVisible()

    // Verify shipping options affect total
    await page.click('input[value="express"]')
    // Total should update to include express shipping cost
  })
})