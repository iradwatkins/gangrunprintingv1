import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as createOrderHandler, GET as getOrdersHandler } from '@/app/api/orders/route'
import { createTestUser, createTestProduct, cleanupDatabase } from '../utils/db-helpers'

// Mock Square API
vi.mock('square', () => ({
  Client: vi.fn().mockImplementation(() => ({
    paymentsApi: {
      createPayment: vi.fn().mockResolvedValue({
        result: {
          payment: {
            id: 'test-payment-id',
            status: 'COMPLETED',
            totalMoney: { amount: 10000, currency: 'USD' },
          },
        },
      }),
    },
  })),
  Environment: {
    Sandbox: 'sandbox',
    Production: 'production',
  },
}))

// Mock auth validation
vi.mock('@/lib/auth', () => ({
  validateRequest: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com', role: 'CUSTOMER' },
    session: { id: 'test-session-id' },
  }),
}))

describe('Orders API Routes', () => {
  let testUser: any
  let testProduct: any

  beforeEach(async () => {
    await cleanupDatabase()
    testUser = await createTestUser()
    testProduct = await createTestProduct()
  })

  describe('POST /api/orders', () => {
    const validOrderData = {
      items: [
        {
          productId: 'test-product-id',
          quantity: 100,
          specifications: { size: '3.5x2', stock: 'premium' },
          unitPrice: 50.0,
          totalPrice: 50.0,
        },
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'US',
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'US',
      },
      paymentMethodId: 'test-payment-method',
      subtotal: 50.0,
      tax: 4.0,
      shipping: 5.0,
      total: 59.0,
    }

    it('should create order for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.order).toBeDefined()
      expect(data.order.orderNumber).toMatch(/^GRP-/)
      expect(data.order.status).toBe('PENDING')
      expect(data.order.total).toBe(59.0)
    })

    it('should validate required fields', async () => {
      const invalidData = { ...validOrderData }
      delete invalidData.shippingAddress

      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Shipping address is required')
    })

    it('should validate order items', async () => {
      const invalidData = { ...validOrderData, items: [] }

      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('At least one item is required')
    })

    it('should process payment integration', async () => {
      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.order.paymentStatus).toBe('COMPLETED')
      expect(data.paymentId).toBe('test-payment-id')
    })

    it('should handle payment failures', async () => {
      // Mock payment failure
      const { Client } = await import('square')
      const mockClient = Client as any
      mockClient.mockImplementation(() => ({
        paymentsApi: {
          createPayment: vi.fn().mockRejectedValue(new Error('Payment declined')),
        },
      }))

      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Payment failed')
    })

    it('should calculate totals correctly', async () => {
      const orderData = {
        ...validOrderData,
        items: [
          {
            productId: testProduct.id,
            quantity: 100,
            specifications: { size: '3.5x2' },
            unitPrice: 25.0,
            totalPrice: 25.0,
          },
          {
            productId: testProduct.id,
            quantity: 200,
            specifications: { size: '4x6' },
            unitPrice: 35.0,
            totalPrice: 35.0,
          },
        ],
        subtotal: 60.0,
        tax: 4.8,
        shipping: 5.0,
        total: 69.8,
      }

      const request = new NextRequest('http://localhost:3002/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.order.subtotal).toBe(60.0)
      expect(data.order.tax).toBe(4.8)
      expect(data.order.total).toBe(69.8)
    })
  })

  describe('GET /api/orders', () => {
    it('should return orders for authenticated user', async () => {
      // Create test order first
      const { prisma } = await import('../utils/db-helpers')
      await prisma.order.create({
        data: {
          orderNumber: 'GRP-TEST-001',
          userId: testUser.id,
          status: 'PENDING',
          total: 100.0,
          subtotal: 90.0,
          tax: 10.0,
          shippingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'US',
          },
          billingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'US',
          },
        },
      })

      const request = new NextRequest('http://localhost:3002/api/orders')

      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.orders).toHaveLength(1)
      expect(data.orders[0].orderNumber).toBe('GRP-TEST-001')
    })

    it('should support pagination', async () => {
      // Create multiple test orders
      const { prisma } = await import('../utils/db-helpers')
      const orders = []
      for (let i = 0; i < 15; i++) {
        orders.push({
          orderNumber: `GRP-TEST-${i.toString().padStart(3, '0')}`,
          userId: testUser.id,
          status: 'PENDING',
          total: 100.0,
          subtotal: 90.0,
          tax: 10.0,
          shippingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'US',
          },
          billingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'US',
          },
        })
      }
      await prisma.order.createMany({ data: orders })

      const request = new NextRequest('http://localhost:3002/api/orders?page=2&limit=10')

      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.orders).toHaveLength(5) // 15 total - 10 from page 1 = 5 on page 2
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.totalPages).toBe(2)
    })

    it('should filter orders by status', async () => {
      const { prisma } = await import('../utils/db-helpers')
      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'GRP-PENDING-001',
            userId: testUser.id,
            status: 'PENDING',
            total: 100.0,
            subtotal: 90.0,
            tax: 10.0,
            shippingAddress: {},
            billingAddress: {},
          },
          {
            orderNumber: 'GRP-COMPLETED-001',
            userId: testUser.id,
            status: 'COMPLETED',
            total: 100.0,
            subtotal: 90.0,
            tax: 10.0,
            shippingAddress: {},
            billingAddress: {},
          },
        ],
      })

      const request = new NextRequest('http://localhost:3002/api/orders?status=PENDING')

      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.orders).toHaveLength(1)
      expect(data.orders[0].status).toBe('PENDING')
    })
  })
})
