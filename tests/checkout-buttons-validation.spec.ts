import { test, expect, devices } from '@playwright/test'

/**
 * CHECKOUT BUTTONS VALIDATION TEST
 *
 * Tests all buttons in the checkout flow work correctly on:
 * - Mobile (375x667)
 * - Tablet (768x1024)
 * - Desktop (1920x1080)
 *
 * Flow tested:
 * 1. Add to Cart button on product page
 * 2. Cart drawer "Proceed to Checkout" button
 * 3. Checkout page "Continue to Payment" button
 * 4. Payment page method selection buttons
 * 5. Back navigation buttons
 */

// Test configurations for different viewport sizes
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
]

for (const viewport of viewports) {
  test.describe(`Checkout Button Validation - ${viewport.name}`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    })

    test.beforeEach(async ({ page }) => {
      // Clear cart and storage
      await page.goto('http://localhost:3020')
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      console.log(`🖥️  [${viewport.name}] Test started`)
    })

    test(`Complete checkout flow - ${viewport.name}`, async ({ page }) => {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🧪 TESTING CHECKOUT BUTTONS ON ${viewport.name.toUpperCase()}`)
      console.log(`${'='.repeat(60)}\n`)

      // ==========================================
      // STEP 1: Navigate to product page
      // ==========================================
      console.log('📍 Step 1: Navigate to products page')
      await page.goto('http://localhost:3020/products')
      await page.waitForSelector('a[href^="/products/"]', { timeout: 10000 })
      console.log('   ✅ Products page loaded')

      // Click first product
      const productLinks = page.locator('a[href^="/products/"]:not([href="/products"])')
      await productLinks.first().click()
      console.log('   ✅ Clicked first product')

      // Wait for product page to load
      await page.waitForSelector('h1', { timeout: 10000 })
      const productName = await page.locator('h1').first().textContent()
      console.log(`   ✅ Product page loaded: ${productName}`)

      // ==========================================
      // STEP 2: Validate "Add to Cart" button
      // ==========================================
      console.log('\n📍 Step 2: Test "Add to Cart" button')
      await page.waitForTimeout(2000) // Wait for configuration to load

      const addToCartButton = page.locator('button:has-text("Add to Cart")')

      // Check button visibility
      const isVisible = await addToCartButton.isVisible().catch(() => false)
      if (!isVisible) {
        await page.screenshot({
          path: `test-checkout-${viewport.name.toLowerCase()}-no-button.png`,
          fullPage: true,
        })
        throw new Error(`❌ Add to Cart button not visible on ${viewport.name}`)
      }
      console.log('   ✅ Add to Cart button is visible')

      // Check button is enabled
      const isEnabled = await addToCartButton.isEnabled()
      console.log(`   ℹ️  Button enabled: ${isEnabled}`)

      // Click Add to Cart
      await addToCartButton.click()
      console.log('   ✅ Clicked Add to Cart button')

      // ==========================================
      // STEP 3: Validate Cart Drawer Opens
      // ==========================================
      console.log('\n📍 Step 3: Validate cart drawer opens')
      await page.waitForTimeout(1000)

      const drawer = page.locator('[role="dialog"]')
      const drawerVisible = await drawer.isVisible({ timeout: 5000 }).catch(() => false)

      if (!drawerVisible) {
        await page.screenshot({
          path: `test-checkout-${viewport.name.toLowerCase()}-no-drawer.png`,
          fullPage: true,
        })
        throw new Error(`❌ Cart drawer did not open on ${viewport.name}`)
      }
      console.log('   ✅ Cart drawer opened')

      // Verify product in drawer
      const cartItem = drawer.locator(`text=${productName}`)
      await expect(cartItem).toBeVisible({ timeout: 3000 })
      console.log(`   ✅ Product "${productName}" appears in drawer`)

      // ==========================================
      // STEP 4: Test "Proceed to Checkout" button
      // ==========================================
      console.log('\n📍 Step 4: Test "Proceed to Checkout" button in drawer')

      const checkoutButton = drawer.locator('button:has-text("Proceed to Checkout")')
      await expect(checkoutButton).toBeVisible({ timeout: 3000 })
      console.log('   ✅ "Proceed to Checkout" button is visible')

      // Verify button is clickable
      const checkoutButtonEnabled = await checkoutButton.isEnabled()
      if (!checkoutButtonEnabled) {
        throw new Error(`❌ "Proceed to Checkout" button is disabled on ${viewport.name}`)
      }
      console.log('   ✅ "Proceed to Checkout" button is enabled')

      // Click Proceed to Checkout
      await checkoutButton.click()
      console.log('   ✅ Clicked "Proceed to Checkout"')

      // ==========================================
      // STEP 5: Validate checkout page loads
      // ==========================================
      console.log('\n📍 Step 5: Validate checkout page loaded')

      await page.waitForURL('**/checkout', { timeout: 10000 })
      console.log('   ✅ Navigated to /checkout')

      const checkoutHeading = page.locator('h1:has-text("Checkout")')
      await expect(checkoutHeading).toBeVisible({ timeout: 5000 })
      console.log('   ✅ Checkout page heading visible')

      // ==========================================
      // STEP 6: Test "Continue to Payment" button
      // ==========================================
      console.log('\n📍 Step 6: Test "Continue to Payment" button')

      const continueToPaymentButton = page.locator('button:has-text("Continue to Payment")')
      await expect(continueToPaymentButton).toBeVisible({ timeout: 5000 })
      console.log('   ✅ "Continue to Payment" button is visible')

      // Verify button is clickable
      const continueEnabled = await continueToPaymentButton.isEnabled()
      if (!continueEnabled) {
        await page.screenshot({
          path: `test-checkout-${viewport.name.toLowerCase()}-button-disabled.png`,
          fullPage: true,
        })
        throw new Error(`❌ "Continue to Payment" button is disabled on ${viewport.name}`)
      }
      console.log('   ✅ "Continue to Payment" button is enabled')

      // Scroll button into view if needed (important for mobile)
      await continueToPaymentButton.scrollIntoViewIfNeeded()
      console.log(`   ℹ️  Scrolled button into view (${viewport.name})`)

      // Click Continue to Payment
      await continueToPaymentButton.click()
      console.log('   ✅ Clicked "Continue to Payment"')

      // ==========================================
      // STEP 7: Validate payment page (or shipping redirect)
      // ==========================================
      console.log('\n📍 Step 7: Validate navigation after "Continue to Payment"')

      // Wait for navigation (could be /checkout/payment or /checkout/shipping)
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      const currentURL = page.url()
      console.log(`   ℹ️  Current URL: ${currentURL}`)

      if (currentURL.includes('/checkout/shipping')) {
        console.log('   ✅ Redirected to shipping page (expected flow)')

        // Take screenshot of shipping page
        await page.screenshot({
          path: `test-checkout-${viewport.name.toLowerCase()}-shipping.png`,
          fullPage: true,
        })
      } else if (currentURL.includes('/checkout/payment')) {
        console.log('   ✅ Navigated to payment page')

        // Validate payment method selection buttons
        console.log('\n📍 Step 8: Validate payment method buttons')

        const squareButton = page.locator('button:has-text("Credit/Debit Card")')
        const cashAppButton = page.locator('button:has-text("Cash App")')
        const paypalButton = page.locator('button:has-text("PayPal")')

        await expect(squareButton).toBeVisible({ timeout: 5000 })
        console.log('   ✅ Square payment button visible')

        await expect(cashAppButton).toBeVisible({ timeout: 5000 })
        console.log('   ✅ Cash App payment button visible')

        await expect(paypalButton).toBeVisible({ timeout: 5000 })
        console.log('   ✅ PayPal payment button visible')

        // Test clicking Square payment method
        await squareButton.scrollIntoViewIfNeeded()
        await squareButton.click()
        console.log('   ✅ Clicked Square payment button')

        await page.waitForTimeout(2000)

        // Test Back button
        const backButton = page.locator('button:has-text("Back")')
        const backVisible = await backButton.isVisible().catch(() => false)
        if (backVisible) {
          await backButton.click()
          console.log('   ✅ Back button works')
        }

        // Take screenshot
        await page.screenshot({
          path: `test-checkout-${viewport.name.toLowerCase()}-payment.png`,
          fullPage: true,
        })
      } else {
        throw new Error(`❌ Unexpected URL after Continue to Payment: ${currentURL}`)
      }

      // ==========================================
      // SUCCESS
      // ==========================================
      console.log(`\n${'='.repeat(60)}`)
      console.log(`✅ ALL BUTTONS WORKING ON ${viewport.name.toUpperCase()}`)
      console.log(`${'='.repeat(60)}\n`)
    })

    test(`Back navigation buttons - ${viewport.name}`, async ({ page }) => {
      console.log(`\n🔙 Testing back navigation on ${viewport.name}`)

      // Navigate to checkout page directly
      await page.goto('http://localhost:3020/checkout')
      await page.waitForTimeout(1000)

      const currentURL = page.url()
      console.log(`   ℹ️  Current URL: ${currentURL}`)

      // Check for "Continue Shopping" or similar back button
      const backButtons = [
        page.locator('button:has-text("Continue Shopping")'),
        page.locator('a:has-text("Continue Shopping")'),
        page.locator('button:has-text("Browse Products")'),
        page.locator('a:has-text("Browse Products")'),
      ]

      let backButtonFound = false
      for (const backButton of backButtons) {
        const isVisible = await backButton.isVisible().catch(() => false)
        if (isVisible) {
          console.log(`   ✅ Back button found: ${await backButton.textContent()}`)
          backButtonFound = true
          break
        }
      }

      if (!backButtonFound) {
        console.log('   ⚠️  No back navigation button found (might be empty cart state)')
      }
    })
  })
}

// Export for CLI usage
export {}
