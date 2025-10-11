import { test, expect } from '@playwright/test'

test.describe('Product Creation - Comprehensive Error Testing', () => {
  // Helper function to set up admin authentication
  async function setupAdminAuth(page) {
    // Mock admin authentication
    await page.route('**/api/auth/validate', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'admin-user-id',
            email: 'iradwatkins@gmail.com',
            name: 'Admin User',
            role: 'ADMIN',
            emailVerified: true,
          },
          session: {
            id: 'admin-session-id',
            userId: 'admin-user-id',
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
        }),
      })
    })

    // Set authentication cookie
    await page.context().addCookies([
      {
        name: 'lucia-session',
        value: 'admin-session-id',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ])
  }

  // Helper function to mock successful API dependencies
  async function mockSuccessfulAPIs(page) {
    // Mock categories
    await page.route('**/api/product-categories', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'cat-business-cards',
            name: 'Business Cards',
            slug: 'business-cards',
            description: 'Professional business cards',
            isActive: true,
          },
          {
            id: 'cat-flyers',
            name: 'Flyers',
            slug: 'flyers',
            description: 'Marketing flyers',
            isActive: true,
          },
        ]),
      })
    })

    // Mock paper stocks
    await page.route('**/api/paper-stocks', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ps-matte',
            name: 'Matte',
            weight: 100,
            pricePerSqInch: 0.05,
            isActive: true,
          },
          {
            id: 'ps-gloss',
            name: 'Gloss',
            weight: 100,
            pricePerSqInch: 0.06,
            isActive: true,
          },
        ]),
      })
    })

    // Mock quantity groups
    await page.route('**/api/quantities', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'qg-standard',
            name: 'Standard Quantities',
            description: 'Common quantity options',
            values: '100,250,500,1000,2500',
            valuesList: ['100', '250', '500', '1000', '2500'],
            defaultValue: '250',
            isActive: true,
          },
        ]),
      })
    })

    // Mock size groups
    await page.route('**/api/sizes', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'sg-business-cards',
            name: 'Business Card Sizes',
            description: 'Standard business card dimensions',
            values: '3.5x2,4x2.5',
            valuesList: ['3.5x2', '4x2.5'],
            defaultValue: '3.5x2',
            hasCustomOption: false,
            isActive: true,
          },
        ]),
      })
    })

    // Mock add-ons
    await page.route('**/api/add-ons', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ao-rounded-corners',
            name: 'Rounded Corners',
            description: 'Round the corners of your cards',
            pricingModel: 'FLAT',
            configuration: { price: 5 },
            isActive: true,
          },
          {
            id: 'ao-spot-uv',
            name: 'Spot UV',
            description: 'Add spot UV coating',
            pricingModel: 'FLAT',
            configuration: { price: 15 },
            isActive: true,
          },
        ]),
      })
    })
  }

  test.beforeEach(async ({ page }) => {
    await setupAdminAuth(page)
    await mockSuccessfulAPIs(page)
  })

  test('should successfully create product with all dependencies', async ({ page }) => {
    // Mock successful product creation
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          status: 201,
          body: JSON.stringify({
            id: 'new-product-id',
            name: 'Test Business Cards',
            sku: 'test-business-cards',
            slug: 'test-business-cards',
            categoryId: 'cat-business-cards',
            isActive: true,
            basePrice: 25.99,
            setupFee: 10.0,
            productionTime: 3,
            createdAt: new Date().toISOString(),
          }),
        })
      } else {
        route.continue()
      }
    })

    // Navigate to product creation page
    await page.goto('http://localhost:3002/admin/products/new')

    // Wait for page to load
    await page.waitForSelector('[data-testid="product-name"]', { timeout: 10000 })

    // Fill in product details
    await page.fill('[data-testid="product-name"]', 'Test Business Cards')
    await page.selectOption('select[value=""]', 'cat-business-cards') // Category selection

    // Select paper stocks
    await page.check('#stock-ps-matte')
    await page.check('#stock-ps-gloss')

    // Set default paper stock
    await page.check('input[name="defaultPaperStock"][value="ps-matte"]')

    // Select quantity and size groups (these should auto-select if there's only one)

    // Select add-ons
    await page.check('#addon-ao-rounded-corners')

    // Set pricing
    await page.fill('#base-price', '25.99')
    await page.fill('#production', '3')

    // Submit form
    await page.click('button:has-text("Save Product")')

    // Wait for success message
    await expect(page.locator('text=Product created successfully')).toBeVisible({ timeout: 10000 })
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Override auth to return unauthorized
    await page.route('**/api/auth/validate', (route) => {
      route.fulfill({
        contentType: 'application/json',
        status: 401,
        body: JSON.stringify({
          error: 'Unauthorized - Admin access required',
        }),
      })
    })

    // Mock product creation to return 401
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          status: 401,
          body: JSON.stringify({
            error: 'Unauthorized - Admin access required',
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')

    // Should redirect to signin or show auth error
    await page.waitForTimeout(3000)

    const url = page.url()
    const hasAuthError = (await page.locator('text=/unauthorized|access denied/i').count()) > 0

    expect(url.includes('/auth/signin') || hasAuthError).toBeTruthy()
  })

  test('should handle validation errors with detailed feedback', async ({ page }) => {
    // Mock validation error response
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          status: 400,
          body: JSON.stringify({
            error: 'Validation failed',
            details: [
              {
                field: 'name',
                message: 'Product name is required',
                received: '',
              },
              {
                field: 'selectedPaperStocks',
                message: 'At least one paper stock must be selected',
                received: [],
              },
            ],
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('button:has-text("Save Product")')

    // Submit empty form to trigger validation
    await page.click('button:has-text("Save Product")')

    // Should show validation errors
    await expect(page.locator('text=/validation failed|required/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle database constraint violations', async ({ page }) => {
    // Mock constraint violation (duplicate SKU)
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          status: 400,
          body: JSON.stringify({
            error: 'A product with this sku already exists',
            field: 'sku',
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('[data-testid="product-name"]')

    // Fill form with duplicate data
    await page.fill('[data-testid="product-name"]', 'Duplicate Product')
    await page.selectOption('select[value=""]', 'cat-business-cards')
    await page.check('#stock-ps-matte')
    await page.check('input[name="defaultPaperStock"][value="ps-matte"]')

    await page.click('button:has-text("Save Product")')

    // Should show constraint violation error
    await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle foreign key validation errors', async ({ page }) => {
    // Mock foreign key error
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          status: 400,
          body: JSON.stringify({
            error: 'Category with ID invalid-category-id not found',
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('[data-testid="product-name"]')

    await page.fill('[data-testid="product-name"]', 'Test Product')
    // Note: form will have invalid category ID from mocked response

    await page.click('button:has-text("Save Product")')

    await expect(page.locator('text=/not found|invalid/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle transaction timeout errors', async ({ page }) => {
    // Mock transaction timeout
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        // Simulate timeout by delaying response
        setTimeout(() => {
          route.fulfill({
            contentType: 'application/json',
            status: 408,
            body: JSON.stringify({
              error: 'Product creation timed out. Please try again.',
              requestId: 'test-request-id',
            }),
          })
        }, 1000)
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('[data-testid="product-name"]')

    await page.fill('[data-testid="product-name"]', 'Timeout Test Product')
    await page.selectOption('select[value=""]', 'cat-business-cards')
    await page.check('#stock-ps-matte')

    await page.click('button:has-text("Save Product")')

    await expect(page.locator('text=/timed out|timeout/i')).toBeVisible({ timeout: 10000 })
  })

  test('should handle dependency API failures gracefully', async ({ page }) => {
    // Mock API failures for dependencies
    await page.route('**/api/product-categories', (route) => {
      route.fulfill({
        contentType: 'application/json',
        status: 500,
        body: JSON.stringify({ error: 'Failed to load categories' }),
      })
    })

    await page.route('**/api/paper-stocks', (route) => {
      route.fulfill({
        contentType: 'application/json',
        status: 500,
        body: JSON.stringify({ error: 'Failed to load paper stocks' }),
      })
    })

    await page.goto('http://localhost:3002/admin/products/new')

    // Should show error state for failed data loading
    await expect(page.locator('text=/Failed to Load Required Data|error/i')).toBeVisible({
      timeout: 10000,
    })

    // Should show retry button
    await expect(page.locator('button:has-text("Retry Loading")')).toBeVisible()
  })

  test('should test complete product creation workflow', async ({ page }) => {
    let productCreationCalled = false

    // Mock successful product creation and track if it's called
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        productCreationCalled = true
        const requestData = route.request().postData()

        route.fulfill({
          contentType: 'application/json',
          status: 201,
          body: JSON.stringify({
            id: 'workflow-test-product',
            name: 'Workflow Test Product',
            sku: 'workflow-test-product',
            slug: 'workflow-test-product',
            categoryId: 'cat-business-cards',
            isActive: true,
            basePrice: 19.99,
            setupFee: 5.0,
            productionTime: 2,
            createdAt: new Date().toISOString(),
            ProductCategory: {
              name: 'Business Cards',
            },
            productPaperStocks: [
              {
                paperStock: { name: 'Matte' },
                isDefault: true,
              },
            ],
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('[data-testid="product-name"]')

    // Test form validation client-side first
    await page.click('button:has-text("Save Product")')
    await expect(page.locator('text=/fill in all required fields/i')).toBeVisible({ timeout: 3000 })

    // Fill form completely
    await page.fill('[data-testid="product-name"]', 'Workflow Test Product')
    await page.selectOption('select[value=""]', 'cat-business-cards')
    await page.check('#stock-ps-matte')
    await page.check('input[name="defaultPaperStock"][value="ps-matte"]')
    await page.check('#addon-ao-rounded-corners')
    await page.fill('#base-price', '19.99')
    await page.fill('#production', '2')

    // Test price calculation
    await page.click('button:has-text("Test Price")')
    await expect(page.locator('text=/Test Price/i')).toBeVisible({ timeout: 3000 })

    // Submit form
    await page.click('button:has-text("Save Product")')

    // Verify API was called
    await page.waitForTimeout(2000)
    expect(productCreationCalled).toBeTruthy()

    // Should redirect to products list
    await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 10000 })
  })

  test('should monitor console errors during product creation', async ({ page }) => {
    const consoleErrors: string[] = []
    const networkErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`)
      }
    })

    page.on('pageerror', (error) => {
      consoleErrors.push(`PageError: ${error.message}`)
    })

    await page.goto('http://localhost:3002/admin/products/new')
    await page.waitForSelector('[data-testid="product-name"]', { timeout: 10000 })

    // Fill and submit form
    await page.fill('[data-testid="product-name"]', 'Error Test Product')
    await page.selectOption('select[value=""]', 'cat-business-cards')
    await page.check('#stock-ps-matte')
    await page.check('input[name="defaultPaperStock"][value="ps-matte"]')

    await page.click('button:has-text("Save Product")')
    await page.waitForTimeout(3000)

    // Filter out expected errors (auth, redirects, etc.)
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('404') &&
        !err.includes('401') &&
        !err.includes('auth') &&
        !err.toLowerCase().includes('network')
    )

    if (criticalErrors.length > 0) {
      criticalErrors.forEach((err) => console.log(`  - ${err}`))
    }

    if (networkErrors.length > 0) {
      networkErrors.forEach((err) => console.log(`  - ${err}`))
    }

    // We should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(3)
  })
})

test.describe('Product Creation Performance Tests', () => {
  test('should load product creation page within performance budget', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:3002/admin/products/new', {
      waitUntil: 'domcontentloaded',
    })

    const domLoadTime = Date.now() - startTime

    await page.waitForSelector('[data-testid="product-name"]', { timeout: 10000 })

    const totalLoadTime = Date.now() - startTime

    // Performance expectations
    expect(domLoadTime).toBeLessThan(3000) // DOM should load within 3 seconds
    expect(totalLoadTime).toBeLessThan(8000) // Form should be ready within 8 seconds
  })
})
