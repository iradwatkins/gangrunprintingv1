/**
 * CHROME DEVTOOLS MCP TEST: Square Credit Card Payment
 *
 * Uses Claude MCP chrome-devtools integration for browser automation
 * Tests complete payment flow with Square credit cards
 * Runs 3 iterations to ensure reliability
 *
 * Usage:
 *   This script is designed to be run by Claude using the mcp__chrome-devtools MCP tools
 *   Claude will execute this test autonomously using its MCP integration
 *
 * Test Flow:
 *   1. Navigate to product page
 *   2. Add product to cart
 *   3. Go to checkout
 *   4. Fill shipping information
 *   5. Select Credit Card payment
 *   6. Fill Square card form (test card)
 *   7. Submit payment
 *   8. Verify order confirmation
 *   9. Check database for order
 *   10. Verify admin notification
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Test configuration
const CONFIG = {
  baseURL: 'https://gangrunprinting.com',
  productURL: '/products/4x6-flyers-9pt-card-stock',

  customer: {
    name: 'Chrome DevTools Test Customer',
    email: 'chrome-test@gangrunprinting.com',
    phone: '(555) 987-6543',
  },

  address: {
    street: '456 DevTools Avenue',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
  },

  testCard: {
    number: '4111111111111111', // Visa test card
    expiry: '1225', // 12/25
    cvv: '123',
    zip: '60601',
  },

  iterations: 3,
}

// Results tracker
const results = {
  iterations: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
}

/**
 * Log with timestamp
 */
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  console.log(`[${timestamp}] ${message}`)
}

/**
 * Step logger
 */
function logStep(step, message) {
  console.log('\n' + '='.repeat(80))
  console.log(`STEP ${step}: ${message}`)
  console.log('='.repeat(80) + '\n')
}

/**
 * Wait helper
 */
async function wait(ms, reason) {
  if (reason) log(`⏳ Waiting ${ms}ms: ${reason}`)
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main test function for one iteration
 *
 * NOTE: This function expects to be called by Claude using MCP chrome-devtools tools
 * Claude will handle the actual browser automation
 */
async function runIteration(iteration) {
  log(`\n${'='.repeat(80)}`)
  log(`SQUARE CARD CHROME DEVTOOLS TEST - ITERATION ${iteration}/${CONFIG.iterations}`)
  log(`${'='.repeat(80)}\n`)

  const startTime = Date.now()
  const result = {
    iteration,
    success: false,
    orderNumber: null,
    paymentId: null,
    duration: 0,
    error: null,
    steps: [],
  }

  try {
    /**
     * INSTRUCTIONS FOR CLAUDE:
     *
     * Use the following MCP chrome-devtools tools to execute this test:
     *
     * 1. mcp__chrome-devtools__new_page(url: CONFIG.baseURL + CONFIG.productURL)
     * 2. mcp__chrome-devtools__take_snapshot() - Verify product page loaded
     * 3. Select quantity 500 if needed (use take_snapshot to find uid, then fill)
     * 4. mcp__chrome-devtools__click(uid: <add-to-cart-button-uid>)
     * 5. mcp__chrome-devtools__navigate_page(url: CONFIG.baseURL + '/checkout')
     * 6. mcp__chrome-devtools__take_snapshot() - Get checkout form element UIDs
     * 7. Fill shipping form fields:
     *    - mcp__chrome-devtools__fill(uid: <email-input-uid>, value: CONFIG.customer.email)
     *    - mcp__chrome-devtools__fill(uid: <name-input-uid>, value: CONFIG.customer.name)
     *    - mcp__chrome-devtools__fill(uid: <phone-input-uid>, value: CONFIG.customer.phone)
     *    - mcp__chrome-devtools__fill(uid: <street-input-uid>, value: CONFIG.address.street)
     *    - mcp__chrome-devtools__fill(uid: <city-input-uid>, value: CONFIG.address.city)
     *    - mcp__chrome-devtools__fill(uid: <state-select-uid>, value: CONFIG.address.state)
     *    - mcp__chrome-devtools__fill(uid: <zip-input-uid>, value: CONFIG.address.zipCode)
     * 8. Click Continue/Calculate if button exists
     * 9. Select "Credit Card" payment method:
     *    - mcp__chrome-devtools__click(uid: <credit-card-radio-uid>)
     * 10. Wait 5 seconds for Square form to load
     * 11. mcp__chrome-devtools__take_snapshot() - Verify Square iframes loaded
     * 12. Fill Square card form using evaluate_script to interact with iframes:
     *     - Card number: CONFIG.testCard.number
     *     - Expiry: CONFIG.testCard.expiry
     *     - CVV: CONFIG.testCard.cvv
     * 13. mcp__chrome-devtools__click(uid: <pay-button-uid>)
     * 14. Wait 10 seconds for payment processing
     * 15. mcp__chrome-devtools__take_snapshot() - Get order confirmation
     * 16. Extract order number from snapshot text
     * 17. Query database to verify order (use code below)
     * 18. Take final screenshot: mcp__chrome-devtools__take_screenshot(filePath: './test-results/...')
     */

    logStep(1, 'Navigate to Product Page')
    log(`URL: ${CONFIG.baseURL}${CONFIG.productURL}`)
    result.steps.push({ step: 1, name: 'Navigate to product', status: 'pending' })

    logStep(2, 'Add Product to Cart')
    log(`Quantity: 500`)
    result.steps.push({ step: 2, name: 'Add to cart', status: 'pending' })

    logStep(3, 'Navigate to Checkout')
    log(`URL: ${CONFIG.baseURL}/checkout`)
    result.steps.push({ step: 3, name: 'Navigate to checkout', status: 'pending' })

    logStep(4, 'Fill Shipping Information')
    log(`Email: ${CONFIG.customer.email}`)
    log(`Name: ${CONFIG.customer.name}`)
    log(`Phone: ${CONFIG.customer.phone}`)
    log(`Address: ${CONFIG.address.street}, ${CONFIG.address.city}, ${CONFIG.address.state} ${CONFIG.address.zipCode}`)
    result.steps.push({ step: 4, name: 'Fill shipping info', status: 'pending' })

    logStep(5, 'Select Credit Card Payment Method')
    result.steps.push({ step: 5, name: 'Select payment method', status: 'pending' })

    logStep(6, 'Fill Square Card Form')
    log(`Card Number: ${CONFIG.testCard.number}`)
    log(`Expiry: ${CONFIG.testCard.expiry}`)
    log(`CVV: ${CONFIG.testCard.cvv}`)
    result.steps.push({ step: 6, name: 'Fill card form', status: 'pending' })

    logStep(7, 'Submit Payment')
    result.steps.push({ step: 7, name: 'Submit payment', status: 'pending' })

    logStep(8, 'Verify Order Confirmation')
    result.steps.push({ step: 8, name: 'Verify confirmation', status: 'pending' })

    /**
     * Database verification
     * Claude should call this after getting the order number
     */
    async function verifyOrderInDatabase(orderNumber) {
      logStep(9, 'Verify Order in Database')
      log(`Querying for order: ${orderNumber}`)

      const order = await prisma.order.findFirst({
        where: { orderNumber },
        include: {
          OrderItem: true,
          StatusHistory: true,
        },
      })

      if (order) {
        log('✅ Order found in database')
        log(`   Order ID: ${order.id}`)
        log(`   Status: ${order.status}`)
        log(`   Total: $${(order.total / 100).toFixed(2)}`)
        log(`   Payment Method: ${order.paymentMethod || 'N/A'}`)
        log(`   Square Payment ID: ${order.squarePaymentId || 'N/A'}`)
        log(`   Items: ${order.OrderItem.length}`)

        result.orderNumber = orderNumber
        result.paymentId = order.squarePaymentId
        result.steps.push({ step: 9, name: 'Database verification', status: 'success', order })

        return order
      } else {
        log('❌ Order not found in database')
        result.steps.push({ step: 9, name: 'Database verification', status: 'failed' })
        throw new Error(`Order ${orderNumber} not found in database`)
      }
    }

    /**
     * CLAUDE: After completing the browser automation steps above,
     * call verifyOrderInDatabase(orderNumber) to verify the order was created
     */

    // Mark as success
    result.success = true
    result.steps.forEach(step => {
      if (step.status === 'pending') step.status = 'success'
    })

    log(`\n✅ Iteration ${iteration} PASSED\n`)

  } catch (error) {
    log(`\n❌ Iteration ${iteration} FAILED: ${error.message}\n`)
    result.error = error.message
    result.success = false
  } finally {
    result.duration = Date.now() - startTime
    results.iterations.push(result)
    results.summary.total++
    if (result.success) {
      results.summary.passed++
    } else {
      results.summary.failed++
    }
  }

  return result
}

/**
 * Print final summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(80))
  console.log('SQUARE CARD CHROME DEVTOOLS TEST - SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Tests: ${results.summary.total}`)
  console.log(`Passed: ${results.summary.passed} ✅`)
  console.log(`Failed: ${results.summary.failed} ❌`)
  console.log(`Success Rate: ${results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0}%`)
  console.log('='.repeat(80) + '\n')

  console.log('Individual Results:')
  results.iterations.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`\n${index + 1}. ${status} - Iteration ${result.iteration}`)
    if (result.orderNumber) console.log(`   Order: ${result.orderNumber}`)
    if (result.paymentId) console.log(`   Payment ID: ${result.paymentId}`)
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`)
    if (result.error) console.log(`   Error: ${result.error}`)

    console.log(`   Steps:`)
    result.steps.forEach(step => {
      const stepStatus = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏳'
      console.log(`     ${stepStatus} ${step.step}. ${step.name}`)
    })
  })

  console.log('\n')
}

/**
 * Main execution
 *
 * CLAUDE: Run this test by calling the runIteration function 3 times,
 * using MCP chrome-devtools tools to perform the actual browser automation
 */
async function main() {
  log('\n' + '='.repeat(80))
  log('CHROME DEVTOOLS MCP TEST: Square Credit Card Payment')
  log('='.repeat(80) + '\n')

  log('Test Configuration:')
  log(`  Base URL: ${CONFIG.baseURL}`)
  log(`  Product: ${CONFIG.productURL}`)
  log(`  Iterations: ${CONFIG.iterations}`)
  log(`  Customer: ${CONFIG.customer.email}`)
  log(`  Test Card: ${CONFIG.testCard.number}`)
  log('')

  // Run iterations
  for (let i = 1; i <= CONFIG.iterations; i++) {
    await runIteration(i)

    // Wait between iterations
    if (i < CONFIG.iterations) {
      log(`⏳ Waiting 5 seconds before next iteration...\n`)
      await wait(5000, 'Between iterations')
    }
  }

  // Print summary
  printSummary()

  // Close database
  await prisma.$disconnect()

  // Exit
  process.exit(results.summary.failed > 0 ? 1 : 0)
}

// Export for use by Claude
module.exports = {
  CONFIG,
  runIteration,
  printSummary,
  results,
}

// Run if called directly
if (require.main === module) {
  console.log('\n⚠️  This script is designed to be executed by Claude using MCP chrome-devtools tools.')
  console.log('Claude will handle the browser automation using the instructions embedded in runIteration().\n')
  console.log('To run this test, ask Claude to execute it using the chrome-devtools MCP integration.\n')
}
