import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { reportError, addBreadcrumb } from '@/lib/sentry'

// Generate correlation ID for request tracking
export function generateCorrelationId(): string {
  return uuidv4()
}

// API Error handling middleware function for route handlers
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId()
    const startTime = Date.now()

    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime

      // Log successful API call
      addBreadcrumb('API call successful', 'http', {
        correlationId,
        status: response.status,
        duration,
        path: request.nextUrl.pathname,
        method: request.method,
      })

      // Add response headers for monitoring
      const headers = new Headers(response.headers)
      headers.set('x-correlation-id', correlationId)
      headers.set('x-response-time', duration.toString())

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      const duration = Date.now() - startTime

      // Report API error with context
      reportError(error as Error, {
        apiRoute: true,
        correlationId,
        path: request.nextUrl.pathname,
        method: request.method,
        duration,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        body: await safeParseBody(request),
      })

      // Return structured error response
      return Response.json(
        {
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : 'Something went wrong',
          correlationId,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'x-correlation-id': correlationId,
            'x-response-time': duration.toString(),
          },
        }
      )
    }
  }
}

// Safe body parsing for error context
async function safeParseBody(request: NextRequest): Promise<any> {
  try {
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await request.json()
    }
    if (contentType?.includes('text/')) {
      return await request.text()
    }
    return null
  } catch {
    return null
  }
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_MAX = 100 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

export function withRateLimit<T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response,
  limit: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const ip = request.headers.get('x-forwarded-for') || 'unknown' || 'unknown'
    const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId()

    const now = Date.now()
    const windowStart = now - windowMs

    const clientData = rateLimitMap.get(ip) || { count: 0, lastReset: now }

    // Reset count if window has passed
    if (clientData.lastReset < windowStart) {
      clientData.count = 0
      clientData.lastReset = now
    }

    // Check if rate limit exceeded
    if (clientData.count >= limit) {
      addBreadcrumb('Rate limit exceeded', 'security', {
        ip,
        correlationId,
        count: clientData.count,
        limit,
      })

      return Response.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          correlationId,
          retryAfter: Math.ceil((clientData.lastReset + windowMs - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'x-correlation-id': correlationId,
            'retry-after': Math.ceil((clientData.lastReset + windowMs - now) / 1000).toString(),
            'x-ratelimit-limit': limit.toString(),
            'x-ratelimit-remaining': Math.max(0, limit - clientData.count).toString(),
            'x-ratelimit-reset': Math.ceil((clientData.lastReset + windowMs) / 1000).toString(),
          },
        }
      )
    }

    // Increment count
    clientData.count++
    rateLimitMap.set(ip, clientData)

    return handler(...args)
  }
}

// Request validation middleware
export function withRequestValidation<T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response,
  options: {
    methods?: string[]
    contentTypes?: string[]
    maxBodySize?: number
    requireAuth?: boolean
  } = {}
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId()

    // Validate HTTP method
    if (options.methods && !options.methods.includes(request.method)) {
      addBreadcrumb(`Invalid method: ${request.method}`, 'validation', {
        correlationId,
        allowed: options.methods,
      })

      return Response.json(
        {
          error: 'Method not allowed',
          message: `Method ${request.method} is not allowed for this endpoint`,
          correlationId,
          allowed: options.methods,
        },
        {
          status: 405,
          headers: {
            'x-correlation-id': correlationId,
            allow: options.methods.join(', '),
          },
        }
      )
    }

    // Validate content type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && options.contentTypes) {
      const contentType = request.headers.get('content-type')
      if (!contentType || !options.contentTypes.some((type) => contentType.includes(type))) {
        return Response.json(
          {
            error: 'Unsupported media type',
            message: 'Content-Type header is required and must be one of the supported types',
            correlationId,
            supported: options.contentTypes,
          },
          {
            status: 415,
            headers: {
              'x-correlation-id': correlationId,
            },
          }
        )
      }
    }

    // Validate body size
    if (options.maxBodySize) {
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > options.maxBodySize) {
        return Response.json(
          {
            error: 'Payload too large',
            message: `Request body size exceeds the maximum allowed size of ${options.maxBodySize} bytes`,
            correlationId,
            maxSize: options.maxBodySize,
          },
          {
            status: 413,
            headers: {
              'x-correlation-id': correlationId,
            },
          }
        )
      }
    }

    return handler(...args)
  }
}

// Authentication middleware
export function withAuth<T extends any[]>(handler: (...args: T) => Promise<Response> | Response) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId()

    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json(
        {
          error: 'Unauthorized',
          message: 'Authorization header is required',
          correlationId,
        },
        {
          status: 401,
          headers: {
            'x-correlation-id': correlationId,
            'www-authenticate': 'Bearer',
          },
        }
      )
    }

    // Validate token format (Bearer token)
    const token = authHeader.split(' ')[1]
    if (!token) {
      return Response.json(
        {
          error: 'Unauthorized',
          message: 'Bearer token is required',
          correlationId,
        },
        {
          status: 401,
          headers: {
            'x-correlation-id': correlationId,
          },
        }
      )
    }

    // Add user context to request (would be implemented based on auth system)
    // For now, just pass through
    return handler(...args)
  }
}

// Logging middleware
export function withLogging<T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response,
  options: {
    logBody?: boolean
    logResponse?: boolean
    sensitiveFields?: string[]
  } = {}
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId()
    const startTime = Date.now()

    // Log request
    const requestData: Record<string, unknown> = {
      correlationId,
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      headers: Object.fromEntries(request.headers.entries()),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    }

    // Optionally include request body
    if (options.logBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      requestData.body = await safeParseBody(request)

      // Redact sensitive fields
      if (options.sensitiveFields && requestData.body) {
        const body = requestData.body as Record<string, any>
        options.sensitiveFields.forEach((field) => {
          if (body[field]) {
            body[field] = '[REDACTED]'
          }
        })
      }
    }

    addBreadcrumb('API request received', 'http', requestData)

    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime

      // Log response
      const responseData: Record<string, unknown> = {
        correlationId,
        status: response.status,
        duration,
      }

      // Optionally include response body
      if (options.logResponse && response.body) {
        try {
          responseData.body = await response.text()
        } catch {
          responseData.body = '[Unable to read response body]'
        }
      }

      addBreadcrumb('API response sent', 'http', responseData)

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      addBreadcrumb('API request failed', 'http', {
        correlationId,
        duration,
        error: (error as Error).message,
      })

      throw error
    }
  }
}

// Combine multiple middleware functions
export function withMiddleware<T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response,
  ...middlewares: Array<(handler: any) => any>
) {
  return middlewares.reduce((wrapped, middleware) => middleware(wrapped), handler)
}

// Common middleware combinations
export const withStandardMiddleware = <T extends any[]>(
  handler: (...args: T) => Promise<Response> | Response,
  options: {
    rateLimit?: number
    requireAuth?: boolean
    logRequests?: boolean
    validationOptions?: Parameters<typeof withRequestValidation>[1]
  } = {}
) => {
  const middlewares: Array<(handler: any) => any> = [withErrorHandling]

  if (options.logRequests) {
    middlewares.push(withLogging)
  }

  if (options.rateLimit) {
    middlewares.push((h) => withRateLimit(h as any, options.rateLimit))
  }

  if (options.validationOptions) {
    middlewares.push((h) => withRequestValidation(h as any, options.validationOptions))
  }

  if (options.requireAuth) {
    middlewares.push(withAuth)
  }

  return withMiddleware(handler, ...middlewares)
}
