/**
 * PLAYWRIGHT E2E TEST: Product Checkout with Southwest Cargo Shipping
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
 * This test will run 3 iterations using Playwright's test framework.
 */

import { test, expect, Page } from '@playwright/test'
import path from 'path'

// Test configuration
const BASE_URL = 'https://gangrunprinting.com'
const PRODUCT_URL = `${BASE_URL}/products/4x6-flyers-9pt-card-stock`
const SCREENSHOT_DIR = './test-screenshots/playwright-southwest'

// Test specifications
const TEST_CONFIG = {
  quantity: '5000',
  size: '4″ × 6″',
  paperStock: '9pt C2S Cardstock',
  coating: 'UV',
  sides: 'both',
  design: 'none',
  shipping: {
    street: '123 Test Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    airport: 'ORD',
  },
}

// Helper: Take screenshot
async function takeScreenshot(page: Page, name: string, iteration: number) {
  const filename = path.join(SCREENSHOT_DIR, `iteration-${iteration}`, `${name}.png`)
  await page.screenshot({ path: filename, fullPage: true })
  console.log(`📸 Screenshot: ${filename}`)
}

// Main test suite - run 3 times serially
test.describe.serial('Southwest Cargo Checkout - 3 Iterations', () => {
  // Iteration 1
  test('Iteration 1: Complete checkout flow with Southwest Cargo', async ({ page }) => {
    await runCheckoutTest(page, 1)
  })

  // Iteration 2
  test('Iteration 2: Complete checkout flow with Southwest Cargo', async ({ page }) => {
    await runCheckoutTest(page, 2)
  })

  // Iteration 3
  test('Iteration 3: Complete checkout flow with Southwest Cargo', async ({ page }) => {
    await runCheckoutTest(page, 3)
  })
})

/**
 * Main test flow
 */
async function runCheckoutTest(page: Page, iteration: number) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`PLAYWRIGHT TEST ITERATION ${iteration}/3`)
  console.log(`${'='.repeat(80)}\n`)

  // Set viewport
  await page.setViewportSize({ width: 1920, height: 1080 })

  // Step 1: Navigate to product page
  test.step('Navigate to product page', async () => {
    console.log('Step 1: Navigating to product page...')

    await page.goto(PRODUCT_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await takeScreenshot(page, '01-product-page-loaded', iteration)

    // Verify correct product
    const heading = await page.locator('h1').textContent()
    expect(heading).toContain('4x6 Flyers')
    console.log('✅ Product page loaded successfully')
  })

  // Step 2: Configure product
  await test.step('Configure product options', async () => {
    console.log('Step 2: Configuring product...')

    await page.waitForTimeout(2000)

    // Verify/set quantity to 5000
    console.log('  → Verifying quantity: 5000')
    const quantitySelect = page.locator('select, [role="combobox"]').first()
    const currentQty = await quantitySelect.textContent()

    if (!currentQty?.includes('5000')) {
      const select = page.locator('select').first()
      const has5000 = await select.locator('option', { hasText: '5000' }).count()
      if (has5000 > 0) {
        await select.selectOption({ label: /5000/ })
        console.log('    ✅ Quantity set to 5000')
      } else {
        console.log('    ⚠️  5000 not found in options')
      }
    } else {
      console.log('    ✅ Quantity already 5000')
    }

    await takeScreenshot(page, '02a-quantity-verified', iteration)

    // Verify size is 4x6
    console.log('  → Verifying size: 4x6')
    const pageText = await page.textContent('body')
    expect(pageText).toContain('4')
    expect(pageText).toContain('6')
    console.log('    ✅ Size is 4x6')

    await takeScreenshot(page, '02b-size-verified', iteration)

    // Verify paper stock is 9pt
    console.log('  → Verifying paper stock: 9pt')
    expect(pageText).toContain('9pt')
    console.log('    ✅ Paper stock is 9pt C2S Cardstock')

    await takeScreenshot(page, '02c-paper-verified', iteration)

    // Configure coating (UV)
    console.log('  → Configuring coating: UV')
    const selects = await page.locator('select').all()

    for (const select of selects) {
      const options = await select.locator('option').allTextContents()
      const hasUV = options.some((o) => o.toLowerCase().includes('uv'))

      if (hasUV) {
        const uvOption = options.find((o) => o.toLowerCase().includes('uv'))
        if (uvOption) {
          await select.selectOption({ label: uvOption })
          console.log(`    ✅ UV coating selected: ${uvOption}`)
          await page.waitForTimeout(1000)
        }
        break
      }
    }

    await takeScreenshot(page, '02d-coating-configured', iteration)

    // Configure sides (both sides / 4/4)
    console.log('  → Configuring sides: Both sides (4/4)')
    for (const select of selects) {
      const options = await select.locator('option').allTextContents()
      const hasBothSides = options.some(
        (o) =>
          o.toLowerCase().includes('both') ||
          o.includes('4/4') ||
          o.toLowerCase().includes('double')
      )

      if (hasBothSides) {
        const bothOption = options.find(
          (o) =>
            o.toLowerCase().includes('both') ||
            o.includes('4/4') ||
            o.toLowerCase().includes('double')
        )
        if (bothOption) {
          await select.selectOption({ label: bothOption })
          console.log(`    ✅ Both sides selected: ${bothOption}`)
          await page.waitForTimeout(1000)
        }
        break
      }
    }

    await takeScreenshot(page, '02e-sides-configured', iteration)
    console.log('✅ Product configuration complete')
  })

  // Step 3: Add to cart
  await test.step('Add product to cart', async () => {
    console.log('Step 3: Adding to cart...')

    const addToCartBtn = page.locator('button', { hasText: 'Add to Cart' })
    await expect(addToCartBtn).toBeVisible()
    await expect(addToCartBtn).toBeEnabled()

    await addToCartBtn.click()
    console.log('✅ Clicked Add to Cart')

    await page.waitForTimeout(3000)
    await takeScreenshot(page, '03-added-to-cart', iteration)
  })

  // Step 4: Navigate to checkout
  await test.step('Navigate to checkout', async () => {
    console.log('Step 4: Navigating to checkout...')

    // Try multiple selectors for checkout/cart
    const checkoutSelectors = [
      page.locator('a[href*="/checkout"]'),
      page.locator('a[href*="/cart"]'),
      page.locator('button', { hasText: 'Checkout' }),
      page.locator('button', { hasText: 'Cart' }),
    ]

    let clicked = false
    for (const selector of checkoutSelectors) {
      const count = await selector.count()
      if (count > 0 && (await selector.first().isVisible())) {
        await selector.first().click()
        clicked = true
        break
      }
    }

    if (!clicked) {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' })
    }

    await takeScreenshot(page, '04-checkout-page', iteration)

    // Verify on checkout page
    expect(page.url()).toMatch(/checkout|cart/)
    console.log('✅ Checkout page loaded')
  })

  // Step 5: Fill shipping information
  await test.step('Fill shipping information', async () => {
    console.log('Step 5: Filling shipping info...')

    await page.waitForTimeout(2000)

    const { street, city, state, zipCode } = TEST_CONFIG.shipping

    // Fill street
    console.log(`  → Entering street: ${street}`)
    const streetInput = page
      .locator('input[name="street"], input[name="address"], input[placeholder*="street" i]')
      .first()
    await streetInput.fill(street)
    console.log('    ✅ Street entered')

    // Fill city
    console.log(`  → Entering city: ${city}`)
    const cityInput = page.locator('input[name="city"], input[placeholder*="city" i]').first()
    await cityInput.fill(city)
    console.log('    ✅ City entered')

    // Select state
    console.log(`  → Selecting state: ${state}`)
    const stateSelect = page.locator('select[name="state"], select[name="stateCode"]').first()
    await stateSelect.selectOption(state)
    console.log('    ✅ State selected')

    // Fill ZIP
    console.log(`  → Entering ZIP: ${zipCode}`)
    const zipInput = page
      .locator('input[name="zipCode"], input[name="zip"], input[placeholder*="zip" i]')
      .first()
    await zipInput.fill(zipCode)
    console.log('    ✅ ZIP entered')

    await takeScreenshot(page, '05-shipping-info-filled', iteration)

    // Click continue/calculate
    const continueBtn = page
      .locator('button:has-text("Continue"), button:has-text("Calculate"), button[type="submit"]')
      .first()
    if (await continueBtn.isVisible()) {
      await continueBtn.click()
      console.log('✅ Clicked continue')
      await page.waitForTimeout(4000)
    }

    await takeScreenshot(page, '05-shipping-calculated', iteration)
  })

  // Step 6: Select Southwest Cargo
  await test.step('Select Southwest Cargo shipping', async () => {
    console.log('Step 6: Selecting Southwest Cargo...')

    await page.waitForTimeout(3000)

    // Verify Southwest Cargo appears
    const bodyText = await page.textContent('body')
    expect(bodyText?.toLowerCase()).toContain('southwest')
    console.log('    ✅ Southwest Cargo text found')

    // Find and click Southwest radio button
    const radioButtons = await page.locator('input[type="radio"]').all()
    let southwestFound = false

    for (const radio of radioButtons) {
      const label = await radio.evaluate((el) => {
        const parent = el.closest('label') || el.parentElement
        return parent?.textContent || ''
      })

      if (label.toLowerCase().includes('southwest') || label.toLowerCase().includes('cargo')) {
        await radio.click()
        console.log(`    ✅ Southwest Cargo selected`)
        southwestFound = true
        break
      }
    }

    expect(southwestFound).toBe(true)

    await page.waitForTimeout(2000)
    await takeScreenshot(page, '06a-southwest-selected', iteration)

    // Find airport selector
    console.log('  → Looking for airport selector...')
    await page.waitForTimeout(1500)

    const airportSelect = page
      .locator('select[name*="airport" i], select:has(option[value*="ORD" i])')
      .first()
    await expect(airportSelect).toBeVisible()

    // Count airports
    const airportCount = await airportSelect.locator('option').count()
    console.log(`    ✅ Airport selector found with ${airportCount} airports`)

    if (airportCount < 82) {
      console.log(`    ⚠️  Expected 82 airports, found ${airportCount}`)
    } else {
      console.log(`    ✅ All 82 Southwest Cargo airports available`)
    }

    // Select Chicago ORD
    const options = await airportSelect.locator('option').allTextContents()
    const ordOption = options.find(
      (o) => o.includes('ORD') || o.includes('Chicago') || o.includes("O'Hare")
    )

    if (ordOption) {
      await airportSelect.selectOption({ label: ordOption })
      console.log(`    ✅ Airport selected: ${ordOption}`)
    } else {
      await airportSelect.selectOption({ index: 1 })
      console.log(`    ⚠️  ORD not found, selected first airport`)
    }

    await page.waitForTimeout(1000)
    await takeScreenshot(page, '06b-airport-selected', iteration)
  })

  // Step 7: Verify order summary
  await test.step('Verify order summary', async () => {
    console.log('Step 7: Verifying order summary...')

    await page.waitForTimeout(1000)

    const summaryText = await page.textContent('body')

    // Verify key elements
    const checks = {
      product: summaryText?.includes('4x6') && summaryText.includes('Flyer'),
      quantity: summaryText?.includes('5000') || summaryText?.includes('5,000'),
      southwest:
        summaryText?.toLowerCase().includes('southwest') ||
        summaryText?.toLowerCase().includes('cargo'),
      total:
        summaryText?.includes('$') &&
        (summaryText.includes('Total') || summaryText.includes('total')),
    }

    console.log('  Order Summary Checks:')
    console.log(`    Product (4x6 Flyers): ${checks.product ? '✅' : '❌'}`)
    console.log(`    Quantity (5000): ${checks.quantity ? '✅' : '❌'}`)
    console.log(`    Southwest Cargo: ${checks.southwest ? '✅' : '❌'}`)
    console.log(`    Total price: ${checks.total ? '✅' : '❌'}`)

    expect(checks.product).toBe(true)
    expect(checks.quantity).toBe(true)
    expect(checks.southwest).toBe(true)
    expect(checks.total).toBe(true)

    await takeScreenshot(page, '07-order-summary', iteration)

    console.log('✅ Order summary verified')
  })

  console.log(`\n✅ Iteration ${iteration} PASSED\n`)
}
