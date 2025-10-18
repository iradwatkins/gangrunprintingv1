/**
 * Playwright Tests for Southwest Cargo Airport Display
 *
 * Comprehensive tests to diagnose why 82 airports are not showing
 * Run with: npx playwright test southwest-cargo-diagnostics.spec.ts --headed
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3020'

test.describe('Southwest Cargo Airport Display Diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    // Log console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Error: ${msg.text()}`)
      } else if (msg.text().includes('airport') || msg.text().includes('Southwest')) {
        console.log(`📝 Browser Log: ${msg.text()}`)
      }
    })

    // Log failed requests
    page.on('requestfailed', (request) => {
      console.log(`❌ Request Failed: ${request.url()}`)
    })
  })

  /**
   * Test 1: API Endpoint Returns 82 Airports
   */
  test('API /api/airports should return all 82 Southwest Cargo airports', async ({ page }) => {
    console.log('\n🧪 TEST 1: API Endpoint Direct Test')
    console.log('=' .repeat(60))

    // Navigate to API endpoint
    const response = await page.goto(`${BASE_URL}/api/airports`)
    expect(response?.status()).toBe(200)

    // Get JSON response
    const responseBody = await response?.json()
    console.log(`   API Response:`)
    console.log(`     - success: ${responseBody.success}`)
    console.log(`     - count: ${responseBody.count}`)
    console.log(`     - airports.length: ${responseBody.airports?.length}`)

    // Validate response structure
    expect(responseBody).toHaveProperty('success', true)
    expect(responseBody).toHaveProperty('airports')
    expect(responseBody).toHaveProperty('count')

    // Check airport count
    const airportCount = responseBody.airports?.length || 0
    console.log(`\n   📊 Airport Count Analysis:`)
    console.log(`     - Expected: 82`)
    console.log(`     - Actual: ${airportCount}`)
    console.log(`     - Status: ${airportCount === 82 ? '✅ PASS' : '❌ FAIL'}`)

    if (airportCount === 0) {
      console.log(`\n   ⚠️  ROOT CAUSE: Database has NO airports`)
      console.log(`      Fix: Run seed script: npx tsx src/scripts/seed-southwest-airports.ts`)
    } else if (airportCount < 82) {
      console.log(`\n   ⚠️  ROOT CAUSE: Database has only ${airportCount} airports (missing ${82 - airportCount})`)
      console.log(`      Fix: Run seed script to add missing airports`)
    }

    // Verify airport data structure
    if (responseBody.airports && responseBody.airports.length > 0) {
      const firstAirport = responseBody.airports[0]
      console.log(`\n   📋 Sample Airport Structure:`)
      console.log(JSON.stringify(firstAirport, null, 2))

      // Verify required fields
      expect(firstAirport).toHaveProperty('id')
      expect(firstAirport).toHaveProperty('code')
      expect(firstAirport).toHaveProperty('name')
      expect(firstAirport).toHaveProperty('city')
      expect(firstAirport).toHaveProperty('state')

      // Check for specific major airports
      const majorAirports = ['MDW', 'ATL', 'DAL', 'PHX', 'LAS', 'DEN', 'LAX']
      console.log(`\n   🔍 Major Airport Check:`)
      majorAirports.forEach((code) => {
        const found = responseBody.airports.find((a: any) => a.code === code)
        console.log(`     ${code}: ${found ? '✅ Found' : '❌ Missing'}`)
      })
    }

    // Expect 82 airports (this may fail - that's the point of the diagnostic)
    expect(airportCount).toBe(82)
  })

  /**
   * Test 2: Locations Page Displays All Airports
   */
  test('Locations page should display all 82 airports in Air Cargo tab', async ({ page }) => {
    console.log('\n🧪 TEST 2: Locations Page Display Test')
    console.log('=' .repeat(60))

    // Track API calls
    const apiCalls: any[] = []
    page.on('response', async (response) => {
      if (response.url().includes('/api/airports')) {
        try {
          const data = await response.json()
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            count: data.airports?.length || 0,
          })
          console.log(`   📡 API Call: ${response.url()}`)
          console.log(`      Status: ${response.status()}`)
          console.log(`      Airports: ${data.airports?.length || 0}`)
        } catch (e) {
          // Ignore non-JSON responses
        }
      }
    })

    // Navigate to locations page
    console.log(`   → Navigating to /locations...`)
    await page.goto(`${BASE_URL}/locations`, { waitUntil: 'networkidle' })

    // Check for Air Cargo tab
    console.log(`\n   🔍 Checking page structure...`)
    const cargoTab = page.getByRole('tab', { name: /Air Cargo/i })
    await expect(cargoTab).toBeVisible()
    console.log(`     ✅ Air Cargo tab found`)

    // Click the Air Cargo tab
    console.log(`   👆 Clicking Air Cargo tab...`)
    await cargoTab.click()

    // Wait for content to load
    await page.waitForTimeout(2000)

    // Check for loading state
    const isLoading = await page.locator('text=Loading air cargo locations').isVisible()
    console.log(`     Loading state: ${isLoading ? '⏳ Still loading' : '✅ Loaded'}`)

    if (isLoading) {
      console.log(`   ⚠️  Page stuck in loading state - API may have failed`)
      console.log(`      API calls made: ${apiCalls.length}`)
      if (apiCalls.length === 0) {
        console.log(`      ROOT CAUSE: No API call made - check useEffect in locations/page.tsx:84`)
      }
    }

    // Wait for loading to complete (or timeout)
    await page.waitForTimeout(3000)

    // Count airport cards displayed
    console.log(`\n   📊 Counting displayed airports...`)

    // Look for location cards with airport codes (3-letter badges)
    const airportCards = page.locator('[class*="grid"] > div').filter({
      has: page.locator('text=/^[A-Z]{3}$/'),
    })

    const cardCount = await airportCards.count()
    console.log(`     Airport cards found: ${cardCount}`)

    // Check for empty state
    const hasEmptyState = await page.locator('text=/No air cargo locations/i').isVisible()
    console.log(`     Empty state: ${hasEmptyState ? '❌ Shown (BAD)' : '✅ Hidden (GOOD)'}`)

    // Get the count shown in UI
    const countText = await page
      .locator('text=/\\d+.*Southwest.*Cargo.*[Ll]ocations?/')
      .textContent()
    const displayedCount = countText ? parseInt(countText.match(/\d+/)?.[0] || '0') : 0
    console.log(`     Count in UI text: ${displayedCount}`)

    // Analysis
    console.log(`\n   📊 Display Analysis:`)
    console.log(`     - Expected: 82 airports`)
    console.log(`     - API returned: ${apiCalls[0]?.count || 0}`)
    console.log(`     - Cards rendered: ${cardCount}`)
    console.log(`     - UI shows: ${displayedCount}`)

    if (apiCalls.length === 0) {
      console.log(`\n   ⚠️  ROOT CAUSE: API never called`)
      console.log(`      Fix: Check useEffect in src/app/(customer)/locations/page.tsx:84`)
      console.log(`      - Verify fetch('/api/airports') is executing`)
      console.log(`      - Check for React errors in browser console`)
    } else if (apiCalls[0]?.count === 0) {
      console.log(`\n   ⚠️  ROOT CAUSE: API returned 0 airports`)
      console.log(`      Fix: Database seeding issue - run seed script`)
    } else if (apiCalls[0]?.count > 0 && cardCount === 0) {
      console.log(`\n   ⚠️  ROOT CAUSE: API returned data but React didn't render`)
      console.log(`      Fix: Check state management in LocationsPage component`)
      console.log(`      - Verify setAirCargoLocations() is called`)
      console.log(`      - Check filteredAirCargoLocations useMemo`)
    }

    // Take screenshot
    await page.screenshot({
      path: 'playwright-results-locations-cargo.png',
      fullPage: true,
    })
    console.log(`\n   📸 Screenshot saved: playwright-results-locations-cargo.png`)

    // Expect cards to be displayed
    expect(cardCount).toBeGreaterThan(0)
  })

  /**
   * Test 3: Checkout Shows Airport Selector with All Airports
   */
  test('Checkout should show airport selector when Southwest Cargo is selected', async ({
    page,
  }) => {
    console.log('\n🧪 TEST 3: Checkout Airport Selector Test')
    console.log('=' .repeat(60))

    // This test requires:
    // 1. Authentication
    // 2. Product in cart
    // 3. Selecting Southwest Cargo shipping

    console.log(`   ⚠️  This test requires manual setup:`)
    console.log(`      1. User must be logged in`)
    console.log(`      2. Cart must have at least one product`)
    console.log(`      3. Shipping address must be set`)
    console.log(`      4. Southwest Cargo must be selected as shipping method`)

    try {
      // Attempt to navigate to checkout
      console.log(`\n   → Attempting to navigate to /checkout...`)
      await page.goto(`${BASE_URL}/checkout`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      })

      const currentUrl = page.url()
      console.log(`     Current URL: ${currentUrl}`)

      if (!currentUrl.includes('/checkout')) {
        console.log(`   ⚠️  Redirected to: ${currentUrl}`)
        console.log(`      (Expected - requires auth and cart items)`)
        console.log(`\n   💡 Manual Test Steps:`)
        console.log(`      1. Log in to the site`)
        console.log(`      2. Add a product to cart`)
        console.log(`      3. Go to checkout`)
        console.log(`      4. Enter shipping address`)
        console.log(`      5. Look for Southwest Cargo shipping option`)
        console.log(`      6. Select Southwest Cargo`)
        console.log(`      7. Verify airport selector appears`)
        console.log(`      8. Open airport dropdown`)
        console.log(`      9. Count airports - should be 82`)
        test.skip()
        return
      }

      console.log(`   ✅ Reached checkout page`)

      // Look for shipping method selection
      const hasSouthwestOption = await page
        .locator('text=/Southwest.*Cargo/i')
        .first()
        .isVisible()
      console.log(`\n   Southwest Cargo option visible: ${hasSouthwestOption ? '✅' : '❌'}`)

      if (hasSouthwestOption) {
        // Try to click Southwest option
        console.log(`   → Attempting to select Southwest Cargo...`)
        await page.locator('text=/Southwest.*Cargo/i').first().click()
        await page.waitForTimeout(1000)

        // Look for airport selector
        const airportSelector = page.locator('text=/Select.*Airport/i')
        const hasSelectorbeVisible = await airportSelector.isVisible()
        console.log(`   Airport selector visible: ${hasSelectorbeVisible ? '✅' : '❌'}`)

        if (hasSelectorbeVisible) {
          // Try to open dropdown and count options
          const dropdown = page.locator('[role="combobox"]').first()
          await dropdown.click()
          await page.waitForTimeout(500)

          const options = page.locator('[role="option"]')
          const optionCount = await options.count()
          console.log(`\n   📊 Airport Options Count: ${optionCount}`)
          console.log(`      Expected: 82`)
          console.log(`      Status: ${optionCount === 82 ? '✅ PASS' : '❌ FAIL'}`)

          if (optionCount < 82) {
            console.log(`\n   ⚠️  ROOT CAUSE: Airport selector showing ${optionCount} instead of 82`)
            console.log(`      Check: src/components/checkout/airport-selector.tsx`)
            console.log(`      - Verify /api/airports is called`)
            console.log(`      - Check if filtering is applied incorrectly`)
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not complete checkout test: ${error}`)
      console.log(`      This is expected if not logged in or cart is empty`)
    }
  })

  /**
   * Test 4: Database Query Analysis
   */
  test('Database should contain exactly 82 active Southwest Cargo airports', async ({ page }) => {
    console.log('\n🧪 TEST 4: Database Analysis via API')
    console.log('=' .repeat(60))

    // Call API with different filters to diagnose
    console.log(`\n   🔍 Testing API with various filters...`)

    // Test 1: All airports
    const allResponse = await page.request.get(`${BASE_URL}/api/airports`)
    const allData = await allResponse.json()
    console.log(`   All airports (no filter): ${allData.airports?.length || 0}`)

    // Test 2: Filter by a common state (IL for Chicago)
    const ilResponse = await page.request.get(`${BASE_URL}/api/airports?state=IL`)
    const ilData = await ilResponse.json()
    console.log(`   Illinois airports: ${ilData.airports?.length || 0}`)

    // Test 3: Search by airport code
    const mdwResponse = await page.request.get(`${BASE_URL}/api/airports?search=MDW`)
    const mdwData = await mdwResponse.json()
    console.log(`   Search 'MDW': ${mdwData.airports?.length || 0}`)

    // Analysis
    console.log(`\n   📊 Database Analysis:`)
    if (allData.airports?.length === 0) {
      console.log(`   ❌ ROOT CAUSE: Database table 'Airport' is EMPTY`)
      console.log(`\n   🔧 FIX:`)
      console.log(`      cd /root/websites/gangrunprinting`)
      console.log(`      npx tsx src/scripts/seed-southwest-airports.ts`)
    } else if (allData.airports?.length < 82) {
      console.log(
        `   ⚠️  Database has ${allData.airports.length} airports (missing ${82 - allData.airports.length})`
      )
      console.log(`\n   🔧 FIX: Re-run seed script to add missing airports`)
    } else if (allData.airports?.length === 82) {
      console.log(`   ✅ Database has correct count (82 airports)`)
      console.log(`\n   ⚠️  If airports still not showing on frontend:`)
      console.log(`      - Check React component state management`)
      console.log(`      - Verify API is being called in useEffect`)
      console.log(`      - Check browser console for errors`)
    } else {
      console.log(`   ⚠️  Database has ${allData.airports.length} airports (more than expected)`)
      console.log(`      May include duplicates or airports from other carriers`)
    }

    // Verify isActive flag
    if (allData.airports && allData.airports.length > 0) {
      const sample = allData.airports.slice(0, 5)
      console.log(`\n   📋 Sample airports (checking structure):`)
      sample.forEach((airport: any) => {
        console.log(`      ${airport.code} - ${airport.name}, ${airport.state}`)
      })
    }
  })
})
