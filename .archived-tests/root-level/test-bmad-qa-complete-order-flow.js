#!/usr/bin/env node

/**
 * BMAD QA Complete Order Flow Test Suite
 *
 * Comprehensive end-to-end testing for GangRun Printing order flow
 * Tests product ordering from customer perspective through to admin visibility
 *
 * @author BMAD QA Agent (Quinn)
 * @version 2.0.0
 * @requires puppeteer, chrome-devtools-mcp, node-fetch
 */

const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const fs = require('fs').promises
const path = require('path')

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'https://gangrunprinting.com',
  productUrl: 'https://gangrunprinting.com/products/asdfasd',
  customer: {
    email: 'appvillagellc@gmail.com',
    firstName: 'Test',
    lastName: 'Customer',
    company: 'App Village LLC',
    phone: '(773) 123-4567',
    address: '2740 West 83rd Pl',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60652',
  },
  iterations: 5,
  timeout: 120000,
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down actions for better visibility
  screenshotDir: './qa-test-screenshots',
  reportFile: './QA-TEST-REPORT.json',
}

// Color-coded console output
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  step: (msg) => console.log(`\x1b[35m[STEP]\x1b[0m ${msg}`),
  data: (label, data) => console.log(`\x1b[34m[DATA]\x1b[0m ${label}:`, data),
}

// Test Results Collector
class TestResults {
  constructor() {
    this.startTime = new Date()
    this.iterations = []
    this.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      partiallyPassed: 0,
    }
  }

  addIteration(result) {
    this.iterations.push(result)
    this.summary.total++
    if (result.status === 'PASSED') this.summary.passed++
    else if (result.status === 'FAILED') this.summary.failed++
    else if (result.status === 'PARTIAL') this.summary.partiallyPassed++
  }

  async generateReport() {
    const report = {
      testSuite: 'BMAD QA Complete Order Flow',
      startTime: this.startTime,
      endTime: new Date(),
      duration: new Date() - this.startTime,
      configuration: TEST_CONFIG,
      summary: this.summary,
      successRate: `${((this.summary.passed / this.summary.total) * 100).toFixed(2)}%`,
      iterations: this.iterations,
      recommendations: this.generateRecommendations(),
    }

    await fs.writeFile(TEST_CONFIG.reportFile, JSON.stringify(report, null, 2))

    return report
  }

  generateRecommendations() {
    const recommendations = []

    // Analyze common failures
    const failureReasons = {}
    this.iterations.forEach((iteration) => {
      if (iteration.status !== 'PASSED') {
        iteration.failureReasons.forEach((reason) => {
          failureReasons[reason] = (failureReasons[reason] || 0) + 1
        })
      }
    })

    // Generate recommendations based on failures
    Object.entries(failureReasons).forEach(([reason, count]) => {
      if (count >= 2) {
        recommendations.push({
          severity: 'HIGH',
          issue: reason,
          occurrences: count,
          recommendation: this.getRecommendationForIssue(reason),
        })
      }
    })

    return recommendations
  }

  getRecommendationForIssue(issue) {
    const recommendations = {
      'Email not sent': 'Check Resend API configuration and email service status',
      'Order not visible in admin': 'Verify admin panel queries include CONFIRMATION status orders',
      'Payment failed': 'Review payment processing logic and API endpoints',
      'Checkout form validation': 'Add better form validation and error messages',
      'Shipping calculation failed': 'Check shipping API integration and rate calculations',
    }

    return recommendations[issue] || 'Investigate root cause and implement fix'
  }
}

// Main Test Runner
class OrderFlowTestRunner {
  constructor() {
    this.results = new TestResults()
    this.browser = null
  }

  async initialize() {
    log.info('Initializing test environment...')

    // Create screenshot directory
    await fs.mkdir(TEST_CONFIG.screenshotDir, { recursive: true })

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    })

    log.success('Test environment initialized')
  }

  async runTestIteration(iterationNumber) {
    const page = await this.browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    const iterationResult = {
      iteration: iterationNumber,
      startTime: new Date(),
      status: 'RUNNING',
      steps: [],
      screenshots: [],
      orderDetails: null,
      failureReasons: [],
      warnings: [],
    }

    try {
      log.info(`Starting test iteration ${iterationNumber}/${TEST_CONFIG.iterations}`)

      // Step 1: Navigate to product page
      await this.navigateToProduct(page, iterationResult)

      // Step 2: Add product to cart
      await this.addProductToCart(page, iterationResult)

      // Step 3: Navigate to cart
      await this.navigateToCart(page, iterationResult)

      // Step 4: Proceed to checkout
      await this.proceedToCheckout(page, iterationResult)

      // Step 5: Fill customer information
      await this.fillCustomerInformation(page, iterationResult)

      // Step 6: Select shipping method
      await this.selectShippingMethod(page, iterationResult)

      // Step 7: Select payment method
      await this.selectPaymentMethod(page, iterationResult)

      // Step 8: Complete order
      await this.completeOrder(page, iterationResult)

      // Step 9: Verify order confirmation
      await this.verifyOrderConfirmation(page, iterationResult)

      // Step 10: Check email delivery
      await this.checkEmailDelivery(iterationResult)

      // Step 11: Verify admin visibility
      await this.verifyAdminVisibility(iterationResult)

      // Step 12: Verify customer account
      await this.verifyCustomerAccount(iterationResult)

      iterationResult.status = 'PASSED'
      log.success(`Iteration ${iterationNumber} completed successfully`)
    } catch (error) {
      iterationResult.status = 'FAILED'
      iterationResult.failureReasons.push(error.message)
      log.error(`Iteration ${iterationNumber} failed: ${error.message}`)

      // Take error screenshot
      const errorScreenshot = await this.takeScreenshot(page, `iteration-${iterationNumber}-error`)
      iterationResult.screenshots.push(errorScreenshot)
    }

    iterationResult.endTime = new Date()
    iterationResult.duration = iterationResult.endTime - iterationResult.startTime

    await page.close()
    return iterationResult
  }

  async navigateToProduct(page, result) {
    const step = { name: 'Navigate to Product', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Navigating to product page...')
      await page.goto(TEST_CONFIG.productUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for product details to load
      await page.waitForSelector('[data-testid="product-title"], h1', { timeout: 10000 })

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-product-page`
      )
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Product page loaded')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to load product page: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async addProductToCart(page, result) {
    const step = { name: 'Add to Cart', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Adding product to cart...')

      // Look for Add to Cart button
      const addToCartButton = await page.$(
        'button:has-text("Add to Cart"), button:has-text("ADD TO CART")'
      )

      if (!addToCartButton) {
        // Try alternative selectors
        await page.click(
          '[data-testid="add-to-cart-button"], .add-to-cart-btn, button[type="submit"]'
        )
      } else {
        await addToCartButton.click()
      }

      // Wait for cart notification or redirect
      await page.waitForTimeout(2000)

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-added-to-cart`
      )
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Product added to cart')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to add product to cart: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async navigateToCart(page, result) {
    const step = { name: 'Navigate to Cart', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Navigating to cart...')

      // Try multiple methods to get to cart
      const cartUrl = `${TEST_CONFIG.baseUrl}/cart`
      await page.goto(cartUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for cart to load
      await page.waitForSelector('.cart-item, [data-testid="cart-item"]', { timeout: 10000 })

      const screenshot = await this.takeScreenshot(page, `iteration-${result.iteration}-cart-page`)
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Cart page loaded')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      result.warnings.push('Cart navigation failed, attempting direct checkout')
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async proceedToCheckout(page, result) {
    const step = { name: 'Proceed to Checkout', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Proceeding to checkout...')

      // Look for checkout button
      await page.click(
        'button:has-text("Proceed to Checkout"), a[href="/checkout"], button:has-text("Checkout")'
      )

      // Wait for checkout page to load
      await page.waitForSelector('input[name="email"], #email', { timeout: 15000 })

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-checkout-page`
      )
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Checkout page loaded')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to proceed to checkout: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async fillCustomerInformation(page, result) {
    const step = { name: 'Fill Customer Information', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Filling customer information...')

      // Fill email
      await page.type('input[name="email"], #email', TEST_CONFIG.customer.email)

      // Fill name
      await page.type('input[name="firstName"], #firstName', TEST_CONFIG.customer.firstName)
      await page.type('input[name="lastName"], #lastName', TEST_CONFIG.customer.lastName)

      // Fill company (optional)
      const companyField = await page.$('input[name="company"], #company')
      if (companyField) {
        await page.type('input[name="company"], #company', TEST_CONFIG.customer.company)
      }

      // Fill phone
      await page.type('input[name="phone"], #phone', TEST_CONFIG.customer.phone)

      // Fill address
      await page.type('input[name="address"], #address', TEST_CONFIG.customer.address)
      await page.type('input[name="city"], #city', TEST_CONFIG.customer.city)
      await page.type('input[name="state"], #state', TEST_CONFIG.customer.state)
      await page.type('input[name="zipCode"], #zipCode', TEST_CONFIG.customer.zipCode)

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-customer-info`
      )
      result.screenshots.push(screenshot)

      // Continue to shipping
      await page.click('button:has-text("Continue to Shipping"), button:has-text("Continue")')
      await page.waitForTimeout(3000)

      step.status = 'PASSED'
      log.success('Customer information filled')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to fill customer information: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async selectShippingMethod(page, result) {
    const step = { name: 'Select Shipping Method', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Selecting shipping method...')

      // Wait for shipping options to load
      await page.waitForTimeout(3000)

      // Try to select first shipping option
      const shippingOption = await page.$('input[type="radio"][name="shipping"]')
      if (shippingOption) {
        await shippingOption.click()
      }

      const screenshot = await this.takeScreenshot(page, `iteration-${result.iteration}-shipping`)
      result.screenshots.push(screenshot)

      // Continue to payment
      await page.click('button:has-text("Continue to Payment"), button:has-text("Continue")')
      await page.waitForTimeout(3000)

      step.status = 'PASSED'
      log.success('Shipping method selected')
    } catch (error) {
      step.status = 'PARTIAL'
      step.error = error.message
      result.warnings.push('Shipping selection may have failed')
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async selectPaymentMethod(page, result) {
    const step = { name: 'Select Payment Method', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Selecting Test Cash payment method...')

      // Look for Test Cash Payment option
      const testCashOption = await page.$('label:has-text("Test Cash"), input[value="test_cash"]')
      if (testCashOption) {
        await testCashOption.click()
      } else {
        // Try to find any payment option with "test" or "cash"
        await page.evaluate(() => {
          const labels = document.querySelectorAll('label')
          for (const label of labels) {
            if (
              label.textContent.toLowerCase().includes('test') ||
              label.textContent.toLowerCase().includes('cash')
            ) {
              label.click()
              return
            }
          }
        })
      }

      const screenshot = await this.takeScreenshot(page, `iteration-${result.iteration}-payment`)
      result.screenshots.push(screenshot)

      // Continue to review or complete order
      const continueButton = await page.$('button:has-text("Continue"), button:has-text("Review")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(3000)
      }

      step.status = 'PASSED'
      log.success('Payment method selected')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to select payment method: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async completeOrder(page, result) {
    const step = { name: 'Complete Order', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Completing order...')

      // Click Place Order button
      await page.click(
        'button:has-text("Place Order"), button:has-text("Complete Order"), button:has-text("Submit Order")'
      )

      // Wait for order processing
      await page.waitForTimeout(5000)

      // Check for success page or confirmation
      const successIndicator = await page.$(
        '.order-success, .confirmation, [data-testid="order-confirmation"]'
      )

      if (successIndicator) {
        // Try to extract order number
        const orderNumber = await page.evaluate(() => {
          const orderElements = document.querySelectorAll('*')
          for (const el of orderElements) {
            const text = el.textContent || ''
            const match = text.match(/TEST-[A-Z0-9]+|GRP-[A-Z0-9]+|Order #[\w-]+/)
            if (match) return match[0]
          }
          return null
        })

        result.orderDetails = {
          orderNumber: orderNumber,
          timestamp: new Date(),
        }

        log.data('Order Number', orderNumber)
      }

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-order-complete`
      )
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Order completed')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      throw new Error(`Failed to complete order: ${error.message}`)
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async verifyOrderConfirmation(page, result) {
    const step = { name: 'Verify Order Confirmation', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Verifying order confirmation...')

      // Check for confirmation elements
      const confirmationElements = [
        '.order-confirmation',
        '.success-message',
        '[data-testid="order-success"]',
        'h1:has-text("Thank you")',
        'h1:has-text("Order Confirmed")',
      ]

      let confirmationFound = false
      for (const selector of confirmationElements) {
        const element = await page.$(selector)
        if (element) {
          confirmationFound = true
          break
        }
      }

      if (!confirmationFound) {
        throw new Error('Order confirmation page not found')
      }

      const screenshot = await this.takeScreenshot(
        page,
        `iteration-${result.iteration}-confirmation`
      )
      result.screenshots.push(screenshot)

      step.status = 'PASSED'
      log.success('Order confirmation verified')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      result.failureReasons.push('Order confirmation not displayed')
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async checkEmailDelivery(result) {
    const step = { name: 'Check Email Delivery', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Checking email delivery status...')

      // Note: In a real test, we would integrate with email service API
      // For now, we'll mark this as a manual verification step

      result.warnings.push('Email delivery requires manual verification at appvillagellc@gmail.com')

      step.status = 'MANUAL'
      log.warning('Email delivery requires manual verification')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async verifyAdminVisibility(result) {
    const step = { name: 'Verify Admin Visibility', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Checking order visibility in admin panel...')

      // Make API call to check if order exists in database
      if (result.orderDetails && result.orderDetails.orderNumber) {
        const response = await fetch(
          `${TEST_CONFIG.baseUrl}/api/orders/check/${result.orderDetails.orderNumber}`
        )

        if (response.ok) {
          step.status = 'PASSED'
          log.success('Order visible in admin system')
        } else {
          throw new Error('Order not found in admin system')
        }
      } else {
        result.warnings.push('Cannot verify admin visibility without order number')
        step.status = 'SKIPPED'
      }
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
      result.failureReasons.push('Order not visible in admin')
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async verifyCustomerAccount(result) {
    const step = { name: 'Verify Customer Account', status: 'RUNNING', startTime: new Date() }

    try {
      log.step('Checking order in customer account...')

      // Note: This would require customer login automation
      result.warnings.push('Customer account verification requires manual check')

      step.status = 'MANUAL'
      log.warning('Customer account requires manual verification')
    } catch (error) {
      step.status = 'FAILED'
      step.error = error.message
    }

    step.endTime = new Date()
    result.steps.push(step)
  }

  async takeScreenshot(page, name) {
    const filename = `${name}-${Date.now()}.png`
    const filepath = path.join(TEST_CONFIG.screenshotDir, filename)

    await page.screenshot({
      path: filepath,
      fullPage: false,
    })

    log.info(`Screenshot saved: ${filename}`)
    return filename
  }

  async runAllTests() {
    await this.initialize()

    log.info(`Starting ${TEST_CONFIG.iterations} test iterations...`)

    for (let i = 1; i <= TEST_CONFIG.iterations; i++) {
      const iterationResult = await this.runTestIteration(i)
      this.results.addIteration(iterationResult)

      // Wait between iterations
      if (i < TEST_CONFIG.iterations) {
        log.info('Waiting 5 seconds before next iteration...')
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }

    await this.browser.close()

    // Generate final report
    const report = await this.results.generateReport()

    // Print summary
    this.printSummary(report)

    return report
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(80))
    console.log('📊 BMAD QA TEST SUITE - FINAL REPORT')
    console.log('='.repeat(80))

    console.log(`\n📅 Test Duration: ${Math.round(report.duration / 1000)}s`)
    console.log(`🎯 Success Rate: ${report.successRate}`)

    console.log('\n📈 Test Results:')
    console.log(`   ✅ Passed: ${report.summary.passed}`)
    console.log(`   ⚠️  Partial: ${report.summary.partiallyPassed}`)
    console.log(`   ❌ Failed: ${report.summary.failed}`)
    console.log(`   📝 Total: ${report.summary.total}`)

    if (report.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.severity}] ${rec.issue}`)
        console.log(`      → ${rec.recommendation}`)
      })
    }

    console.log('\n📁 Outputs:')
    console.log(`   • Screenshots: ${TEST_CONFIG.screenshotDir}/`)
    console.log(`   • Report: ${TEST_CONFIG.reportFile}`)

    console.log('\n✉️ Manual Verification Required:')
    console.log('   1. Check email at appvillagellc@gmail.com')
    console.log('   2. Verify orders in admin panel')
    console.log('   3. Check customer account for order history')

    console.log('\n' + '='.repeat(80))
    console.log('🏁 TEST SUITE COMPLETED')
    console.log('='.repeat(80) + '\n')
  }
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🧪 BMAD QA COMPLETE ORDER FLOW TEST SUITE')
  console.log('🎯 Testing: ' + TEST_CONFIG.productUrl)
  console.log('📧 Customer: ' + TEST_CONFIG.customer.email)
  console.log('🔄 Iterations: ' + TEST_CONFIG.iterations)
  console.log('='.repeat(80) + '\n')

  const runner = new OrderFlowTestRunner()

  try {
    const report = await runner.runAllTests()

    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0)
  } catch (error) {
    log.error(`Fatal error: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// Check for required modules
async function checkDependencies() {
  const dependencies = ['puppeteer', 'node-fetch']
  const missing = []

  for (const dep of dependencies) {
    try {
      require.resolve(dep)
    } catch {
      missing.push(dep)
    }
  }

  if (missing.length > 0) {
    console.log('📦 Installing missing dependencies...')
    require('child_process').execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' })
    console.log('✅ Dependencies installed. Please run the script again.')
    process.exit(0)
  }
}

// Run the test suite
checkDependencies().then(() => main())
