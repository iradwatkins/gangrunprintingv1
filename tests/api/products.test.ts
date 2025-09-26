import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/products/route'
import { POST as uploadImage } from '@/app/api/products/upload-image/route'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// Mock auth module
jest.mock('@/lib/auth', () => ({
  validateRequest: jest.fn()
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    productCategory: {
      findUnique: jest.fn(),
    },
    paperStockSet: {
      findUnique: jest.fn(),
    },
    quantityGroup: {
      findUnique: jest.fn(),
    },
    sizeGroup: {
      findUnique: jest.fn(),
    },
    addOn: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  }
}))

describe('Product API Routes', () => {
  beforeAll(() => {
    // Set up common mocks
    process.env.NODE_ENV = 'test'
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products with PascalCase formatting', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Business Cards',
          slug: 'business-cards',
          description: 'Professional business cards',
          basePrice: 29.99,
          isActive: true,
          isFeatured: true,
          createdAt: new Date('2024-01-01'),
          productCategory: {
            id: 'cat-1',
            name: 'Cards',
            slug: 'cards',
          },
          productImages: [
            {
              id: 'img-1',
              url: '/images/bc.jpg',
              isPrimary: true,
              sortOrder: 1,
            }
          ],
        }
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3002/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)

      // Check PascalCase transformation
      expect(data.data[0]).toHaveProperty('Id')
      expect(data.data[0]).toHaveProperty('Name')
      expect(data.data[0]).toHaveProperty('BasePrice')
      expect(data.data[0]).toHaveProperty('IsActive')
      expect(data.data[0]).toHaveProperty('IsFeatured')
      expect(data.data[0]).toHaveProperty('ProductCategory')
      expect(data.data[0]).toHaveProperty('ProductImages')
    })

    it('should handle empty product list', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3002/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.meta.count).toBe(0)
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3002/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
      expect(data.requestId).toBeDefined()
    })

    it('should include request ID in all responses', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3002/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(data.requestId).toBeDefined()
      expect(data.requestId).toMatch(/^req_[a-zA-Z0-9]+$/)
    })
  })

  describe('POST /api/products', () => {
    const validProductData = {
      name: 'Test Product',
      sku: 'TEST-001',
      categoryId: 'cat-1',
      description: 'Test description',
      shortDescription: 'Test short',
      isActive: true,
      isFeatured: false,
      images: [],
      paperStockSetId: 'paper-1',
      quantityGroupId: 'qty-1',
      sizeGroupId: 'size-1',
      selectedAddOns: [],
      productionTime: 5,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 50.00,
      basePrice: 99.99,
      setupFee: 25.00,
    }

    beforeEach(() => {
      // Mock successful auth
      ;(validateRequest as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'ADMIN' },
        session: { id: 'session-1' }
      })

      // Mock successful lookups
      ;(prisma.productCategory.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-1' })
      ;(prisma.paperStockSet.findUnique as jest.Mock).mockResolvedValue({ id: 'paper-1' })
      ;(prisma.quantityGroup.findUnique as jest.Mock).mockResolvedValue({ id: 'qty-1' })
      ;(prisma.sizeGroup.findUnique as jest.Mock).mockResolvedValue({ id: 'size-1' })
      ;(prisma.addOn.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should create product successfully with admin auth', async () => {
      const mockCreatedProduct = {
        id: 'prod-new',
        ...validProductData,
        slug: 'test-product',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          product: {
            create: jest.fn().mockResolvedValue(mockCreatedProduct)
          },
          productPaperStockSet: {
            create: jest.fn()
          },
          productQuantityGroup: {
            create: jest.fn()
          },
          productSizeGroup: {
            create: jest.fn()
          },
        })
      })

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('Id')
      expect(data.data.Name).toBe('Test Product')
    })

    it('should reject non-admin users', async () => {
      ;(validateRequest as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'USER' },
        session: { id: 'session-1' }
      })

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Admin access required')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test Product',
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json {',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should validate referenced entities exist', async () => {
      ;(prisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Category not found')
    })

    it('should generate slug from product name', async () => {
      const productWithSpaces = {
        ...validProductData,
        name: 'Product With Special Chars & Spaces!',
      }

      let capturedSlug: string = ''

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          product: {
            create: jest.fn().mockImplementation(({ data }) => {
              capturedSlug = data.slug
              return Promise.resolve({
                id: 'prod-new',
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            })
          },
          productPaperStockSet: { create: jest.fn() },
          productQuantityGroup: { create: jest.fn() },
          productSizeGroup: { create: jest.fn() },
        })
      })

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productWithSpaces),
      })

      await POST(request)

      expect(capturedSlug).toBe('product-with-special-chars-spaces')
    })
  })

  describe('POST /api/products/upload-image', () => {
    beforeEach(() => {
      ;(validateRequest as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'ADMIN' },
        session: { id: 'session-1' }
      })
    })

    it('should validate file size limit', async () => {
      const largeFile = new File(
        [new ArrayBuffer(11 * 1024 * 1024)], // 11MB
        'large.jpg',
        { type: 'image/jpeg' }
      )

      const formData = new FormData()
      formData.append('file', largeFile)
      formData.append('productId', 'prod-1')

      const request = new NextRequest('http://localhost:3002/api/products/upload-image', {
        method: 'POST',
        headers: {
          'Content-Length': String(11 * 1024 * 1024)
        },
        body: formData as any,
      })

      const response = await uploadImage(request)
      const data = await response.json()

      expect(response.status).toBe(413)
      expect(data.success).toBe(false)
      expect(data.error).toContain('exceeds 10MB limit')
    })

    it('should validate file type', async () => {
      const invalidFile = new File(
        ['test content'],
        'test.txt',
        { type: 'text/plain' }
      )

      const formData = new FormData()
      formData.append('file', invalidFile)
      formData.append('productId', 'prod-1')

      const request = new NextRequest('http://localhost:3002/api/products/upload-image', {
        method: 'POST',
        body: formData as any,
      })

      const response = await uploadImage(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file type')
    })

    it('should require admin authentication', async () => {
      ;(validateRequest as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'USER' },
        session: { id: 'session-1' }
      })

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3002/api/products/upload-image', {
        method: 'POST',
        body: formData as any,
      })

      const response = await uploadImage(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Admin access required')
    })
  })

  describe('Error Response Consistency', () => {
    it('should always include requestId in error responses', async () => {
      const testCases = [
        // Database error
        async () => {
          ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))
          return GET(new NextRequest('http://localhost:3002/api/products'))
        },
        // Auth error
        async () => {
          ;(validateRequest as jest.Mock).mockResolvedValue({ user: null, session: null })
          return POST(new NextRequest('http://localhost:3002/api/products', {
            method: 'POST',
            body: JSON.stringify({}),
          }))
        },
        // Validation error
        async () => {
          ;(validateRequest as jest.Mock).mockResolvedValue({
            user: { id: 'user-1', role: 'ADMIN' },
            session: { id: 'session-1' }
          })
          return POST(new NextRequest('http://localhost:3002/api/products', {
            method: 'POST',
            body: JSON.stringify({ name: '' }), // Invalid data
          }))
        }
      ]

      for (const testCase of testCases) {
        const response = await testCase()
        const data = await response.json()

        expect(data.requestId).toBeDefined()
        expect(data.requestId).toMatch(/^req_[a-zA-Z0-9]+$/)
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })
  })

  describe('Data Transformation Consistency', () => {
    it('should transform all nested relations to PascalCase', async () => {
      const complexProduct = {
        id: 'prod-complex',
        name: 'Complex Product',
        slug: 'complex-product',
        description: 'Description',
        basePrice: 100.00,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        productCategory: {
          id: 'cat-1',
          name: 'Category',
          slug: 'category',
          isActive: true,
        },
        productImages: [
          {
            id: 'img-1',
            url: '/img1.jpg',
            isPrimary: true,
            sortOrder: 1,
          }
        ],
        productSizes: [
          {
            id: 'size-1',
            productId: 'prod-complex',
            name: '8.5x11',
            width: 8.5,
            height: 11,
            unit: 'inches',
            isActive: true,
          }
        ],
        productQuantities: [
          {
            id: 'qty-1',
            productId: 'prod-complex',
            quantity: 100,
            price: 50.00,
            isActive: true,
          }
        ],
        productPaperStocks: [
          {
            id: 'paper-1',
            productId: 'prod-complex',
            name: 'Glossy',
            thickness: 14,
            finish: 'glossy',
            isActive: true,
          }
        ],
        productAddOns: [
          {
            id: 'addon-1',
            productId: 'prod-complex',
            name: 'Rush Service',
            price: 25.00,
            isActive: true,
          }
        ]
      }

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([complexProduct])

      const request = new NextRequest('http://localhost:3002/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      const product = data.data[0]

      // Check all transformed properties
      expect(product).toHaveProperty('Id')
      expect(product).toHaveProperty('Name')
      expect(product).toHaveProperty('BasePrice')
      expect(product).toHaveProperty('IsActive')
      expect(product).toHaveProperty('IsFeatured')

      // Check nested relations
      expect(product.ProductCategory).toHaveProperty('Id')
      expect(product.ProductCategory).toHaveProperty('Name')
      expect(product.ProductCategory).toHaveProperty('IsActive')

      expect(product.ProductImages[0]).toHaveProperty('Id')
      expect(product.ProductImages[0]).toHaveProperty('Url')
      expect(product.ProductImages[0]).toHaveProperty('IsPrimary')
      expect(product.ProductImages[0]).toHaveProperty('DisplayOrder')

      expect(product.ProductSizes[0]).toHaveProperty('Id')
      expect(product.ProductSizes[0]).toHaveProperty('Name')
      expect(product.ProductSizes[0]).toHaveProperty('Width')
      expect(product.ProductSizes[0]).toHaveProperty('Height')
      expect(product.ProductSizes[0]).toHaveProperty('IsActive')
    })
  })
})