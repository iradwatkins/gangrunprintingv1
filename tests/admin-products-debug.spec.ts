import { test, expect } from '@playwright/test'

test.describe('Admin Products New Page Enhanced Tests', () => {
  test('verify admin products page shows proper loading states', async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {

      }
    })

    // Track network requests
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {

      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {

      }
    })

    // Navigate to admin products new page

    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Check initial loading state

    // Look for auth verification
    const verifyingText = page.locator('text=Verifying admin access...')
    const redirectingText = page.locator('text=Redirecting to sign in...')
    const accessDeniedText = page.locator('text=Access denied')

    // Check skeleton loading state
    const skeletonElements = page.locator('[class*="animate-pulse"]')
    const errorAlert = page.locator('[role="alert"][class*="destructive"]')
    const formTitle = page.locator('text=Create Product')

    // Wait for auth to resolve (max 12 seconds)
    await page.waitForTimeout(2000)

    if (await verifyingText.isVisible()) {

      // Wait for auth to complete or redirect
      try {
        await page.waitForFunction(
          () => {
            return (
              !document.querySelector('text=Verifying admin access...') ||
              document.querySelector('text=Redirecting to sign in...') ||
              document.querySelector('text=Create Product') ||
              document.querySelector('[role="alert"]')
            )
          },
          { timeout: 12000 }
        )
      } catch (e) {

      }
    }

    // Check final state
    const finalStates = {
      verifying: await verifyingText.isVisible(),
      redirecting: await redirectingText.isVisible(),
      accessDenied: await accessDeniedText.isVisible(),
      hasSkeletons: (await skeletonElements.count()) > 0,
      hasErrorAlert: await errorAlert.isVisible(),
      hasForm: await formTitle.isVisible(),
    }

    if (finalStates.redirecting) {
      console.log('🔄 Page is redirecting to sign in (expected for unauthenticated users)')
      // Wait for redirect
      await page.waitForTimeout(3000)
      console.log('🌐 Current URL after redirect:', page.url())
    }

    if (finalStates.hasSkeletons) {

      console.log('📊 Number of skeleton elements:', await skeletonElements.count())

      // Wait for skeletons to disappear or timeout
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('[class*="animate-pulse"]').length === 0,
          { timeout: 15000 }
        )

      } catch (e) {

      }
    }

    if (finalStates.hasErrorAlert) {

      const errorTitle = await page.locator('[role="alert"] h5').textContent()
      const errorDescription = await page.locator('[role="alert"] div').first().textContent()

    }

    if (finalStates.hasForm) {

      // Verify form sections are present
      const formSections = {
        basicInfo: await page.locator('text=Basic Info & Images').isVisible(),
        quantitySet: await page.locator('text=Quantity Set').isVisible(),
        paperStock: await page.locator('text=Paper Stock Options').isVisible(),
        sizeSet: await page.locator('text=Size Set').isVisible(),
        addOns: await page.locator('text=Add-on Options').isVisible(),
        turnaround: await page.locator('text=Turnaround Times').isVisible(),
      }

      // Count dropdown/select elements
      const selectElements = await page.locator('select, [role="combobox"]').count()

    }

    // Take screenshot of final state
    await page.screenshot({ path: 'admin-products-enhanced.png', fullPage: true })

    // Get console errors
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    console.log('📊 Final metrics:', {
      url: page.url(),
      title: await page.title(),
      loadState: await page.evaluate(() => document.readyState),
      consoleErrors: errors.length,
    })
  })

  test('test direct API calls from browser context', async ({ page }) => {

    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Test API calls using page.evaluate to run in browser context
    const apiResults = await page.evaluate(async () => {
      const endpoints = [
        '/api/product-categories',
        '/api/paper-stocks',
        '/api/quantities',
        '/api/sizes',
        '/api/add-ons',
      ]

      const results: Record<string, any> = {}

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          results[endpoint] = {
            status: response.status,
            dataLength: Array.isArray(data) ? data.length : 'N/A',
            success: response.ok,
          }
        } catch (error: any) {
          results[endpoint] = {
            status: 'ERROR',
            error: error.message,
            success: false,
          }
        }
      }

      return results
    })

    console.log(JSON.stringify(apiResults, null, 2))
  })
})
