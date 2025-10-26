import { PrismaClient } from '@prisma/client'
import { DATABASE_CONFIG } from '@/config/constants'

// Global singleton for Prisma Client - critical for serverless
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Production-optimized Prisma configuration for serverless/edge
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  const isProduction = process.env.NODE_ENV === 'production'

  // Increased production connection limit to handle concurrent requests
  // VPS deployment can handle more connections than serverless
  const connectionLimit = isProduction ? 15 : DATABASE_CONFIG.CONNECTION_LIMIT

  // Build connection string with optimized parameters
  let pooledUrl = databaseUrl
  if (!databaseUrl?.includes('connection_limit')) {
    const separator = databaseUrl?.includes('?') ? '&' : '?'
    pooledUrl = `${databaseUrl}${separator}connection_limit=${connectionLimit}&pool_timeout=${DATABASE_CONFIG.POOL_TIMEOUT}&connect_timeout=${DATABASE_CONFIG.CONNECT_TIMEOUT}&statement_timeout=${DATABASE_CONFIG.STATEMENT_TIMEOUT}&idle_in_transaction_session_timeout=${DATABASE_CONFIG.IDLE_IN_TRANSACTION_TIMEOUT}`
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
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

// Add connection health check utility for on-demand monitoring
// SECURITY FIX (2025-01-24): Replaced $executeRawUnsafe with safe $executeRaw
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  latency?: number
  error?: string
}> => {
  const startTime = Date.now()
  try {
    // Use safe $executeRaw instead of $executeRawUnsafe for consistency
    await prisma.$executeRaw`SELECT 1`
    const latency = Date.now() - startTime

    return { status: 'healthy', latency }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      status: 'unhealthy',
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Enhanced connection management with retry logic
export const ensureDatabaseConnection = async (retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()

      return
    } catch (error) {
      if (i === retries - 1) {
        throw new Error(`Failed to connect to database after ${retries} attempts`)
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}
