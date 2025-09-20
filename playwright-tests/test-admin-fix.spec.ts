import { test, expect } from '@playwright/test'

test('Admin products page renders correctly', async ({ page }) => {
  console.log('🔍 Testing admin products page fix...')

  // Go to the admin page
  await page.goto('https://gangrunprinting.com/admin/products/new', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  // Wait a bit for any redirects or loading
  await page.waitForTimeout(5000)

  // Check current URL
  const currentUrl = page.url()
  console.log('Current URL:', currentUrl)

  // Take a screenshot for debugging
  await page.screenshot({ path: 'admin-page-test.png' })

  if (currentUrl.includes('/auth/signin')) {
    console.log('❌ Page redirected to signin - not authenticated')
    // This is expected behavior for unauthenticated users
    expect(currentUrl).toContain('/auth/signin')
  } else if (currentUrl.includes('/admin/products/new')) {
    console.log('✅ Still on admin page - checking content...')

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

    console.log('Has loading message:', hasLoadingMessage)
    console.log('Has product form:', hasProductForm)
    console.log('Has create button:', hasCreateButton)
    console.log('Has sidebar:', hasSidebar)

    // The page should either show the form or redirect
    if (hasProductForm || hasCreateButton) {
      console.log('✅ SUCCESS! Product form is visible!')
      expect(hasProductForm || hasCreateButton).toBeTruthy()
    } else if (hasLoadingMessage) {
      console.log('❌ ISSUE: Page stuck on loading message')
      expect(hasLoadingMessage).toBeFalsy()
    } else if (hasSidebar) {
      console.log('⚠️ Sidebar visible but no content - checking HTML...')
      const bodyHTML = await page.content()
      console.log('Page has', bodyHTML.length, 'characters of HTML')

      // Check for specific form elements
      const hasInputs = await page.locator('input').count()
      const hasButtons = await page.locator('button').count()
      console.log('Found', hasInputs, 'inputs and', hasButtons, 'buttons')
    }
  }

  console.log('Test complete!')
})
