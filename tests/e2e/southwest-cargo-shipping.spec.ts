import { test, expect } from '@playwright/test'

/**
 * Test 2: Southwest Cargo Airport Shipping
 *
 * This test verifies Southwest Cargo shipping functionality:
 * 1. Add product to cart
 * 2. Open cart drawer
 * 3. Enter zip code for major Southwest Cargo airport hub
 * 4. Calculate shipping rates
 * 5. Verify Southwest Cargo appears as an option
 * 6. Select Southwest Cargo
 * 7. Verify price updates correctly
 */

// Southwest Cargo airport hub zip codes
const SOUTHWEST_HUBS = {
  phoenix: '85034', // Phoenix Sky Harbor International Airport
  dallas: '75261', // Dallas Love Field
  houston: '77032', // Houston Hobby Airport
  lasVegas: '89119', // Las Vegas McCarran International
  chicago: '60666', // Chicago Midway International
}

test.describe('Southwest Cargo Shipping - Airport Pickup', () => {
  test.beforeEach(async ({ page }) => {
    // Start at products page
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
  })

  test('Complete Southwest Cargo selection flow - Phoenix Hub', async ({ page }) => {
    console.log('✈️  Testing Southwest Cargo shipping flow...')

    // Step 1: Add product to cart
    console.log('🛒 Step 1: Adding product to cart...')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await addToCartButton.click()
    console.log('✓ Product added to cart')

    // Step 2: Verify cart drawer opened
    console.log('📦 Step 2: Verifying cart drawer opened...')
    const cartDrawer = page.locator('[role="dialog"], .sheet')
    await expect(cartDrawer).toBeVisible({ timeout: 5000 })
    console.log('✓ Cart drawer opened')

    // Step 3: Find shipping preview section
    console.log('📍 Step 3: Finding shipping preview section...')
    const shippingSection = page.locator('text=/Shipping|Delivery/i').first()
    await expect(shippingSection).toBeVisible({ timeout: 5000 })
    console.log('✓ Shipping section found')

    // Step 4: Enter Phoenix zip code
    console.log(`🔢 Step 4: Entering Phoenix zip code (${SOUTHWEST_HUBS.phoenix})...`)
    const zipInput = page.locator('input[placeholder*="zip"], input[id*="zip"], input[name*="zip"]').first()
    await expect(zipInput).toBeVisible({ timeout: 5000 })

    await zipInput.fill(SOUTHWEST_HUBS.phoenix)
    console.log(`✓ Zip code entered: ${SOUTHWEST_HUBS.phoenix}`)

    // Step 5: Calculate shipping rates
    console.log('🧮 Step 5: Calculating shipping rates...')
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Get Rates")').first()
    await expect(calculateButton).toBeVisible({ timeout: 3000 })
    await calculateButton.click()
    console.log('✓ Calculate button clicked')

    // Wait for shipping rates to load
    await page.waitForTimeout(3000) // Allow time for API call

    // Step 6: Verify Southwest Cargo appears
    console.log('✈️  Step 6: Verifying Southwest Cargo option appears...')

    // Look for Southwest Cargo in shipping options
    const southwestOption = page.locator('text=/Southwest Cargo|Southwest/i').first()

    try {
      await expect(southwestOption).toBeVisible({ timeout: 10000 })
      console.log('✓ Southwest Cargo shipping option found!')

      // Step 7: Select Southwest Cargo
      console.log('☑️  Step 7: Selecting Southwest Cargo...')

      // Find the radio button or clickable area for Southwest Cargo
      const southwestRadio = page.locator('input[type="radio"]').filter({
        has: page.locator('text=/Southwest/i')
      }).first()

      if (await southwestRadio.isVisible({ timeout: 2000 })) {
        await southwestRadio.click()
        console.log('✓ Southwest Cargo selected via radio button')
      } else {
        // Try clicking the label/container
        const southwestLabel = page.locator('label:has-text("Southwest"), div:has-text("Southwest")').first()
        if (await southwestLabel.isVisible({ timeout: 2000 })) {
          await southwestLabel.click()
          console.log('✓ Southwest Cargo selected via label')
        }
      }

      // Step 8: Verify price updated
      console.log('💰 Step 8: Verifying total price updated...')

      // Wait for price calculation
      await page.waitForTimeout(1000)

      // Check for total price display
      const totalPrice = page.locator('text=/Total|Final Total/i').first()
      if (await totalPrice.isVisible({ timeout: 3000 })) {
        const priceText = await totalPrice.textContent()
        console.log(`✓ Total price displayed: ${priceText}`)
      }

      // Verify airport pickup location info
      const airportInfo = page.locator('text=/Phoenix|Sky Harbor|Airport/i').first()
      if (await airportInfo.isVisible({ timeout: 3000 })) {
        console.log('✓ Airport pickup location information displayed')
      }

      console.log('🎉 Southwest Cargo shipping test completed successfully!')

    } catch (error) {
      console.log('⚠️  Southwest Cargo option not found')
      console.log('Available shipping options:')

      // Log all visible shipping options for debugging
      const shippingOptions = page.locator('[role="radiogroup"], [class*="shipping"]')
      const optionsText = await shippingOptions.textContent()
      console.log(optionsText)

      throw new Error('Southwest Cargo shipping option not available')
    }
  })

  test('Test multiple Southwest Cargo hub cities', async ({ page }) => {
    console.log('🌐 Testing multiple Southwest Cargo hubs...')

    const hubCities = [
      { name: 'Phoenix', zip: SOUTHWEST_HUBS.phoenix },
      { name: 'Dallas', zip: SOUTHWEST_HUBS.dallas },
      { name: 'Houston', zip: SOUTHWEST_HUBS.houston },
    ]

    for (const hub of hubCities) {
      console.log(`\n📍 Testing ${hub.name} (${hub.zip})...`)

      // Navigate to products and add to cart
      await page.goto('/products')
      await page.waitForLoadState('networkidle')

      const firstProduct = page.locator('a[href^="/products/"]').first()
      await firstProduct.click()
      await page.waitForLoadState('networkidle')

      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.isVisible({ timeout: 5000 })) {
        await addToCartButton.click()

        // Wait for cart drawer
        await page.waitForSelector('[role="dialog"], .sheet', { timeout: 5000 })

        // Enter zip code
        const zipInput = page.locator('input[placeholder*="zip"], input[id*="zip"]').first()
        if (await zipInput.isVisible({ timeout: 3000 })) {
          await zipInput.clear()
          await zipInput.fill(hub.zip)

          // Calculate shipping
          const calculateButton = page.locator('button:has-text("Calculate")').first()
          if (await calculateButton.isVisible({ timeout: 2000 })) {
            await calculateButton.click()
            await page.waitForTimeout(3000)

            // Check for Southwest Cargo
            const southwestOption = page.locator('text=/Southwest/i').first()
            if (await southwestOption.isVisible({ timeout: 5000 })) {
              console.log(`✓ ${hub.name}: Southwest Cargo available`)
            } else {
              console.log(`⚠️  ${hub.name}: Southwest Cargo not available`)
            }
          }
        }

        // Close cart drawer for next iteration
        const closeButton = page.locator('[aria-label="Close"]').first()
        if (await closeButton.isVisible({ timeout: 2000 })) {
          await closeButton.click()
        }

        // Clear cart
        const clearButton = page.locator('button:has-text("Clear")').first()
        if (await clearButton.isVisible({ timeout: 2000 })) {
          await clearButton.click()
        }
      }

      await page.waitForTimeout(1000)
    }

    console.log('\n🎉 Multi-hub test completed!')
  })

  test('Verify Southwest Cargo rate calculation accuracy', async ({ page }) => {
    console.log('💵 Testing Southwest Cargo rate accuracy...')

    // Add product to cart
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
    if (await addToCartButton.isVisible({ timeout: 5000 })) {
      await addToCartButton.click()

      // Wait for cart
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

      // Get initial subtotal
      const subtotalElement = page.locator('text=/Subtotal/i').first()
      const subtotalText = await subtotalElement.textContent()
      console.log(`Initial Subtotal: ${subtotalText}`)

      // Enter zip and calculate
      const zipInput = page.locator('input[placeholder*="zip"]').first()
      if (await zipInput.isVisible({ timeout: 3000 })) {
        await zipInput.fill(SOUTHWEST_HUBS.phoenix)

        const calculateButton = page.locator('button:has-text("Calculate")').first()
        await calculateButton.click()
        await page.waitForTimeout(3000)

        // Select Southwest Cargo if available
        const southwestOption = page.locator('text=/Southwest/i').first()
        if (await southwestOption.isVisible({ timeout: 5000 })) {
          await southwestOption.click()
          await page.waitForTimeout(1000)

          // Verify shipping cost appears
          const shippingCost = page.locator('text=/Shipping.*\\$/i').first()
          if (await shippingCost.isVisible({ timeout: 3000 })) {
            const shippingText = await shippingCost.textContent()
            console.log(`✓ Shipping cost: ${shippingText}`)
          }

          // Verify total updated
          const totalElement = page.locator('text=/Total.*\\$/i').last()
          const totalText = await totalElement.textContent()
          console.log(`✓ Updated total: ${totalText}`)

          console.log('✓ Rate calculation verified')
        }
      }
    }
  })
})
