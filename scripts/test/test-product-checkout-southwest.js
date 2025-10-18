/**
 * END-TO-END TEST: Product Checkout with Southwest Cargo Shipping
 *
 * REAL Product: https://gangrunprinting.com/products/4x6-flyers-9pt-card-stock
 *
 * Test Specifications (User Requirements):
 * - Quantity: 5000
 * - Size: 4x6
 * - Paper Stock: 9pt C2S Cardstock
 * - Coating: UV-coated both sides
 * - Sides: Both sides (same image)
 * - Design: No design options
 * - Shipping: Southwest Cargo (verify 82 airports)
 *
 * This test will run 3 iterations and document all issues found.
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// Test configuration
const BASE_URL = 'https://gangrunprinting.com'
const PRODUCT_URL = `${BASE_URL}/products/4x6-flyers-9pt-card-stock`
const SCREENSHOT_DIR = './test-screenshots/southwest-checkout'
const TEST_ITERATIONS = 3

// Test specifications (EXACT requirements from user)
const TEST_CONFIG = {
  quantity: '5000',
  size: '4″ × 6″',
  paperStock: '9pt C2S Cardstock',
  coating: 'UV', // Will look for UV coating option
  sides: 'both', // Image both sides (4/4)
  design: 'none', // No design options selected
  shipping: {
    street: '123 Test Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    airport: 'ORD', // Chicago O'Hare
  },
}

// Results storage
const testResults = {
  iterations: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    issues: [],
  },
}

/**
 * Utility: Wait for selector with timeout
 */
async function waitForSelector(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true })
    return true
  } catch (error) {
    console.error(`❌ Selector not found: ${selector}`)
    return false
  }
}

/**
 * Utility: Take screenshot
 */
async function takeScreenshot(page, name, iteration) {
  const dir = path.join(SCREENSHOT_DIR, `iteration-${iteration}`)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const filename = path.join(dir, `${name}.png`)
  await page.screenshot({ path: filename, fullPage: true })
  console.log(`📸 Screenshot saved: ${filename}`)
  return filename
}

/**
 * Utility: Log with timestamp
 */
function log(message) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`)
}

/**
 * Utility: Capture console errors
 */
function setupConsoleLogging(page) {
  const consoleErrors = []

  page.on('console', (msg) => {
    const type = msg.type()
    if (type === 'error' || type === 'warning') {
      const text = msg.text()
      consoleErrors.push({ type, text, timestamp: new Date().toISOString() })
      console.log(`🔴 Console ${type}: ${text}`)
    }
  })

  page.on('pageerror', (error) => {
    consoleErrors.push({ type: 'pageerror', text: error.toString(), timestamp: new Date().toISOString() })
    console.log(`🔴 Page error: ${error}`)
  })

  return consoleErrors
}

/**
 * Step 1: Navigate to product page
 */
async function navigateToProduct(page, iteration) {
  log('Step 1: Navigating to product page...')

  try {
    await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 30000 })
    await takeScreenshot(page, '01-product-page-loaded', iteration)

    // Verify product page loaded
    const title = await page.title()
    log(`✅ Product page loaded: ${title}`)

    // Verify it's the correct product
    const heading = await page.$eval('h1', (el) => el.textContent)
    if (!heading.includes('4x6 Flyers')) {
      throw new Error(`Wrong product loaded: ${heading}`)
    }

    return { success: true, message: 'Product page loaded successfully' }
  } catch (error) {
    log(`❌ Failed to navigate to product page: ${error.message}`)
    await takeScreenshot(page, '01-product-page-ERROR', iteration)
    return { success: false, message: error.message }
  }
}

/**
 * Step 2: Configure product (verify defaults and adjust if needed)
 */
async function configureProduct(page, iteration) {
  log('Step 2: Configuring product options...')

  const issues = []

  try {
    await page.waitForTimeout(2000)

    // Step 2a: Verify Quantity is 5000
    log('  → Verifying quantity: 5000')
    try {
      const quantitySelect = await page.$('select, [role="combobox"]')
      if (quantitySelect) {
        const currentValue = await page.evaluate((el) => {
          const select = el.tagName === 'SELECT' ? el : el.querySelector('select')
          return select ? select.value : el.textContent
        }, quantitySelect)

        log(`    Current quantity: ${currentValue}`)

        // Check if we need to change to 5000
        if (!currentValue.includes('5000')) {
          // Try to select 5000 from dropdown
          const selectElement = await page.$('select')
          if (selectElement) {
            const options = await page.$$eval('select option', (opts) =>
              opts.map((o) => ({ value: o.value, text: o.textContent }))
            )
            const qty5000 = options.find((o) => o.text.includes('5000') || o.value === '5000')

            if (qty5000) {
              await page.select('select', qty5000.value)
              log(`    ✅ Quantity set to: 5000`)
              await page.waitForTimeout(1000)
            } else {
              issues.push('5000 quantity option not found')
              log(`    ⚠️  5000 not available in dropdown`)
            }
          }
        } else {
          log(`    ✅ Quantity already set to 5000`)
        }
      }
    } catch (error) {
      issues.push(`Quantity configuration failed: ${error.message}`)
      log(`    ❌ Quantity error: ${error.message}`)
    }

    await takeScreenshot(page, '02a-quantity-verified', iteration)

    // Step 2b: Verify Size is 4x6
    log('  → Verifying size: 4x6')
    try {
      const sizeText = await page.evaluate(() => {
        const sizeLabel = Array.from(document.querySelectorAll('*')).find(
          (el) => el.textContent.includes('SIZE') && el.tagName !== 'SCRIPT'
        )
        if (sizeLabel) {
          const sibling = sizeLabel.nextElementSibling
          return sibling ? sibling.textContent : 'not found'
        }
        return 'not found'
      })

      log(`    Current size: ${sizeText}`)

      if (sizeText.includes('4') && sizeText.includes('6')) {
        log(`    ✅ Size is 4x6`)
      } else {
        issues.push('Size is not 4x6')
        log(`    ⚠️  Size may not be 4x6`)
      }
    } catch (error) {
      issues.push(`Size verification failed: ${error.message}`)
      log(`    ❌ Size error: ${error.message}`)
    }

    await takeScreenshot(page, '02b-size-verified', iteration)

    // Step 2c: Verify Paper Stock is 9pt
    log('  → Verifying paper stock: 9pt C2S Cardstock')
    try {
      const paperText = await page.evaluate(() => {
        const paperLabel = Array.from(document.querySelectorAll('*')).find(
          (el) => el.textContent.includes('PAPER STOCK') && el.tagName !== 'SCRIPT'
        )
        if (paperLabel) {
          const sibling = paperLabel.nextElementSibling
          return sibling ? sibling.textContent : 'not found'
        }
        return 'not found'
      })

      log(`    Current paper: ${paperText}`)

      if (paperText.includes('9pt')) {
        log(`    ✅ Paper stock is 9pt C2S Cardstock`)
      } else {
        issues.push('Paper stock is not 9pt')
        log(`    ⚠️  Paper stock may not be 9pt`)
      }
    } catch (error) {
      issues.push(`Paper stock verification failed: ${error.message}`)
      log(`    ❌ Paper error: ${error.message}`)
    }

    await takeScreenshot(page, '02c-paper-verified', iteration)

    // Step 2d: Check and adjust Coating (need UV coating both sides)
    log('  → Checking coating options for UV')
    try {
      // Look for coating dropdown
      const coatingSelects = await page.$$('select')
      let uvFound = false

      for (const select of coatingSelects) {
        const options = await select.evaluate((el) => {
          const opts = Array.from(el.options || [])
          return opts.map((o) => ({ value: o.value, text: o.textContent }))
        })

        // Check if this is the coating select
        const hasUV = options.some((o) => o.text.toLowerCase().includes('uv'))

        if (hasUV) {
          log(`    Found coating options with UV`)
          // Select UV coating
          const uvOption = options.find((o) => o.text.toLowerCase().includes('uv'))
          if (uvOption) {
            await select.evaluate((el, value) => {
              el.value = value
              el.dispatchEvent(new Event('change', { bubbles: true }))
            }, uvOption.value)
            log(`    ✅ Selected UV coating: ${uvOption.text}`)
            uvFound = true
            await page.waitForTimeout(1000)
          }
          break
        }
      }

      if (!uvFound) {
        issues.push('UV coating option not found')
        log(`    ⚠️  UV coating not found - using default`)
      }
    } catch (error) {
      issues.push(`Coating configuration failed: ${error.message}`)
      log(`    ❌ Coating error: ${error.message}`)
    }

    await takeScreenshot(page, '02d-coating-configured', iteration)

    // Step 2e: Check and adjust Sides (need both sides / 4/4)
    log('  → Checking sides options for both sides (4/4)')
    try {
      const sidesSelects = await page.$$('select')
      let bothSidesFound = false

      for (const select of sidesSelects) {
        const options = await select.evaluate((el) => {
          const opts = Array.from(el.options || [])
          return opts.map((o) => ({ value: o.value, text: o.textContent }))
        })

        // Check if this is the sides select
        const hasBothSides = options.some(
          (o) =>
            o.text.toLowerCase().includes('both') ||
            o.text.includes('4/4') ||
            o.text.toLowerCase().includes('double')
        )

        if (hasBothSides) {
          log(`    Found sides options`)
          // Select both sides
          const bothOption = options.find(
            (o) =>
              o.text.toLowerCase().includes('both') ||
              o.text.includes('4/4') ||
              o.text.toLowerCase().includes('double')
          )
          if (bothOption) {
            await select.evaluate((el, value) => {
              el.value = value
              el.dispatchEvent(new Event('change', { bubbles: true }))
            }, bothOption.value)
            log(`    ✅ Selected both sides: ${bothOption.text}`)
            bothSidesFound = true
            await page.waitForTimeout(1000)
          }
          break
        }
      }

      if (!bothSidesFound) {
        issues.push('Both sides (4/4) option not found')
        log(`    ⚠️  Both sides option not found - using default`)
      }
    } catch (error) {
      issues.push(`Sides configuration failed: ${error.message}`)
      log(`    ❌ Sides error: ${error.message}`)
    }

    await takeScreenshot(page, '02e-sides-configured', iteration)

    log('✅ Product configuration verified/adjusted')
    return { success: true, message: 'Product configured', issues }
  } catch (error) {
    log(`❌ Product configuration failed: ${error.message}`)
    await takeScreenshot(page, '02-configuration-ERROR', iteration)
    return { success: false, message: error.message, issues }
  }
}

/**
 * Step 3: Add product to cart
 */
async function addToCart(page, iteration) {
  log('Step 3: Adding product to cart...')

  try {
    // Look for Add to Cart button
    const addToCartButton = await page.waitForSelector('button:has-text("Add to Cart"), button[type="submit"]', {
      timeout: 5000,
    }).catch(() => null)

    if (!addToCartButton) {
      throw new Error('Add to Cart button not found')
    }

    // Check if button is enabled
    const isDisabled = await addToCartButton.evaluate((el) => el.disabled)
    if (isDisabled) {
      log('⚠️  Add to Cart button is disabled')
      await takeScreenshot(page, '03-add-to-cart-DISABLED', iteration)
      return { success: false, message: 'Add to Cart button is disabled' }
    }

    // Click Add to Cart
    await addToCartButton.click()
    log('✅ Clicked Add to Cart button')

    // Wait for response
    await page.waitForTimeout(3000)
    await takeScreenshot(page, '03-added-to-cart', iteration)

    return { success: true, message: 'Product added to cart' }
  } catch (error) {
    log(`❌ Failed to add to cart: ${error.message}`)
    await takeScreenshot(page, '03-add-to-cart-ERROR', iteration)
    return { success: false, message: error.message }
  }
}

/**
 * Step 4: Navigate to checkout
 */
async function navigateToCheckout(page, iteration) {
  log('Step 4: Navigating to checkout...')

  try {
    // Try to find and click checkout/cart button
    const checkoutPaths = [
      'a[href*="/checkout"]',
      'a[href*="/cart"]',
      'button:has-text("Checkout")',
      'button:has-text("Cart")',
    ]

    let navigated = false
    for (const selector of checkoutPaths) {
      try {
        const element = await page.$(selector)
        if (element) {
          await element.click()
          await page.waitForNavigation({ timeout: 10000 }).catch(() => {})
          navigated = true
          break
        }
      } catch (err) {
        continue
      }
    }

    if (!navigated) {
      // Navigate directly
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2', timeout: 30000 })
    }

    await takeScreenshot(page, '04-checkout-page', iteration)

    // Verify checkout page loaded
    const url = page.url()
    if (!url.includes('/checkout') && !url.includes('/cart')) {
      throw new Error(`Not on checkout page. Current URL: ${url}`)
    }

    log(`✅ Checkout page loaded: ${url}`)
    return { success: true, message: 'Navigated to checkout' }
  } catch (error) {
    log(`❌ Failed to navigate to checkout: ${error.message}`)
    await takeScreenshot(page, '04-checkout-ERROR', iteration)
    return { success: false, message: error.message }
  }
}

/**
 * Step 5: Fill shipping information
 */
async function fillShippingInfo(page, iteration) {
  log('Step 5: Filling shipping information...')

  try {
    const { street, city, state, zipCode } = TEST_CONFIG.shipping

    await page.waitForTimeout(2000)

    // Fill shipping form fields
    const fieldMappings = [
      { name: 'street', value: street, selectors: ['input[name="street"]', 'input[name="address"]', 'input[placeholder*="street" i]'] },
      { name: 'city', value: city, selectors: ['input[name="city"]', 'input[placeholder*="city" i]'] },
      { name: 'zipCode', value: zipCode, selectors: ['input[name="zipCode"]', 'input[name="zip"]', 'input[placeholder*="zip" i]'] },
    ]

    for (const field of fieldMappings) {
      log(`  → Entering ${field.name}: ${field.value}`)
      let filled = false

      for (const selector of field.selectors) {
        const input = await page.$(selector)
        if (input) {
          await input.click({ clickCount: 3 })
          await input.type(field.value)
          log(`    ✅ ${field.name} entered`)
          filled = true
          break
        }
      }

      if (!filled) {
        throw new Error(`${field.name} input not found`)
      }
    }

    // Select state
    log(`  → Selecting state: ${state}`)
    const stateSelect = await page.$('select[name="state"], select[name="stateCode"]')
    if (stateSelect) {
      await page.select('select[name="state"], select[name="stateCode"]', state)
      log('    ✅ State selected')
    } else {
      throw new Error('State selector not found')
    }

    await page.waitForTimeout(1000)
    await takeScreenshot(page, '05-shipping-info-filled', iteration)

    // Click continue/calculate shipping
    const continueButton = await page.$('button:has-text("Continue"), button:has-text("Calculate"), button[type="submit"]')
    if (continueButton) {
      await continueButton.click()
      log('✅ Clicked continue button')
      await page.waitForTimeout(4000) // Wait for shipping rates to load
    }

    await takeScreenshot(page, '05-shipping-calculated', iteration)

    return { success: true, message: 'Shipping information filled' }
  } catch (error) {
    log(`❌ Failed to fill shipping info: ${error.message}`)
    await takeScreenshot(page, '05-shipping-ERROR', iteration)
    return { success: false, message: error.message }
  }
}

/**
 * Step 6: Select Southwest Cargo shipping and airport
 */
async function selectSouthwestCargo(page, iteration) {
  log('Step 6: Selecting Southwest Cargo shipping...')

  const issues = []

  try {
    await page.waitForTimeout(3000)

    // Look for shipping options
    log('  → Looking for Southwest Cargo shipping option...')

    // Get all text on page
    const pageText = await page.evaluate(() => document.body.innerText)

    if (!pageText.toLowerCase().includes('southwest') && !pageText.toLowerCase().includes('cargo')) {
      issues.push('Southwest Cargo shipping option not found on page')
      log('    ❌ Southwest Cargo not found in page content')
      await takeScreenshot(page, '06-southwest-NOT-FOUND', iteration)
      return { success: false, message: 'Southwest Cargo not available', issues }
    }

    log('    ✅ Southwest Cargo text found on page')

    // Try to find and click Southwest Cargo radio button or option
    const radioButtons = await page.$$('input[type="radio"]')
    let southwestRadio = null

    for (const radio of radioButtons) {
      const label = await radio.evaluate((el) => {
        const parent = el.closest('label') || el.parentElement
        return parent ? parent.textContent : ''
      })

      if (label.toLowerCase().includes('southwest') || label.toLowerCase().includes('cargo')) {
        southwestRadio = radio
        log(`    Found Southwest option: ${label.substring(0, 50)}...`)
        break
      }
    }

    if (southwestRadio) {
      await southwestRadio.click()
      log('    ✅ Southwest Cargo radio button clicked')
      await page.waitForTimeout(2000)
      await takeScreenshot(page, '06a-southwest-selected', iteration)
    } else {
      issues.push('Southwest Cargo radio button not found')
      log('    ⚠️  Could not click Southwest Cargo option')
    }

    // Look for airport selector
    log('  → Looking for airport selector...')
    await page.waitForTimeout(1500)

    const airportSelect = await page.$('select[name*="airport" i], select:has(option[value*="ORD" i])')

    if (!airportSelect) {
      issues.push('Airport selector did not appear')
      log('    ❌ Airport selector not found')
      await takeScreenshot(page, '06-airport-selector-NOT-FOUND', iteration)
      return { success: false, message: 'Airport selector not found', issues }
    }

    // Get all airport options
    const airports = await page.evaluate(() => {
      const select = document.querySelector('select[name*="airport" i], select:has(option[value*="ORD" i])')
      if (!select) return []
      return Array.from(select.options).map((o) => ({ value: o.value, text: o.textContent }))
    })

    log(`    ✅ Airport selector found with ${airports.length} airports`)

    if (airports.length < 82) {
      issues.push(`Expected 82 airports, found ${airports.length}`)
      log(`    ⚠️  Expected 82 airports, found ${airports.length}`)
    } else {
      log(`    ✅ All 82 Southwest Cargo airports available`)
    }

    // Select Chicago O'Hare (ORD)
    const ordAirport = airports.find((a) => a.text.includes('ORD') || a.text.includes('Chicago') || a.text.includes("O'Hare"))

    if (ordAirport) {
      await page.select('select[name*="airport" i], select:has(option[value*="ORD" i])', ordAirport.value)
      log(`    ✅ Airport selected: ${ordAirport.text}`)
    } else {
      // Select first airport as fallback
      await page.select('select[name*="airport" i], select:has(option[value*="ORD" i])', airports[0].value)
      log(`    ⚠️  ORD not found, selected: ${airports[0].text}`)
      issues.push('Chicago ORD airport not found')
    }

    await page.waitForTimeout(1000)
    await takeScreenshot(page, '06b-airport-selected', iteration)

    return { success: true, message: 'Southwest Cargo selected with airport', issues, airportCount: airports.length }
  } catch (error) {
    log(`❌ Failed to select Southwest Cargo: ${error.message}`)
    await takeScreenshot(page, '06-southwest-ERROR', iteration)
    return { success: false, message: error.message, issues }
  }
}

/**
 * Step 7: Verify order summary
 */
async function verifyOrderSummary(page, iteration) {
  log('Step 7: Verifying order summary...')

  const issues = []

  try {
    await page.waitForTimeout(1000)

    // Get page content
    const summaryText = await page.evaluate(() => document.body.innerText)

    // Verify key elements
    const checks = {
      product: summaryText.includes('4x6') && summaryText.includes('Flyer'),
      quantity: summaryText.includes('5000') || summaryText.includes('5,000'),
      southwest: summaryText.toLowerCase().includes('southwest') || summaryText.toLowerCase().includes('cargo'),
      total: summaryText.includes('$') && (summaryText.includes('Total') || summaryText.includes('total')),
    }

    log('  Order Summary Checks:')
    log(`    Product (4x6 Flyers): ${checks.product ? '✅' : '❌'}`)
    log(`    Quantity (5000): ${checks.quantity ? '✅' : '❌'}`)
    log(`    Southwest Cargo: ${checks.southwest ? '✅' : '❌'}`)
    log(`    Total price: ${checks.total ? '✅' : '❌'}`)

    if (!checks.product) issues.push('Product (4x6 Flyers) not in summary')
    if (!checks.quantity) issues.push('Quantity (5000) not in summary')
    if (!checks.southwest) issues.push('Southwest Cargo not in summary')
    if (!checks.total) issues.push('Total price not in summary')

    await takeScreenshot(page, '07-order-summary', iteration)

    const allPassed = Object.values(checks).every((c) => c)

    return {
      success: allPassed,
      message: allPassed ? 'Order summary verified' : 'Some summary elements missing',
      issues,
      checks,
    }
  } catch (error) {
    log(`❌ Failed to verify order summary: ${error.message}`)
    await takeScreenshot(page, '07-summary-ERROR', iteration)
    return { success: false, message: error.message, issues }
  }
}

/**
 * Run a single test iteration
 */
async function runTestIteration(iteration) {
  log(`\n${'='.repeat(80)}`)
  log(`STARTING TEST ITERATION ${iteration}/${TEST_ITERATIONS}`)
  log(`${'='.repeat(80)}\n`)

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  const consoleErrors = setupConsoleLogging(page)

  const results = {
    iteration,
    timestamp: new Date().toISOString(),
    steps: [],
    consoleErrors: [],
    overallSuccess: false,
  }

  try {
    // Step 1: Navigate to product
    const step1 = await navigateToProduct(page, iteration)
    results.steps.push({ step: 1, name: 'Navigate to product', ...step1 })
    if (!step1.success) throw new Error('Step 1 failed')

    // Step 2: Configure product
    const step2 = await configureProduct(page, iteration)
    results.steps.push({ step: 2, name: 'Configure product', ...step2 })
    if (!step2.success) throw new Error('Step 2 failed')

    // Step 3: Add to cart
    const step3 = await addToCart(page, iteration)
    results.steps.push({ step: 3, name: 'Add to cart', ...step3 })
    if (!step3.success) throw new Error('Step 3 failed')

    // Step 4: Navigate to checkout
    const step4 = await navigateToCheckout(page, iteration)
    results.steps.push({ step: 4, name: 'Navigate to checkout', ...step4 })
    if (!step4.success) throw new Error('Step 4 failed')

    // Step 5: Fill shipping info
    const step5 = await fillShippingInfo(page, iteration)
    results.steps.push({ step: 5, name: 'Fill shipping info', ...step5 })
    if (!step5.success) throw new Error('Step 5 failed')

    // Step 6: Select Southwest Cargo
    const step6 = await selectSouthwestCargo(page, iteration)
    results.steps.push({ step: 6, name: 'Select Southwest Cargo', ...step6 })
    if (!step6.success) throw new Error('Step 6 failed')

    // Step 7: Verify order summary
    const step7 = await verifyOrderSummary(page, iteration)
    results.steps.push({ step: 7, name: 'Verify order summary', ...step7 })

    results.overallSuccess = step7.success
    results.consoleErrors = consoleErrors

    log(`\n✅ Test iteration ${iteration} PASSED\n`)
  } catch (error) {
    log(`\n❌ Test iteration ${iteration} FAILED: ${error.message}\n`)
    results.overallSuccess = false
    results.error = error.message
    results.consoleErrors = consoleErrors
  } finally {
    await browser.close()
  }

  return results
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(80))
  console.log('CHROME DEVTOOLS E2E TEST: Product Checkout with Southwest Cargo')
  console.log('='.repeat(80) + '\n')

  console.log('Test Configuration:')
  console.log(`  Product URL: ${PRODUCT_URL}`)
  console.log(`  Iterations: ${TEST_ITERATIONS}`)
  console.log(`  Product Specifications:`)
  console.log(`    - Quantity: ${TEST_CONFIG.quantity}`)
  console.log(`    - Size: ${TEST_CONFIG.size}`)
  console.log(`    - Paper Stock: ${TEST_CONFIG.paperStock}`)
  console.log(`    - Coating: ${TEST_CONFIG.coating} (both sides)`)
  console.log(`    - Sides: ${TEST_CONFIG.sides} (same image both sides)`)
  console.log(`    - Design: ${TEST_CONFIG.design}`)
  console.log(`  Shipping:`)
  console.log(`    - Address: ${TEST_CONFIG.shipping.street}, ${TEST_CONFIG.shipping.city}, ${TEST_CONFIG.shipping.state} ${TEST_CONFIG.shipping.zipCode}`)
  console.log(`    - Carrier: Southwest Cargo`)
  console.log(`    - Airport: ${TEST_CONFIG.shipping.airport} (Chicago O'Hare)`)
  console.log('')

  // Run all iterations
  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    const result = await runTestIteration(i)
    testResults.iterations.push(result)
    testResults.summary.totalTests++

    if (result.overallSuccess) {
      testResults.summary.passed++
    } else {
      testResults.summary.failed++
    }

    // Collect issues
    result.steps.forEach((step) => {
      if (step.issues && step.issues.length > 0) {
        step.issues.forEach((issue) => {
          if (!testResults.summary.issues.includes(issue)) {
            testResults.summary.issues.push(issue)
          }
        })
      }
    })

    // Wait between iterations
    if (i < TEST_ITERATIONS) {
      log(`Waiting 5 seconds before next iteration...\n`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  // Save results
  const resultsFile = path.join(SCREENSHOT_DIR, 'test-results.json')
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2))
  log(`\n📄 Test results saved to: ${resultsFile}`)

  // Print summary
  console.log('\n' + '='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Tests: ${testResults.summary.totalTests}`)
  console.log(`Passed: ${testResults.summary.passed} ✅`)
  console.log(`Failed: ${testResults.summary.failed} ❌`)
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(1)}%`)

  if (testResults.summary.issues.length > 0) {
    console.log(`\nIssues Found (${testResults.summary.issues.length}):`)
    testResults.summary.issues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue}`)
    })
  } else {
    console.log('\n✅ No issues found - all tests passed perfectly!')
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
