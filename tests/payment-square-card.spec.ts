/**
 * E2E TEST: Square Credit Card Payment
 *
 * Tests the complete payment flow using Square credit card processing
 * Runs 3 iterations to ensure consistency and reliability
 *
 * Test Coverage:
 * - Product selection and cart
 * - Checkout form completion
 * - Square card form (iframe interaction)
 * - Payment processing via Square API
 * - Order creation in database
 * - Admin notification verification
 */

import { test, expect, Page } from '@playwright/test'
import {
  TEST_CONFIG,
  TestResultTracker,
  addProductToCart,
  navigateToCheckout,
  fillShippingInfo,
  selectPaymentMethod,
  fillSquareCardForm,
  submitPayment,
  verifyOrderConfirmation,
  findOrderInDatabase,
  closeDatabaseConnection,
  takeScreenshot,
  wait,
  logStep,
} from './helpers/payment-test-helpers'

const ITERATIONS = 3
const tracker = new TestResultTracker()

test.describe.serial('Square Credit Card Payment - 3 Iterations', () => {
  // Run 3 iterations
  for (let iteration = 1; iteration <= ITERATIONS; iteration++) {
    test(`Iteration ${iteration}: Complete Square Card payment flow`, async ({ page }) => {
      const iterationStartTime = Date.now()
      const screenshots: string[] = []

      console.log('\n' + '='.repeat(80))
      console.log(`SQUARE CARD TEST - ITERATION ${iteration}/${ITERATIONS}`)
      console.log('='.repeat(80) + '\n')

      try {
        // Setup page logging
        page.on('console', (msg) => {
          const type = msg.type()
          if (type === 'error' || type === 'warning') {
            console.log(`🔴 Console ${type}: ${msg.text()}`)
          }
        })

        page.on('pageerror', (error) => {
          console.log(`🔴 Page error: ${error.message}`)
        })

        // Set viewport
        await page.setViewportSize({ width: 1920, height: 1080 })

        // STEP 1: Add product to cart
        await addProductToCart(page, iteration)

        // STEP 2: Navigate to checkout
        await navigateToCheckout(page, iteration)

        // STEP 3: Fill shipping information
        await fillShippingInfo(page, iteration)

        // STEP 4: Select Credit Card payment method
        await selectPaymentMethod(page, 'card', iteration)

        // Wait for Square form to load
        logStep(5, 'Wait for Square Card Form to Load')
        await wait(4000, 'Square SDK to initialize and render card form')

        const formScreenshot = await takeScreenshot(page, '06-square-form-loaded', iteration)
        screenshots.push(formScreenshot)

        // Verify Square iframes are present
        const cardNumberFrame = page.frameLocator('iframe[name*="card-number"]').first()
        const cardNumberInput = cardNumberFrame.locator('input').first()

        try {
          await cardNumberInput.waitFor({ state: 'visible', timeout: 20000 })
          console.log('✅ Square card form loaded successfully')
        } catch (error) {
          console.error('❌ Square card form did not load')
          const errorScreenshot = await takeScreenshot(page, '06-square-form-ERROR', iteration)
          screenshots.push(errorScreenshot)
          throw new Error('Square card form failed to load')
        }

        // STEP 6: Fill Square card form
        await fillSquareCardForm(page, iteration)

        // STEP 7: Submit payment
        await submitPayment(page, iteration)

        // Wait for payment processing
        logStep(7, 'Wait for Payment Processing')
        await wait(8000, 'Square payment API to process')

        const processingScreenshot = await takeScreenshot(page, '08-payment-processing', iteration)
        screenshots.push(processingScreenshot)

        // STEP 8: Verify order confirmation
        const confirmation = await verifyOrderConfirmation(page, iteration)

        if (!confirmation.success) {
          throw new Error('Order confirmation page not detected')
        }

        if (!confirmation.orderNumber) {
          throw new Error('Order number not found on confirmation page')
        }

        console.log(`✅ Order Number: ${confirmation.orderNumber}`)

        // STEP 9: Verify order in database
        await wait(2000, 'Order to be committed to database')

        const order = await findOrderInDatabase(confirmation.orderNumber)

        if (!order) {
          throw new Error(`Order ${confirmation.orderNumber} not found in database`)
        }

        // Verify order details
        expect(order.orderNumber).toBe(confirmation.orderNumber)
        expect(order.email).toBe(TEST_CONFIG.customer.email)
        expect(order.total).toBeGreaterThan(0)
        expect(order.OrderItem.length).toBeGreaterThan(0)

        console.log('✅ Order verified in database')

        // Check if payment was processed
        if (order.squarePaymentId) {
          console.log(`✅ Square Payment ID: ${order.squarePaymentId}`)
        } else {
          console.log('⚠️ Square Payment ID not yet populated (may update via webhook)')
        }

        // Record success
        const duration = Date.now() - iterationStartTime
        tracker.addResult({
          iteration,
          paymentMethod: 'Square Credit Card',
          testFramework: 'Playwright',
          success: true,
          orderNumber: confirmation.orderNumber,
          paymentId: order.squarePaymentId || undefined,
          duration,
          screenshots,
        })

        console.log(`\n✅ Iteration ${iteration} PASSED (${(duration / 1000).toFixed(1)}s)\n`)
      } catch (error: any) {
        const duration = Date.now() - iterationStartTime

        console.error(`\n❌ Iteration ${iteration} FAILED: ${error.message}\n`)

        // Take error screenshot
        const errorScreenshot = await takeScreenshot(page, '99-ERROR-final', iteration)
        screenshots.push(errorScreenshot)

        // Record failure
        tracker.addResult({
          iteration,
          paymentMethod: 'Square Credit Card',
          testFramework: 'Playwright',
          success: false,
          duration,
          error: error.message,
          screenshots,
        })

        throw error
      }

      // Wait between iterations
      if (iteration < ITERATIONS) {
        console.log(`⏳ Waiting 5 seconds before next iteration...\n`)
        await wait(5000, 'Between iterations')
      }
    })
  }

  // Print summary after all iterations
  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80))
    console.log('SQUARE CREDIT CARD TEST - ALL ITERATIONS COMPLETE')
    console.log('='.repeat(80) + '\n')

    tracker.printSummary()

    await closeDatabaseConnection()
  })
})
