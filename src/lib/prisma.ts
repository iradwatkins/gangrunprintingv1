import { PrismaClient } from '@prisma/client'

// Global singleton for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production-optimized Prisma configuration
const createPrismaClient = () => {
  // Parse DATABASE_URL and add connection pooling parameters
  const databaseUrl = process.env.DATABASE_URL

  // Add pooling parameters if not already present
  const pooledUrl = databaseUrl?.includes('connection_limit')
    ? databaseUrl
    : `${databaseUrl}${databaseUrl?.includes('?') ? '&' : '?'}connection_limit=25&pool_timeout=10&connect_timeout=10&statement_timeout=20000`

  return new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl,
      },
    },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

// Ensure single instance in production
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache the instance globally
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production, always use cached instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}

// Graceful shutdown handler
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
