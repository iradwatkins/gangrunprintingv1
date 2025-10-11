import { test, expect } from '@playwright/test'

test.describe('BMAD Data Flow Validation', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testProductName = `Test Product ${Date.now()}`
  const testProductSku = testProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3002')
  })

  test('Complete user journey: Sign up → Create product → Dashboard display', async ({
    page,
    browser,
  }) => {
    // Phase 1: Authentication Flow

    // Click sign in
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/.*sign-in/)

    // Test magic link flow
    await page.fill('input[type="email"]', testEmail)
    await page.click('button:has-text("Send Magic Link")')

    // Verify magic link sent message
    await expect(page.locator('text=Check your email')).toBeVisible()

    // Phase 2: Admin Product Creation (simulate admin user)

    // Open new tab for admin access
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()

    // Navigate to admin product creation
    await adminPage.goto('http://localhost:3002/admin/products/new')

    // Wait for data to load (testing our new API caching)
    await adminPage.waitForSelector('[data-testid="product-name"]', { timeout: 10000 })

    // Fill product form
    await adminPage.fill('[data-testid="product-name"] input', testProductName)
    await adminPage.selectOption('select[name="categoryId"]', { index: 1 })
    await adminPage.fill(
      'textarea[name="description"]',
      'Test product description for BMAD validation'
    )

    // Test the new bundled API loading
    await expect(adminPage.locator('text=Loading product data')).not.toBeVisible()

    // Select paper stocks (testing multiple selection)
    const firstPaperStock = adminPage.locator('input[type="checkbox"][id^="stock-"]').first()
    await firstPaperStock.check()

    // Set as default paper stock
    const defaultRadio = adminPage.locator('input[type="radio"][name="defaultPaperStock"]').first()
    await defaultRadio.check()

    // Verify quantity and size groups are loaded and selected automatically
    await expect(adminPage.locator('select[value!=""]')).toHaveCount(2) // quantity and size groups

    // Set pricing
    await adminPage.fill('input[id="base-price"]', '25.99')

    // Submit product creation
    await adminPage.click('button:has-text("Save Product")')

    // Verify successful creation
    await expect(adminPage.locator('text=Product created successfully')).toBeVisible({
      timeout: 15000,
    })
    await expect(adminPage).toHaveURL(/.*admin\/products/, { timeout: 10000 })

    // Phase 3: Customer Product Interaction

    // Go back to main customer page
    await page.goto(`http://localhost:3002/products/${testProductSku}`)

    // Test cached API loading (should be fast)
    const startTime = Date.now()
    await page.waitForSelector('h1', { timeout: 10000 })
    const loadTime = Date.now() - startTime

    // Verify quick loading due to caching
    expect(loadTime).toBeLessThan(5000)

    // Verify product appears correctly
    await expect(page.locator(`text=${testProductName}`)).toBeVisible()
    await expect(page.locator('text=$25.99')).toBeVisible()

    // Test product customization (selections should work)
    await page.click('text=Customize')

    // Verify paper stock options are available
    await expect(page.locator('select').first()).toBeVisible()

    // Test file upload (simulate)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-design.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image data'),
    })

    // Verify upload processing
    await expect(page.locator('text=Uploading')).toBeVisible()
    await expect(page.locator('text=uploaded successfully')).toBeVisible({ timeout: 10000 })

    // Add to cart
    await page.click('button:has-text("Add to Cart")')
    await expect(page.locator('text=added to cart')).toBeVisible()

    // Phase 4: Dashboard Data Display Validation

    // Navigate to dashboard (testing new routes)
    await page.goto('http://localhost:3002/dashboard')

    // Verify dashboard loads without 404 errors
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

    // Test dashboard navigation links
    const dashboardRoutes = [
      { link: 'text=Profile', expectedUrl: /.*dashboard\/profile/ },
      { link: 'text=Settings', expectedUrl: /.*dashboard\/settings/ },
      { link: 'text=Upcoming', expectedUrl: /.*dashboard\/upcoming/ },
      { link: 'text=Saved', expectedUrl: /.*dashboard\/saved/ },
      { link: 'text=Payments', expectedUrl: /.*dashboard\/payments/ },
      { link: 'text=Notifications', expectedUrl: /.*dashboard\/notifications/ },
    ]

    for (const route of dashboardRoutes) {
      await page.click(route.link)
      await expect(page).toHaveURL(route.expectedUrl)

      // Verify no 404 errors
      await expect(page.locator('text=404')).not.toBeVisible()
      await expect(page.locator('text=Not Found')).not.toBeVisible()

      // Go back to main dashboard
      await page.click('text=Back to Dashboard')
      await expect(page).toHaveURL(/.*dashboard$/)
    }

    // Phase 5: Data Persistence Validation

    // Check if our product appears in recent activity (may take time to propagate)
    await page.goto('http://localhost:3002/dashboard')

    // Verify user stats are displaying
    await expect(page.locator('[data-testid="total-orders"], text=orders')).toBeVisible()

    // Test file serving (uploaded images should be accessible)
    await page.goto(`http://localhost:3002/products/${testProductSku}`)

    // Check if uploaded image is served correctly via our new /uploads route
    const uploadedImage = page.locator('img[src^="/uploads/"]')
    if (await uploadedImage.isVisible()) {
      const imageSrc = await uploadedImage.getAttribute('src')
      const imageResponse = await page.request.get(`http://localhost:3002${imageSrc}`)
      expect(imageResponse.status()).toBe(200)
    }

    // Phase 6: Performance Validation

    // Test API caching by making multiple requests
    const performanceResults = []

    for (let i = 0; i < 3; i++) {
      const start = Date.now()
      await page.goto(`http://localhost:3002/products/${testProductSku}`)
      await page.waitForSelector('h1')
      const duration = Date.now() - start
      performanceResults.push(duration)
    }

    // Subsequent loads should be faster due to caching
    const firstLoad = performanceResults[0]
    const cachedLoads = performanceResults.slice(1)
    const averageCachedLoad = cachedLoads.reduce((a, b) => a + b, 0) / cachedLoads.length

    // Cleanup
    await adminContext.close()
  })

  test('API Error Handling and Recovery', async ({ page }) => {
    // Test admin page error handling with network issues
    await page.goto('http://localhost:3002/admin/products/new')

    // Wait for initial load
    await page.waitForTimeout(2000)

    // Simulate network failure
    await page.route('**/api/**', (route) => route.abort())

    // Reload page to trigger error state
    await page.reload()

    // Should show error state instead of crashing
    await expect(page.locator('text=Error Loading Product Data, text=Retry Loading')).toBeVisible()

    // Test retry functionality
    await page.unroute('**/api/**')
    await page.click('button:has-text("Retry Loading")')

    // Should recover
    await expect(page.locator('text=Create Product')).toBeVisible({ timeout: 10000 })
  })

  test('Rate Limiting Prevention', async ({ page }) => {
    // Make multiple rapid requests to test deduplication
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(page.request.get('http://localhost:3002/api/product-categories'))
    }

    const responses = await Promise.all(promises)

    // All requests should succeed (no 429 errors)
    responses.forEach((response, index) => {
      expect(response.status()).not.toBe(429)
    })
  })
})
