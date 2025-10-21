import { test, expect } from '@playwright/test'
import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * FedEx Shipping Real Orders Test
 * Tests 4 complete order scenarios with FedEx shipping verification
 *
 * Test Scenarios:
 * 1. Residential - Ground Home Delivery (Los Angeles, CA)
 * 2. Business - FedEx Ground (Chicago, IL)
 * 3. Residential - FedEx 2Day (Miami, FL)
 * 4. Business - Standard Overnight (New York, NY)
 */

const BASE_URL = 'http://localhost:3020'
const PRODUCT_SLUG = '4x6-flyers-9pt-card-stock'

// Test user data
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
    phone: '(310) 555-0101',
    isResidential: true,
    expectedService: 'GROUND_HOME_DELIVERY',
    expectedName: 'FedEx Home Delivery',
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
    phone: '(312) 555-0102',
    isResidential: false,
    expectedService: 'FEDEX_GROUND',
    expectedName: 'FedEx Ground',
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
    phone: '(305) 555-0103',
    isResidential: true,
    expectedService: 'FEDEX_2_DAY',
    expectedName: 'FedEx 2Day',
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
    phone: '(212) 555-0104',
    isResidential: false,
    expectedService: 'STANDARD_OVERNIGHT',
    expectedName: 'FedEx Standard Overnight',
  },
]

interface OrderResult {
  scenario: string
  success: boolean
  fedexRatesFound: number
  fedexServices: string[]
  selectedService: string
  selectedServiceName: string
  shippingCost: string
  totalCost: string
  orderId?: string
  error?: string
  screenshots: string[]
}

const orderResults: OrderResult[] = []

test.describe('FedEx Shipping - 4 Real Orders', () => {
  test.setTimeout(120000) // 2 minutes per test

  for (const [index, testUser] of TEST_USERS.entries()) {
    test(`Order ${index + 1}: ${testUser.scenario}`, async ({ page }) => {
      const result: OrderResult = {
        scenario: testUser.scenario,
        success: false,
        fedexRatesFound: 0,
        fedexServices: [],
        selectedService: '',
        selectedServiceName: '',
        shippingCost: '',
        totalCost: '',
        screenshots: [],
      }

      try {
        console.log(`\n${'='.repeat(60)}`)
        console.log(`🚀 Starting: ${testUser.scenario}`)
        console.log(`${'='.repeat(60)}`)

        // Step 1: Navigate to product page
        console.log('📍 Step 1: Navigating to product page...')
        await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`)
        await page.waitForLoadState('networkidle')

        const screenshot1 = `order${index + 1}-step1-product-page.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot1}`, fullPage: true })
        result.screenshots.push(screenshot1)
        console.log('✅ Product page loaded')

        // Step 2: Configure product (select quantity)
        console.log('📍 Step 2: Configuring product...')

        // Wait for quantity selector
        await page.waitForSelector('[data-testid="quantity-select"], select[name="quantity"], .quantity-selector', { timeout: 10000 })

        // Select quantity 250
        const quantitySelector = await page.$('select[name="quantity"]') || await page.$('[data-testid="quantity-select"]')
        if (quantitySelector) {
          await quantitySelector.selectOption('250')
          console.log('✅ Selected quantity: 250')
        }

        // Wait a moment for pricing to update
        await page.waitForTimeout(1000)

        const screenshot2 = `order${index + 1}-step2-configured.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot2}`, fullPage: true })
        result.screenshots.push(screenshot2)

        // Step 3: Add to cart
        console.log('📍 Step 3: Adding to cart...')
        const addToCartButton = await page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
        await addToCartButton.click()
        await page.waitForTimeout(2000) // Wait for cart update
        console.log('✅ Added to cart')

        // Step 4: Go to checkout
        console.log('📍 Step 4: Navigating to checkout...')
        await page.goto(`${BASE_URL}/checkout`)
        await page.waitForLoadState('networkidle')

        const screenshot3 = `order${index + 1}-step3-checkout-start.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot3}`, fullPage: true })
        result.screenshots.push(screenshot3)

        // Step 5: Fill shipping information
        console.log('📍 Step 5: Filling shipping information...')

        await page.fill('input[name="email"], input[type="email"]', testUser.email)
        await page.fill('input[name="firstName"]', testUser.firstName)
        await page.fill('input[name="lastName"]', testUser.lastName)

        if (testUser.company) {
          const companyInput = await page.$('input[name="company"]')
          if (companyInput) {
            await companyInput.fill(testUser.company)
          }
        }

        await page.fill('input[name="address"], input[name="street"]', testUser.address)
        await page.fill('input[name="city"]', testUser.city)

        // Select state
        const stateSelector = await page.$('select[name="state"]')
        if (stateSelector) {
          await stateSelector.selectOption(testUser.state)
        }

        await page.fill('input[name="zipCode"], input[name="zip"]', testUser.zipCode)
        await page.fill('input[name="phone"]', testUser.phone)

        // Set residential/business flag if available
        if (testUser.isResidential) {
          const residentialCheckbox = await page.$('input[name="isResidential"], input[type="checkbox"][name="residential"]')
          if (residentialCheckbox) {
            await residentialCheckbox.check()
          }
        }

        await page.waitForTimeout(1000)

        const screenshot4 = `order${index + 1}-step4-shipping-filled.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot4}`, fullPage: true })
        result.screenshots.push(screenshot4)

        console.log('✅ Shipping information filled')

        // Step 6: Continue to shipping method selection
        console.log('📍 Step 6: Loading shipping rates...')

        // Click continue or next button
        const continueButton = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Continue to Shipping")').first()
        if (await continueButton.isVisible()) {
          await continueButton.click()
          await page.waitForTimeout(3000) // Wait for shipping rates to load
        }

        // Step 7: Verify FedEx rates appear
        console.log('📍 Step 7: Verifying FedEx shipping rates...')

        // Wait for shipping options to appear
        await page.waitForSelector('[data-testid="shipping-option"], .shipping-rate, .shipping-method', { timeout: 15000 })

        // Count FedEx rates
        const fedexRates = await page.locator('[data-testid="shipping-option"]:has-text("FedEx"), .shipping-rate:has-text("FedEx"), .shipping-method:has-text("FedEx")').all()
        result.fedexRatesFound = fedexRates.length

        console.log(`✅ Found ${result.fedexRatesFound} FedEx shipping rates`)

        // Extract service names
        for (const rate of fedexRates) {
          const serviceName = await rate.textContent()
          if (serviceName) {
            result.fedexServices.push(serviceName.trim())
            console.log(`   - ${serviceName.trim()}`)
          }
        }

        const screenshot5 = `order${index + 1}-step5-shipping-rates.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot5}`, fullPage: true })
        result.screenshots.push(screenshot5)

        // Step 8: Verify expected service is present
        console.log(`📍 Step 8: Looking for expected service: ${testUser.expectedName}...`)

        const expectedServiceLocator = await page.locator(
          `[data-testid="shipping-option"]:has-text("${testUser.expectedName}"),
           .shipping-rate:has-text("${testUser.expectedName}"),
           .shipping-method:has-text("${testUser.expectedName}")`
        ).first()

        const serviceExists = await expectedServiceLocator.count() > 0

        if (serviceExists) {
          console.log(`✅ Expected service found: ${testUser.expectedName}`)
          result.selectedService = testUser.expectedService
          result.selectedServiceName = testUser.expectedName

          // Click to select this shipping method
          await expectedServiceLocator.click()
          await page.waitForTimeout(1000)

          // Extract shipping cost
          const shippingCostText = await expectedServiceLocator.textContent()
          const costMatch = shippingCostText?.match(/\$[\d,]+\.\d{2}/)
          if (costMatch) {
            result.shippingCost = costMatch[0]
            console.log(`💰 Shipping cost: ${result.shippingCost}`)
          }
        } else {
          console.error(`❌ Expected service NOT found: ${testUser.expectedName}`)
          console.log('Available services:', result.fedexServices)
          result.error = `Expected service ${testUser.expectedName} not found`
        }

        const screenshot6 = `order${index + 1}-step6-service-selected.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot6}`, fullPage: true })
        result.screenshots.push(screenshot6)

        // Step 9: Continue to payment
        console.log('📍 Step 9: Proceeding to payment...')

        const continueToPayment = await page.locator('button:has-text("Continue to Payment"), button:has-text("Next"), button:has-text("Continue")').first()
        if (await continueToPayment.isVisible()) {
          await continueToPayment.click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(2000)
        }

        // Extract total cost
        const totalElement = await page.locator('[data-testid="order-total"], .total-amount, .order-total').first()
        if (await totalElement.count() > 0) {
          const totalText = await totalElement.textContent()
          const totalMatch = totalText?.match(/\$[\d,]+\.\d{2}/)
          if (totalMatch) {
            result.totalCost = totalMatch[0]
            console.log(`💰 Order total: ${result.totalCost}`)
          }
        }

        const screenshot7 = `order${index + 1}-step7-payment-page.png`
        await page.screenshot({ path: `tests/screenshots/${screenshot7}`, fullPage: true })
        result.screenshots.push(screenshot7)

        // Mark as success if we got this far
        result.success = true
        console.log(`✅ Order flow completed successfully!`)

      } catch (error) {
        console.error(`❌ Error in ${testUser.scenario}:`, error)
        result.error = error instanceof Error ? error.message : String(error)

        // Take error screenshot
        const errorScreenshot = `order${index + 1}-error.png`
        try {
          await page.screenshot({ path: `tests/screenshots/${errorScreenshot}`, fullPage: true })
          result.screenshots.push(errorScreenshot)
        } catch (screenshotError) {
          console.error('Failed to take error screenshot:', screenshotError)
        }
      }

      orderResults.push(result)

      // Log result summary
      console.log(`\n📊 Result Summary:`)
      console.log(`   Success: ${result.success ? '✅ YES' : '❌ NO'}`)
      console.log(`   FedEx Rates Found: ${result.fedexRatesFound}`)
      console.log(`   Expected Service: ${testUser.expectedName}`)
      console.log(`   Service Found: ${result.selectedServiceName || 'N/A'}`)
      console.log(`   Shipping Cost: ${result.shippingCost || 'N/A'}`)
      console.log(`   Total Cost: ${result.totalCost || 'N/A'}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      console.log(`${'='.repeat(60)}\n`)

      // Assertions
      expect(result.fedexRatesFound, 'Should find FedEx shipping rates').toBeGreaterThanOrEqual(3)
      expect(result.selectedServiceName, `Should find expected service: ${testUser.expectedName}`).toContain(testUser.expectedName.split(' ')[1]) // Match partial name
    })
  }

  test.afterAll(async () => {
    // Generate comprehensive test report
    const report = {
      testDate: new Date().toISOString(),
      totalOrders: orderResults.length,
      successfulOrders: orderResults.filter((r) => r.success).length,
      failedOrders: orderResults.filter((r) => !r.success).length,
      orders: orderResults,
      summary: {
        allOrdersSuccessful: orderResults.every((r) => r.success),
        allExpectedServicesFound: orderResults.every((r) => r.selectedServiceName.length > 0),
        averageFedexRatesFound: orderResults.reduce((sum, r) => sum + r.fedexRatesFound, 0) / orderResults.length,
      },
    }

    // Write JSON report
    const reportPath = join(process.cwd(), 'tests', 'fedex-orders-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Write human-readable report
    const textReport = `
FedEx Shipping Orders Test Report
==================================
Date: ${new Date().toISOString()}

SUMMARY
-------
Total Orders: ${report.totalOrders}
Successful: ${report.successfulOrders}
Failed: ${report.failedOrders}
Success Rate: ${((report.successfulOrders / report.totalOrders) * 100).toFixed(1)}%
Average FedEx Rates Found: ${report.summary.averageFedexRatesFound.toFixed(1)}

DETAILED RESULTS
----------------
${orderResults
  .map(
    (r, i) => `
Order ${i + 1}: ${r.scenario}
  Status: ${r.success ? '✅ SUCCESS' : '❌ FAILED'}
  FedEx Rates Found: ${r.fedexRatesFound}
  Services Available: ${r.fedexServices.join(', ')}
  Selected Service: ${r.selectedServiceName || 'None'}
  Shipping Cost: ${r.shippingCost || 'N/A'}
  Total Cost: ${r.totalCost || 'N/A'}
  ${r.error ? `Error: ${r.error}` : ''}
  Screenshots: ${r.screenshots.join(', ')}
`
  )
  .join('\n')}

FEDEX SHIPPING VERIFICATION
----------------------------
${orderResults.every((r) => r.fedexRatesFound >= 3) ? '✅ All orders showed 3+ FedEx rates' : '❌ Some orders showed fewer than 3 FedEx rates'}
${orderResults.every((r) => r.selectedServiceName.length > 0) ? '✅ All expected services were found' : '❌ Some expected services were not found'}

CONCLUSION
----------
${report.summary.allOrdersSuccessful && report.summary.allExpectedServicesFound ? '✅ ALL TESTS PASSED - FedEx shipping is working correctly!' : '❌ SOME TESTS FAILED - Review details above'}
`

    const textReportPath = join(process.cwd(), 'tests', 'fedex-orders-report.txt')
    writeFileSync(textReportPath, textReport)

    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST REPORT GENERATED')
    console.log('='.repeat(80))
    console.log(textReport)
    console.log('\n📁 Reports saved:')
    console.log(`   JSON: ${reportPath}`)
    console.log(`   Text: ${textReportPath}`)
    console.log('='.repeat(80) + '\n')
  })
})
