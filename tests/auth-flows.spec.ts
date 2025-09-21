import { test, expect, Page } from '@playwright/test'

test.describe('Authentication Flows', () => {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002'

  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test('API Products endpoint should not return 500 errors', async ({ page }) => {
    console.log('Testing /api/products endpoint...')

    // Test the products API directly
    const response = await page.request.get(`${baseURL}/api/products`)

    console.log(`Response status: ${response.status()}`)

    // Should not return 500 error
    expect(response.status()).not.toBe(500)

    // Should return either 200 (success) or other valid status
    expect([200, 503, 504].includes(response.status())).toBe(true)

    if (response.status() === 200) {
      const products = await response.json()
      console.log(`Found ${products.length} products`)
      expect(Array.isArray(products)).toBe(true)
    } else {
      console.log('Products API returned non-200 status, checking error structure')
      const errorResponse = await response.json()
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse).toHaveProperty('requestId')
      expect(errorResponse).toHaveProperty('timestamp')
    }
  })

  test('Authentication API (/api/auth/me) should respond without timeout', async ({ page }) => {
    console.log('Testing /api/auth/me endpoint...')

    const startTime = Date.now()
    const response = await page.request.get(`${baseURL}/api/auth/me`, {
      headers: {
        'X-Request-Source': 'playwright-test'
      }
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime

    console.log(`Auth API response time: ${responseTime}ms`)
    console.log(`Response status: ${response.status()}`)

    // Should respond within 10 seconds
    expect(responseTime).toBeLessThan(10000)

    // Should not return 500 error
    expect(response.status()).not.toBe(500)

    if (response.status() === 200) {
      const authData = await response.json()
      console.log('Auth response structure valid')
      expect(authData).toHaveProperty('user')
      expect(authData).toHaveProperty('session')
    }
  })

  test('Admin page should not timeout on authentication check', async ({ page }) => {
    console.log('Testing admin page authentication flow...')

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

    console.log(`Admin page load time: ${pageLoadTime}ms`)

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
      console.log('Timeout logs found:', timeoutLogs)
    }

    // Should not have the old 20-second timeout message
    const oldTimeoutLogs = consoleLogs.filter(log =>
      log.includes('timed out after 20 seconds')
    )
    expect(oldTimeoutLogs.length).toBe(0)
  })

  test('Magic link authentication flow works end-to-end', async ({ page }) => {
    console.log('Testing magic link authentication...')

    // Navigate to sign in page
    await page.goto(`${baseURL}/auth/signin`)

    // Check that sign in page loads without errors
    await expect(page.locator('h1, h2').filter({ hasText: /sign in|login/i })).toBeVisible({ timeout: 10000 })

    // Look for email input field
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()

    if (await emailInput.isVisible()) {
      console.log('Email input found - testing form submission')

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

        console.log(`Magic link form submission - Success: ${hasSuccessMessage}, Error: ${hasErrorMessage}`)

        // Should either show success or at least not crash
        expect(hasErrorMessage).toBe(false)
      }
    } else {
      console.log('Email input not found - checking for OAuth options')

      // Look for Google OAuth button
      const googleButton = page.locator('button, a').filter({ hasText: /google|oauth/i }).first()

      if (await googleButton.isVisible()) {
        console.log('Google OAuth button found')
        expect(await googleButton.isVisible()).toBe(true)
      }
    }
  })

  test('API endpoints return proper error responses with tracking', async ({ page }) => {
    console.log('Testing API error response structure...')

    // Test products API
    const productsResponse = await page.request.get(`${baseURL}/api/products`)
    const productsHeaders = productsResponse.headers()

    console.log('Products API headers:', Object.keys(productsHeaders))

    if (productsResponse.status() !== 200) {
      const errorBody = await productsResponse.json()
      expect(errorBody).toHaveProperty('requestId')
      expect(errorBody).toHaveProperty('timestamp')
      console.log(`Products API error tracking: requestId=${errorBody.requestId}`)
    }

    // Test auth API
    const authResponse = await page.request.get(`${baseURL}/api/auth/me`)
    const authHeaders = authResponse.headers()

    console.log('Auth API headers:', Object.keys(authHeaders))

    if (authHeaders['x-request-id']) {
      console.log(`Auth API request tracking: ${authHeaders['x-request-id']}`)
    }

    if (authHeaders['x-response-time']) {
      const responseTime = parseInt(authHeaders['x-response-time'])
      console.log(`Auth API response time: ${responseTime}ms`)
      expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    }
  })

  test('Database health can be checked', async ({ page }) => {
    console.log('Testing database connectivity...')

    // Try to access any API that uses the database
    const response = await page.request.get(`${baseURL}/api/products`)

    console.log(`Database test via products API: ${response.status()}`)

    // Should not get connection errors
    expect([200, 400, 401, 403].includes(response.status())).toBe(true)

    // 503 (service unavailable) or 504 (gateway timeout) might indicate DB issues
    if (response.status() === 503) {
      const errorBody = await response.json()
      console.log('Database connection error detected:', errorBody.error)
    }

    if (response.status() === 504) {
      const errorBody = await response.json()
      console.log('Database timeout error detected:', errorBody.error)
    }
  })

  test('Page load performance within acceptable limits', async ({ page }) => {
    console.log('Testing page load performance...')

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/signin', name: 'Sign In' },
      { path: '/products', name: 'Products' },
    ]

    for (const testPage of pages) {
      console.log(`Testing ${testPage.name} (${testPage.path})...`)

      const startTime = Date.now()
      await page.goto(`${baseURL}${testPage.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
      const endTime = Date.now()
      const loadTime = endTime - startTime

      console.log(`${testPage.name} load time: ${loadTime}ms`)

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
    console.log('Testing concurrent API requests...')

    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002'
    const concurrentRequests = 5
    const context = await browser.newContext()

    const promises = Array.from({ length: concurrentRequests }, async (_, i) => {
      const page = await context.newPage()

      try {
        console.log(`Starting concurrent request ${i + 1}`)
        const response = await page.request.get(`${baseURL}/api/products`)
        console.log(`Request ${i + 1} completed with status: ${response.status()}`)

        await page.close()
        return {
          index: i + 1,
          status: response.status(),
          success: response.status() !== 500
        }
      } catch (error) {
        console.log(`Request ${i + 1} failed:`, error)
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

    console.log('Concurrent request results:', results)

    // At least 80% of requests should succeed (not return 500)
    const successfulRequests = results.filter(r => r.success).length
    const successRate = successfulRequests / concurrentRequests

    console.log(`Success rate: ${successRate * 100}% (${successfulRequests}/${concurrentRequests})`)
    expect(successRate).toBeGreaterThanOrEqual(0.8)
  })
})