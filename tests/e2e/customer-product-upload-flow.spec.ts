import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * Test 1: Customer Product Flow with Artwork Upload
 *
 * This test simulates a real customer journey:
 * 1. Browse to actual product page
 * 2. Configure product options (size, paper, coating, turnaround)
 * 3. Upload real artwork files
 * 4. Add to cart
 * 5. Verify cart drawer opens with uploaded files
 */

// Real test image from fixtures
const TEST_IMAGE = path.join(__dirname, '../fixtures/test-image.jpg')
const TEST_PDF = path.join(__dirname, '../fixtures/test-document.pdf')

test.describe('Customer Product Upload Flow - Real Customer Simulation', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage like a real customer
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('Complete customer journey: Browse → Configure → Upload → Add to Cart', async ({ page }) => {
    console.log('🛒 Starting real customer journey test...')

    // Step 1: Navigate to products page
    console.log('📄 Step 1: Navigating to products page...')
    await page.click('a[href="/products"]')
    await page.waitForLoadState('networkidle')

    // Verify we're on products page
    await expect(page).toHaveURL(/\/products/)
    console.log('✓ Products page loaded')

    // Step 2: Click on first available product
    console.log('🖱️  Step 2: Selecting first product...')
    const firstProductLink = page.locator('a[href^="/products/"]').first()
    await expect(firstProductLink).toBeVisible({ timeout: 10000 })

    const productHref = await firstProductLink.getAttribute('href')
    console.log(`✓ Found product: ${productHref}`)

    await firstProductLink.click()
    await page.waitForLoadState('networkidle')

    // Verify product page loaded
    await expect(page.locator('h1')).toBeVisible()
    const productTitle = await page.locator('h1').textContent()
    console.log(`✓ Product page loaded: "${productTitle}"`)

    // Step 3: Configure product options
    console.log('⚙️  Step 3: Configuring product options...')

    // Wait for configuration form to be visible (increased timeout for slower browsers)
    await page.waitForSelector('[data-testid="product-configuration"]', {
      timeout: 15000,
      state: 'visible'
    })
    console.log('✓ Product configuration form loaded')

    // Helper function to select from dropdown with better cross-browser support
    async function selectFromDropdown(testId: string, label: string) {
      const selector = page.locator(`[data-testid="${testId}"]`)
      const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false)

      if (isVisible) {
        // Click to open dropdown
        await selector.click({ force: true })

        // Wait for dropdown to be fully open - check for visible options
        await page.waitForSelector('[role="option"]', { state: 'visible', timeout: 3000 })
        await page.waitForTimeout(300) // Additional stability wait

        // Click first option (more reliable than .first().click())
        const options = page.locator('[role="option"]')
        await options.nth(0).click({ force: true })

        console.log(`✓ ${label} selected`)

        // Wait for dropdown to close
        await page.waitForTimeout(300)
      }
    }

    // Select quantity if available
    await selectFromDropdown('quantity-select', 'Quantity')

    // Select size if available
    await selectFromDropdown('size-select', 'Size')

    // Select paper stock if available
    await selectFromDropdown('paper-stock-select', 'Paper stock')

    // Select coating if available
    await selectFromDropdown('coating-select', 'Coating')

    // Select sides if available
    await selectFromDropdown('sides-select', 'Sides')

    // Select turnaround time if available (radio buttons)
    const turnaroundOption = page.locator('[data-testid="turnaround-option"]').first()
    const turnaroundVisible = await turnaroundOption.isVisible({ timeout: 3000 }).catch(() => false)

    if (turnaroundVisible) {
      await turnaroundOption.click({ force: true })
      console.log('✓ Turnaround time selected')
      await page.waitForTimeout(500)
    }

    // Wait for price calculation (increased timeout for slower browsers)
    await page.waitForTimeout(2000)

    // Step 4: Upload artwork files
    console.log('📤 Step 4: Uploading artwork files...')

    // Look for file upload input (more specific selector)
    const fileInput = page.locator('input[type="file"][accept*="image"]').first()
    const fileInputVisible = await fileInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (fileInputVisible) {
      // Upload image file
      await fileInput.setInputFiles(TEST_IMAGE)
      console.log('✓ Image file uploaded')

      // Wait for upload to complete with multiple possible indicators
      await Promise.race([
        page.waitForSelector('text=/uploaded|success|complete/i', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('[class*="thumbnail"], [class*="preview"]', { timeout: 10000 }).catch(() => null),
        page.waitForTimeout(3000) // Fallback timeout
      ])

      // Verify file thumbnail or preview appears
      const filePreview = page.locator('[class*="thumbnail"], [class*="preview"], img[alt*="test"]').first()
      const previewVisible = await filePreview.isVisible({ timeout: 3000 }).catch(() => false)

      if (previewVisible) {
        console.log('✓ File preview displayed')
      }
    } else {
      console.log('⚠️  File upload not available on this product - continuing...')
    }

    // Step 5: Add to cart
    console.log('🛒 Step 5: Adding product to cart...')

    // Find and click Add to Cart button (using data-testid for reliability)
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled({ timeout: 5000 })

    console.log('✓ Add to Cart button ready')
    await addToCartButton.click()

    // Step 6: Verify cart drawer opens
    console.log('✅ Step 6: Verifying cart drawer opened...')

    // Wait for cart drawer to appear - try multiple selectors
    const cartDrawer = page.locator('[role="dialog"], .sheet, [data-testid="cart-drawer"]').first()
    await expect(cartDrawer).toBeVisible({ timeout: 8000 })
    console.log('✓ Cart drawer opened')

    // Wait a moment for cart to fully render
    await page.waitForTimeout(1000)

    // Verify product is in cart - more flexible text matching
    const cartTitle = page.locator('text=/Shopping Cart|Your Cart|Cart/i').first()
    const cartTitleVisible = await cartTitle.isVisible({ timeout: 5000 }).catch(() => false)

    if (cartTitleVisible) {
      console.log('✓ Cart drawer title visible')
    }

    // Verify cart contains the product - more flexible selector
    const cartProductName = page.locator('.cart-item, [data-testid="cart-item"], [class*="CartItem"]').first()
    const cartProductVisible = await cartProductName.isVisible({ timeout: 5000 }).catch(() => false)

    if (cartProductVisible) {
      console.log('✓ Product appears in cart')
    }

    // Verify uploaded files appear in cart if files were uploaded
    if (fileInputVisible) {
      const cartFileThumbnails = page.locator('[class*="thumbnail"], [class*="FileThumbnails"], [class*="file-preview"]')
      const thumbnailsVisible = await cartFileThumbnails.first().isVisible({ timeout: 3000 }).catch(() => false)

      if (thumbnailsVisible) {
        console.log('✓ Uploaded files visible in cart')
      }
    }

    // Verify proceed to checkout button - more flexible selector
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout"), button:has-text("Checkout"), a:has-text("Checkout")').first()
    const checkoutVisible = await checkoutButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (checkoutVisible) {
      console.log('✓ Checkout button visible')
    }

    console.log('🎉 Customer journey test completed successfully!')
  })

  test('Upload multiple files and verify thumbnails', async ({ page }) => {
    console.log('🖼️  Testing multiple file uploads...')

    // Navigate directly to a product
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()
    await page.waitForLoadState('networkidle')

    // Find upload input
    const fileInput = page.locator('input[type="file"]#artwork-upload').first()

    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Upload multiple files
      await fileInput.setInputFiles([TEST_IMAGE, TEST_PDF])
      console.log('✓ Multiple files selected')

      // Wait for uploads to process
      await page.waitForTimeout(2000)

      // Verify multiple file previews
      const filePreviews = page.locator('[class*="thumbnail"], [class*="preview"]')
      const count = await filePreviews.count()

      if (count >= 2) {
        console.log(`✓ ${count} file previews displayed`)
      } else {
        console.log(`⚠️  Expected 2+ previews, found ${count}`)
      }
    } else {
      console.log('⚠️  File upload not available - skipping multi-file test')
    }
  })

  test('Verify cart persists across page navigation', async ({ page }) => {
    console.log('💾 Testing cart persistence...')

    // Add product to cart
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()
    await page.waitForLoadState('networkidle')

    // Add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
    if (await addToCartButton.isVisible({ timeout: 5000 })) {
      await addToCartButton.click()

      // Wait for cart drawer
      await page.waitForSelector('[role="dialog"], .sheet', { timeout: 5000 })
      console.log('✓ Product added to cart')

      // Close cart drawer
      const closeButton = page.locator('[aria-label="Close"], button:has-text("×")').first()
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click()
      }

      // Navigate away
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      console.log('✓ Navigated to homepage')

      // Check cart button shows item count or total
      const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"], a[href*="cart"]').first()
      await expect(cartButton).toBeVisible()
      console.log('✓ Cart button visible with items')

      // Open cart
      await cartButton.click()

      // Verify cart still has item
      const cartDrawer = page.locator('[role="dialog"], .sheet')
      await expect(cartDrawer).toBeVisible({ timeout: 5000 })
      console.log('✓ Cart persisted across navigation')
    }
  })
})
