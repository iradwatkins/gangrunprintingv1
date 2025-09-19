import { PrismaClient } from '@prisma/client'

// Global singleton for Prisma Client - critical for serverless
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Production-optimized Prisma configuration for serverless/edge
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  // CRITICAL: For serverless/Next.js production, use SMALL connection pool
  // Each serverless function gets its own pool, so keep it minimal
  const isProduction = process.env.NODE_ENV === 'production'

  // In production: 5 connections max (serverless best practice)
  // In development: 10 connections for better DX
  const connectionLimit = isProduction ? 5 : 10

  // Build connection string with optimized parameters
  let pooledUrl = databaseUrl
  if (!databaseUrl?.includes('connection_limit')) {
    const separator = databaseUrl?.includes('?') ? '&' : '?'
    pooledUrl = `${databaseUrl}${separator}connection_limit=${connectionLimit}&pool_timeout=15&connect_timeout=10&statement_timeout=20000&idle_in_transaction_session_timeout=20000`
  }

  console.log(`[Prisma] Initializing with connection limit: ${connectionLimit}`)

  return new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl,
      },
    },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error', 'warn'],
  })
}

// Use Node.js global to ensure true singleton across serverless invocations
if (!global.prisma) {
  global.prisma = createPrismaClient()
}

export const prisma = global.prisma

// Prevent hot reload issues in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Production optimization: Disconnect idle connections
if (process.env.NODE_ENV === 'production') {
  // Set up periodic connection cleanup
  setInterval(async () => {
    try {
      // This helps prevent connection leaks in long-running processes
      await prisma.$executeRawUnsafe('SELECT 1')
    } catch (error) {
      console.error('[Prisma] Health check failed:', error)
      // Attempt to reconnect
      try {
        await prisma.$disconnect()
        await prisma.$connect()
      } catch (reconnectError) {
        console.error('[Prisma] Reconnection failed:', reconnectError)
      }
    }
  }, 30000) // Every 30 seconds
}
