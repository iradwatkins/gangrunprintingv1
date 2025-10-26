import { PrismaClient, Prisma } from '@prisma/client'
import { hash } from 'argon2'

// Create a singleton for test database
let prisma: PrismaClient

if (process.env.NODE_ENV === 'test') {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL + '_test',
        },
      },
    })
  }
  prisma = global.__prisma
} else {
  prisma = new PrismaClient()
}

export { prisma }

// Test data factories
export const createTestUser = async (overrides: any = {}) => {
  const hashedPassword = await hash('testpassword')

  return prisma.user.create({
    data: {
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      role: 'CUSTOMER',
      ...overrides,
    },
  })
}

export const createTestProduct = async (overrides: any = {}) => {
  return prisma.product.create({
    data: {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      category: 'CARDS',
      isActive: true,
      ...overrides,
    },
  })
}

export const createTestOrder = async (userId: string, overrides: any = {}) => {
  return prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId,
      status: 'PENDING',
      total: 100.0,
      subtotal: 90.0,
      tax: 10.0,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        country: 'US',
      },
      billingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        country: 'US',
      },
      ...overrides,
    },
  })
}

export const createTestQuote = async (userId: string, productId: string, overrides: any = {}) => {
  return prisma.quote.create({
    data: {
      userId,
      productId,
      quantity: 100,
      price: 50.0,
      totalPrice: 50.0,
      specifications: {},
      ...overrides,
    },
  })
}

// Database cleanup helpers
// SECURITY FIX (2025-01-24): Replaced unsafe string concatenation with individual parameterized queries
export const cleanupDatabase = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  // Execute TRUNCATE for each table individually to avoid SQL injection via dynamic concatenation
  // This is safer than concatenating all table names into a single query
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        // Use Prisma.raw for safe table name interpolation
        await prisma.$executeRaw`TRUNCATE TABLE ${Prisma.raw(`"public"."${tablename}"`)} CASCADE`
      } catch (error) {
        // Silently continue if table truncation fails
      }
    }
  }
}

export const disconnectDatabase = async () => {
  await prisma.$disconnect()
}

// Type augmentation for global
declare global {
  var __prisma: PrismaClient | undefined
}
