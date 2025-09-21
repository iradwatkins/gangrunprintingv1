const { chromium } = require('playwright')

async function testWithValidSession() {

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()

  // Capture logs
  const logs = []
  const log = (message) => {

    logs.push(`[${new Date().toISOString()}] ${message}`)
  }

  page.on('console', (msg) => {
    log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`)
  })

  page.on('pageerror', (error) => {
    log(`PAGE ERROR: ${error.message}`)
  })

  page.on('response', (response) => {
    if (!response.ok()) {
      log(`FAILED REQUEST: ${response.status()} ${response.statusText()} - ${response.url()}`)
    }
  })

  try {
    // Intercept the auth API call and return a mock admin user
    await page.route('**/api/auth/me', (route) => {
      const mockAdminResponse = {
        user: {
          id: 'test-admin-id',
          email: 'iradwatkins@gmail.com',
          name: 'Test Admin',
          role: 'ADMIN',
          emailVerified: true,
        },
        session: {
          id: 'test-session-id',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAdminResponse),
      })
    })

    log('=== TEST: Admin page with mocked authentication ===')

    // Navigate to admin page
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Wait for page to load
    await page.waitForTimeout(5000)

    const currentUrl = page.url()
    log(`Current URL: ${currentUrl}`)

    // Check if we stayed on the admin page (no redirect)
    const stayedOnAdminPage = currentUrl.includes('/admin/products/new')
    log(`Stayed on admin page: ${stayedOnAdminPage}`)

    // Check what's visible on the page
    const pageText = await page.textContent('body')
    log(`Page contains (first 200 chars): ${pageText.substring(0, 200)}`)

    // Look for loading states
    const hasLoadingMessage = pageText.includes('Verifying admin access')
    const hasRedirectMessage = pageText.includes('Redirecting to sign in')
    log(`Has loading message: ${hasLoadingMessage}`)
    log(`Has redirect message: ${hasRedirectMessage}`)

    // Check if the actual product form loaded
    const hasProductForm = pageText.includes('Create Product') || pageText.includes('Product Name')
    log(`Has product form: ${hasProductForm}`)

    // Check for any error messages
    const hasError = pageText.toLowerCase().includes('error')
    log(`Has error messages: ${hasError}`)

    // Test API endpoint functionality
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const data = await response.json()
        return { status: response.status, data }
      } catch (error) {
        return { error: error.message }
      }
    })

    log(`API test result: ${JSON.stringify(apiTest, null, 2)}`)

    // Wait for any network activity to settle
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      log('Network did not settle in 5 seconds')
    })

    // Final check of page state
    const finalText = await page.textContent('body')
    log(`Final page state (first 300 chars): ${finalText.substring(0, 300)}`)
  } catch (error) {
    log(`Test error: ${error.message}`)
  }

  await browser.close()
  log('Test completed')
}

// Run the test
testWithValidSession().catch(console.error)
