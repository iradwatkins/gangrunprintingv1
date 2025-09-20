import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up admin user session
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'admin-session-id',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Mock admin user validation
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'admin-user-id',
            email: 'admin@gangrunprinting.com',
            name: 'Admin User',
            role: 'ADMIN',
          },
        }),
      })
    })

    // Mock dashboard data
    await page.route('**/api/admin/dashboard', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          totalOrders: 1247,
          totalRevenue: 87650.5,
          pendingOrders: 23,
          completedOrders: 1224,
          monthlyStats: [
            { month: 'Jan', orders: 156, revenue: 12450 },
            { month: 'Feb', orders: 189, revenue: 15670 },
            { month: 'Mar', orders: 234, revenue: 18920 },
          ],
        }),
      })
    })
  })

  test('should display dashboard overview', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await expect(page.locator('h1')).toContainText('Dashboard')

    // Check key metrics
    await expect(page.locator('[data-testid="total-orders"]')).toContainText('1,247')
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('$87,650.50')
    await expect(page.locator('[data-testid="pending-orders"]')).toContainText('23')
    await expect(page.locator('[data-testid="completed-orders"]')).toContainText('1,224')

    // Check charts are loaded
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible()
  })

  test('should manage orders', async ({ page }) => {
    // Mock orders API
    await page.route('**/api/orders*', (route) => {
      const url = new URL(route.request().url())
      const status = url.searchParams.get('status')

      let orders = [
        {
          id: 'order-1',
          orderNumber: 'GRP-20250915-001',
          status: 'PENDING',
          total: 125.5,
          customerName: 'John Doe',
          createdAt: '2025-09-15T10:00:00Z',
        },
        {
          id: 'order-2',
          orderNumber: 'GRP-20250915-002',
          status: 'PROCESSING',
          total: 89.25,
          customerName: 'Jane Smith',
          createdAt: '2025-09-15T11:00:00Z',
        },
        {
          id: 'order-3',
          orderNumber: 'GRP-20250915-003',
          status: 'COMPLETED',
          total: 256.0,
          customerName: 'Bob Johnson',
          createdAt: '2025-09-15T12:00:00Z',
        },
      ]

      if (status) {
        orders = orders.filter((order) => order.status === status)
      }

      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          orders,
          pagination: { page: 1, totalPages: 1, total: orders.length },
        }),
      })
    })

    await page.goto('/admin/orders')

    // Should display all orders by default
    await expect(page.locator('[data-testid="order-row"]')).toHaveCount(3)

    // Filter by status
    await page.selectOption('[data-testid="status-filter"]', 'PENDING')
    await expect(page.locator('[data-testid="order-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="order-GRP-20250915-001"]')).toBeVisible()

    // Clear filter
    await page.selectOption('[data-testid="status-filter"]', '')
    await expect(page.locator('[data-testid="order-row"]')).toHaveCount(3)

    // Update order status
    await page.click('[data-testid="status-GRP-20250915-001"]')
    await page.selectOption('[data-testid="status-select-GRP-20250915-001"]', 'PROCESSING')

    // Mock status update API
    await page.route('**/api/orders/order-1/status', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.click('[data-testid="update-status-GRP-20250915-001"]')
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Order status updated'
    )
  })

  test('should manage products', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products*', (route) => {
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
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'flyers',
            name: 'Flyers',
            slug: 'flyers',
            description: 'Marketing flyers',
            category: 'MARKETING',
            isActive: false,
            createdAt: '2025-01-01T00:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/admin/products')

    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(2)

    // Add new product
    await page.click('[data-testid="add-product-button"]')
    await expect(page).toHaveURL('/admin/products/new')

    await page.fill('[data-testid="product-name"]', 'Postcards')
    await page.fill('[data-testid="product-description"]', 'High-quality postcards')
    await page.selectOption('[data-testid="product-category"]', 'CARDS')
    await page.check('[data-testid="product-active"]')

    // Mock create product API
    await page.route('**/api/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'postcards',
            name: 'Postcards',
            slug: 'postcards',
            description: 'High-quality postcards',
            category: 'CARDS',
            isActive: true,
          }),
        })
      }
    })

    await page.click('[data-testid="save-product-button"]')
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Product created'
    )
    await expect(page).toHaveURL('/admin/products')

    // Edit existing product
    await page.click('[data-testid="edit-business-cards"]')
    await expect(page).toHaveURL('/admin/products/business-cards')

    await page.fill(
      '[data-testid="product-description"]',
      'Premium business cards with multiple finishes'
    )

    // Mock update product API
    await page.route('**/api/products/business-cards', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      }
    })

    await page.click('[data-testid="save-product-button"]')
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Product updated'
    )
  })

  test('should manage vendors', async ({ page }) => {
    // Mock vendors API
    await page.route('**/api/admin/vendors*', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'vendor-1',
            name: 'Premium Print Co',
            email: 'orders@premiumprint.com',
            phone: '555-0123',
            specialties: ['CARDS', 'MARKETING'],
            isActive: true,
          },
          {
            id: 'vendor-2',
            name: 'Quick Print Solutions',
            email: 'service@quickprint.com',
            phone: '555-0456',
            specialties: ['STICKERS', 'MAGNETS'],
            isActive: true,
          },
        ]),
      })
    })

    await page.goto('/admin/vendors')

    await expect(page.locator('[data-testid="vendor-row"]')).toHaveCount(2)

    // Assign order to vendor
    await page.route('**/api/orders/order-1/assign-vendor', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/admin/orders')
    await page.click('[data-testid="assign-vendor-GRP-20250915-001"]')
    await page.selectOption('[data-testid="vendor-select"]', 'vendor-1')
    await page.click('[data-testid="confirm-assignment"]')

    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Vendor assigned'
    )
  })

  test('should handle user management', async ({ page }) => {
    // Mock users API
    await page.route('**/api/admin/users*', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user-1',
            email: 'customer@example.com',
            name: 'Regular Customer',
            role: 'CUSTOMER',
            isBroker: false,
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            email: 'broker@example.com',
            name: 'Broker User',
            role: 'CUSTOMER',
            isBroker: true,
            brokerDiscounts: { CARDS: 15, MARKETING: 10 },
            createdAt: '2025-01-01T00:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/admin/users')

    await expect(page.locator('[data-testid="user-row"]')).toHaveCount(2)

    // Promote user to broker
    await page.click('[data-testid="edit-user-user-1"]')
    await page.check('[data-testid="is-broker-checkbox"]')
    await page.fill('[data-testid="discount-CARDS"]', '20')
    await page.fill('[data-testid="discount-MARKETING"]', '15')

    // Mock user update API
    await page.route('**/api/admin/users/user-1', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.click('[data-testid="save-user-button"]')
    await expect(page.locator('[data-testid="success-notification"]')).toContainText('User updated')
  })

  test('should prevent non-admin access', async ({ page, context }) => {
    // Clear admin session and set regular user
    await context.clearCookies()
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'customer-session-id',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'customer-user-id',
            email: 'customer@example.com',
            name: 'Regular Customer',
            role: 'CUSTOMER',
          },
        }),
      })
    })

    await page.goto('/admin/dashboard')

    // Should redirect to home page with error
    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="error-notification"]')).toContainText('Access denied')
  })

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/admin/orders')

    // Select multiple orders
    await page.check('[data-testid="select-order-GRP-20250915-001"]')
    await page.check('[data-testid="select-order-GRP-20250915-002"]')

    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()

    // Bulk status update
    await page.selectOption('[data-testid="bulk-status-select"]', 'PROCESSING')

    // Mock bulk update API
    await page.route('**/api/admin/orders/bulk-update', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, updated: 2 }),
      })
    })

    await page.click('[data-testid="apply-bulk-action"]')
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      '2 orders updated'
    )
  })
})
