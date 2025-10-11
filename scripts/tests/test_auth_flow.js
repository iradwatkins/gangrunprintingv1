const { chromium } = require('playwright')

async function testAuthFlow() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()

  // Capture all logs
  const logs = []
  const log = (message) => {
    logs.push(`[${new Date().toISOString()}] ${message}`)
  }

  // Capture console messages
  page.on('console', (msg) => {
    log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`)
  })

  // Capture errors
  page.on('pageerror', (error) => {
    log(`PAGE ERROR: ${error.message}`)
  })

  // Capture request/response failures
  page.on('response', (response) => {
    if (!response.ok()) {
      log(`FAILED REQUEST: ${response.status()} ${response.statusText()} - ${response.url()}`)
    }
  })

  try {
    // Test 1: Direct access to admin page (should redirect)
    log('=== TEST 1: Direct access to admin page ===')
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    await page.waitForTimeout(3000)

    const currentUrl1 = page.url()
    log(`After redirect: ${currentUrl1}`)

    const isOnSignin = currentUrl1.includes('/auth/signin')
    log(`Redirected to signin: ${isOnSignin}`)

    // Test 2: Check the auth API directly
    log('\n=== TEST 2: Direct API test ===')

    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })
        const data = await response.json()
        return {
          status: response.status,
          data: data,
          headers: Object.fromEntries(response.headers.entries()),
        }
      } catch (error) {
        return { error: error.message }
      }
    })

    log(`API Response: ${JSON.stringify(apiResponse, null, 2)}`)

    // Test 3: Try to sign in via magic link
    log('\n=== TEST 3: Magic link authentication ===')

    // Navigate to signin page if not already there
    if (!currentUrl1.includes('/auth/signin')) {
      await page.goto('https://gangrunprinting.com/auth/signin')
      await page.waitForTimeout(2000)
    }

    // Check if signin form exists
    const hasEmailInput = await page
      .locator('input[type="email"]')
      .isVisible()
      .catch(() => false)
    log(`Email input visible: ${hasEmailInput}`)

    if (hasEmailInput) {
      // Try to send magic link for admin email
      await page.fill('input[type="email"]', 'iradwatkins@gmail.com')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(3000)

      const afterSubmitText = await page.textContent('body')
      log(`After magic link request: ${afterSubmitText.substring(0, 200)}...`)
    }

    // Test 4: Test with a simulated session cookie
    log('\n=== TEST 4: Testing with simulated auth ===')

    // Try to manually set a session cookie and test
    await context.addCookies([
      {
        name: 'auth_session',
        value: 'test-session-id',
        domain: '.gangrunprinting.com',
        path: '/',
        httpOnly: true,
        secure: true,
      },
    ])

    const apiResponseWithCookie = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })
        const data = await response.json()
        return {
          status: response.status,
          data: data,
        }
      } catch (error) {
        return { error: error.message }
      }
    })

    log(`API Response with fake cookie: ${JSON.stringify(apiResponseWithCookie, null, 2)}`)

    // Test 5: Check if there are any JavaScript errors preventing execution
    log('\n=== TEST 5: JavaScript execution test ===')

    await page.goto('https://gangrunprinting.com/admin/products/new')
    await page.waitForTimeout(5000)

    const jsTestResult = await page.evaluate(() => {
      return {
        hasReact: typeof React !== 'undefined',
        hasNext:
          typeof window.__NEXT_ROUTER__ !== 'undefined' || typeof window.next !== 'undefined',
        userAgent: navigator.userAgent,
        location: window.location.href,
        hasDocument: typeof document !== 'undefined',
        documentReady: document.readyState,
        bodyContent: document.body ? document.body.textContent.substring(0, 100) : 'No body',
      }
    })

    log(`JavaScript environment: ${JSON.stringify(jsTestResult, null, 2)}`)
  } catch (error) {
    log(`Test error: ${error.message}`)
  }

  await browser.close()

  // Write logs to file for analysis
  const fs = require('fs')
  fs.writeFileSync('/tmp/auth_flow_debug.log', logs.join('\n'))
  log('Debug log written to /tmp/auth_flow_debug.log')
}

// Run the test
testAuthFlow().catch(console.error)
