/**
 * Enhanced API Error Handler
 *
 * Provides comprehensive error handling, logging, and response formatting
 * for API routes with security and monitoring features
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger-safe'
import { validateRequest } from '@/lib/auth'

// Error types for better categorization
export enum ApiErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  INTERNAL = 'INTERNAL',
}

// Structured API error
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public message: string,
    public statusCode: number = 500,
    public details?: any,
    public cause?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static validation(message: string, details?: any): ApiError {
    return new ApiError(ApiErrorType.VALIDATION, message, 400, details)
  }

  static authentication(message: string = 'Authentication required'): ApiError {
    return new ApiError(ApiErrorType.AUTHENTICATION, message, 401)
  }

  static authorization(message: string = 'Access denied'): ApiError {
    return new ApiError(ApiErrorType.AUTHORIZATION, message, 403)
  }

  static notFound(resource: string = 'Resource'): ApiError {
    return new ApiError(ApiErrorType.NOT_FOUND, `${resource} not found`, 404)
  }

  static rateLimit(message: string, resetTime?: number): ApiError {
    return new ApiError(ApiErrorType.RATE_LIMIT, message, 429, { resetTime })
  }

  static fileUpload(message: string, details?: any): ApiError {
    return new ApiError(ApiErrorType.FILE_UPLOAD, message, 400, details)
  }

  static database(message: string, cause?: Error): ApiError {
    return new ApiError(
      ApiErrorType.DATABASE,
      'Database operation failed',
      500,
      { original: message },
      cause
    )
  }

  static externalService(service: string, message: string, cause?: Error): ApiError {
    return new ApiError(
      ApiErrorType.EXTERNAL_SERVICE,
      `${service} service error`,
      503,
      { original: message },
      cause
    )
  }

  static businessLogic(message: string): ApiError {
    return new ApiError(ApiErrorType.BUSINESS_LOGIC, message, 422)
  }

  static internal(message: string, cause?: Error): ApiError {
    return new ApiError(
      ApiErrorType.INTERNAL,
      'Internal server error',
      500,
      { original: message },
      cause
    )
  }
}

// Request context for logging and error handling
export interface ApiContext {
  requestId: string
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
  userRole?: string
  startTime: number
  metadata?: Record<string, any>
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create API context from request
export function createApiContext(request: NextRequest, metadata?: Record<string, any>): ApiContext {
  return {
    requestId: generateRequestId(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip:
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      undefined,
    startTime: Date.now(),
    metadata,
  }
}

// Enhanced API route wrapper
export function withApiHandler<T = any>(
  handler: (request: NextRequest, context: ApiContext, params?: any) => Promise<NextResponse<T>>,
  options?: {
    requireAuth?: boolean
    requireAdmin?: boolean
    validateSchema?: z.ZodSchema
    rateLimit?: {
      keyPrefix: string
      maxRequests: number
      windowMs: number
    }
  }
) {
  return async (request: NextRequest, routeParams?: { params: any }): Promise<NextResponse> => {
    const context = createApiContext(request)

    try {
      // Add authentication info to context
      if (options?.requireAuth || options?.requireAdmin) {
        const { user } = await validateRequest()

        if (!user) {
          throw ApiError.authentication()
        }

        if (options.requireAdmin && user.role !== 'ADMIN') {
          throw ApiError.authorization('Admin access required')
        }

        context.userId = user.id
        context.userRole = user.role
      }

      // Rate limiting
      if (options?.rateLimit) {
        const { checkRateLimit, getRateLimitIdentifier, formatRateLimitError } = await import(
          '@/lib/security/rate-limiter'
        )

        const identifier = getRateLimitIdentifier(context.ip, context.userId)
        const result = checkRateLimit(identifier, {
          keyPrefix: options.rateLimit.keyPrefix,
          maxRequests: options.rateLimit.maxRequests,
          windowMs: options.rateLimit.windowMs,
        })

        if (!result.allowed) {
          throw ApiError.rateLimit(formatRateLimitError(result), result.resetTime)
        }
      }

      // Schema validation
      if (options?.validateSchema && request.method !== 'GET') {
        try {
          const body = await request.json()
          options.validateSchema.parse(body)
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw ApiError.validation('Request validation failed', error.errors)
          }
          throw error
        }
      }

      // Log request start
      logger.info('API request started', {
        requestId: context.requestId,
        method: context.method,
        url: context.url,
        userId: context.userId,
        userRole: context.userRole,
        ip: context.ip,
        userAgent: context.userAgent,
      })

      // Execute handler
      const response = await handler(request, context, routeParams?.params)

      // Log successful response
      const duration = Date.now() - context.startTime
      logger.info('API request completed', {
        requestId: context.requestId,
        method: context.method,
        url: context.url,
        statusCode: response.status,
        duration,
        userId: context.userId,
      })

      // Add request ID header
      response.headers.set('X-Request-ID', context.requestId)

      return response
    } catch (error) {
      return handleApiError(error, context)
    }
  }
}

// Handle and format API errors
export function handleApiError(error: unknown, context: ApiContext): NextResponse {
  const duration = Date.now() - context.startTime

  // Handle known API errors
  if (error instanceof ApiError) {
    logger.warn('API error occurred', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      errorType: error.type,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
      duration,
      userId: context.userId,
      cause: error.cause?.message,
    })

    const responseBody: any = {
      error: error.message,
      type: error.type,
      requestId: context.requestId,
    }

    // Include details for validation errors
    if (error.type === ApiErrorType.VALIDATION && error.details) {
      responseBody.details = error.details
    }

    // Include reset time for rate limit errors
    if (error.type === ApiErrorType.RATE_LIMIT && error.details?.resetTime) {
      responseBody.retryAfter = Math.ceil((error.details.resetTime - Date.now()) / 1000)
    }

    const response = NextResponse.json(responseBody, { status: error.statusCode })
    response.headers.set('X-Request-ID', context.requestId)

    // Add rate limit headers
    if (error.type === ApiErrorType.RATE_LIMIT && error.details?.resetTime) {
      response.headers.set('Retry-After', responseBody.retryAfter.toString())
    }

    return response
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    logger.warn('Validation error', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      errors: error.errors,
      duration,
      userId: context.userId,
    })

    const response = NextResponse.json(
      {
        error: 'Validation failed',
        type: ApiErrorType.VALIDATION,
        details: error.errors,
        requestId: context.requestId,
      },
      { status: 400 }
    )

    response.headers.set('X-Request-ID', context.requestId)
    return response
  }

  // Handle database errors (Prisma)
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any

    logger.error('Database error', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      code: prismaError.code,
      message: prismaError.message,
      duration,
      userId: context.userId,
      stack: prismaError.stack,
    })

    // Map common Prisma errors to user-friendly messages
    let message = 'Database operation failed'
    let statusCode = 500

    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this information already exists'
        statusCode = 409
        break
      case 'P2025':
        message = 'Record not found'
        statusCode = 404
        break
      case 'P2003':
        message = 'Related record not found'
        statusCode = 400
        break
    }

    const response = NextResponse.json(
      {
        error: message,
        type: ApiErrorType.DATABASE,
        requestId: context.requestId,
      },
      { status: statusCode }
    )

    response.headers.set('X-Request-ID', context.requestId)
    return response
  }

  // Handle unknown errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  const errorStack = error instanceof Error ? error.stack : undefined

  logger.error('Unhandled API error', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    message: errorMessage,
    stack: errorStack,
    duration,
    userId: context.userId,
  })

  const response = NextResponse.json(
    {
      error: 'Internal server error',
      type: ApiErrorType.INTERNAL,
      requestId: context.requestId,
    },
    { status: 500 }
  )

  response.headers.set('X-Request-ID', context.requestId)
  return response
}

// Utility for standardized success responses
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse<{
  success: true
  data: T
  message?: string
}> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  )
}

// Utility for paginated responses
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string
): NextResponse<{
  success: true
  data: T[]
  pagination: typeof pagination
  message?: string
}> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      message,
    },
    { status: 200 }
  )
}
