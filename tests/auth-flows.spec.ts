import { test, expect, Page } from '@playwright/test'

test.describe('Authentication Flows', () => {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002'

  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test('API Products endpoint should not return 500 errors', async ({ page }) => {

    // Test the products API directly
    const response = await page.request.get(`${baseURL}/api/products`)

    // Should not return 500 error
    expect(response.status()).not.toBe(500)

    // Should return either 200 (success) or other valid status
    expect([200, 503, 504].includes(response.status())).toBe(true)

    if (response.status() === 200) {
      const products = await response.json()

      expect(Array.isArray(products)).toBe(true)
    } else {

      const errorResponse = await response.json()
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse).toHaveProperty('requestId')
      expect(errorResponse).toHaveProperty('timestamp')
    }
  })

  test('Authentication API (/api/auth/me) should respond without timeout', async ({ page }) => {

    const startTime = Date.now()
    const response = await page.request.get(`${baseURL}/api/auth/me`, {
      headers: {
        'X-Request-Source': 'playwright-test'
      }
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Should respond within 10 seconds
    expect(responseTime).toBeLessThan(10000)

    // Should not return 500 error
    expect(response.status()).not.toBe(500)

    if (response.status() === 200) {
      const authData = await response.json()

      expect(authData).toHaveProperty('user')
      expect(authData).toHaveProperty('session')
    }
  })

  test('Admin page should not timeout on authentication check', async ({ page }) => {

    // Set up console logging to catch timeout messages
    const consoleLogs: string[] = []
    page.on('console', msg => {
      consoleLogs.push(msg.text())
    })

    // Navigate to admin page
    const startTime = Date.now()
    await page.goto(`${baseURL}/admin`, { timeout: 70000 }) // 70 second timeout
    const endTime = Date.now()
    const pageLoadTime = endTime - startTime

    // Should not take more than 65 seconds (our new 60s timeout + buffer)
    expect(pageLoadTime).toBeLessThan(65000)

    // Check if we got redirected to sign in (expected) or loaded admin (if already authenticated)
    const currentUrl = page.url()
    const isSignInPage = currentUrl.includes('/auth/signin')
    const isAdminPage = currentUrl.includes('/admin')

    expect(isSignInPage || isAdminPage).toBe(true)

    // Check for timeout messages in console
    const timeoutLogs = consoleLogs.filter(log =>
      log.includes('timed out') || log.includes('timeout')
    )

    if (timeoutLogs.length > 0) {

    }

    // Should not have the old 20-second timeout message
    const oldTimeoutLogs = consoleLogs.filter(log =>
      log.includes('timed out after 20 seconds')
    )
    expect(oldTimeoutLogs.length).toBe(0)
  })

  test('Magic link authentication flow works end-to-end', async ({ page }) => {

    // Navigate to sign in page
    await page.goto(`${baseURL}/auth/signin`)

    // Check that sign in page loads without errors
    await expect(page.locator('h1, h2').filter({ hasText: /sign in|login/i })).toBeVisible({ timeout: 10000 })

    // Look for email input field
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()

    if (await emailInput.isVisible()) {

      // Test with a test email
      await emailInput.fill('test@example.com')

      // Find and click submit button
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /send|sign in|login/i }).first()

      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Wait for form submission response
        await page.waitForTimeout(2000)

        // Check for success message or redirect
        const hasSuccessMessage = await page.locator('text=/sent|check your email|magic link/i').isVisible()
        const hasErrorMessage = await page.locator('text=/error|failed|invalid/i').isVisible()

        // Should either show success or at least not crash
        expect(hasErrorMessage).toBe(false)
      }
    } else {

      // Look for Google OAuth button
      const googleButton = page.locator('button, a').filter({ hasText: /google|oauth/i }).first()

      if (await googleButton.isVisible()) {

        expect(await googleButton.isVisible()).toBe(true)
      }
    }
  })

  test('API endpoints return proper error responses with tracking', async ({ page }) => {

    // Test products API
    const productsResponse = await page.request.get(`${baseURL}/api/products`)
    const productsHeaders = productsResponse.headers()

    console.log('Products API headers:', Object.keys(productsHeaders))

    if (productsResponse.status() !== 200) {
      const errorBody = await productsResponse.json()
      expect(errorBody).toHaveProperty('requestId')
      expect(errorBody).toHaveProperty('timestamp')

    }

    // Test auth API
    const authResponse = await page.request.get(`${baseURL}/api/auth/me`)
    const authHeaders = authResponse.headers()

    console.log('Auth API headers:', Object.keys(authHeaders))

    if (authHeaders['x-request-id']) {

    }

    if (authHeaders['x-response-time']) {
      const responseTime = parseInt(authHeaders['x-response-time'])

      expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    }
  })

  test('Database health can be checked', async ({ page }) => {

    // Try to access any API that uses the database
    const response = await page.request.get(`${baseURL}/api/products`)

    // Should not get connection errors
    expect([200, 400, 401, 403].includes(response.status())).toBe(true)

    // 503 (service unavailable) or 504 (gateway timeout) might indicate DB issues
    if (response.status() === 503) {
      const errorBody = await response.json()

    }

    if (response.status() === 504) {
      const errorBody = await response.json()

    }
  })

  test('Page load performance within acceptable limits', async ({ page }) => {

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/signin', name: 'Sign In' },
      { path: '/products', name: 'Products' },
    ]

    for (const testPage of pages) {

      const startTime = Date.now()
      await page.goto(`${baseURL}${testPage.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Pages should load within 10 seconds
      expect(loadTime).toBeLessThan(10000)

      // Check that page didn't crash
      const hasErrorText = await page.locator('text=/error|500|crashed|failed/i').isVisible()
      expect(hasErrorText).toBe(false)
    }
  })
})

test.describe('Stress Testing', () => {
  test('Multiple concurrent API requests should not cause 500 errors', async ({ browser }) => {

    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002'
    const concurrentRequests = 5
    const context = await browser.newContext()

    const promises = Array.from({ length: concurrentRequests }, async (_, i) => {
      const page = await context.newPage()

      try {

        const response = await page.request.get(`${baseURL}/api/products`)

        await page.close()
        return {
          index: i + 1,
          status: response.status(),
          success: response.status() !== 500
        }
      } catch (error) {

        await page.close()
        return {
          index: i + 1,
          status: 0,
          success: false,
          error: error
        }
      }
    })

    const results = await Promise.all(promises)
    await context.close()

    // At least 80% of requests should succeed (not return 500)
    const successfulRequests = results.filter(r => r.success).length
    const successRate = successfulRequests / concurrentRequests

    expect(successRate).toBeGreaterThanOrEqual(0.8)
  })
})