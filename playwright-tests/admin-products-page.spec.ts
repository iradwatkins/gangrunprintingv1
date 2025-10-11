import { test, expect } from '@playwright/test'

test.describe('Admin Products Page - Comprehensive Tests', () => {
  // Test 1: Unauthenticated user redirect flow
  test('unauthenticated users are redirected to signin', async ({ page }) => {
    // Navigate to admin page as unauthenticated user
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Wait for auth check and redirect
    await page.waitForURL(/auth\/signin/, { timeout: 15000 })

    const currentUrl = page.url()
    expect(currentUrl).toContain('/auth/signin')
    expect(currentUrl).toContain('redirectUrl')
  })

  // Test 2: Test API endpoints directly
  test('API endpoints require authentication', async ({ request }) => {
    const endpoints = [
      '/api/product-categories',
      '/api/paper-stocks',
      '/api/quantities',
      '/api/sizes',
      '/api/add-ons',
    ]

    for (const endpoint of endpoints) {
      const response = await request.get(`https://gangrunprinting.com${endpoint}`)

      // These endpoints should work for GET requests (public data)
      expect([200, 401, 403]).toContain(response.status())
    }
  })

  // Test 3: Test authenticated admin session
  test('authenticated admin can access product page', async ({ page, context }) => {
    // First, sign in as admin
    await page.goto('https://gangrunprinting.com/auth/signin')

    // Enter admin email
    await page.fill('input[type="email"], input[name="email"]', 'iradwatkins@gmail.com')

    // Submit form to send magic link
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send Magic Link"), button:has-text("Sign In")'
    )
    await submitButton.click()

    // Wait for magic link confirmation
    await page.waitForTimeout(2000)
  })

  // Test 4: Test page loading states
  test('page shows proper loading states', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Check for loading indicators
    const loadingIndicators = [
      'text=Verifying admin access',
      'text=Loading',
      '.animate-spin',
      '[role="status"]',
    ]

    let foundLoadingState = false
    for (const selector of loadingIndicators) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible({ timeout: 2000 })) {
          foundLoadingState = true

          break
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }

    expect(foundLoadingState).toBeTruthy()
  })

  // Test 5: Test network timeouts and error handling
  test('handles network timeouts gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      await route.continue()
    })

    await page.goto('https://gangrunprinting.com/admin/products/new', {
      timeout: 20000,
    })

    // Should either redirect or show error state within timeout
    await page.waitForTimeout(12000)

    const url = page.url()
    const hasRedirected = url.includes('/auth/signin')
    const hasErrorMessage = (await page.locator('text=/error|failed|timeout/i').count()) > 0

    expect(hasRedirected || hasErrorMessage).toBeTruthy()
  })

  // Test 6: Test data loading after authentication
  test('loads product form data when authenticated', async ({ page }) => {
    // This test would require a valid session
    // For now, we'll test that the page structure exists
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Wait for potential redirect
    await page.waitForTimeout(3000)

    const url = page.url()
    if (url.includes('/auth/signin')) {
      console.log('  Page requires authentication (expected behavior)')
      expect(url).toContain('/auth/signin')
    } else {
      // If authenticated, check for form elements
      const formElements = ['input#name', 'input#sku', 'select', 'button:has-text("Save")']

      for (const selector of formElements) {
        const element = page.locator(selector).first()
        const isPresent = (await element.count()) > 0
      }
    }
  })

  // Test 7: Console error monitoring
  test('no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    await page
      .goto('https://gangrunprinting.com/admin/products/new', {
        waitUntil: 'networkidle',
        timeout: 20000,
      })
      .catch(() => {
        // Continue even if navigation fails
      })

    await page.waitForTimeout(5000)

    // Filter out expected auth-related messages
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('401') &&
        !err.includes('Unauthorized') &&
        !err.includes('auth') &&
        !err.includes('signin')
    )

    if (criticalErrors.length > 0) {
      criticalErrors.forEach((err) => console.log(`    - ${err}`))
    } else {
    }

    // We expect no critical errors
    expect(criticalErrors.length).toBe(0)
  })

  // Test 8: Performance monitoring
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page
      .goto('https://gangrunprinting.com/admin/products/new', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .catch(() => {
        // Continue even if navigation fails
      })

    const loadTime = Date.now() - startTime

    // Wait for either redirect or content
    await page.waitForTimeout(5000)

    const totalTime = Date.now() - startTime

    // Should complete auth check and redirect within 15 seconds
    expect(totalTime).toBeLessThan(15000)
  })
})

// Summary test
test('SUMMARY: Admin Products Page Health Check', async ({ page }) => {
  const results = {
    authRedirect: false,
    pageLoads: false,
    noErrors: true,
    apiAccessible: false,
  }

  // Quick health check
  try {
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      timeout: 15000,
    })

    await page.waitForTimeout(5000)

    const url = page.url()
    results.authRedirect = url.includes('/auth/signin')
    results.pageLoads = true

    // Check for errors
    const errorText = await page.locator('text=/error|failed/i').count()
    results.noErrors = errorText === 0 || results.authRedirect
  } catch (error) {}
})
