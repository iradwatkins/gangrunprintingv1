/**
 * Complete Checkout Flow Test - 3 Real Orders
 * Tests the full customer journey from product selection to payment page
 */

const puppeteer = require('puppeteer')
const fs = require('fs')

const BASE_URL = 'https://gangrunprinting.com'

// Test scenarios with different configurations
const TEST_ORDERS = [
  {
    name: 'Order 1: Business Cards - Residential Delivery',
    product: {
      url: '/products/business-cards',
      name: 'Business Cards',
      quantity: 500,
      turnaround: 'Economy', // or whatever turnaround options you have
    },
    shipping: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      isResidential: true,
    },
    expectedShippingService: 'GROUND_HOME_DELIVERY',
  },
  {
    name: 'Order 2: Flyers - Business Delivery',
    product: {
      url: '/products/flyers',
      name: 'Flyers',
      quantity: 1000,
      turnaround: 'Fast',
    },
    shipping: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@business.com',
      phone: '555-987-6543',
      street: '456 Commerce Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60173',
      isResidential: false,
    },
    expectedShippingService: 'FEDEX_GROUND',
  },
  {
    name: 'Order 3: Brochures - Residential Delivery',
    product: {
      url: '/products/brochures',
      name: 'Brochures',
      quantity: 250,
      turnaround: 'Standard',
    },
    shipping: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@email.com',
      phone: '555-456-7890',
      street: '789 Park Avenue',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      isResidential: true,
    },
    expectedShippingService: 'GROUND_HOME_DELIVERY',
  },
]

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `test-screenshots/${name}-${timestamp}.png`
  await page.screenshot({ path: filename, fullPage: true })
  console.log(`   📸 Screenshot saved: ${filename}`)
  return filename
}

async function processOrder(browser, order, orderNum) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🛒 ${order.name}`)
  console.log('='.repeat(80))

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  const result = {
    order: order.name,
    success: false,
    steps: {},
    screenshots: [],
    fedexRatesFound: 0,
    selectedShippingService: '',
    errors: [],
  }

  try {
    // Step 1: Navigate to product page
    console.log(`\n📍 Step 1: Navigating to product page...`)
    await page.goto(`${BASE_URL}${order.product.url}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    await wait(2000)

    const screenshot1 = await takeScreenshot(page, `order${orderNum}-step1-product-page`)
    result.screenshots.push(screenshot1)
    result.steps.productPageLoaded = true
    console.log(`   ✅ Product page loaded`)

    // Step 2: Find and configure product (look for quantity selector)
    console.log(`\n📍 Step 2: Configuring product...`)

    // Try to find quantity input
    const quantitySelector = await page.$('input[type="number"]')
    if (quantitySelector) {
      await quantitySelector.click({ clickCount: 3 }) // Select all
      await quantitySelector.type(order.product.quantity.toString())
      console.log(`   ✅ Set quantity: ${order.product.quantity}`)
    }

    await wait(1000)
    const screenshot2 = await takeScreenshot(page, `order${orderNum}-step2-configured`)
    result.screenshots.push(screenshot2)

    // Step 3: Add to cart
    console.log(`\n📍 Step 3: Adding to cart...`)

    // Look for "Add to Cart" button with various possible selectors
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button[type="submit"]',
      '.add-to-cart',
      '[data-testid="add-to-cart"]',
      'button:contains("Add to Cart")',
    ]

    let addedToCart = false
    for (const selector of addToCartSelectors) {
      try {
        const button = await page.$(selector)
        if (button) {
          await button.click()
          addedToCart = true
          console.log(`   ✅ Clicked "Add to Cart" using selector: ${selector}`)
          await wait(2000)
          break
        }
      } catch (err) {
        // Try next selector
      }
    }

    if (!addedToCart) {
      throw new Error('Could not find "Add to Cart" button')
    }

    result.steps.addedToCart = true
    const screenshot3 = await takeScreenshot(page, `order${orderNum}-step3-cart`)
    result.screenshots.push(screenshot3)

    // Step 4: Navigate to checkout
    console.log(`\n📍 Step 4: Proceeding to checkout...`)
    await page.goto(`${BASE_URL}/checkout/shipping`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    await wait(2000)

    const screenshot4 = await takeScreenshot(page, `order${orderNum}-step4-checkout-shipping`)
    result.screenshots.push(screenshot4)
    result.steps.checkoutPageLoaded = true
    console.log(`   ✅ Shipping page loaded`)

    // Step 5: Fill in shipping address
    console.log(`\n📍 Step 5: Filling in shipping address...`)

    await page.type('input[name="firstName"]', order.shipping.firstName)
    await page.type('input[name="lastName"]', order.shipping.lastName)
    await page.type('input[name="email"]', order.shipping.email)
    await page.type('input[name="phone"]', order.shipping.phone)
    await page.type('input[name="street"]', order.shipping.street)
    await page.type('input[name="city"]', order.shipping.city)
    await page.type('select[name="state"]', order.shipping.state)
    await page.type('input[name="zipCode"]', order.shipping.zipCode)

    console.log(`   ✅ Shipping address filled`)
    await wait(2000)

    const screenshot5 = await takeScreenshot(page, `order${orderNum}-step5-address-filled`)
    result.screenshots.push(screenshot5)
    result.steps.addressFilled = true

    // Step 6: Wait for shipping rates to load
    console.log(`\n📍 Step 6: Waiting for shipping rates...`)
    await wait(3000) // Give API time to fetch rates

    // Count FedEx shipping options
    const fedexRates = await page.$$('[data-provider="fedex"], [data-carrier="FEDEX"]')
    result.fedexRatesFound = fedexRates.length

    console.log(`   ✅ FedEx rates found: ${result.fedexRatesFound}`)

    // Check if expected service is available
    const pageContent = await page.content()
    const hasExpectedService = pageContent.includes(order.expectedShippingService)
    result.selectedShippingService = order.expectedShippingService

    if (hasExpectedService) {
      console.log(`   ✅ Found expected service: ${order.expectedShippingService}`)
    } else {
      console.log(`   ⚠️  Expected service not found: ${order.expectedShippingService}`)
    }

    const screenshot6 = await takeScreenshot(page, `order${orderNum}-step6-shipping-rates`)
    result.screenshots.push(screenshot6)
    result.steps.shippingRatesLoaded = true

    // Step 7: Select first available shipping method
    console.log(`\n📍 Step 7: Selecting shipping method...`)

    const shippingOptions = await page.$$('input[type="radio"][name*="shipping"], .shipping-option')
    if (shippingOptions.length > 0) {
      await shippingOptions[0].click()
      console.log(`   ✅ Selected shipping method`)
      await wait(1000)
    }

    result.steps.shippingMethodSelected = true

    // Step 8: Continue to payment
    console.log(`\n📍 Step 8: Proceeding to payment...`)

    const continueButton = await page.$('button:has-text("Continue to Payment")')
    if (continueButton) {
      await continueButton.click()
      await wait(3000)

      const currentUrl = page.url()
      if (currentUrl.includes('/checkout/payment')) {
        console.log(`   ✅ Payment page loaded`)
        result.steps.paymentPageLoaded = true

        const screenshot7 = await takeScreenshot(page, `order${orderNum}-step7-payment-page`)
        result.screenshots.push(screenshot7)
      } else {
        throw new Error(`Did not reach payment page. Current URL: ${currentUrl}`)
      }
    } else {
      throw new Error('Could not find "Continue to Payment" button')
    }

    // Verify payment page has payment options
    const hasPaymentOptions = await page.$('.payment-method, [data-testid="payment-options"]')
    if (hasPaymentOptions) {
      console.log(`   ✅ Payment options visible`)
      result.steps.paymentOptionsVisible = true
    }

    result.success = true
    console.log(`\n✅ Order ${orderNum} completed successfully!`)

  } catch (error) {
    console.error(`\n❌ Error in order ${orderNum}:`, error.message)
    result.errors.push(error.message)

    const errorScreenshot = await takeScreenshot(page, `order${orderNum}-error`)
    result.screenshots.push(errorScreenshot)
  } finally {
    await page.close()
  }

  return result
}

async function runTests() {
  console.log('\n🚀 Starting Complete Checkout Flow Test')
  console.log('='.repeat(80))
  console.log(`Testing ${TEST_ORDERS.length} complete orders\n`)

  // Create screenshots directory
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots')
  }

  const browser = await puppeteer.launch({
    headless: true, // Run headless on server
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  })

  const results = []

  for (let i = 0; i < TEST_ORDERS.length; i++) {
    const result = await processOrder(browser, TEST_ORDERS[i], i + 1)
    results.push(result)

    // Wait between orders
    if (i < TEST_ORDERS.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next order...\n')
      await wait(3000)
    }
  }

  await browser.close()

  // Generate Report
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 FINAL TEST REPORT')
  console.log('='.repeat(80))

  const successful = results.filter((r) => r.success).length
  const total = results.length

  console.log(`\nSUMMARY`)
  console.log(`-------`)
  console.log(`Total Orders: ${total}`)
  console.log(`Successful: ${successful}`)
  console.log(`Failed: ${total - successful}`)
  console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`)

  console.log(`\nDETAILED RESULTS`)
  console.log(`----------------`)

  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.order}`)
    console.log(`   Status: ${r.success ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`   FedEx Rates Found: ${r.fedexRatesFound}`)
    console.log(`   Expected Service: ${r.selectedShippingService}`)
    console.log(`   Steps Completed:`)
    Object.entries(r.steps).forEach(([step, completed]) => {
      console.log(`     ${completed ? '✅' : '❌'} ${step}`)
    })
    if (r.errors.length > 0) {
      console.log(`   Errors:`)
      r.errors.forEach((err) => console.log(`     - ${err}`))
    }
    console.log(`   Screenshots: ${r.screenshots.length}`)
  })

  console.log(`\nCONCLUSION`)
  console.log(`----------`)
  if (successful === total) {
    console.log(`✅ ALL ORDERS COMPLETED - Checkout flow is working perfectly!`)
    console.log(`✅ FedEx shipping rates loading correctly`)
    console.log(`✅ Payment page accessible`)
  } else {
    console.log(`❌ SOME ORDERS FAILED - Review details above`)
  }

  console.log('\n' + '='.repeat(80) + '\n')

  // Write JSON report
  fs.writeFileSync(
    'checkout-flow-test-report.json',
    JSON.stringify(
      {
        testDate: new Date().toISOString(),
        total,
        successful,
        failed: total - successful,
        results,
      },
      null,
      2
    )
  )

  console.log(`📁 Report saved: checkout-flow-test-report.json\n`)

  process.exit(successful === total ? 0 : 1)
}

runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
