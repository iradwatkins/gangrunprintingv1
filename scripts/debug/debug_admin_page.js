const { chromium } = require('playwright')

async function debugAdminPage() {
  console.log('Starting browser automation to debug admin page...')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()

  // Capture console messages
  const consoleMessages = []
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    })
  })

  // Capture errors
  const pageErrors = []
  page.on('pageerror', (error) => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  })

  // Capture failed requests
  const failedRequests = []
  page.on('response', (response) => {
    if (!response.ok()) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString(),
      })
    }
  })

  try {
    console.log('Navigating to admin products new page...')

    // Navigate to the admin page
    const response = await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    console.log(`Initial response status: ${response.status()}`)

    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(5000)

    // Check what text is visible on the page
    const bodyText = await page.textContent('body')
    console.log('Page content contains:', bodyText.substring(0, 500))

    // Look for specific loading messages
    const loadingElement = await page.locator('text=Verifying admin access').first()
    const isLoadingVisible = await loadingElement.isVisible().catch(() => false)
    console.log('Loading message visible:', isLoadingVisible)

    // Check if redirect happened
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('Network never went idle')
    })

    // Final check after waiting
    const finalText = await page.textContent('body')
    console.log('Final page content:', finalText.substring(0, 500))

    // Check for specific error indicators
    const hasError = finalText.includes('error') || finalText.includes('Error')
    console.log('Contains error text:', hasError)
  } catch (error) {
    console.error('Navigation error:', error)
  }

  // Print all captured information
  console.log('\n=== CONSOLE MESSAGES ===')
  consoleMessages.forEach((msg) => {
    console.log(`[${msg.timestamp}] ${msg.type.toUpperCase()}: ${msg.text}`)
  })

  console.log('\n=== PAGE ERRORS ===')
  pageErrors.forEach((error) => {
    console.log(`[${error.timestamp}] ERROR: ${error.message}`)
    if (error.stack) {
      console.log('Stack:', error.stack)
    }
  })

  console.log('\n=== FAILED REQUESTS ===')
  failedRequests.forEach((req) => {
    console.log(`[${req.timestamp}] ${req.status} ${req.statusText}: ${req.url}`)
  })

  await browser.close()
  console.log('Browser automation completed.')
}

// Run the debug
debugAdminPage().catch(console.error)
