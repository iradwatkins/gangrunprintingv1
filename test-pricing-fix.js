const puppeteer = require('puppeteer')

;(async () => {
  console.log('🚀 Starting pricing calculation test on REAL product...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Capture console logs and errors
  const logs = []
  const errors = []

  page.on('console', (msg) => {
    const text = msg.text()
    logs.push(text)
    if (text.includes('[Frontend]') || text.includes('[API]') || text.includes('error')) {
      console.log(`📋 Console: ${text}`)
    }
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.error(`❌ Page Error: ${error.message}`)
  })

  page.on('requestfailed', (request) => {
    console.error(`❌ Request Failed: ${request.url()} - ${request.failure().errorText}`)
  })

  // Track API calls
  const apiCalls = []
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/api/pricing/calculate-base')) {
      const status = response.status()
      const contentType = response.headers()['content-type']

      console.log(`\n📡 API Call to /api/pricing/calculate-base`)
      console.log(`   Status: ${status}`)
      console.log(`   Content-Type: ${contentType}`)

      try {
        const body = await response.text()
        const isJSON = contentType && contentType.includes('application/json')

        if (isJSON) {
          const data = JSON.parse(body)
          console.log(`   ✅ Response is valid JSON`)
          console.log(`   Success: ${data.success}`)
          if (data.basePrice) {
            console.log(`   Base Price: $${data.basePrice.toFixed(2)}`)
          }
          if (data.error) {
            console.log(`   Error: ${data.error}`)
          }
        } else {
          console.log(`   ❌ Response is NOT JSON!`)
          console.log(`   First 200 chars: ${body.substring(0, 200)}`)
        }

        apiCalls.push({
          url,
          status,
          contentType,
          isJSON,
          timestamp: new Date().toISOString(),
        })
      } catch (e) {
        console.error(`   ❌ Error parsing response: ${e.message}`)
      }
    }
  })

  try {
    console.log('📍 Navigating to: https://gangrunprinting.com/products/test\n')

    await page.goto('https://gangrunprinting.com/products/test', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    console.log('✅ Page loaded successfully\n')

    // Wait for product configuration form to load
    console.log('⏳ Waiting for product form to load...\n')
    await page.waitForSelector('[class*="product"]', { timeout: 10000 })

    // Wait a bit for initial price calculation
    await page.waitForTimeout(5000)

    // Try to interact with the form - select different options to trigger price calculations
    console.log('🎯 Testing price calculations by changing options...\n')

    // Look for quantity selector
    const quantitySelectors = await page.$$('select, input[type="radio"]')
    if (quantitySelectors.length > 0) {
      console.log(`   Found ${quantitySelectors.length} form controls`)

      // Try to change a few options to trigger API calls
      for (let i = 0; i < Math.min(3, quantitySelectors.length); i++) {
        try {
          await quantitySelectors[i].click()
          await page.waitForTimeout(2000) // Wait for API call
        } catch (e) {
          // Some elements might not be clickable
        }
      }
    }

    // Wait for any final API calls
    await page.waitForTimeout(3000)

    // Check for errors on page
    const pageErrors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]')
      return Array.from(errorElements).map((el) => el.textContent)
    })

    console.log('\n📊 Test Results:')
    console.log('='.repeat(60))
    console.log(`✅ Page loaded: YES`)
    console.log(`📡 API calls made: ${apiCalls.length}`)
    console.log(`❌ JavaScript errors: ${errors.length}`)
    console.log(`⚠️  Page errors shown: ${pageErrors.length}`)

    if (apiCalls.length > 0) {
      console.log('\n📋 API Call Summary:')
      apiCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. Status: ${call.status}, JSON: ${call.isJSON ? '✅' : '❌'}`)
      })
    }

    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors Detected:')
      errors.forEach((err) => console.log(`   - ${err}`))
    } else {
      console.log('\n✅ No JavaScript errors detected!')
    }

    if (pageErrors.length > 0) {
      console.log('\n⚠️  Error Messages on Page:')
      pageErrors.forEach((err) => console.log(`   - ${err}`))
    }

    // Check if the specific error message appears in logs
    const hasJSONParseError = logs.some(
      (log) =>
        log.includes('Unexpected token') ||
        log.includes('is not valid JSON') ||
        log.includes('SyntaxError')
    )

    if (hasJSONParseError) {
      console.log('\n❌ FAIL: JSON parse errors still occurring!')
      process.exit(1)
    } else {
      console.log('\n✅ SUCCESS: No JSON parse errors detected!')
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
    console.log('\n🏁 Test complete!\n')
  }
})()
