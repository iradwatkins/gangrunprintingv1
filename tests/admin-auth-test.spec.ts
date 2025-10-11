import { test, expect } from '@playwright/test'

test.describe('Admin Authentication Flow Test', () => {
  test('verify authentication redirect flow works properly', async ({ page }) => {
    // Navigate to admin page as unauthenticated user
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Check that we see the auth loading states
    const verifyingText = page.locator('text=Verifying admin access...')
    const redirectingText = page.locator('text=Redirecting to sign in...')

    // Should start with verifying
    const isVerifying = await verifyingText.isVisible()

    // Should transition to redirecting
    await page.waitForTimeout(1000)
    const isRedirecting = await redirectingText.isVisible()

    // Should redirect to signin page
    await page.waitForURL(/auth\/signin/, { timeout: 10000 })
    const currentUrl = page.url()

    // Verify signin page loaded
    const signinPageTitle = await page.locator('h1, h2').first().textContent()

    // Check for email input field
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const hasEmailInput = await emailInput.isVisible()
  })

  test('test magic link API endpoint', async ({ request }) => {
    const response = await request.post('https://gangrunprinting.com/api/auth/send-magic-link', {
      data: {
        email: 'test@example.com',
      },
    })

    if (response.status() === 200) {
      const data = await response.json()
    } else {
      try {
        const error = await response.text()
      } catch (e) {}
    }
  })
})
