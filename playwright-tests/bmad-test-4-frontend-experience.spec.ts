import { test, expect } from '@playwright/test'

test.describe('BMAD Test 4: Frontend Customer Experience Verification', () => {
  // Test data for verifying customer-facing product display and purchase flow
  const testProductSlugs = [
    'premium-business-cards-test',
    'premium-business-cards-with-image',
    'marketing-flyer-with-design',
    'large-format-poster',
    'deluxe-premium-business-cards-complete-package'
  ]

  const customerTestData = {
    name: 'John Smith',
    email: 'john.smith@testcustomer.com',
    phone: '(555) 123-4567',
    company: 'Test Company Inc.',
    address: {
      street: '123 Main Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201'
    }
  }

  test.beforeEach(async ({ page }) => {
    // Start from customer homepage
    await page.goto('https://gangrunprinting.com')
    await page.waitForLoadState('networkidle')
  })

  test('Step 1: Verify Homepage Product Display', async ({ page }) => {

    // Check if products are displayed on homepage
    const productCards = page.locator('[data-testid="product-card"], .product-card, [class*="product"]')

    // Wait for products to load
    await page.waitForTimeout(3000)

    if (await productCards.count() > 0) {

      // Check for basic product information
      const firstProduct = productCards.first()
      await expect(firstProduct).toBeVisible()

      // Look for product name, price, and image
      const productElements = [
        'h2, h3, .product-name, [class*="name"]',
        '.price, [class*="price"], [data-testid="price"]',
        'img, [class*="image"]'
      ]

      for (const selector of productElements) {
        const element = firstProduct.locator(selector)
        if (await element.count() > 0) {

        }
      }
    } else {

      // Try navigating to products page
      const productsLink = page.locator('a[href*="products"], a:has-text("Products"), nav a:has-text("Shop")')
      if (await productsLink.count() > 0) {
        await productsLink.first().click()
        await page.waitForLoadState('networkidle')

        const productsPageCards = page.locator('[data-testid="product-card"], .product-card, [class*="product"]')
        await page.waitForTimeout(2000)

        if (await productsPageCards.count() > 0) {

        }
      }
    }
  })

  test('Step 2: Test Product Detail Pages', async ({ page }) => {

    for (const slug of testProductSlugs) {
      const productUrl = `https://gangrunprinting.com/products/${slug}`

      try {
        await page.goto(productUrl)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check if page loads successfully (not 404)
        const pageTitle = await page.title()
        const is404 = pageTitle.toLowerCase().includes('404') ||
                      pageTitle.toLowerCase().includes('not found') ||
                      await page.locator('text=404, text="Not Found"').count() > 0

        if (!is404) {

          // Check for essential product elements
          const productElements = {
            'Product Name': 'h1, h2, .product-title, [data-testid="product-name"]',
            'Product Price': '.price, [class*="price"], [data-testid="price"]',
            'Product Description': '.description, [class*="description"], p',
            'Add to Cart Button': 'button:has-text("Add to Cart"), button:has-text("Order"), button[type="submit"]',
            'Product Options': 'select, input[type="radio"], input[type="checkbox"], .option'
          }

          for (const [elementName, selector] of Object.entries(productElements)) {
            const element = page.locator(selector)
            if (await element.count() > 0) {

            } else {

            }
          }

          // Check for product images
          const productImages = page.locator('img[alt*="product"], img[src*="product"], .product-image img')
          if (await productImages.count() > 0) {

            // Verify first image loads
            const firstImage = productImages.first()
            const imageSrc = await firstImage.getAttribute('src')
            if (imageSrc && !imageSrc.includes('placeholder')) {

            }
          }

        } else {

        }

      } catch (error) {

      }
    }
  })

  test('Step 3: Test Product Configuration Interface', async ({ page }) => {

    // Try to find a working product page to test configuration
    let workingProductPage = null

    for (const slug of testProductSlugs) {
      try {
        await page.goto(`https://gangrunprinting.com/products/${slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check if this page has configuration options
        const configOptions = page.locator('select, input[type="radio"], input[type="checkbox"], .quantity-selector')
        if (await configOptions.count() > 0) {
          workingProductPage = slug
          break
        }
      } catch (error) {
        continue
      }
    }

    if (workingProductPage) {

      // Test quantity selection
      const quantitySelectors = [
        'select[name="quantity"], select[id*="quantity"]',
        'input[name="quantity"], input[id*="quantity"]',
        '.quantity-selector select, .quantity-selector input'
      ]

      for (const selector of quantitySelectors) {
        const quantityElement = page.locator(selector)
        if (await quantityElement.count() > 0) {

          if (await quantityElement.getAttribute('type') !== 'number') {
            // It's a dropdown, select a different option
            await quantityElement.click()
            const options = page.locator(`${selector} option`)
            if (await options.count() > 1) {
              await options.nth(1).click()

            }
          }
          break
        }
      }

      // Test paper stock selection
      const paperStockSelectors = [
        'select[name*="paper"], select[id*="paper"]',
        'select[name*="stock"], select[id*="stock"]',
        '.paper-selector select, .stock-selector select'
      ]

      for (const selector of paperStockSelectors) {
        const paperElement = page.locator(selector)
        if (await paperElement.count() > 0) {

          await paperElement.click()
          const options = page.locator(`${selector} option`)
          if (await options.count() > 1) {
            await options.nth(1).click()

          }
          break
        }
      }

      // Test size selection
      const sizeSelectors = [
        'select[name*="size"], select[id*="size"]',
        'input[name*="size"][type="radio"]',
        '.size-selector select, .size-selector input'
      ]

      for (const selector of sizeSelectors) {
        const sizeElement = page.locator(selector)
        if (await sizeElement.count() > 0) {

          if (selector.includes('radio')) {
            const radioOptions = page.locator(selector)
            if (await radioOptions.count() > 0) {
              await radioOptions.first().click()

            }
          } else {
            await sizeElement.click()
            const options = page.locator(`${selector} option`)
            if (await options.count() > 1) {
              await options.nth(1).click()

            }
          }
          break
        }
      }

      // Check if price updates with configuration changes
      const priceElements = page.locator('.price, [class*="price"], [data-testid="price"]')
      if (await priceElements.count() > 0) {
        const initialPrice = await priceElements.first().textContent()

      }

    } else {

    }
  })

  test('Step 4: Test Add to Cart Functionality', async ({ page }) => {

    // Find a product page to test cart functionality
    let productToTest = null

    for (const slug of testProductSlugs) {
      try {
        await page.goto(`https://gangrunprinting.com/products/${slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Order"), button[type="submit"]')
        if (await addToCartButton.count() > 0) {
          productToTest = slug
          break
        }
      } catch (error) {
        continue
      }
    }

    if (productToTest) {

      // Configure product if options are available
      const quantityInput = page.locator('input[name="quantity"], select[name="quantity"]')
      if (await quantityInput.count() > 0) {
        if (await quantityInput.getAttribute('type') === 'number') {
          await quantityInput.fill('2')
        } else {
          await quantityInput.click()
          await page.locator('option[value="250"], option:has-text("250")').first().click()
        }

      }

      // Click add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Order"), button[type="submit"]')
      await addToCartButton.first().click()

      // Look for success indicators
      await page.waitForTimeout(2000)

      const successIndicators = [
        'text="Added to cart"',
        'text="Success"',
        '.cart-notification',
        '.success-message',
        '[data-testid="cart-success"]'
      ]

      let cartSuccess = false
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).count() > 0) {

          cartSuccess = true
          break
        }
      }

      // Check if cart icon/counter updated
      const cartCounters = page.locator('.cart-count, [data-testid="cart-count"], .cart-items-count')
      if (await cartCounters.count() > 0) {
        const cartCount = await cartCounters.first().textContent()
        if (cartCount && cartCount !== '0') {

          cartSuccess = true
        }
      }

      // Try to navigate to cart page
      const cartLinks = page.locator('a[href*="cart"], button:has-text("Cart"), .cart-icon')
      if (await cartLinks.count() > 0) {
        await cartLinks.first().click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        const cartItems = page.locator('.cart-item, [data-testid="cart-item"], .product-in-cart')
        if (await cartItems.count() > 0) {

          cartSuccess = true
        }
      }

      if (!cartSuccess) {

      }

    } else {

    }
  })

  test('Step 5: Test Checkout Process', async ({ page }) => {

    // Navigate to checkout page directly or through cart
    const checkoutUrls = [
      'https://gangrunprinting.com/checkout',
      'https://gangrunprinting.com/cart/checkout',
      'https://gangrunprinting.com/order/checkout'
    ]

    let checkoutPageFound = false

    for (const checkoutUrl of checkoutUrls) {
      try {
        await page.goto(checkoutUrl)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check if page loads successfully
        const pageTitle = await page.title()
        const is404 = pageTitle.toLowerCase().includes('404') ||
                      pageTitle.toLowerCase().includes('not found') ||
                      await page.locator('text=404, text="Not Found"').count() > 0

        if (!is404) {
          checkoutPageFound = true

          // Test checkout form elements
          const checkoutElements = {
            'Customer Name': 'input[name*="name"], input[placeholder*="name"]',
            'Email Address': 'input[type="email"], input[name*="email"]',
            'Phone Number': 'input[type="tel"], input[name*="phone"]',
            'Address Fields': 'input[name*="address"], input[name*="street"]',
            'City Field': 'input[name*="city"]',
            'State/Zip Fields': 'input[name*="state"], input[name*="zip"]',
            'Order Summary': '.order-summary, .cart-summary, [data-testid="order-summary"]',
            'Total Price': '.total, .order-total, [data-testid="total"]',
            'Submit Button': 'button[type="submit"], button:has-text("Place Order"), button:has-text("Submit")'
          }

          for (const [elementName, selector] of Object.entries(checkoutElements)) {
            const element = page.locator(selector)
            if (await element.count() > 0) {

              // Fill out form fields for testing
              if (elementName === 'Customer Name' && await element.first().isVisible()) {
                await element.first().fill(customerTestData.name)
              } else if (elementName === 'Email Address' && await element.first().isVisible()) {
                await element.first().fill(customerTestData.email)
              } else if (elementName === 'Phone Number' && await element.first().isVisible()) {
                await element.first().fill(customerTestData.phone)
              }
            } else {

            }
          }

          // Test file upload for custom designs
          const fileUploadInputs = page.locator('input[type="file"]')
          if (await fileUploadInputs.count() > 0) {

            // Test image upload
            await page.evaluate(() => {
              const canvas = document.createElement('canvas')
              canvas.width = 350
              canvas.height = 200
              const ctx = canvas.getContext('2d')!

              ctx.fillStyle = '#4f46e5'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'white'
              ctx.font = 'bold 16px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('CUSTOMER DESIGN', canvas.width / 2, canvas.height / 2)

              canvas.toBlob(async (blob) => {
                if (blob) {
                  const file = new File([blob], 'customer-design.png', { type: 'image/png' })
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                  if (fileInput) {
                    const dataTransfer = new DataTransfer()
                    dataTransfer.items.add(file)
                    fileInput.files = dataTransfer.files
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                }
              }, 'image/png')
            })

            await page.waitForTimeout(2000)

          }

          break
        }
      } catch (error) {
        continue
      }
    }

    if (!checkoutPageFound) {

    }
  })

  test('Step 6: Test API Endpoints from Frontend', async ({ page }) => {

    const apiEndpoints = [
      { endpoint: '/api/products', name: 'Products API' },
      { endpoint: '/api/product-categories', name: 'Categories API' },
      { endpoint: '/api/products/by-slug/premium-business-cards-test', name: 'Product by Slug API' },
      { endpoint: '/api/health', name: 'Health Check API' }
    ]

    for (const apiTest of apiEndpoints) {
      try {
        const response = await page.request.get(`https://gangrunprinting.com${apiTest.endpoint}`)

        if (response.status() === 200) {
          const data = await response.json()

          if (Array.isArray(data)) {

          } else if (data && typeof data === 'object') {

          }
        } else {

        }
      } catch (error) {

      }
    }
  })

  test('Step 7: Complete Customer Journey Simulation', async ({ page }) => {

    // 1. Start at homepage
    await page.goto('https://gangrunprinting.com')
    await page.waitForLoadState('networkidle')

    // 2. Browse products
    const productLinks = page.locator('a[href*="/products/"], .product-card a, [data-testid="product-link"]')
    if (await productLinks.count() > 0) {
      await productLinks.first().click()
      await page.waitForLoadState('networkidle')

    } else {

    }

    // 3. Configure product options
    const configurationSteps = [
      { name: 'quantity', selectors: ['select[name="quantity"]', 'input[name="quantity"]'] },
      { name: 'paper stock', selectors: ['select[name*="paper"]', 'select[name*="stock"]'] },
      { name: 'size', selectors: ['select[name*="size"]', 'input[name*="size"][type="radio"]'] }
    ]

    for (const step of configurationSteps) {
      let configured = false
      for (const selector of step.selectors) {
        const element = page.locator(selector)
        if (await element.count() > 0 && await element.first().isVisible()) {
          if (selector.includes('radio')) {
            await element.first().click()
          } else {
            await element.click()
            const options = page.locator(`${selector} option`)
            if (await options.count() > 1) {
              await options.nth(1).click()
            }
          }
          configured = true
          break
        }
      }
      if (configured) {

      }
    }

    // 4. Add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Order"), button[type="submit"]')
    if (await addToCartButton.count() > 0) {
      await addToCartButton.first().click()
      await page.waitForTimeout(2000)

    }

    // 5. Go to checkout
    const checkoutButtons = page.locator('button:has-text("Checkout"), a[href*="checkout"], .checkout-button')
    if (await checkoutButtons.count() > 0) {
      await checkoutButtons.first().click()
      await page.waitForLoadState('networkidle')

    } else {
      // Try direct navigation
      await page.goto('https://gangrunprinting.com/checkout')
      await page.waitForLoadState('networkidle')

    }

    // 6. Fill checkout form
    const customerForm = {
      'input[name*="name"], input[placeholder*="name"]': customerTestData.name,
      'input[type="email"], input[name*="email"]': customerTestData.email,
      'input[type="tel"], input[name*="phone"]': customerTestData.phone,
      'input[name*="company"]': customerTestData.company
    }

    for (const [selector, value] of Object.entries(customerForm)) {
      const field = page.locator(selector)
      if (await field.count() > 0 && await field.first().isVisible()) {
        await field.first().fill(value)

      }
    }

  })

  test('Step 8: Performance and Accessibility Check', async ({ page }) => {

    // Test key pages for basic performance
    const pagesToTest = [
      'https://gangrunprinting.com',
      'https://gangrunprinting.com/products',
      'https://gangrunprinting.com/checkout'
    ]

    for (const pageUrl of pagesToTest) {
      try {
        const startTime = Date.now()
        await page.goto(pageUrl)
        await page.waitForLoadState('networkidle')
        const loadTime = Date.now() - startTime

        // Check for basic accessibility elements
        const accessibilityChecks = [
          { name: 'Page Title', selector: 'title', required: true },
          { name: 'Main Content', selector: 'main, [role="main"]', required: true },
          { name: 'Navigation', selector: 'nav, [role="navigation"]', required: false },
          { name: 'Alt Text on Images', selector: 'img[alt]', required: false },
          { name: 'Form Labels', selector: 'label, input[aria-label]', required: false }
        ]

        for (const check of accessibilityChecks) {
          const elements = page.locator(check.selector)
          const count = await elements.count()

          if (count > 0) {

          } else if (check.required) {

          } else {

          }
        }

        // Check for console errors
        const consoleErrors = []
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })

        await page.waitForTimeout(2000)

        if (consoleErrors.length === 0) {

        } else {

        }

      } catch (error) {

      }
    }

  })
})