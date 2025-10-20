/**
 * Test Shipping Rates in Browser using Playwright
 * This will actually visit the product page and check shipping rates
 */

import { chromium } from 'playwright'

async function testShippingInBrowser() {
  console.log('🚀 Starting browser test for shipping rates...\n')

  const browser = await chromium.launch({
    headless: true, // Headless mode for server
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Docker/VPS
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  })

  const page = await context.newPage()

  // Listen to console messages
  page.on('console', (msg) => {
    const type = msg.type()
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}]:`, msg.text())
    }
  })

  // Listen to network responses
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/api/shipping/rates')) {
      console.log(`\n📡 Shipping API Response:`)
      console.log(`   Status: ${response.status()}`)
      console.log(`   URL: ${url}`)

      try {
        const data = await response.json()
        console.log(`   Response:`, JSON.stringify(data, null, 2))
      } catch (e) {
        const text = await response.text()
        console.log(`   Raw Response:`, text.substring(0, 500))
      }
    }
  })

  try {
    // Step 1: Go to a product page
    console.log('📄 Step 1: Loading product page...')
    await page.goto('http://gangrunprinting.com/products/4x6-flyers-9pt-card-stock', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    console.log('   ✅ Page loaded')

    // Step 2: Wait for product configuration to load
    console.log('\n⚙️  Step 2: Waiting for product configuration...')
    await page.waitForSelector('[data-testid="quantity-select"], select[name="quantity"]', {
      timeout: 10000,
    })
    console.log('   ✅ Configuration loaded')

    // Step 3: Select a quantity
    console.log('\n📦 Step 3: Selecting quantity...')
    const quantitySelect = await page.locator('select[name="quantity"]').first()
    await quantitySelect.selectOption('250')
    console.log('   ✅ Quantity selected: 250')

    // Wait a bit for price to update
    await page.waitForTimeout(1000)

    // Step 4: Click "Add to Cart"
    console.log('\n🛒 Step 4: Adding to cart...')
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first()
    await addToCartBtn.click()
    console.log('   ✅ Clicked Add to Cart')

    // Wait for cart to update
    await page.waitForTimeout(2000)

    // Step 5: Go to checkout
    console.log('\n💳 Step 5: Going to checkout...')
    await page.goto('http://gangrunprinting.com/checkout', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    console.log('   ✅ Checkout page loaded')

    // Step 6: Fill in shipping address
    console.log('\n📍 Step 6: Filling shipping address...')

    // Fill address fields
    await page.fill('input[name="street"]', '123 Main St')
    await page.fill('input[name="city"]', 'Los Angeles')
    await page.fill('input[name="state"]', 'CA')
    await page.fill('input[name="zipCode"]', '90001')

    console.log('   ✅ Address filled')

    // Step 7: Wait for shipping rates to load
    console.log('\n🚢 Step 7: Waiting for shipping rates...')
    await page.waitForTimeout(3000) // Give time for API call

    // Check if rates loaded
    const ratesContainer = page.locator('[data-testid="shipping-rates"]')
    const hasRates = await ratesContainer.count() > 0

    if (hasRates) {
      console.log('   ✅ Shipping rates container found')

      // Get all rate options
      const rateOptions = await page.locator('[data-testid="shipping-rate-option"]').count()
      console.log(`   📊 Found ${rateOptions} shipping rate options`)

      // Log each rate
      for (let i = 0; i < rateOptions; i++) {
        const rateText = await page.locator('[data-testid="shipping-rate-option"]').nth(i).textContent()
        console.log(`      ${i + 1}. ${rateText}`)
      }
    } else {
      console.log('   ❌ No shipping rates container found')

      // Check for error messages
      const errorMsg = await page.locator('text=/error|failed|unavailable/i').first().textContent().catch(() => null)
      if (errorMsg) {
        console.log(`   ❌ Error message: ${errorMsg}`)
      }
    }

    // Step 8: Take screenshot
    console.log('\n📸 Step 8: Taking screenshot...')
    await page.screenshot({ path: '/root/websites/gangrunprinting/shipping-test-screenshot.png', fullPage: true })
    console.log('   ✅ Screenshot saved: shipping-test-screenshot.png')

    // Step 9: Open DevTools and check network
    console.log('\n🔍 Step 9: Checking network requests...')
    const networkRequests = []
    page.on('request', (request) => {
      if (request.url().includes('shipping')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        })
      }
    })

    // Wait a bit more
    await page.waitForTimeout(2000)

    console.log('\n📊 Network Summary:')
    console.log(`   Total shipping requests: ${networkRequests.length}`)
    networkRequests.forEach((req, i) => {
      console.log(`   ${i + 1}. ${req.method} ${req.url}`)
      if (req.postData) {
        console.log(`      Body: ${req.postData.substring(0, 200)}`)
      }
    })

    console.log('\n✅ Test complete! Browser will stay open for 10 seconds...')
    await page.waitForTimeout(10000)

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    await page.screenshot({ path: '/root/websites/gangrunprinting/shipping-test-error.png', fullPage: true })
    console.log('   📸 Error screenshot saved: shipping-test-error.png')
  } finally {
    await browser.close()
  }
}

// Run the test
testShippingInBrowser().catch(console.error)
