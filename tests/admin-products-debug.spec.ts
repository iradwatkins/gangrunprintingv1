import { test, expect } from '@playwright/test'

test.describe('Admin Products New Page Enhanced Tests', () => {
  test('verify admin products page shows proper loading states', async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`)
      }
    })

    // Track network requests
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`)
      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`)
      }
    })

    // Navigate to admin products new page
    console.log('🚀 Navigating to admin products new page...')
    await page.goto('https://gangrunprinting.com/admin/products/new')

    // Check initial loading state
    console.log('📄 Checking initial page state...')

    // Look for auth verification
    const verifyingText = page.locator('text=Verifying admin access...')
    const redirectingText = page.locator('text=Redirecting to sign in...')
    const accessDeniedText = page.locator('text=Access denied')

    // Check skeleton loading state
    const skeletonElements = page.locator('[class*="animate-pulse"]')
    const errorAlert = page.locator('[role="alert"][class*="destructive"]')
    const formTitle = page.locator('text=Create Product')

    console.log('🔍 Checking for authentication states...')

    // Wait for auth to resolve (max 12 seconds)
    await page.waitForTimeout(2000)

    if (await verifyingText.isVisible()) {
      console.log('🔐 Authentication verification in progress...')

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
        console.log('⏰ Auth check timed out')
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

    console.log('📊 Final page states:', finalStates)

    if (finalStates.redirecting) {
      console.log('🔄 Page is redirecting to sign in (expected for unauthenticated users)')
      // Wait for redirect
      await page.waitForTimeout(3000)
      console.log('🌐 Current URL after redirect:', page.url())
    }

    if (finalStates.hasSkeletons) {
      console.log('💀 Skeleton loading state detected')
      console.log('📊 Number of skeleton elements:', await skeletonElements.count())

      // Wait for skeletons to disappear or timeout
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('[class*="animate-pulse"]').length === 0,
          { timeout: 15000 }
        )
        console.log('✅ Skeleton loading completed')
      } catch (e) {
        console.log('⏰ Skeleton loading timed out')
      }
    }

    if (finalStates.hasErrorAlert) {
      console.log('❌ Error alert detected')
      const errorTitle = await page.locator('[role="alert"] h5').textContent()
      const errorDescription = await page.locator('[role="alert"] div').first().textContent()
      console.log('Error details:', { title: errorTitle, description: errorDescription })
    }

    if (finalStates.hasForm) {
      console.log('✅ Product creation form loaded successfully!')

      // Verify form sections are present
      const formSections = {
        basicInfo: await page.locator('text=Basic Info & Images').isVisible(),
        quantitySet: await page.locator('text=Quantity Set').isVisible(),
        paperStock: await page.locator('text=Paper Stock Options').isVisible(),
        sizeSet: await page.locator('text=Size Set').isVisible(),
        addOns: await page.locator('text=Add-on Options').isVisible(),
        turnaround: await page.locator('text=Turnaround Times').isVisible(),
      }

      console.log('📋 Form sections loaded:', formSections)

      // Count dropdown/select elements
      const selectElements = await page.locator('select, [role="combobox"]').count()
      console.log('🔽 Number of select elements:', selectElements)
    }

    // Take screenshot of final state
    await page.screenshot({ path: 'admin-products-enhanced.png', fullPage: true })
    console.log('📸 Screenshot saved as admin-products-enhanced.png')

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
    console.log('🧪 Testing API calls directly from browser context...')

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

    console.log('🔍 API test results from browser context:')
    console.log(JSON.stringify(apiResults, null, 2))
  })
})
