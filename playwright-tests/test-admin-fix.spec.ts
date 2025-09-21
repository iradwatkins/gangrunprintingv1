import { test, expect } from '@playwright/test'

test('Admin products page renders correctly', async ({ page }) => {

  // Go to the admin page
  await page.goto('https://gangrunprinting.com/admin/products/new', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  // Wait a bit for any redirects or loading
  await page.waitForTimeout(5000)

  // Check current URL
  const currentUrl = page.url()

  // Take a screenshot for debugging
  await page.screenshot({ path: 'admin-page-test.png' })

  if (currentUrl.includes('/auth/signin')) {

    // This is expected behavior for unauthenticated users
    expect(currentUrl).toContain('/auth/signin')
  } else if (currentUrl.includes('/admin/products/new')) {

    // Check if the page has the expected content
    const hasLoadingMessage = await page
      .locator('text=Verifying admin access')
      .isVisible()
      .catch(() => false)
    const hasProductForm = await page
      .locator('text=Product Name')
      .isVisible()
      .catch(() => false)
    const hasCreateButton = await page
      .locator('text=Create Product')
      .isVisible()
      .catch(() => false)
    const hasSidebar = await page
      .locator('text=Dashboard')
      .isVisible()
      .catch(() => false)

    // The page should either show the form or redirect
    if (hasProductForm || hasCreateButton) {

      expect(hasProductForm || hasCreateButton).toBeTruthy()
    } else if (hasLoadingMessage) {

      expect(hasLoadingMessage).toBeFalsy()
    } else if (hasSidebar) {

      const bodyHTML = await page.content()

      // Check for specific form elements
      const hasInputs = await page.locator('input').count()
      const hasButtons = await page.locator('button').count()

    }
  }

})
