import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display sign in form', async ({ page }) => {
    await page.click('[data-testid="sign-in-button"]')
    await expect(page).toHaveURL('/auth/signin')

    await expect(page.locator('h1')).toContainText('Sign In')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate email input', async ({ page }) => {
    await page.goto('/auth/signin')

    // Try to submit without email
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email is required')

    // Try invalid email format
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid email format'
    )
  })

  test('should send magic link for valid email', async ({ page }) => {
    await page.goto('/auth/signin')

    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Magic link sent')
    await expect(page.locator('[data-testid="email-sent-notice"]')).toBeVisible()
  })

  test('should handle magic link verification', async ({ page, context }) => {
    // Mock the magic link token
    await page.goto('/auth/verify?token=valid-test-token')

    // Should redirect to dashboard after successful verification
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
  })

  test('should handle expired magic link', async ({ page }) => {
    await page.goto('/auth/verify?token=expired-test-token')

    await expect(page.locator('[data-testid="error-message"]')).toContainText('expired')
    await expect(page.locator('a[href="/auth/signin"]')).toBeVisible()
  })

  test('should sign out user', async ({ page }) => {
    // First sign in (mock authentication state)
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'test-token')
    })

    await page.goto('/dashboard')
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="sign-out"]')

    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible()
  })

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL('/auth/signin')
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should remember user session', async ({ page, context }) => {
    // Set up authentication cookies
    await context.addCookies([
      {
        name: 'auth_session',
        value: 'valid-session-id',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()

    // Refresh page and ensure still authenticated
    await page.reload()
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
  })

  test('should handle Google OAuth flow', async ({ page }) => {
    await page.goto('/auth/signin')

    // Mock Google OAuth
    await page.route('**/api/auth/google', (route) => {
      route.fulfill({
        status: 302,
        headers: {
          Location: 'https://accounts.google.com/oauth/authorize?...',
        },
      })
    })

    await page.click('[data-testid="google-signin"]')

    // Should redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/)
  })

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/auth/signin')

    const email = 'ratelimit@example.com'

    // Send multiple requests quickly
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', email)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }

    await expect(page.locator('[data-testid="error-message"]')).toContainText('rate limit')
  })
})
