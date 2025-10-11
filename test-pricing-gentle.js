const puppeteer = require('puppeteer')

;(async () => {
  console.log('🚀 Starting GENTLE pricing test on real product...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Track errors
  const errors = []
  const apiCalls = []

  page.on('console', (msg) => {
    const text = msg.text()
    if (
      text.includes('error') ||
      text.includes('Error') ||
      text.includes('[Frontend]') ||
      text.includes('[API]')
    ) {
      console.log(`📋 Console: ${text}`)
    }
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.error(`❌ Page Error: ${error.message}`)
  })

  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/api/pricing/calculate-base')) {
      const status = response.status()
      const contentType = response.headers()['content-type']

      console.log(`\n📡 Pricing API Call Detected`)
      console.log(`   Status: ${status}`)
      console.log(`   Content-Type: ${contentType}`)

      try {
        const body = await response.text()
        const isJSON = contentType && contentType.includes('application/json')

        if (isJSON && status === 200) {
          const data = JSON.parse(body)
          console.log(`   ✅ Valid JSON response`)
          console.log(`   Success: ${data.success}`)
          if (data.basePrice) {
            console.log(`   Base Price: $${data.basePrice.toFixed(2)}`)
          }
        } else if (!isJSON) {
          console.log(`   ❌ Response is HTML, not JSON!`)
          console.log(`   Preview: ${body.substring(0, 100)}`)
        } else if (status !== 200) {
          console.log(`   ❌ Non-200 status: ${status}`)
        }

        apiCalls.push({ url, status, contentType, isJSON, timestamp: new Date().toISOString() })
      } catch (e) {
        console.error(`   ❌ Error: ${e.message}`)
      }
    }
  })

  try {
    console.log('📍 Loading: https://gangrunprinting.com/products/test\n')

    await page.goto('https://gangrunprinting.com/products/test', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    console.log('✅ Page loaded\n')

    // Wait for React to hydrate
    console.log('⏳ Waiting for product form to render...\n')
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Check if form loaded
    const formExists = await page.evaluate(() => {
      const forms = document.querySelectorAll('form')
      const buttons = document.querySelectorAll('button')
      return { formCount: forms.length, buttonCount: buttons.length }
    })

    console.log(
      `📋 Page Elements: ${formExists.formCount} forms, ${formExists.buttonCount} buttons\n`
    )

    // Wait for any API calls to complete
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('\n📊 Test Results:')
    console.log('='.repeat(60))
    console.log(`✅ Page loaded: YES`)
    console.log(`📡 Pricing API calls: ${apiCalls.length}`)
    console.log(`❌ JavaScript errors: ${errors.length}`)

    if (apiCalls.length > 0) {
      console.log('\n📋 API Call Summary:')
      apiCalls.forEach((call, index) => {
        console.log(
          `   ${index + 1}. Status: ${call.status}, JSON: ${call.isJSON ? '✅' : '❌'}, Time: ${call.timestamp}`
        )
      })

      // Check for HTML responses
      const htmlResponses = apiCalls.filter((c) => !c.isJSON)
      if (htmlResponses.length > 0) {
        console.log('\n❌ FAIL: API returned HTML instead of JSON!')
        process.exit(1)
      }
    } else {
      console.log("\n⚠️  No pricing API calls detected (this might be normal if form didn't load)")
    }

    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors:')
      errors.forEach((err) => console.log(`   - ${err}`))
      process.exit(1)
    } else {
      console.log('\n✅ SUCCESS: No errors detected!')
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
    console.log('\n🏁 Test complete!\n')
  }
})()
