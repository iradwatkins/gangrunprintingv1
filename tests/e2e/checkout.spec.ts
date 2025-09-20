import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up authenticated user session
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'valid-session-id',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Mock API responses
    await page.route('**/api/products', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'business-cards',
            name: 'Business Cards',
            slug: 'business-cards',
            description: 'Professional business cards',
            category: 'CARDS',
            isActive: true,
          },
        ]),
      })
    })

    await page.route('**/api/quotes', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'quote-1',
          productId: 'business-cards',
          quantity: 500,
          price: 45.0,
          totalPrice: 45.0,
        }),
      })
    })
  })

  test('should complete full checkout process', async ({ page }) => {
    await page.goto('/')

    // Navigate to product
    await page.click('[data-testid="product-business-cards"]')
    await expect(page).toHaveURL('/products/business-cards')

    // Configure product options
    await page.selectOption('[data-testid="quantity-select"]', '500')
    await page.selectOption('[data-testid="size-select"]', '3.5x2')
    await page.selectOption('[data-testid="stock-select"]', 'Premium')

    // Get quote
    await page.click('[data-testid="get-quote-button"]')
    await expect(page.locator('[data-testid="quote-price"]')).toContainText('$45.00')

    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]')
    await expect(page.locator('[data-testid="cart-notification"]')).toContainText('Added to cart')

    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page).toHaveURL('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL('/checkout')

    // Fill shipping information
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.fill('[data-testid="shipping-street"]', '123 Main St')
    await page.fill('[data-testid="shipping-city"]', 'Austin')
    await page.selectOption('[data-testid="shipping-state"]', 'TX')
    await page.fill('[data-testid="shipping-zip"]', '78701')

    // Use same address for billing
    await page.check('[data-testid="use-same-address"]')

    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]')

    // Fill payment information
    await page.fill('[data-testid="card-number"]', '4111111111111111')
    await page.fill('[data-testid="expiry-month"]', '12')
    await page.fill('[data-testid="expiry-year"]', '2025')
    await page.fill('[data-testid="cvv"]', '123')
    await page.fill('[data-testid="cardholder-name"]', 'John Doe')

    // Mock successful payment
    await page.route('**/api/orders', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          order: {
            id: 'order-1',
            orderNumber: 'GRP-20250915-001',
            status: 'PENDING',
            total: 54.0, // includes tax and shipping
          },
          paymentId: 'payment-1',
        }),
      })
    })

    // Place order
    await page.click('[data-testid="place-order-button"]')

    // Should redirect to confirmation page
    await expect(page).toHaveURL(/\/orders\/confirmation/)
    await expect(page.locator('[data-testid="order-number"]')).toContainText('GRP-20250915-001')
    await expect(page.locator('[data-testid="order-total"]')).toContainText('$54.00')
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Order placed successfully'
    )
  })

  test('should validate shipping information', async ({ page }) => {
    await page.goto('/checkout')

    // Try to continue without filling required fields
    await page.click('[data-testid="continue-to-payment"]')

    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required')
    await expect(page.locator('[data-testid="address-error"]')).toContainText('Address is required')
    await expect(page.locator('[data-testid="city-error"]')).toContainText('City is required')
    await expect(page.locator('[data-testid="zip-error"]')).toContainText('ZIP code is required')
  })

  test('should validate payment information', async ({ page }) => {
    await page.goto('/checkout')

    // Fill shipping info first
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.fill('[data-testid="shipping-street"]', '123 Main St')
    await page.fill('[data-testid="shipping-city"]', 'Austin')
    await page.selectOption('[data-testid="shipping-state"]', 'TX')
    await page.fill('[data-testid="shipping-zip"]', '78701')
    await page.check('[data-testid="use-same-address"]')
    await page.click('[data-testid="continue-to-payment"]')

    // Try to place order without payment info
    await page.click('[data-testid="place-order-button"]')

    await expect(page.locator('[data-testid="card-error"]')).toContainText(
      'Card number is required'
    )
    await expect(page.locator('[data-testid="expiry-error"]')).toContainText(
      'Expiry date is required'
    )
    await expect(page.locator('[data-testid="cvv-error"]')).toContainText('CVV is required')
  })

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/checkout')

    // Fill all required information
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.fill('[data-testid="shipping-street"]', '123 Main St')
    await page.fill('[data-testid="shipping-city"]', 'Austin')
    await page.selectOption('[data-testid="shipping-state"]', 'TX')
    await page.fill('[data-testid="shipping-zip"]', '78701')
    await page.check('[data-testid="use-same-address"]')
    await page.click('[data-testid="continue-to-payment"]')

    await page.fill('[data-testid="card-number"]', '4000000000000002') // Declined card
    await page.fill('[data-testid="expiry-month"]', '12')
    await page.fill('[data-testid="expiry-year"]', '2025')
    await page.fill('[data-testid="cvv"]', '123')
    await page.fill('[data-testid="cardholder-name"]', 'John Doe')

    // Mock payment failure
    await page.route('**/api/orders', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment failed: Card declined',
        }),
      })
    })

    await page.click('[data-testid="place-order-button"]')

    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      'Payment failed: Card declined'
    )
    await expect(page).toHaveURL('/checkout') // Should stay on checkout page
  })

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/cart')

    // Should show item total
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$45.00')

    // Add another item to cart
    await page.route('**/api/quotes', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'quote-2',
          productId: 'flyers',
          quantity: 1000,
          price: 85.0,
          totalPrice: 85.0,
        }),
      })
    })

    await page.goto('/products/flyers')
    await page.selectOption('[data-testid="quantity-select"]', '1000')
    await page.click('[data-testid="get-quote-button"]')
    await page.click('[data-testid="add-to-cart-button"]')

    await page.goto('/cart')
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$130.00')

    // Proceed to checkout to see tax and shipping
    await page.click('[data-testid="checkout-button"]')

    await expect(page.locator('[data-testid="subtotal-display"]')).toContainText('$130.00')
    await expect(page.locator('[data-testid="tax-display"]')).toContainText('$10.40') // 8% tax
    await expect(page.locator('[data-testid="shipping-display"]')).toContainText('$8.95')
    await expect(page.locator('[data-testid="total-display"]')).toContainText('$149.35')
  })

  test('should handle empty cart', async ({ page }) => {
    await page.route('**/api/cart', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })

    await page.goto('/cart')

    await expect(page.locator('[data-testid="empty-cart-message"]')).toContainText(
      'Your cart is empty'
    )
    await expect(page.locator('[data-testid="checkout-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="continue-shopping"]')).toBeVisible()
  })

  test('should allow cart item modifications', async ({ page }) => {
    await page.goto('/cart')

    // Update quantity
    await page.selectOption('[data-testid="quantity-select-0"]', '1000')
    await expect(page.locator('[data-testid="item-price-0"]')).toContainText('$65.00') // Updated price

    // Remove item
    await page.click('[data-testid="remove-item-0"]')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible()
  })

  test('should remember cart across sessions', async ({ page, context }) => {
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)

    // Clear session and create new one
    await context.clearCookies()
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'different-session-id',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.reload()

    // Cart should persist for authenticated user
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })
})
