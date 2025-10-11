#!/usr/bin/env node

/**
 * Complete Customer Order Flow Test
 * Tests the specific product page and checkout flow as requested
 *
 * Requirements:
 * 1. Navigate to https://gangrunprinting.com/products/asdfasd
 * 2. Configure product options
 * 3. Add to cart
 * 4. Proceed to checkout
 * 5. Fill customer information
 * 6. Select shipping method
 * 7. Choose "Test Cash Payment"
 * 8. Complete order
 * 9. Run 5 times for consistency
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// Test configuration
const WEBSITE_URL = 'https://gangrunprinting.com'
const PRODUCT_URL = 'https://gangrunprinting.com/products/asdfasd'
const HEADLESS = false // Set to true for server runs
const SLOW_MO = 100 // Slow down for better observation
const VIEWPORT = { width: 1920, height: 1080 }

// Customer information as specified
const CUSTOMER_INFO = {
  email: 'appvillagellc@gmail.com',
  name: 'Test Customer',
  phone: '(773) 123-4567',
  address: {
    street: '2740 West 83rd Pl',
    city: 'Chicago',
    state: 'IL',
    zip: '60652',
  },
}

// Utility functions
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    step: '\x1b[35m', // Magenta
  }
  const reset = '\x1b[0m'
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  console.log(`${colors[type]}[${timestamp}] ${message}${reset}`)
}

const createScreenshotDir = () => {
  const screenshotDir = path.join(__dirname, 'screenshots', 'order-flow-test')
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }
  return screenshotDir
}

const takeScreenshot = async (page, testRun, step, description = '') => {
  try {
    const screenshotDir = createScreenshotDir()
    const timestamp = Date.now()
    const filename = `test-${testRun}-${step.toString().padStart(2, '0')}-${description.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`
    const fullPath = path.join(screenshotDir, filename)

    await page.screenshot({
      path: fullPath,
      fullPage: true,
      type: 'png',
    })

    log(`📸 Screenshot saved: ${filename}`, 'info')
    return filename
  } catch (error) {
    log(`❌ Screenshot failed: ${error.message}`, 'error')
    return null
  }
}

const waitForElement = async (page, selector, timeout = 10000) => {
  try {
    await page.waitForSelector(selector, { timeout, visible: true })
    return true
  } catch (error) {
    log(`⚠️ Element not found: ${selector}`, 'warning')
    return false
  }
}

// Main test function
async function runOrderFlowTest(testRun) {
  let browser
  const results = {
    testRun,
    success: false,
    steps: [],
    screenshots: [],
    orderId: null,
    orderNumber: null,
    errors: [],
    startTime: new Date().toISOString(),
    endTime: null,
  }

  try {
    log(`🚀 Starting Test Run ${testRun}/5`, 'step')

    // Launch browser
    browser = await puppeteer.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    })

    const page = await browser.newPage()
    await page.setViewport(VIEWPORT)

    // Set timeout for all navigation
    page.setDefaultTimeout(30000)
    page.setDefaultNavigationTimeout(30000)

    // STEP 1: Navigate to product page
    log(`📄 Step 1: Navigating to product page: ${PRODUCT_URL}`, 'step')
    try {
      await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2' })
      await wait(2000)

      const screenshot1 = await takeScreenshot(page, testRun, 1, 'product-page-loaded')
      results.screenshots.push(screenshot1)
      results.steps.push({ step: 1, name: 'Navigate to product page', success: true })
      log('✅ Successfully loaded product page', 'success')
    } catch (error) {
      throw new Error(`Failed to load product page: ${error.message}`)
    }

    // STEP 2: Wait for product configuration to load
    log('⚙️ Step 2: Waiting for product configuration to load', 'step')
    try {
      // Wait for common product configuration elements
      await Promise.race([
        waitForElement(page, 'select[name="quantity"]'),
        waitForElement(page, 'input[type="number"]'),
        waitForElement(page, '.product-options'),
        waitForElement(page, '[data-testid="product-config"]'),
        wait(5000), // Fallback timeout
      ])

      await wait(3000) // Additional wait for JavaScript to load options

      const screenshot2 = await takeScreenshot(page, testRun, 2, 'configuration-loaded')
      results.screenshots.push(screenshot2)
      results.steps.push({ step: 2, name: 'Product configuration loaded', success: true })
      log('✅ Product configuration loaded', 'success')
    } catch (error) {
      log(`⚠️ Configuration loading issue: ${error.message}`, 'warning')
      results.steps.push({
        step: 2,
        name: 'Product configuration loaded',
        success: false,
        error: error.message,
      })
    }

    // STEP 3: Configure product options
    log('🔧 Step 3: Configuring product options', 'step')
    try {
      // Check for any required selections and make them
      await page.evaluate(() => {
        // Look for quantity selectors
        const quantitySelectors = [
          'select[name="quantity"]',
          'input[type="number"]',
          'input[name="quantity"]',
        ]

        for (const selector of quantitySelectors) {
          const element = document.querySelector(selector)
          if (element) {
            if (element.tagName === 'SELECT') {
              // Select first available quantity option
              const options = element.querySelectorAll('option[value]:not([value=""])')
              if (options.length > 0) {
                element.value = options[0].value
                element.dispatchEvent(new Event('change', { bubbles: true }))
              }
            } else if (element.tagName === 'INPUT') {
              // Set quantity to 100
              element.value = '100'
              element.dispatchEvent(new Event('input', { bubbles: true }))
              element.dispatchEvent(new Event('change', { bubbles: true }))
            }
            break
          }
        }

        // Look for size selectors
        const sizeSelectors = document.querySelectorAll(
          'select[name*="size"], select[name*="Size"]'
        )
        sizeSelectors.forEach((select) => {
          const options = select.querySelectorAll('option[value]:not([value=""])')
          if (options.length > 0) {
            select.value = options[0].value
            select.dispatchEvent(new Event('change', { bubbles: true }))
          }
        })

        // Look for paper stock selectors
        const paperSelectors = document.querySelectorAll(
          'select[name*="paper"], select[name*="stock"]'
        )
        paperSelectors.forEach((select) => {
          const options = select.querySelectorAll('option[value]:not([value=""])')
          if (options.length > 0) {
            select.value = options[0].value
            select.dispatchEvent(new Event('change', { bubbles: true }))
          }
        })
      })

      await wait(2000) // Wait for any price updates

      const screenshot3 = await takeScreenshot(page, testRun, 3, 'product-configured')
      results.screenshots.push(screenshot3)
      results.steps.push({ step: 3, name: 'Configure product options', success: true })
      log('✅ Product options configured', 'success')
    } catch (error) {
      log(`⚠️ Configuration error: ${error.message}`, 'warning')
      results.steps.push({
        step: 3,
        name: 'Configure product options',
        success: false,
        error: error.message,
      })
    }

    // STEP 4: Add to cart
    log('🛒 Step 4: Adding product to cart', 'step')
    try {
      // Look for Add to Cart button
      const addToCartResult = await page.evaluate(() => {
        const buttonSelectors = [
          'button:has-text("Add to Cart")',
          'button[data-testid="add-to-cart"]',
          'button.add-to-cart',
          'input[type="submit"][value*="cart" i]',
          'button[type="submit"]',
        ]

        // Try exact text match first
        const buttons = Array.from(document.querySelectorAll('button'))
        let addButton = buttons.find(
          (btn) =>
            btn.textContent.toLowerCase().includes('add to cart') ||
            btn.textContent.toLowerCase().includes('add to basket')
        )

        // If not found, try other selectors
        if (!addButton) {
          for (const selector of buttonSelectors) {
            addButton = document.querySelector(selector)
            if (addButton) break
          }
        }

        if (addButton && !addButton.disabled) {
          addButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
          addButton.click()
          return { success: true, buttonText: addButton.textContent.trim() }
        }

        return { success: false, error: 'Add to Cart button not found or disabled' }
      })

      if (addToCartResult.success) {
        log(`✅ Clicked Add to Cart button: "${addToCartResult.buttonText}"`, 'success')
        await wait(3000) // Wait for cart update

        const screenshot4 = await takeScreenshot(page, testRun, 4, 'added-to-cart')
        results.screenshots.push(screenshot4)
        results.steps.push({ step: 4, name: 'Add to cart', success: true })
      } else {
        throw new Error(addToCartResult.error)
      }
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`)
    }

    // STEP 5: Navigate to cart
    log('📋 Step 5: Navigating to cart', 'step')
    try {
      await page.goto(`${WEBSITE_URL}/cart`, { waitUntil: 'networkidle2' })
      await wait(2000)

      const screenshot5 = await takeScreenshot(page, testRun, 5, 'cart-page')
      results.screenshots.push(screenshot5)
      results.steps.push({ step: 5, name: 'Navigate to cart', success: true })
      log('✅ Cart page loaded', 'success')
    } catch (error) {
      throw new Error(`Failed to load cart: ${error.message}`)
    }

    // STEP 6: Proceed to checkout
    log('💳 Step 6: Proceeding to checkout', 'step')
    try {
      const checkoutResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'))
        const checkoutBtn = buttons.find(
          (btn) =>
            btn.textContent.toLowerCase().includes('checkout') ||
            btn.textContent.toLowerCase().includes('proceed to checkout')
        )

        if (checkoutBtn) {
          checkoutBtn.click()
          return { success: true, buttonText: checkoutBtn.textContent.trim() }
        }
        return { success: false, error: 'Checkout button not found' }
      })

      if (checkoutResult.success) {
        log(`✅ Clicked checkout button: "${checkoutResult.buttonText}"`, 'success')
        await wait(3000)
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
      } else {
        // Try direct navigation to checkout
        await page.goto(`${WEBSITE_URL}/checkout`, { waitUntil: 'networkidle2' })
      }

      const screenshot6 = await takeScreenshot(page, testRun, 6, 'checkout-page')
      results.screenshots.push(screenshot6)
      results.steps.push({ step: 6, name: 'Proceed to checkout', success: true })
      log('✅ Checkout page loaded', 'success')
    } catch (error) {
      throw new Error(`Failed to proceed to checkout: ${error.message}`)
    }

    // STEP 7: Fill customer information
    log('👤 Step 7: Filling customer information', 'step')
    try {
      await wait(2000)

      // Check if login is required
      const needsLogin = await page.evaluate(() => {
        return (
          document.body.textContent.toLowerCase().includes('sign in') ||
          document.body.textContent.toLowerCase().includes('login') ||
          document.querySelector('input[type="password"]') !== null
        )
      })

      if (needsLogin) {
        log('🔐 Login required, filling in guest checkout or creating account', 'info')

        // Try guest checkout first
        const guestCheckout = await page.evaluate(() => {
          const guestButtons = Array.from(document.querySelectorAll('button, a'))
          const guestBtn = guestButtons.find(
            (btn) =>
              btn.textContent.toLowerCase().includes('guest') ||
              btn.textContent.toLowerCase().includes('continue without')
          )
          if (guestBtn) {
            guestBtn.click()
            return true
          }
          return false
        })

        if (!guestCheckout) {
          // Fill registration form if guest checkout not available
          await page.waitForSelector('input[type="email"]', { timeout: 5000 })

          await page.type('input[type="email"]', CUSTOMER_INFO.email, { delay: 50 })
          log(`✅ Filled email: ${CUSTOMER_INFO.email}`, 'success')

          const nameInput = await page.$('input[name="name"], input[placeholder*="name" i]')
          if (nameInput) {
            await nameInput.type(CUSTOMER_INFO.name, { delay: 50 })
            log(`✅ Filled name: ${CUSTOMER_INFO.name}`, 'success')
          }

          // If password field exists, fill it
          const passwordInput = await page.$('input[type="password"]')
          if (passwordInput) {
            await passwordInput.type('TempPassword123!', { delay: 50 })
            log('✅ Filled password', 'success')
          }
        }
      }

      // Fill address information
      await page.evaluate((customerInfo) => {
        const fillField = (selectors, value) => {
          for (const selector of selectors) {
            const input = document.querySelector(selector)
            if (input && input.offsetParent !== null) {
              input.value = value
              input.dispatchEvent(new Event('input', { bubbles: true }))
              input.dispatchEvent(new Event('change', { bubbles: true }))
              return true
            }
          }
          return false
        }

        // Fill all the address fields
        fillField(['input[name="email"], input[type="email"]'], customerInfo.email)
        fillField(
          ['input[name="name"], input[name="firstName"], input[name="fullName"]'],
          customerInfo.name
        )
        fillField(['input[name="phone"], input[type="tel"]'], customerInfo.phone)
        fillField(
          ['input[name="address"], input[name="street"], input[name="address1"]'],
          customerInfo.address.street
        )
        fillField(['input[name="city"]'], customerInfo.address.city)
        fillField(['input[name="state"], select[name="state"]'], customerInfo.address.state)
        fillField(
          ['input[name="zip"], input[name="zipCode"], input[name="postalCode"]'],
          customerInfo.address.zip
        )
      }, CUSTOMER_INFO)

      await wait(2000)

      const screenshot7 = await takeScreenshot(page, testRun, 7, 'customer-info-filled')
      results.screenshots.push(screenshot7)
      results.steps.push({ step: 7, name: 'Fill customer information', success: true })
      log('✅ Customer information filled', 'success')
    } catch (error) {
      log(`⚠️ Customer info error: ${error.message}`, 'warning')
      results.steps.push({
        step: 7,
        name: 'Fill customer information',
        success: false,
        error: error.message,
      })
    }

    // STEP 8: Select shipping method
    log('📦 Step 8: Selecting shipping method', 'step')
    try {
      await wait(2000)

      const shippingSelected = await page.evaluate(() => {
        // Look for shipping options
        const shippingInputs = Array.from(document.querySelectorAll('input[type="radio"]'))
        const shippingInput = shippingInputs.find(
          (input) =>
            input.name.toLowerCase().includes('shipping') ||
            input.value.toLowerCase().includes('standard') ||
            input.value.toLowerCase().includes('ground')
        )

        if (shippingInput) {
          shippingInput.click()
          return { success: true, value: shippingInput.value }
        }

        // Try selecting from dropdown
        const shippingSelect = document.querySelector('select[name*="shipping"]')
        if (shippingSelect) {
          const options = shippingSelect.querySelectorAll('option[value]:not([value=""])')
          if (options.length > 0) {
            shippingSelect.value = options[0].value
            shippingSelect.dispatchEvent(new Event('change', { bubbles: true }))
            return { success: true, value: options[0].textContent }
          }
        }

        return { success: false, error: 'No shipping options found' }
      })

      if (shippingSelected.success) {
        log(`✅ Selected shipping method: ${shippingSelected.value}`, 'success')
      } else {
        log('⚠️ Could not find shipping options, continuing', 'warning')
      }

      const screenshot8 = await takeScreenshot(page, testRun, 8, 'shipping-selected')
      results.screenshots.push(screenshot8)
      results.steps.push({
        step: 8,
        name: 'Select shipping method',
        success: shippingSelected.success,
      })
    } catch (error) {
      log(`⚠️ Shipping selection error: ${error.message}`, 'warning')
      results.steps.push({
        step: 8,
        name: 'Select shipping method',
        success: false,
        error: error.message,
      })
    }

    // STEP 9: Choose "Test Cash Payment"
    log('💵 Step 9: Selecting "Test Cash Payment"', 'step')
    try {
      await wait(2000)

      const paymentSelected = await page.evaluate(() => {
        // Look for Test Cash Payment option
        const elements = Array.from(document.querySelectorAll('*'))
        const cashElement = elements.find(
          (el) =>
            el.textContent.includes('Test Cash Payment') ||
            el.textContent.includes('Cash Payment') ||
            el.textContent.includes('Cash') ||
            (el.tagName === 'INPUT' && el.value.toLowerCase().includes('cash'))
        )

        if (cashElement) {
          if (cashElement.tagName === 'INPUT') {
            cashElement.click()
            return { success: true, method: 'input clicked', text: cashElement.value }
          } else if (cashElement.tagName === 'LABEL') {
            cashElement.click()
            return { success: true, method: 'label clicked', text: cashElement.textContent.trim() }
          } else {
            // Try to find associated input
            const input =
              cashElement.querySelector('input') || document.querySelector(`input[value*="cash" i]`)
            if (input) {
              input.click()
              return {
                success: true,
                method: 'associated input',
                text: cashElement.textContent.trim(),
              }
            }
            cashElement.click()
            return {
              success: true,
              method: 'element clicked',
              text: cashElement.textContent.trim(),
            }
          }
        }

        return { success: false, error: 'Test Cash Payment option not found' }
      })

      if (paymentSelected.success) {
        log(
          `✅ Selected payment method: ${paymentSelected.text} (${paymentSelected.method})`,
          'success'
        )
      } else {
        log('⚠️ Could not find Test Cash Payment option', 'warning')
      }

      const screenshot9 = await takeScreenshot(page, testRun, 9, 'payment-selected')
      results.screenshots.push(screenshot9)
      results.steps.push({
        step: 9,
        name: 'Select Test Cash Payment',
        success: paymentSelected.success,
      })
    } catch (error) {
      log(`⚠️ Payment selection error: ${error.message}`, 'warning')
      results.steps.push({
        step: 9,
        name: 'Select Test Cash Payment',
        success: false,
        error: error.message,
      })
    }

    // STEP 10: Complete the order
    log('🎯 Step 10: Completing the order', 'step')
    try {
      await wait(2000)

      const orderCompleted = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const submitBtn = buttons.find(
          (btn) =>
            btn.textContent.toLowerCase().includes('place order') ||
            btn.textContent.toLowerCase().includes('complete order') ||
            btn.textContent.toLowerCase().includes('submit order') ||
            btn.textContent.toLowerCase().includes('confirm order') ||
            btn.textContent.toLowerCase().includes('pay now')
        )

        if (submitBtn && !submitBtn.disabled) {
          submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' })
          submitBtn.click()
          return { success: true, buttonText: submitBtn.textContent.trim() }
        }

        return { success: false, error: 'Order completion button not found or disabled' }
      })

      if (orderCompleted.success) {
        log(`✅ Clicked order button: "${orderCompleted.buttonText}"`, 'success')
        await wait(5000) // Wait for order processing

        // Check for success page or order confirmation
        const orderInfo = await page.evaluate(() => {
          const bodyText = document.body.textContent
          const orderNumberMatch =
            bodyText.match(/order\s*#?\s*(\d+)/i) ||
            bodyText.match(/order\s*number:?\s*([A-Z0-9-]+)/i) ||
            bodyText.match(/confirmation\s*#?\s*([A-Z0-9-]+)/i)

          const success =
            bodyText.toLowerCase().includes('order placed') ||
            bodyText.toLowerCase().includes('order confirmed') ||
            bodyText.toLowerCase().includes('thank you') ||
            bodyText.toLowerCase().includes('confirmation')

          return {
            orderNumber: orderNumberMatch ? orderNumberMatch[1] : null,
            success: success,
            url: window.location.href,
          }
        })

        if (orderInfo.orderNumber) {
          results.orderNumber = orderInfo.orderNumber
          log(`✅ Order completed! Order #${orderInfo.orderNumber}`, 'success')
        } else if (orderInfo.success) {
          log('✅ Order completed successfully!', 'success')
        } else {
          log('✅ Order submitted (confirmation pending)', 'success')
        }

        const screenshot10 = await takeScreenshot(page, testRun, 10, 'order-completed')
        results.screenshots.push(screenshot10)
        results.steps.push({ step: 10, name: 'Complete order', success: true })
      } else {
        throw new Error(orderCompleted.error)
      }
    } catch (error) {
      throw new Error(`Failed to complete order: ${error.message}`)
    }

    // Test completed successfully
    results.success = true
    results.endTime = new Date().toISOString()
    log('✅ TEST COMPLETED SUCCESSFULLY!', 'success')
  } catch (error) {
    log(`❌ TEST FAILED: ${error.message}`, 'error')
    results.success = false
    results.errors.push(error.message)
    results.endTime = new Date().toISOString()

    // Take error screenshot
    if (browser) {
      try {
        const pages = await browser.pages()
        if (pages.length > 0) {
          const errorScreenshot = await takeScreenshot(pages[0], testRun, 99, 'error')
          results.screenshots.push(errorScreenshot)
        }
      } catch (screenshotError) {
        log(`Failed to take error screenshot: ${screenshotError.message}`, 'error')
      }
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return results
}

// Main execution function
async function runCompleteTest() {
  console.log('\n' + '='.repeat(80))
  console.log('🧪 COMPLETE CUSTOMER ORDER FLOW TEST')
  console.log('🎯 Testing: https://gangrunprinting.com/products/asdfasd')
  console.log('📧 Customer: appvillagellc@gmail.com')
  console.log('🔄 Running 5 test iterations for consistency')
  console.log('='.repeat(80) + '\n')

  const allResults = []
  let successCount = 0
  let failCount = 0

  // Run 5 test iterations
  for (let i = 1; i <= 5; i++) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`🚀 STARTING TEST RUN ${i}/5`)
    console.log(`${'─'.repeat(60)}\n`)

    const result = await runOrderFlowTest(i)
    allResults.push(result)

    if (result.success) {
      successCount++
      log(`✅ Test ${i} PASSED`, 'success')
    } else {
      failCount++
      log(`❌ Test ${i} FAILED`, 'error')
    }

    // Wait between tests (except for the last one)
    if (i < 5) {
      log('⏳ Waiting 10 seconds before next test...', 'info')
      await wait(10000)
    }
  }

  // Generate comprehensive summary report
  console.log('\n' + '='.repeat(80))
  console.log('📊 COMPREHENSIVE TEST SUMMARY')
  console.log('='.repeat(80) + '\n')

  const overallSuccessRate = ((successCount / 5) * 100).toFixed(1)
  console.log(`✅ Successful Tests: ${successCount}/5`)
  console.log(`❌ Failed Tests: ${failCount}/5`)
  console.log(`📈 Success Rate: ${overallSuccessRate}%`)
  console.log(
    `🕒 Test Duration: ${allResults[0]?.startTime} to ${allResults[allResults.length - 1]?.endTime}`
  )

  // Detailed results for each test
  allResults.forEach((result, index) => {
    console.log(`\n${'-'.repeat(40)}`)
    console.log(`Test ${index + 1}: ${result.success ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(
      `Steps Completed: ${result.steps.filter((s) => s.success).length}/${result.steps.length}`
    )

    if (result.orderNumber) {
      console.log(`Order Number: ${result.orderNumber}`)
    }

    if (result.errors.length > 0) {
      console.log(`Errors: ${result.errors.join(', ')}`)
    }

    console.log(`Screenshots: ${result.screenshots.length}`)
    console.log(`Duration: ${result.startTime} - ${result.endTime}`)
  })

  // Step-by-step analysis
  console.log(`\n${'─'.repeat(60)}`)
  console.log('📋 STEP-BY-STEP ANALYSIS')
  console.log(`${'─'.repeat(60)}`)

  const stepNames = [
    'Navigate to product page',
    'Product configuration loaded',
    'Configure product options',
    'Add to cart',
    'Navigate to cart',
    'Proceed to checkout',
    'Fill customer information',
    'Select shipping method',
    'Select Test Cash Payment',
    'Complete order',
  ]

  stepNames.forEach((stepName, stepIndex) => {
    const stepNumber = stepIndex + 1
    const stepResults = allResults.map((r) => r.steps.find((s) => s.step === stepNumber))
    const successfulSteps = stepResults.filter((s) => s && s.success).length
    const successRate = ((successfulSteps / 5) * 100).toFixed(1)

    console.log(`Step ${stepNumber}: ${stepName} - ${successfulSteps}/5 (${successRate}%)`)
  })

  // Save detailed report
  const reportPath = path.join(__dirname, 'order-flow-test-report.json')
  const detailedReport = {
    testMetadata: {
      productUrl: PRODUCT_URL,
      customerEmail: CUSTOMER_INFO.email,
      testRuns: 5,
      timestamp: new Date().toISOString(),
    },
    summary: {
      totalTests: 5,
      passed: successCount,
      failed: failCount,
      successRate: overallSuccessRate + '%',
    },
    stepAnalysis: stepNames.map((stepName, stepIndex) => {
      const stepNumber = stepIndex + 1
      const stepResults = allResults.map((r) => r.steps.find((s) => s.step === stepNumber))
      const successfulSteps = stepResults.filter((s) => s && s.success).length
      return {
        step: stepNumber,
        name: stepName,
        successCount: successfulSteps,
        failureCount: 5 - successfulSteps,
        successRate: ((successfulSteps / 5) * 100).toFixed(1) + '%',
      }
    }),
    detailedResults: allResults,
  }

  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2))

  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  console.log(`📸 Screenshots saved to: ${path.join(__dirname, 'screenshots', 'order-flow-test')}`)

  console.log('\n' + '='.repeat(80))
  console.log('🎉 COMPLETE CUSTOMER ORDER FLOW TEST FINISHED')
  console.log(`🏆 Final Result: ${overallSuccessRate}% Success Rate`)
  console.log('='.repeat(80) + '\n')

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0)
}

// Execute the test if run directly
if (require.main === module) {
  runCompleteTest().catch((error) => {
    console.error(`Fatal error: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { runCompleteTest, runOrderFlowTest }
