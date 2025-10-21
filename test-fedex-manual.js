/**
 * Manual FedEx Shipping Test
 * Tests 4 real order scenarios with FedEx shipping verification
 * Uses Puppeteer for better headless server compatibility
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'http://localhost:3020'
const PRODUCT_SLUG = '4x6-flyers-9pt-card-stock'

// Test scenarios
const TEST_USERS = [
  {
    scenario: 'Residential - Ground Home Delivery',
    email: 'residential.test@gangrunprinting.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    address: '123 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    phone: '3105550101',
    isResidential: true,
    expectedService: 'GROUND_HOME_DELIVERY',
    expectedName: 'Home Delivery',
  },
  {
    scenario: 'Business - FedEx Ground',
    email: 'business.test@gangrunprinting.com',
    firstName: 'Michael',
    lastName: 'Thompson',
    company: 'Thompson Enterprises LLC',
    address: '456 Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60173',
    phone: '3125550102',
    isResidential: false,
    expectedService: 'FEDEX_GROUND',
    expectedName: 'Ground',
  },
  {
    scenario: 'Residential - FedEx 2Day',
    email: 'residential2day.test@gangrunprinting.com',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    address: '789 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33139',
    phone: '3055550103',
    isResidential: true,
    expectedService: 'FEDEX_2_DAY',
    expectedName: '2Day',
  },
  {
    scenario: 'Business - Standard Overnight',
    email: 'business.overnight@gangrunprinting.com',
    firstName: 'David',
    lastName: 'Chen',
    company: 'Chen Trading Co',
    address: '321 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10007',
    phone: '2125550104',
    isResidential: false,
    expectedService: 'STANDARD_OVERNIGHT',
    expectedName: 'Overnight',
  },
]

const orderResults = []

async function testOrder(testUser, index, browser) {
  const result = {
    scenario: testUser.scenario,
    success: false,
    fedexRatesFound: 0,
    fedexServices: [],
    selectedService: '',
    selectedServiceName: '',
    shippingCost: '',
    totalCost: '',
    screenshots: [],
    error: null,
  }

  let page

  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🚀 Order ${index + 1}: ${testUser.scenario}`)
    console.log(`${'='.repeat(80)}`)

    page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    // Enable console logging from browser
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('[ShippingMethodSelector]') || text.includes('[FedEx]')) {
        console.log(`   [Browser Console] ${text}`)
      }
    })

    // Step 1: Navigate to product page
    console.log('📍 Step 1: Navigating to product page...')
    await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`, { waitUntil: 'networkidle0', timeout: 30000 })

    const screenshot1 = `test-screenshots/order${index + 1}-step1-product-page.png`
    await page.screenshot({ path: screenshot1, fullPage: true })
    result.screenshots.push(screenshot1)
    console.log(`   ✅ Product page loaded`)

    // Wait for product to load
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Step 2: Add to cart (find and click add to cart button)
    console.log('📍 Step 2: Adding to cart...')

    const addToCartButton = await page.$('button:has-text("Add to Cart"), button[type="submit"]')
    if (addToCartButton) {
      await addToCartButton.click()
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('   ✅ Clicked Add to Cart')
    } else {
      console.log('   ⚠️ Add to Cart button not found, trying alternative selectors...')
      // Try to find any submit button
      const submitBtn = await page.$('button[type="submit"]')
      if (submitBtn) {
        await submitBtn.click()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('   ✅ Clicked submit button')
      }
    }

    const screenshot2 = `test-screenshots/order${index + 1}-step2-added-to-cart.png`
    await page.screenshot({ path: screenshot2, fullPage: true })
    result.screenshots.push(screenshot2)

    // Step 3: Navigate to checkout
    console.log('📍 Step 3: Navigating to checkout...')
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle0', timeout: 30000 })

    const screenshot3 = `test-screenshots/order${index + 1}-step3-checkout-page.png`
    await page.screenshot({ path: screenshot3, fullPage: true })
    result.screenshots.push(screenshot3)

    // Step 4: Fill shipping information
    console.log('📍 Step 4: Filling shipping information...')

    // Fill form fields
    await page.type('input[name="email"], input[type="email"]', testUser.email)
    await page.type('input[name="firstName"]', testUser.firstName)
    await page.type('input[name="lastName"]', testUser.lastName)

    if (testUser.company) {
      const companyInput = await page.$('input[name="company"]')
      if (companyInput) {
        await companyInput.type(testUser.company)
      }
    }

    await page.type('input[name="address"], input[name="street"]', testUser.address)
    await page.type('input[name="city"]', testUser.city)

    // Select state
    await page.select('select[name="state"]', testUser.state)

    await page.type('input[name="zipCode"], input[name="zip"]', testUser.zipCode)
    await page.type('input[name="phone"]', testUser.phone)

    console.log('   ✅ Shipping information filled')

    const screenshot4 = `test-screenshots/order${index + 1}-step4-shipping-filled.png`
    await page.screenshot({ path: screenshot4, fullPage: true })
    result.screenshots.push(screenshot4)

    // Step 5: Continue to shipping method
    console.log('📍 Step 5: Loading shipping rates...')

    // Click continue button if it exists
    const continueBtn = await page.$('button:has-text("Continue"), button:has-text("Next")')
    if (continueBtn) {
      await continueBtn.click()
      console.log('   Clicked Continue button')
    }

    // Wait for shipping rates to load
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const screenshot5 = `test-screenshots/order${index + 1}-step5-loading-rates.png`
    await page.screenshot({ path: screenshot5, fullPage: true })
    result.screenshots.push(screenshot5)

    // Step 6: Verify FedEx rates
    console.log('📍 Step 6: Verifying FedEx shipping rates...')

    // Look for FedEx shipping options
    const fedexElements = await page.$$('[class*="shipping"], [class*="rate"], [data-testid*="shipping"]')

    // Extract text from all shipping-related elements
    const shippingTexts = []
    for (const element of fedexElements) {
      const text = await page.evaluate((el) => el.textContent, element)
      if (text && text.includes('FedEx')) {
        shippingTexts.push(text.trim())
      }
    }

    result.fedexRatesFound = shippingTexts.length
    result.fedexServices = shippingTexts

    console.log(`   ✅ Found ${result.fedexRatesFound} FedEx shipping rates:`)
    shippingTexts.forEach((text) => {
      console.log(`      - ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`)
    })

    const screenshot6 = `test-screenshots/order${index + 1}-step6-fedex-rates.png`
    await page.screenshot({ path: screenshot6, fullPage: true })
    result.screenshots.push(screenshot6)

    // Check if expected service is present
    const expectedServiceFound = shippingTexts.some((text) => text.includes(testUser.expectedName))

    if (expectedServiceFound) {
      console.log(`   ✅ Expected service found: ${testUser.expectedName}`)
      result.selectedService = testUser.expectedService
      result.selectedServiceName = testUser.expectedName
      result.success = true
    } else {
      console.log(`   ❌ Expected service NOT found: ${testUser.expectedName}`)
      result.error = `Expected service "${testUser.expectedName}" not found in available rates`
    }

    // Extract any pricing info
    const priceMatches = shippingTexts.join(' ').match(/\$[\d,]+\.\d{2}/g)
    if (priceMatches && priceMatches.length > 0) {
      result.shippingCost = priceMatches[0]
      console.log(`   💰 First shipping cost found: ${result.shippingCost}`)
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    result.error = error.message

    if (page) {
      const errorScreenshot = `test-screenshots/order${index + 1}-error.png`
      await page.screenshot({ path: errorScreenshot, fullPage: true })
      result.screenshots.push(errorScreenshot)
    }
  } finally {
    if (page) {
      await page.close()
    }
  }

  console.log(`\n📊 Result Summary:`)
  console.log(`   Success: ${result.success ? '✅ YES' : '❌ NO'}`)
  console.log(`   FedEx Rates Found: ${result.fedexRatesFound}`)
  console.log(`   Expected Service: ${testUser.expectedName}`)
  console.log(`   Service Found: ${result.selectedServiceName || 'N/A'}`)
  console.log(`   Shipping Cost: ${result.shippingCost || 'N/A'}`)
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }

  return result
}

async function main() {
  console.log('\n🚀 Starting FedEx Shipping Test Suite')
  console.log('=' + '='.repeat(79) + '\n')

  // Create screenshots directory
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots')
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    for (let i = 0; i < TEST_USERS.length; i++) {
      const result = await testOrder(TEST_USERS[i], i, browser)
      orderResults.push(result)
    }
  } finally {
    await browser.close()
  }

  // Generate report
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 FINAL TEST REPORT')
  console.log('='.repeat(80))

  const successCount = orderResults.filter((r) => r.success).length
  const totalOrders = orderResults.length

  console.log(`\nSUMMARY`)
  console.log(`-------`)
  console.log(`Total Orders: ${totalOrders}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Failed: ${totalOrders - successCount}`)
  console.log(`Success Rate: ${((successCount / totalOrders) * 100).toFixed(1)}%`)

  const avgRates = orderResults.reduce((sum, r) => sum + r.fedexRatesFound, 0) / totalOrders
  console.log(`Average FedEx Rates Found: ${avgRates.toFixed(1)}`)

  console.log(`\nDETAILED RESULTS`)
  console.log(`----------------`)
  orderResults.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.scenario}`)
    console.log(`   Status: ${r.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`   FedEx Rates: ${r.fedexRatesFound}`)
    console.log(`   Expected Service: ${r.selectedServiceName || 'Not Found'}`)
    if (r.error) {
      console.log(`   Error: ${r.error}`)
    }
    console.log(`   Screenshots: ${r.screenshots.length}`)
  })

  console.log(`\nFEDEX SHIPPING VERIFICATION`)
  console.log(`----------------------------`)
  const allHave3Plus = orderResults.every((r) => r.fedexRatesFound >= 3)
  const allExpectedFound = orderResults.every((r) => r.success)

  console.log(`${allHave3Plus ? '✅' : '❌'} All orders showed 3+ FedEx rates`)
  console.log(`${allExpectedFound ? '✅' : '❌'} All expected services were found`)

  console.log(`\nCONCLUSION`)
  console.log(`----------`)
  if (successCount === totalOrders && allHave3Plus && allExpectedFound) {
    console.log(`✅ ALL TESTS PASSED - FedEx shipping is working correctly!`)
  } else {
    console.log(`❌ SOME TESTS FAILED - Review details above`)
  }

  // Write JSON report
  const report = {
    testDate: new Date().toISOString(),
    totalOrders,
    successfulOrders: successCount,
    failedOrders: totalOrders - successCount,
    orders: orderResults,
    summary: {
      allOrdersSuccessful: successCount === totalOrders,
      allExpectedServicesFound: allExpectedFound,
      averageFedexRatesFound: avgRates,
    },
  }

  fs.writeFileSync('fedex-test-report.json', JSON.stringify(report, null, 2))
  console.log(`\n📁 Report saved: fedex-test-report.json`)
  console.log('=' + '='.repeat(79) + '\n')

  process.exit(successCount === totalOrders ? 0 : 1)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
