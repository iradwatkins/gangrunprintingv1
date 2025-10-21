import { test, expect } from '@playwright/test'

test.describe('Cart Drawer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart by clearing localStorage
    await page.goto('http://localhost:3020')
    await page.evaluate(() => localStorage.clear())
  })

  test('drawer opens when adding product to cart', async ({ page }) => {
    console.log('🧪 Starting cart drawer test...')

    // Navigate to a product page
    await page.goto('http://localhost:3020/products')
    console.log('✅ Navigated to products page')

    // Wait for products to load
    await page.waitForSelector('a[href^="/products/"]', { timeout: 10000 })
    console.log('✅ Products loaded')

    // Click on the first product
    const productLinks = page.locator('a[href^="/products/"]:not([href="/products"])')
    await productLinks.first().click()
    console.log('✅ Clicked first product')

    // Wait for product page to load
    await page.waitForSelector('h1', { timeout: 10000 })
    const productName = await page.locator('h1').first().textContent()
    console.log(`✅ On product page: ${productName}`)

    // Wait for configuration to load
    await page.waitForTimeout(2000)

    // Try to find and click "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    const isVisible = await addToCartButton.isVisible().catch(() => false)

    if (!isVisible) {
      console.log('⚠️ Add to Cart button not visible, checking page state...')

      // Take screenshot for debugging
      await page.screenshot({ path: 'test-cart-drawer-product-page.png', fullPage: true })
      console.log('📸 Screenshot saved: test-cart-drawer-product-page.png')

      // Log page content
      const body = await page.locator('body').innerHTML()
      console.log('📄 Page content:', body.substring(0, 500))
    }

    await expect(addToCartButton).toBeVisible({ timeout: 5000 })
    console.log('✅ Add to Cart button is visible')

    // Check if button is enabled
    const isEnabled = await addToCartButton.isEnabled()
    console.log(`Button enabled: ${isEnabled}`)

    if (!isEnabled) {
      console.log('⚠️ Button is disabled, might need configuration...')
      await page.screenshot({ path: 'test-cart-drawer-button-disabled.png', fullPage: true })
    }

    // Click Add to Cart
    await addToCartButton.click()
    console.log('✅ Clicked Add to Cart button')

    // Wait a bit for drawer animation
    await page.waitForTimeout(1000)

    // Check if drawer is visible
    const drawer = page.locator('[role="dialog"]')
    const drawerVisible = await drawer.isVisible().catch(() => false)

    if (!drawerVisible) {
      console.log('❌ Drawer not visible!')

      // Take screenshot
      await page.screenshot({ path: 'test-cart-drawer-not-visible.png', fullPage: true })
      console.log('📸 Screenshot saved: test-cart-drawer-not-visible.png')

      // Check for any error messages
      const errorToast = page.locator('[role="status"], .toast, [class*="toast"]')
      const hasError = await errorToast.isVisible().catch(() => false)
      if (hasError) {
        const errorText = await errorToast.textContent()
        console.log(`⚠️ Error message: ${errorText}`)
      }

      // Check cart state in localStorage
      const cartData = await page.evaluate(() => localStorage.getItem('gangrun_cart'))
      console.log('🛒 Cart data in localStorage:', cartData)
    }

    // Assert drawer is visible
    await expect(drawer).toBeVisible({ timeout: 5000 })
    console.log('✅ Cart drawer is visible!')

    // Verify drawer contains shopping cart title
    const drawerTitle = page.locator('text=Shopping Cart')
    await expect(drawerTitle).toBeVisible()
    console.log('✅ Drawer title "Shopping Cart" is visible')

    // Verify product appears in drawer
    const cartItem = drawer.locator(`text=${productName}`)
    await expect(cartItem).toBeVisible()
    console.log(`✅ Product "${productName}" appears in cart drawer`)

    // Take success screenshot
    await page.screenshot({ path: 'test-cart-drawer-success.png', fullPage: true })
    console.log('📸 Success screenshot saved: test-cart-drawer-success.png')
  })

  test('drawer contains cart items and controls', async ({ page }) => {
    console.log('🧪 Testing drawer controls...')

    // Add item to cart first (repeat steps from above test)
    await page.goto('http://localhost:3020/products')
    await page.waitForSelector('a[href^="/products/"]')

    const productLinks = page.locator('a[href^="/products/"]:not([href="/products"])')
    await productLinks.first().click()

    await page.waitForSelector('h1')
    await page.waitForTimeout(2000)

    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    const drawer = page.locator('[role="dialog"]')
    await expect(drawer).toBeVisible({ timeout: 5000 })
    console.log('✅ Drawer opened')

    // Check for "Proceed to Checkout" button
    const checkoutButton = drawer.locator('button:has-text("Proceed to Checkout")')
    await expect(checkoutButton).toBeVisible()
    console.log('✅ "Proceed to Checkout" button found')

    // Check for delete/remove button (trash icon)
    const deleteButton = drawer.locator('button svg[class*="lucide-trash"]').first()
    const hasDeleteButton = await deleteButton.isVisible().catch(() => false)
    console.log(`Delete button visible: ${hasDeleteButton}`)

    // Take screenshot of drawer controls
    await page.screenshot({ path: 'test-cart-drawer-controls.png', fullPage: true })
    console.log('📸 Screenshot saved: test-cart-drawer-controls.png')
  })

  test('clicking "Proceed to Checkout" navigates to checkout page', async ({ page }) => {
    console.log('🧪 Testing checkout navigation...')

    // Add item to cart
    await page.goto('http://localhost:3020/products')
    await page.waitForSelector('a[href^="/products/"]')

    const productLinks = page.locator('a[href^="/products/"]:not([href="/products"])')
    await productLinks.first().click()

    await page.waitForSelector('h1')
    await page.waitForTimeout(2000)

    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    const drawer = page.locator('[role="dialog"]')
    await expect(drawer).toBeVisible({ timeout: 5000 })

    // Click "Proceed to Checkout"
    const checkoutButton = drawer.locator('button:has-text("Proceed to Checkout")')
    await checkoutButton.click()
    console.log('✅ Clicked "Proceed to Checkout"')

    // Wait for navigation
    await page.waitForURL('**/checkout', { timeout: 10000 })
    console.log('✅ Navigated to checkout page')

    // Verify we're on checkout page
    expect(page.url()).toContain('/checkout')

    // Verify checkout page loaded
    const checkoutHeading = page.locator('h1:has-text("Checkout")')
    await expect(checkoutHeading).toBeVisible()
    console.log('✅ Checkout page loaded successfully')
  })
})
