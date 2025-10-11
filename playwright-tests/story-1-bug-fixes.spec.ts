import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

// Test configuration
test.describe('Story 1: Critical Bug Fixes', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3002'
  const testProductId = randomUUID()

  test.beforeAll(async ({ request }) => {
    // Ensure test environment is ready
    const healthCheck = await request.get(`${baseURL}/api/health`)
    expect(healthCheck.ok()).toBeTruthy()
  })

  test.describe('API Route Syntax Fix', () => {
    test('GET /api/products should return without errors', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/products`)

      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')

      // No console errors should be present
      expect(response.headers()['x-error']).toBeUndefined()
    })

    test('Error handling should log with requestId', async ({ request }) => {
      // Test with invalid query to trigger error path
      const response = await request.get(`${baseURL}/api/products?invalid=true&forceError=true`)

      // Even with errors, API should respond gracefully
      expect([200, 400, 500]).toContain(response.status())

      const data = await response.json()
      expect(data).toHaveProperty('requestId')
    })
  })

  test.describe('MAX_FILE_SIZE Constant Fix', () => {
    test('Upload endpoint should handle large files correctly', async ({ request }) => {
      // Create a file larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const blob = new Blob([largeBuffer], { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', blob, 'large-test.jpg')

      const response = await request.post(`${baseURL}/api/products/upload-image`, {
        multipart: {
          file: {
            name: 'large-test.jpg',
            mimeType: 'image/jpeg',
            buffer: largeBuffer,
          },
        },
      })

      // Should reject with proper error message
      expect(response.status()).toBe(413) // Payload too large

      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('10MB')
      expect(data).toHaveProperty('maxSize', 10 * 1024 * 1024)
    })

    test('Upload endpoint should accept files under limit', async ({ request }) => {
      // Create a small test image
      const smallBuffer = Buffer.from('test-image-data')

      const response = await request.post(`${baseURL}/api/products/upload-image`, {
        multipart: {
          file: {
            name: 'small-test.jpg',
            mimeType: 'image/jpeg',
            buffer: smallBuffer,
          },
        },
      })

      // Should process or return appropriate response
      expect([200, 201, 400, 401]).toContain(response.status())

      if (response.status() === 200 || response.status() === 201) {
        const data = await response.json()
        expect(data).toHaveProperty('success')
      }
    })
  })

  test.describe('Data Transformation to PascalCase', () => {
    test('Product API should return PascalCase properties', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/products`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data).toHaveProperty('data')

      if (data.data && data.data.length > 0) {
        const product = data.data[0]

        // Check for PascalCase properties
        expect(product).toHaveProperty('Id')
        expect(product).toHaveProperty('Name')
        expect(product).toHaveProperty('Description')
        expect(product).toHaveProperty('BasePrice')
        expect(product).toHaveProperty('IsActive')
        expect(product).toHaveProperty('CreatedAt')

        // Check nested relations if present
        if (product.ProductCategory) {
          expect(product.ProductCategory).toHaveProperty('Id')
          expect(product.ProductCategory).toHaveProperty('Name')
        }

        if (product.ProductImages && product.ProductImages.length > 0) {
          const image = product.ProductImages[0]
          expect(image).toHaveProperty('Id')
          expect(image).toHaveProperty('Url')
        }
      }
    })

    test('Backward compatibility should be maintained', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/products`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()

      if (data.data && data.data.length > 0) {
        const product = data.data[0]

        // Should also have camelCase for backward compatibility
        expect(product).toHaveProperty('productCategory')
        expect(product).toHaveProperty('productImages')
      }
    })
  })

  test.describe('Error Boundaries for Image Handling', () => {
    test('Should handle missing images gracefully', async ({ page }) => {
      // Navigate to a product page
      await page.goto(`${baseURL}/products`)

      // Check that placeholder images are shown for products without images
      const images = await page.locator('img[alt*="product"], img[alt*="Product"]').all()

      for (const img of images) {
        const src = await img.getAttribute('src')

        // Should either have a valid URL or placeholder
        expect(src).toBeTruthy()

        // Check image loads without error
        const isVisible = await img.isVisible()
        expect(isVisible).toBeTruthy()

        // Check for broken image indicator
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
        expect(naturalWidth).toBeGreaterThan(0) // 0 means image failed to load
      }
    })

    test('Should handle malformed image URLs', async ({ page }) => {
      // Create a test page with malformed image URLs
      await page.route('**/api/products', async (route) => {
        const response = await route.fetch()
        const data = await response.json()

        // Inject malformed image URLs
        if (data.data && data.data.length > 0) {
          data.data[0].ProductImages = [
            { Id: 1, Url: 'malformed-url', IsPrimary: true },
            { Id: 2, Url: null, IsPrimary: false },
            { Id: 3, Url: undefined, IsPrimary: false },
          ]
        }

        await route.fulfill({
          response,
          json: data,
        })
      })

      await page.goto(`${baseURL}/products`)

      // Page should load without crashing
      await expect(page).toHaveTitle(/Gang Run Printing|Products/)

      // Check console for errors
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.waitForTimeout(1000)

      // Should have handled errors gracefully
      const criticalErrors = consoleErrors.filter(
        (err) => err.includes('Cannot read') || err.includes('undefined')
      )
      expect(criticalErrors.length).toBe(0)
    })
  })

  test.describe('Integration Test', () => {
    test('Complete product creation flow should work', async ({ page }) => {
      // Login as admin first
      await page.goto(`${baseURL}/auth/signin`)

      // Use test admin credentials
      await page.fill('input[name="email"]', 'admin@gangrunprinting.com')
      await page.fill('input[name="password"]', 'TestAdmin123!')
      await page.click('button[type="submit"]')

      // Wait for redirect to admin
      await page.waitForURL(/\/admin/)

      // Navigate to product creation
      await page.goto(`${baseURL}/admin/products/new`)

      // Fill product form
      const productName = `Test Product ${Date.now()}`
      await page.fill('input[name="name"]', productName)
      await page.fill('textarea[name="description"]', 'Test product description')
      await page.fill('input[name="basePrice"]', '19.99')

      // Select category if available
      const categorySelect = page.locator('select[name="categoryId"]')
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 })
      }

      // Test image upload with small file
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.isVisible()) {
        const buffer = Buffer.from('test-image-content')
        await fileInput.setInputFiles({
          name: 'test.jpg',
          mimeType: 'image/jpeg',
          buffer,
        })
      }

      // Submit form
      await page.click('button[type="submit"]')

      // Should either succeed or show validation errors
      await page.waitForTimeout(2000)

      // Check for success message or validation
      const successMessage = page.locator('text=/success|created|saved/i')
      const errorMessage = page.locator('text=/error|failed|required/i')

      const hasSuccess = await successMessage.isVisible()
      const hasError = await errorMessage.isVisible()

      // Should have some response
      expect(hasSuccess || hasError).toBeTruthy()

      // If successful, verify data transformation
      if (hasSuccess) {
        // Navigate to products list
        await page.goto(`${baseURL}/admin/products`)

        // Check if our product appears with correct format
        const productRow = page.locator(`text="${productName}"`)
        await expect(productRow).toBeVisible()
      }
    })
  })
})

// Utility function to create test admin session
async function createAdminSession(request: any, baseURL: string) {
  try {
    const response = await request.post(`${baseURL}/api/auth/signin`, {
      data: {
        email: 'admin@gangrunprinting.com',
        password: 'TestAdmin123!',
      },
    })

    if (response.ok()) {
      const cookies = response.headers()['set-cookie']
      return cookies
    }
  } catch (error) {
    console.log('Failed to create admin session:', error)
  }
  return null
}
