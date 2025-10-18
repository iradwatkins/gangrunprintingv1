/**
 * Chrome DevTools Tests for Southwest Cargo Airport Display
 *
 * Tests to diagnose why 82 airports are not showing on /locations page
 * Run with: node test-southwest-chrome-devtools.js
 */

const puppeteer = require('puppeteer')

const BASE_URL = 'http://localhost:3020'

async function runChromeDevToolsTests() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--auto-open-devtools-for-tabs'],
  })

  console.log('🧪 Starting Chrome DevTools Tests for Southwest Cargo Airports\n')

  try {
    // Test 1: API Endpoint Direct Test
    await test1_ApiEndpointDirectTest(browser)

    // Test 2: Locations Page Load Test
    await test2_LocationsPageLoadTest(browser)

    // Test 3: Checkout Airport Selector Test
    await test3_CheckoutAirportSelectorTest(browser)
  } catch (error) {
    console.error('❌ Test suite error:', error)
  } finally {
    console.log('\n✅ Chrome DevTools tests complete. Press Enter to close browser...')
    // Keep browser open for manual inspection
    await new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve()
      })
    })
    await browser.close()
  }
}

/**
 * Test 1: Direct API Endpoint Test
 * Check if /api/airports returns the 82 Southwest Cargo airports
 */
async function test1_ApiEndpointDirectTest(browser) {
  console.log('📋 TEST 1: Direct API Endpoint Test')
  console.log('=' .repeat(60))

  const page = await browser.newPage()

  // Enable console logging
  page.on('console', (msg) => {
    console.log(`   [Browser Console] ${msg.type()}: ${msg.text()}`)
  })

  // Enable network monitoring
  const apiResponses = []
  page.on('response', async (response) => {
    if (response.url().includes('/api/airports')) {
      try {
        const data = await response.json()
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          data: data,
        })
      } catch (e) {
        // Not JSON
      }
    }
  })

  try {
    console.log('   → Navigating to /api/airports endpoint...')
    await page.goto(`${BASE_URL}/api/airports`, { waitUntil: 'networkidle0' })

    // Get the response content
    const responseText = await page.evaluate(() => document.body.innerText)
    const responseData = JSON.parse(responseText)

    console.log(`\n   ✓ API Response Status: ${responseData.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`   ✓ Airports Count: ${responseData.count || 0}`)
    console.log(`   ✓ Airports Array Length: ${responseData.airports?.length || 0}`)

    if (responseData.airports && responseData.airports.length > 0) {
      console.log(`\n   📍 Sample Airport Data (first airport):`)
      console.log(JSON.stringify(responseData.airports[0], null, 2))

      // Check for specific Southwest airports
      const sampleCodes = ['MDW', 'ATL', 'DAL', 'PHX', 'LAS']
      console.log(`\n   🔍 Checking for sample Southwest airports:`)
      sampleCodes.forEach((code) => {
        const found = responseData.airports.find((a) => a.code === code)
        console.log(`      ${code}: ${found ? '✅ Found' : '❌ Missing'}`)
      })
    } else {
      console.log(`\n   ⚠️  WARNING: No airports returned from API`)
    }

    // Check database query in DevTools Network tab
    console.log(`\n   💡 Action Required:`)
    console.log(`      1. Check Network tab in DevTools`)
    console.log(`      2. Verify /api/airports request/response`)
    console.log(`      3. Check database connection`)
  } catch (error) {
    console.error(`   ❌ Test 1 Failed:`, error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

/**
 * Test 2: Locations Page Load Test
 * Check if the /locations page fetches and displays airports
 */
async function test2_LocationsPageLoadTest(browser) {
  console.log('📋 TEST 2: Locations Page Load Test')
  console.log('=' .repeat(60))

  const page = await browser.newPage()

  // Enable console logging
  page.on('console', (msg) => {
    const text = msg.text()
    // Filter for our specific logs
    if (text.includes('airports') || text.includes('Southwest') || text.includes('fetch')) {
      console.log(`   [Browser Console] ${msg.type()}: ${text}`)
    }
  })

  // Track network requests
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('/api/airports')) {
      requests.push({
        url: request.url(),
        method: request.method(),
      })
      console.log(`   📡 API Request: ${request.method()} ${request.url()}`)
    }
  })

  // Track network responses
  page.on('response', async (response) => {
    if (response.url().includes('/api/airports')) {
      try {
        const data = await response.json()
        console.log(`   📥 API Response: Status ${response.status()}`)
        console.log(`      Airports in response: ${data.airports?.length || 0}`)
      } catch (e) {
        console.log(`   ⚠️  API Response: Could not parse JSON`)
      }
    }
  })

  try {
    console.log('   → Navigating to /locations page...')
    await page.goto(`${BASE_URL}/locations`, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    })

    // Wait for the page to be interactive
    await page.waitForSelector('button, a', { timeout: 5000 })

    // Check if "Air Cargo Pickup" tab exists
    console.log(`\n   🔍 Checking for Air Cargo tab...`)
    const cargoTabExists = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'))
      return tabs.some((tab) => tab.textContent?.includes('Air Cargo'))
    })
    console.log(`      Air Cargo tab: ${cargoTabExists ? '✅ Found' : '❌ Missing'}`)

    // Click the Air Cargo tab if it exists
    if (cargoTabExists) {
      console.log(`\n   👆 Clicking Air Cargo tab...`)
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button'))
        const cargoTab = tabs.find((tab) => tab.textContent?.includes('Air Cargo'))
        cargoTab?.click()
      })

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Check for loading state
      const isLoading = await page.evaluate(() => {
        return document.body.innerText.includes('Loading air cargo locations')
      })
      console.log(`      Loading state: ${isLoading ? '⏳ Still loading' : '✅ Loaded'}`)

      // Check for airport cards
      const airportCount = await page.evaluate(() => {
        // Look for location cards with airport codes (badges)
        const badges = Array.from(document.querySelectorAll('[class*="badge"]'))
        const airportCodes = badges.filter((badge) => {
          const text = badge.textContent || ''
          return /^[A-Z]{3}$/.test(text.trim())
        })
        return airportCodes.length
      })
      console.log(`      Airport cards displayed: ${airportCount}`)

      // Check for empty state
      const hasEmptyState = await page.evaluate(() => {
        return (
          document.body.innerText.includes('No air cargo locations found') ||
          document.body.innerText.includes('No airports')
        )
      })
      console.log(`      Empty state shown: ${hasEmptyState ? '❌ Yes (BAD)' : '✅ No (GOOD)'}`)

      // Get the actual count shown in UI
      const displayedCount = await page.evaluate(() => {
        const text = document.body.innerText
        const match = text.match(/(\d+).*Southwest.*Cargo.*[Ll]ocations?/)
        return match ? parseInt(match[1]) : 0
      })
      console.log(`      Count shown in UI: ${displayedCount}`)

      // Screenshot the cargo tab
      console.log(`\n   📸 Taking screenshot of Air Cargo tab...`)
      await page.screenshot({
        path: 'test-results-locations-cargo-tab.png',
        fullPage: true,
      })
      console.log(`      Screenshot saved: test-results-locations-cargo-tab.png`)
    }

    // Check React state via DevTools
    console.log(`\n   💡 Manual Inspection Tasks:`)
    console.log(`      1. Open React DevTools`)
    console.log(`      2. Find LocationsPage component`)
    console.log(`      3. Check 'airCargoLocations' state`)
    console.log(`      4. Check 'isLoadingAirports' state`)
    console.log(`      5. Verify useEffect executed`)
  } catch (error) {
    console.error(`   ❌ Test 2 Failed:`, error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

/**
 * Test 3: Checkout Airport Selector Test
 * Check if airports appear in checkout flow
 */
async function test3_CheckoutAirportSelectorTest(browser) {
  console.log('📋 TEST 3: Checkout Airport Selector Test')
  console.log('=' .repeat(60))

  const page = await browser.newPage()

  // Enable console logging
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('airport') || text.includes('Southwest')) {
      console.log(`   [Browser Console] ${msg.type()}: ${text}`)
    }
  })

  // Track API calls
  page.on('response', async (response) => {
    if (response.url().includes('/api/airports')) {
      try {
        const data = await response.json()
        console.log(`   📥 Airports API called in checkout`)
        console.log(`      Count: ${data.airports?.length || 0}`)
      } catch (e) {
        // Ignore
      }
    }
  })

  try {
    console.log('   → Note: This test requires a product in cart to access checkout')
    console.log('   → Attempting to navigate to checkout page...\n')

    // Try to navigate to checkout (may require auth/cart items)
    await page.goto(`${BASE_URL}/checkout`, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    })

    // Check if we're redirected or blocked
    const currentUrl = page.url()
    console.log(`   Current URL: ${currentUrl}`)

    if (currentUrl.includes('/checkout')) {
      console.log(`   ✅ Reached checkout page\n`)

      // Look for airport selector
      const hasAirportSelector = await page.evaluate(() => {
        return (
          document.body.innerText.includes('Airport') ||
          document.body.innerText.includes('pickup location')
        )
      })
      console.log(`   Airport selector present: ${hasAirportSelector ? '✅ Yes' : '❌ No'}`)

      if (hasAirportSelector) {
        // Try to find and interact with selector
        const airportOptions = await page.evaluate(() => {
          const selects = Array.from(document.querySelectorAll('select, [role="combobox"]'))
          return selects.length
        })
        console.log(`   Dropdown elements found: ${airportOptions}`)
      }
    } else {
      console.log(`   ⚠️  Redirected away from checkout (likely requires cart items)`)
      console.log(`\n   💡 To test checkout airport selector:`)
      console.log(`      1. Add a product to cart`)
      console.log(`      2. Proceed to checkout`)
      console.log(`      3. Select Southwest Cargo shipping`)
      console.log(`      4. Verify airport selector appears with all 82 airports`)
    }
  } catch (error) {
    console.error(`   ❌ Test 3 Error:`, error.message)
    console.log(`\n   💡 Manual test required for checkout flow`)
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

// Run the tests
runChromeDevToolsTests().catch(console.error)
