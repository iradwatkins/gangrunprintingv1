import { AsyncLocalStorage } from 'async_hooks'
import { v4 as uuidv4 } from 'uuid'
import { addBreadcrumb } from './sentry'

// CRITICAL: Correlation context for distributed tracing
interface CorrelationContext {
  correlationId: string
  requestId: string
  userId?: string
  sessionId?: string
  traceId?: string
  spanId?: string
  parentSpanId?: string
  startTime: number
  path?: string
  method?: string
}

// AsyncLocalStorage for correlation context
export const correlationStorage = new AsyncLocalStorage<CorrelationContext>()

/**
 * Generate a new correlation ID
 */
export function generateCorrelationId(): string {
  return `corr_${uuidv4()}`
}

/**
 * Generate a new request ID
 */
export function generateRequestId(): string {
  return `req_${uuidv4()}`
}

/**
 * Get current correlation context
 */
export function getCorrelationContext(): CorrelationContext | undefined {
  return correlationStorage.getStore()
}

/**
 * Get current correlation ID
 */
export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore()?.correlationId
}

/**
 * Create a new correlation context
 */
export function createCorrelationContext(
  existingCorrelationId?: string,
  userId?: string,
  sessionId?: string,
  path?: string,
  method?: string
): CorrelationContext {
  const correlationId = existingCorrelationId || generateCorrelationId()
  const requestId = generateRequestId()

  const context: CorrelationContext = {
    correlationId,
    requestId,
    userId,
    sessionId,
    startTime: Date.now(),
    path,
    method,
    traceId: correlationId, // Use correlation ID as trace ID
    spanId: requestId.replace('req_', 'span_'),
  }

  // Add breadcrumb for tracking
  addBreadcrumb('Correlation context created', 'correlation', {
    correlationId,
    requestId,
    userId,
    sessionId,
    path,
    method,
  })

  return context
}

/**
 * Run function with correlation context
 */
export async function withCorrelation<T>(
  context: CorrelationContext | string,
  fn: () => T | Promise<T>
): Promise<T> {
  const correlationContext =
    typeof context === 'string' ? createCorrelationContext(context) : context

  return correlationStorage.run(correlationContext, fn)
}

/**
 * Create child span for nested operations
 */
export function createChildSpan(name: string): CorrelationContext | undefined {
  const parent = getCorrelationContext()
  if (!parent) return undefined

  return {
    ...parent,
    parentSpanId: parent.spanId,
    spanId: `span_${uuidv4()}`,
  }
}

/**
 * Record operation duration
 */
export function recordDuration(operationName: string): () => void {
  const startTime = Date.now()
  const context = getCorrelationContext()

  return () => {
    const duration = Date.now() - startTime

    addBreadcrumb(`Operation completed: ${operationName}`, 'performance', {
      operationName,
      duration,
      correlationId: context?.correlationId,
      requestId: context?.requestId,
    })
  }
}

/**
 * Format correlation headers for HTTP responses
 */
export function getCorrelationHeaders(): Record<string, string> {
  const context = getCorrelationContext()
  if (!context) return {}

  return {
    'x-correlation-id': context.correlationId,
    'x-request-id': context.requestId,
    'x-trace-id': context.traceId || context.correlationId,
    'x-span-id': context.spanId || '',
    'x-parent-span-id': context.parentSpanId || '',
  }
}

/**
 * Extract correlation ID from headers
 */
export function extractCorrelationId(
  headers: Headers | Record<string, string>
): string | undefined {
  if (headers instanceof Headers) {
    return (
      headers.get('x-correlation-id') ||
      headers.get('x-request-id') ||
      headers.get('x-trace-id') ||
      undefined
    )
  }

  return (
    headers['x-correlation-id'] || headers['x-request-id'] || headers['x-trace-id'] || undefined
  )
}

/**
 * Log with correlation context
 */
export function logWithCorrelation(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  const context = getCorrelationContext()

  const logData = {
    ...data,
    correlationId: context?.correlationId,
    requestId: context?.requestId,
    userId: context?.userId,
    sessionId: context?.sessionId,
    duration: context ? Date.now() - context.startTime : undefined,
  }

  // Log based on level
  console[level](message, logData)
}
