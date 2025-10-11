import { test, expect, Page } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3013'
const SIGNIN_URL = `${BASE_URL}/auth/signin`

// Helper function to clear all cookies and storage
async function clearAllData(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

// Helper function to check if user is logged in
async function checkLoginStatus(page: Page) {
  // Check for user menu or avatar that appears when logged in
  const userMenu = page.locator(
    '[data-testid="user-menu"], .user-avatar, button:has-text("Account")'
  )
  const signInButton = page.locator('a:has-text("Sign in"), button:has-text("Sign in")')

  const isLoggedIn = await userMenu.isVisible().catch(() => false)
  const hasSignInButton = await signInButton.isVisible().catch(() => false)

  return { isLoggedIn, hasSignInButton }
}

test.describe('Google OAuth Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all data before each test
    await clearAllData(page)

    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('Test 1: Google OAuth button exists and is clickable', async ({ page }) => {
    // Navigate to signin page
    await page.goto(SIGNIN_URL, { waitUntil: 'networkidle' })

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-1-signin-page.png' })

    // Check if Google sign-in button exists
    const googleButton = page.locator(
      'button:has-text("Sign in with Google"), a:has-text("Sign in with Google"), [aria-label*="Google"]'
    )

    // Wait for button to be visible
    await expect(googleButton).toBeVisible({ timeout: 10000 })

    // Check if button is enabled
    await expect(googleButton).toBeEnabled()

    // Click the button
    await googleButton.click()

    // Wait for navigation (should redirect to Google OAuth)
    await page.waitForLoadState('networkidle')

    // Check if redirected to Google or error page
    const currentUrl = page.url()

    // Take screenshot after click
    await page.screenshot({ path: 'test-1-after-click.png' })

    // Check for configuration error
    const hasError = await page
      .locator('text=/configuration error/i')
      .isVisible()
      .catch(() => false)

    if (hasError) {
      const errorText = await page.locator('body').textContent()
      console.log('Error page content:', errorText?.substring(0, 500))
    } else if (currentUrl.includes('accounts.google.com')) {
    } else if (currentUrl.includes('/auth/error')) {
      const errorMessage = await page
        .locator('[class*="error"], [id*="error"]')
        .textContent()
        .catch(() => 'No error message found')
    } else {
    }
  })

  test('Test 2: Check OAuth providers endpoint', async ({ page }) => {
    // Make API request to check providers
    const response = await page.request.get(`${BASE_URL}/api/auth/providers`)
    const providers = await response.json()

    // Check if Google provider exists
    expect(providers).toHaveProperty('google')
    expect(providers.google).toHaveProperty('id', 'google')
    expect(providers.google).toHaveProperty('name', 'Google')
    expect(providers.google).toHaveProperty('type', 'oauth')
  })

  test('Test 3: Test OAuth flow with mock credentials', async ({ page }) => {
    // Navigate to signin page
    await page.goto(SIGNIN_URL, { waitUntil: 'networkidle' })

    // Intercept OAuth requests to debug
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/') || request.url().includes('google')) {
        console.log('OAuth Request:', request.method(), request.url())
      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/auth/') || response.url().includes('google')) {
        console.log('OAuth Response:', response.status(), response.url())
      }
    })

    // Click Google sign-in button
    const googleButton = page.locator(
      'button:has-text("Sign in with Google"), a:has-text("Sign in with Google")'
    )

    if (await googleButton.isVisible()) {
      await googleButton.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Check current state
      const currentUrl = page.url()

      if (currentUrl.includes('/auth/error')) {
        // Get error details
        const errorCode = await page
          .locator('text=/error code/i')
          .textContent()
          .catch(() => '')
        const errorMessage = await page
          .locator('text=/error|problem/i')
          .textContent()
          .catch(() => '')

        // Take screenshot of error
        await page.screenshot({ path: 'test-3-auth-error.png' })

        // Check console for errors
        const consoleErrors: string[] = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })

        if (consoleErrors.length > 0) {
        }
      } else if (currentUrl.includes('accounts.google.com')) {
        await page.screenshot({ path: 'test-3-google-oauth.png' })
      } else {
        await page.screenshot({ path: 'test-3-unexpected.png' })
      }
    } else {
    }
  })

  test('Test 4: Check session and CSRF token', async ({ page }) => {
    // Navigate to signin page
    await page.goto(SIGNIN_URL, { waitUntil: 'networkidle' })

    // Get CSRF token
    const csrfResponse = await page.request.get(`${BASE_URL}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()

    // Check session
    const sessionResponse = await page.request.get(`${BASE_URL}/api/auth/session`)
    const sessionData = await sessionResponse.json()

    if (sessionData.user) {
    } else {
    }

    // Try to initiate Google OAuth with CSRF token
    if (csrfData.csrfToken) {
      const signInResponse = await page.request.post(`${BASE_URL}/api/auth/signin/google`, {
        data: {
          csrfToken: csrfData.csrfToken,
          callbackUrl: BASE_URL,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const signInData = await signInResponse.json().catch(() => null)

      if (signInData?.url) {
        console.log('✅ OAuth URL generated:', signInData.url.substring(0, 50) + '...')

        // Navigate to OAuth URL
        await page.goto(signInData.url)
        await page.waitForLoadState('networkidle')

        // Check where we ended up
        const finalUrl = page.url()

        await page.screenshot({ path: 'test-4-oauth-redirect.png' })
      } else {
        console.log('Response:', signInResponse.status(), await signInResponse.text())
      }
    }
  })
})

// Summary test
test.describe('Summary', () => {
  test('Generate test report', async ({ page }) => {})
})
