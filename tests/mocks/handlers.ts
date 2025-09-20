import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth handlers
  http.post('/api/auth/send-magic-link', () => {
    return HttpResponse.json({ success: true, message: 'Magic link sent' })
  }),

  http.post('/api/auth/verify', () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CUSTOMER',
      },
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CUSTOMER',
      },
    })
  }),

  // Products handlers
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: 'test-product-1',
        name: 'Business Cards',
        slug: 'business-cards',
        description: 'Professional business cards',
        category: 'CARDS',
        isActive: true,
      },
    ])
  }),

  // Orders handlers
  http.post('/api/orders', () => {
    return HttpResponse.json({
      id: 'test-order-1',
      orderNumber: 'ORD-001',
      status: 'PENDING',
      total: 100.0,
    })
  }),

  http.get('/api/orders', () => {
    return HttpResponse.json([
      {
        id: 'test-order-1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        total: 100.0,
        createdAt: new Date().toISOString(),
      },
    ])
  }),

  // Payment handlers (Square)
  http.post('/api/payments/create-payment', () => {
    return HttpResponse.json({
      success: true,
      paymentResult: {
        payment: {
          id: 'test-payment-id',
          status: 'COMPLETED',
        },
      },
    })
  }),

  // Quotes handlers
  http.post('/api/quotes', () => {
    return HttpResponse.json({
      id: 'test-quote-1',
      productId: 'test-product-1',
      quantity: 100,
      price: 50.0,
      totalPrice: 50.0,
    })
  }),

  // Admin handlers
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({
      totalOrders: 150,
      totalRevenue: 15000,
      pendingOrders: 25,
      completedOrders: 125,
    })
  }),
]
