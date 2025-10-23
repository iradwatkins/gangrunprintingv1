/**
 * Payment Test Helpers
 * Shared utilities for Square Card and Cash App Pay E2E tests
 */

import { PrismaClient } from '@prisma/client'
import { Page } from '@playwright/test'

const prisma = new PrismaClient()

// Test configuration
export const TEST_CONFIG = {
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://gangrunprinting.com',

  // Test customer information
  customer: {
    name: 'Payment Test Customer',
    email: 'payment-test@gangrunprinting.com',
    phone: '(555) 123-4567',
  },

  // Test shipping address
  shippingAddress: {
    street: '123 Test Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'US',
  },

  // Test product
  product: {
    url: '/products/4x6-flyers-9pt-card-stock',
    name: '4x6 Flyers',
    quantity: 500,
  },

  // Square sandbox test cards
  testCards: {
    visa: {
      number: '4111 1111 1111 1111',
      expiry: '12/25',
      cvv: '123',
      zip: '60601',
    },
    mastercard: {
      number: '5555 5555 5555 4444',
      expiry: '12/25',
      cvv: '123',
      zip: '60601',
    },
    amex: {
      number: '3782 822463 10005',
      expiry: '12/25',
      cvv: '1234',
      zip: '60601',
    },
    discover: {
      number: '6011 1111 1111 1117',
      expiry: '12/25',
      cvv: '123',
      zip: '60601',
    },
  },

  // Timeouts
  timeouts: {
    navigation: 30000,
    payment: 45000,
    database: 10000,
  },
}

/**
 * Screenshot helper
 */
export async function takeScreenshot(page: Page, name: string, iteration?: number) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = iteration
    ? `test-results/screenshots/iteration-${iteration}/${name}-${timestamp}.png`
    : `test-results/screenshots/${name}-${timestamp}.png`

  await page.screenshot({ path: filename, fullPage: true })
  console.log(`📸 Screenshot: ${filename}`)
  return filename
}

/**
 * Wait helper with logging
 */
export async function wait(ms: number, reason?: string) {
  if (reason) {
    console.log(`⏳ Waiting ${ms}ms: ${reason}`)
  }
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Log test step
 */
export function logStep(step: number, message: string) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`STEP ${step}: ${message}`)
  console.log(`${'='.repeat(80)}\n`)
}

/**
 * Navigate to product and add to cart
 */
export async function addProductToCart(page: Page, iteration?: number) {
  logStep(1, 'Navigate to Product & Add to Cart')

  // Navigate to product
  console.log(`Navigating to: ${TEST_CONFIG.baseURL}${TEST_CONFIG.product.url}`)
  await page.goto(`${TEST_CONFIG.baseURL}${TEST_CONFIG.product.url}`, {
    waitUntil: 'networkidle',
    timeout: TEST_CONFIG.timeouts.navigation,
  })

  if (iteration) {
    await takeScreenshot(page, '01-product-page', iteration)
  }

  // Wait for product page to load
  await wait(2000, 'Product page to fully load')

  // Verify quantity selector exists
  const quantitySelector = page.locator('select').first()
  await quantitySelector.waitFor({ state: 'visible', timeout: 10000 })

  // Check if 500 is available, select it if needed
  const currentValue = await quantitySelector.inputValue()
  if (!currentValue.includes('500')) {
    const hasQty500 = await quantitySelector.locator('option', { hasText: '500' }).count()
    if (hasQty500 > 0) {
      await quantitySelector.selectOption({ label: /500/ })
      console.log('✅ Selected quantity: 500')
      await wait(1000, 'Price to update')
    }
  }

  // Find and click Add to Cart
  const addToCartBtn = page.locator('button', { hasText: 'Add to Cart' })
  await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 })
  await addToCartBtn.click()
  console.log('✅ Clicked Add to Cart')

  await wait(2000, 'Cart to update')

  if (iteration) {
    await takeScreenshot(page, '02-added-to-cart', iteration)
  }
}

/**
 * Navigate to checkout
 */
export async function navigateToCheckout(page: Page, iteration?: number) {
  logStep(2, 'Navigate to Checkout')

  console.log(`Navigating to checkout...`)
  await page.goto(`${TEST_CONFIG.baseURL}/checkout`, {
    waitUntil: 'networkidle',
    timeout: TEST_CONFIG.timeouts.navigation,
  })

  await wait(2000, 'Checkout page to load')

  if (iteration) {
    await takeScreenshot(page, '03-checkout-page', iteration)
  }

  console.log('✅ Checkout page loaded')
}

/**
 * Fill shipping information
 */
export async function fillShippingInfo(page: Page, iteration?: number) {
  logStep(3, 'Fill Shipping Information')

  const { street, city, state, zipCode } = TEST_CONFIG.shippingAddress
  const { email, name, phone } = TEST_CONFIG.customer

  // Fill email
  console.log('Filling email...')
  const emailInput = page.locator('input[name="email"], input[type="email"]').first()
  await emailInput.fill(email)
  console.log(`✅ Email: ${email}`)

  // Fill name
  console.log('Filling name...')
  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
  await nameInput.fill(name)
  console.log(`✅ Name: ${name}`)

  // Fill phone
  console.log('Filling phone...')
  const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first()
  await phoneInput.fill(phone)
  console.log(`✅ Phone: ${phone}`)

  // Fill street
  console.log('Filling street address...')
  const streetInput = page.locator('input[name="street"], input[name="address"]').first()
  await streetInput.fill(street)
  console.log(`✅ Street: ${street}`)

  // Fill city
  console.log('Filling city...')
  const cityInput = page.locator('input[name="city"]').first()
  await cityInput.fill(city)
  console.log(`✅ City: ${city}`)

  // Select state
  console.log('Selecting state...')
  const stateSelect = page.locator('select[name="state"], select[name="stateCode"]').first()
  await stateSelect.selectOption(state)
  console.log(`✅ State: ${state}`)

  // Fill ZIP
  console.log('Filling ZIP code...')
  const zipInput = page.locator('input[name="zipCode"], input[name="zip"]').first()
  await zipInput.fill(zipCode)
  console.log(`✅ ZIP: ${zipCode}`)

  await wait(1000, 'Form to validate')

  if (iteration) {
    await takeScreenshot(page, '04-shipping-filled', iteration)
  }

  // Click Continue or Calculate Shipping if button exists
  const continueBtn = page
    .locator('button:has-text("Continue"), button:has-text("Calculate")')
    .first()
  const btnCount = await continueBtn.count()

  if (btnCount > 0) {
    await continueBtn.click()
    console.log('✅ Clicked Continue/Calculate button')
    await wait(3000, 'Shipping rates to calculate')
  }

  if (iteration) {
    await takeScreenshot(page, '05-shipping-calculated', iteration)
  }
}

/**
 * Select payment method
 */
export async function selectPaymentMethod(
  page: Page,
  method: 'card' | 'cashapp',
  iteration?: number
) {
  logStep(4, `Select Payment Method: ${method === 'card' ? 'Credit Card' : 'Cash App Pay'}`)

  await wait(2000, 'Payment methods to load')

  // Find and click the payment method radio button
  const paymentLabel = method === 'card' ? /Credit.*Card|Debit.*Card|Card/i : /Cash.*App/i

  const radioButton = page
    .locator(`label:has-text("${paymentLabel.source}") input[type="radio"]`)
    .first()
  await radioButton.waitFor({ state: 'visible', timeout: 10000 })
  await radioButton.click()
  console.log(`✅ Selected: ${method === 'card' ? 'Credit/Debit Card' : 'Cash App Pay'}`)

  await wait(2000, 'Payment form to load')

  if (iteration) {
    await takeScreenshot(page, `06-payment-method-${method}`, iteration)
  }
}

/**
 * Fill Square Card payment form
 */
export async function fillSquareCardForm(page: Page, iteration?: number) {
  logStep(5, 'Fill Square Card Payment Form')

  const card = TEST_CONFIG.testCards.visa

  // Wait for Square card iframe to load
  console.log('Waiting for Square card form to load...')
  await wait(3000, 'Square SDK to initialize')

  // Square uses iframes for card input - we need to interact with them
  // The card number, expiry, and CVV are in separate iframes

  try {
    // Card number iframe
    const cardNumberFrame = page.frameLocator('iframe[name*="card-number"]').first()
    const cardNumberInput = cardNumberFrame.locator('input').first()
    await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 })
    await cardNumberInput.fill(card.number)
    console.log(`✅ Card number entered`)

    await wait(500)

    // Expiry iframe
    const expiryFrame = page.frameLocator('iframe[name*="expiration"]').first()
    const expiryInput = expiryFrame.locator('input').first()
    await expiryInput.fill(card.expiry)
    console.log(`✅ Expiry entered: ${card.expiry}`)

    await wait(500)

    // CVV iframe
    const cvvFrame = page.frameLocator('iframe[name*="cvv"]').first()
    const cvvInput = cvvFrame.locator('input').first()
    await cvvInput.fill(card.cvv)
    console.log(`✅ CVV entered`)

    await wait(500)

    // Postal code (if visible - might be outside iframe)
    try {
      const postalInput = page.locator('input[name*="postal"], input[placeholder*="zip" i]').first()
      await postalInput.fill(card.zip, { timeout: 2000 })
      console.log(`✅ ZIP entered: ${card.zip}`)
    } catch {
      console.log('ℹ️ Postal code field not found (may not be required)')
    }

    if (iteration) {
      await takeScreenshot(page, '07-card-form-filled', iteration)
    }

    console.log('✅ Square card form filled successfully')
  } catch (error) {
    console.error('❌ Error filling card form:', error)
    if (iteration) {
      await takeScreenshot(page, '07-card-form-ERROR', iteration)
    }
    throw error
  }
}

/**
 * Submit payment
 */
export async function submitPayment(page: Page, iteration?: number) {
  logStep(6, 'Submit Payment')

  // Find Pay button
  const payButton = page
    .locator('button:has-text("Pay"), button:has-text("Place Order"), button[type="submit"]')
    .first()
  await payButton.waitFor({ state: 'visible', timeout: 10000 })

  console.log('Clicking Pay button...')
  await payButton.click()
  console.log('✅ Payment submitted')

  // Wait for payment to process
  await wait(5000, 'Payment to process')

  if (iteration) {
    await takeScreenshot(page, '08-payment-submitted', iteration)
  }
}

/**
 * Verify order confirmation
 */
export async function verifyOrderConfirmation(page: Page, iteration?: number) {
  logStep(7, 'Verify Order Confirmation')

  // Wait for redirect to confirmation page or success message
  await wait(3000, 'Order confirmation to load')

  const pageContent = await page.textContent('body')

  // Look for success indicators
  const successIndicators = [
    'thank you',
    'order confirmed',
    'order received',
    'order number',
    'confirmation',
  ]

  const hasSuccess = successIndicators.some((indicator) =>
    pageContent?.toLowerCase().includes(indicator)
  )

  if (hasSuccess) {
    console.log('✅ Order confirmation page detected')
  } else {
    console.log('⚠️ No clear confirmation message found')
  }

  // Try to extract order number
  let orderNumber = null
  const orderNumberMatch = pageContent?.match(/GRP-[A-Z0-9]+-[A-Z0-9]+/)
  if (orderNumberMatch) {
    orderNumber = orderNumberMatch[0]
    console.log(`✅ Order Number: ${orderNumber}`)
  }

  if (iteration) {
    await takeScreenshot(page, '09-order-confirmation', iteration)
  }

  return { success: hasSuccess, orderNumber }
}

/**
 * Query database for order
 */
export async function findOrderInDatabase(orderNumber: string) {
  logStep(8, 'Verify Order in Database')

  console.log(`Querying database for order: ${orderNumber}`)

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        OrderItem: true,
        StatusHistory: true,
      },
    })

    if (order) {
      console.log('✅ Order found in database')
      console.log(`   Order ID: ${order.id}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Total: $${(order.total / 100).toFixed(2)}`)
      console.log(`   Payment Method: ${order.paymentMethod || 'N/A'}`)
      console.log(`   Square Payment ID: ${order.squarePaymentId || 'N/A'}`)
      console.log(`   Items: ${order.OrderItem.length}`)

      return order
    } else {
      console.log('❌ Order not found in database')
      return null
    }
  } catch (error) {
    console.error('❌ Database query error:', error)
    return null
  }
}

/**
 * Find test orders by email (for cleanup)
 */
export async function findTestOrders() {
  const orders = await prisma.order.findMany({
    where: {
      email: TEST_CONFIG.customer.email,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return orders
}

/**
 * Delete test order
 */
export async function deleteTestOrder(orderId: string) {
  console.log(`Deleting test order: ${orderId}`)

  try {
    // Delete related records first
    await prisma.statusHistory.deleteMany({
      where: { orderId },
    })

    await prisma.orderItem.deleteMany({
      where: { orderId },
    })

    // Delete order
    await prisma.order.delete({
      where: { id: orderId },
    })

    console.log(`✅ Test order deleted: ${orderId}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to delete order ${orderId}:`, error)
    return false
  }
}

/**
 * Cleanup all test orders
 */
export async function cleanupAllTestOrders() {
  console.log('\n🧹 Cleaning up test orders...')

  const testOrders = await findTestOrders()
  console.log(`Found ${testOrders.length} test orders`)

  let deleted = 0
  for (const order of testOrders) {
    const success = await deleteTestOrder(order.id)
    if (success) deleted++
  }

  console.log(`✅ Deleted ${deleted}/${testOrders.length} test orders\n`)

  return { total: testOrders.length, deleted }
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection() {
  await prisma.$disconnect()
}

/**
 * Test result tracker
 */
export class TestResultTracker {
  results: Array<{
    iteration: number
    paymentMethod: string
    testFramework: string
    success: boolean
    orderNumber?: string
    paymentId?: string
    duration: number
    error?: string
    screenshots: string[]
  }> = []

  startTime: number = Date.now()

  addResult(result: {
    iteration: number
    paymentMethod: string
    testFramework: string
    success: boolean
    orderNumber?: string
    paymentId?: string
    duration: number
    error?: string
    screenshots?: string[]
  }) {
    this.results.push({
      ...result,
      screenshots: result.screenshots || [],
    })
  }

  getSummary() {
    const total = this.results.length
    const passed = this.results.filter((r) => r.success).length
    const failed = total - passed
    const totalDuration = Date.now() - this.startTime

    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
      totalDuration,
      results: this.results,
    }
  }

  printSummary() {
    const summary = this.getSummary()

    console.log('\n' + '='.repeat(80))
    console.log('TEST SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total Tests: ${summary.total}`)
    console.log(`Passed: ${summary.passed} ✅`)
    console.log(`Failed: ${summary.failed} ❌`)
    console.log(`Success Rate: ${summary.successRate}%`)
    console.log(`Total Duration: ${(summary.totalDuration / 1000).toFixed(1)}s`)
    console.log('='.repeat(80) + '\n')

    // Print individual results
    console.log('Individual Test Results:')
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(
        `\n${index + 1}. ${status} - ${result.paymentMethod} (${result.testFramework}) - Iteration ${result.iteration}`
      )
      if (result.orderNumber) console.log(`   Order: ${result.orderNumber}`)
      if (result.paymentId) console.log(`   Payment ID: ${result.paymentId}`)
      console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`)
      if (result.error) console.log(`   Error: ${result.error}`)
    })

    console.log('\n')
  }
}
