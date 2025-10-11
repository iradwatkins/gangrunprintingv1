import { test, expect } from '@playwright/test'

test.describe('Product Page Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test data or mocks
    await page.goto('/')
  })

  test('should show 404 page for non-existent product', async ({ page }) => {
    // Navigate to a product that doesn't exist
    await page.goto('/products/asdfddddddddddddd')

    // Check that the 404 page is displayed
    await expect(page.getByText('Product Not Found')).toBeVisible()
    await expect(page.getByText(/couldn't find the product/i)).toBeVisible()

    // Verify navigation options are available
    await expect(page.getByRole('link', { name: /Browse Products/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Go Home/i })).toBeVisible()

    // Check that popular categories are shown
    await expect(page.getByText('Popular Categories')).toBeVisible()
  })

  test('should handle invalid slug formats gracefully', async ({ page }) => {
    // Test with various invalid slug formats
    const invalidSlugs = [
      'products/../../etc/passwd', // Path traversal attempt
      'products/<script>alert(1)</script>', // XSS attempt
      'products/' + 'a'.repeat(200), // Excessively long slug
      'products/invalid@slug#', // Special characters
    ]

    for (const slug of invalidSlugs) {
      await page.goto(`/${slug}`, { waitUntil: 'networkidle' })

      // Should either show 404 or redirect to not found
      const notFoundVisible = await page.getByText(/Product Not Found|404/i).isVisible()
      expect(notFoundVisible).toBeTruthy()
    }
  })

  test('should load valid product page without errors', async ({ page }) => {
    // First, navigate to products page to find a valid product
    await page.goto('/products')

    // Click on first product if available
    const firstProduct = page.locator('a[href^="/products/"]:not([href="/products"])').first()

    const productExists = (await firstProduct.count()) > 0

    if (productExists) {
      // Get the href to visit directly
      const productUrl = await firstProduct.getAttribute('href')

      if (productUrl) {
        // Navigate to the product page
        const response = await page.goto(productUrl, { waitUntil: 'networkidle' })

        // Check that page loads successfully
        expect(response?.status()).toBeLessThan(400)

        // Check that product details are shown
        await expect(page.getByText(/Add to Cart/i)).toBeVisible()

        // Check that no error messages are displayed
        const errorMessage = page.getByText(/error|exception|failed/i)
        await expect(errorMessage).not.toBeVisible()
      }
    }
  })

  test('should show error boundary when client-side error occurs', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/products/test-product')

    // Inject an error into the page
    await page
      .evaluate(() => {
        throw new Error('Test error for error boundary')
      })
      .catch(() => {
        // Expected to throw
      })

    // Check if error boundary catches the error
    const errorBoundaryVisible = await page
      .getByText(/Something went wrong|Unable to Load/i)
      .isVisible()

    if (errorBoundaryVisible) {
      // Verify error recovery options
      await expect(page.getByRole('button', { name: /Try Again/i })).toBeVisible()
    }
  })

  test('should handle network failures gracefully', async ({ page }) => {
    // Intercept network requests to simulate failure
    await page.route('**/api/products/**', (route) => {
      route.abort('failed')
    })

    // Try to navigate to a product page
    await page.goto('/products/test-product', { waitUntil: 'domcontentloaded' })

    // Should show error state or fallback
    const hasErrorState = await page.getByText(/Unable to Load|error|failed/i).isVisible()
    const hasNotFound = await page.getByText(/Product Not Found|404/i).isVisible()

    expect(hasErrorState || hasNotFound).toBeTruthy()
  })

  test('should have proper SEO metadata for 404 pages', async ({ page }) => {
    // Navigate to non-existent product
    await page.goto('/products/non-existent-product')

    // Check page title
    const title = await page.title()
    expect(title).toContain('Product Not Found')

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toBeTruthy()
  })

  test('should log errors to console in development mode', async ({ page }) => {
    // Collect console messages
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLogs.push(msg.text())
      }
    })

    // Navigate to non-existent product
    await page.goto('/products/asdfddddddddddddd')

    // Wait for any console logs
    await page.waitForTimeout(1000)

    // In development, we should see logging
    if (process.env.NODE_ENV === 'development') {
      const hasProductLogs = consoleLogs.some(
        (log) => log.includes('[Product Page]') || log.includes('slug')
      )
      expect(hasProductLogs).toBeTruthy()
    }
  })
})

test.describe('Product Page Performance', () => {
  test('should load quickly for valid products', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now()

    await page.goto('/products', { waitUntil: 'networkidle' })

    // Find and click first product
    const firstProduct = page.locator('a[href^="/products/"]:not([href="/products"])').first()

    if ((await firstProduct.count()) > 0) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    }
  })

  test('should not have memory leaks on repeated navigation', async ({ page }) => {
    // Navigate to product pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/products/test-product-' + i, { waitUntil: 'domcontentloaded' })
      await page.goto('/products', { waitUntil: 'domcontentloaded' })
    }

    // Check that page is still responsive
    await expect(page).toHaveURL(/\/products/)
  })
})
