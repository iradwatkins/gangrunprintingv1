import { test, expect } from '@playwright/test'
import path from 'path'

// Test file paths for different scenarios
const TEST_IMAGES = {
  validSmall: path.join(__dirname, '../fixtures/test-image-small.jpg'),
  validMedium: path.join(__dirname, '../fixtures/test-image-medium.jpg'),
  validLarge: path.join(__dirname, '../fixtures/test-image-large.jpg'),
  invalidType: path.join(__dirname, '../fixtures/test-document.pdf'),
  tooLarge: path.join(__dirname, '../fixtures/test-image-oversized.jpg'),
}

test.describe('Product Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the new product page
    await page.goto('/admin/products/new')

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')

    // Check if we need to authenticate (this might redirect to login)
    if (page.url().includes('/auth/signin')) {
      // Handle authentication if needed
      // For now, we'll assume the user is already authenticated
      await page.goto('/admin/products/new')
      await page.waitForLoadState('networkidle')
    }
  })

  test.describe('Image Upload Tests', () => {
    test('should successfully upload a valid image', async ({ page }) => {
      // Fill out basic product information
      await page.fill('[id="name"]', 'Test Product')
      await page.selectOption('[data-testid="category-select"]', { index: 1 }) // Select first category

      // Upload an image
      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Wait for upload to complete
      await page.waitForSelector('text=Image uploaded successfully', { timeout: 30000 })

      // Verify image preview appears
      await expect(page.locator('img[alt="Product preview"]')).toBeVisible()

      // Verify success message
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible()
    })

    test('should show error for invalid file type', async ({ page }) => {
      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.invalidType)

      // Should show error message
      await expect(page.locator('text=Please select a valid image file')).toBeVisible()
    })

    test('should show error for file too large', async ({ page }) => {
      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.tooLarge)

      // Should show error message about file size
      await expect(page.locator('text=must be less than 10MB')).toBeVisible()
    })

    test('should handle upload retry on failure', async ({ page }) => {
      // Intercept upload requests to simulate failure
      let requestCount = 0
      await page.route('/api/products/upload-image', (route) => {
        requestCount++
        if (requestCount <= 2) {
          // Fail the first two attempts
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Temporary server error' }),
          })
        } else {
          // Succeed on the third attempt
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                url: 'https://example.com/test-image.jpg',
                id: 'test-image-id',
              },
            }),
          })
        }
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Should see retry messages
      await expect(page.locator('text=Retrying')).toBeVisible()

      // Should eventually succeed
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 15000 })
    })

    test('should show timeout error for slow uploads', async ({ page }) => {
      // Intercept upload requests to simulate timeout
      await page.route('/api/products/upload-image', (route) => {
        // Don't respond to simulate timeout
        setTimeout(() => {
          route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Upload timeout' }),
          })
        }, 35000) // Longer than the 30s timeout
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validMedium)

      // Should show timeout error
      await expect(page.locator('text=Upload timeout')).toBeVisible({ timeout: 40000 })
    })
  })

  test.describe('Product Creation Tests', () => {
    test('should create product successfully with all fields', async ({ page }) => {
      // Fill out the form
      await page.fill('[id="name"]', 'Test Business Cards')
      await page.selectOption('[data-testid="category-select"]', { index: 1 })
      await page.fill('[id="description"]', 'High quality business cards for professionals')

      // Upload an image
      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)
      await page.waitForSelector('text=Image uploaded successfully', { timeout: 30000 })

      // Select required options
      await page.selectOption('[data-testid="paper-stock-select"]', { index: 1 })
      await page.selectOption('[data-testid="quantity-group-select"]', { index: 1 })
      await page.selectOption('[data-testid="size-group-select"]', { index: 1 })

      // Submit the form
      await page.click('button:has-text("Create Product")')

      // Should redirect to products page on success
      await page.waitForURL('/admin/products', { timeout: 30000 })

      // Should show success message
      await expect(page.locator('text=Product created successfully')).toBeVisible()
    })

    test('should show validation errors for missing required fields', async ({ page }) => {
      // Try to submit without filling required fields
      await page.click('button:has-text("Create Product")')

      // Should show validation error
      await expect(page.locator('text=Product name is required')).toBeVisible()
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Fill out the form
      await page.fill('[id="name"]', 'Test Product')
      await page.selectOption('[data-testid="category-select"]', { index: 1 })

      // Intercept product creation to simulate error
      await page.route('/api/products', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation failed',
            details: {
              validationErrors: [{ field: 'sku', message: 'SKU already exists' }],
            },
          }),
        })
      })

      // Submit the form
      await page.click('button:has-text("Create Product")')

      // Should show specific error message
      await expect(page.locator('text=Validation failed: sku: SKU already exists')).toBeVisible()
    })
  })

  test.describe('Network Error Handling', () => {
    test('should handle connection errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('/api/products/upload-image', (route) => {
        route.abort('failed')
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Should show network error
      await expect(page.locator('text=Network error')).toBeVisible()
    })

    test('should handle slow network connections', async ({ page }) => {
      // Simulate slow network
      await page.route('/api/products/upload-image', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000)) // 10 second delay
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              url: 'https://example.com/test-image.jpg',
              id: 'test-image-id',
            },
          }),
        })
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Should show loading state
      await expect(page.locator('text=Processing image...')).toBeVisible()

      // Should eventually succeed
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 20000 })
    })
  })

  test.describe('Error Recovery Tests', () => {
    test('should recover from connection drops', async ({ page }) => {
      // Simulate connection drops that recover
      let requestCount = 0
      await page.route('/api/products/upload-image', (route) => {
        requestCount++
        if (requestCount === 1) {
          // First request: connection drop
          route.abort('failed')
        } else {
          // Subsequent requests: success
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                url: 'https://example.com/test-image.jpg',
                id: 'test-image-id',
              },
            }),
          })
        }
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Should retry and eventually succeed
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 15000 })
    })

    test('should provide clear error messages for server errors', async ({ page }) => {
      // Simulate various server errors
      await page.route('/api/products/upload-image', (route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Storage service temporarily unavailable. Please try again.',
          }),
        })
      })

      const fileInput = page.locator('input[type="file"][accept="image/*"]')
      await fileInput.setInputFiles(TEST_IMAGES.validSmall)

      // Should show specific error message
      await expect(page.locator('text=Storage service temporarily unavailable')).toBeVisible()
    })
  })
})

// Helper function to create test fixtures
test.describe('Test Fixtures Setup', () => {
  test.skip('Create test image fixtures', async () => {
    // This test would create the necessary test image files
    // In a real implementation, you'd have these files prepared
    console.log('Test fixtures should be created in tests/fixtures/')
  })
})
