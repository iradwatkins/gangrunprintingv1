import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export interface ApiError {
  error: string
  message?: string
  code?: string
  details?: any
  requestId?: string
  timestamp: string
}

export interface ApiSuccess<T = any> {
  data: T
  success: true
  requestId?: string
  timestamp: string
  meta?: {
    page?: number
    total?: number
    count?: number
  }
}

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(7)
}

/**
 * Standardized error response creator
 */
export function createErrorResponse(
  error: string | Error,
  statusCode: number = 500,
  details?: any,
  requestId?: string
): NextResponse<ApiError> {
  const timestamp = new Date().toISOString()
  const id = requestId || generateRequestId()

  let errorMessage: string
  let errorCode: string | undefined

  if (error instanceof Error) {
    errorMessage = error.message
    errorCode = (error as any).code || undefined
  } else {
    errorMessage = error
  }

  const response: ApiError = {
    error: errorMessage,
    code: errorCode,
    details,
    requestId: id,
    timestamp,
  }

  // Log error for debugging
  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Request-ID': id,
      'X-Timestamp': timestamp,
    },
  })
}

/**
 * Standardized success response creator
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: { page?: number; total?: number; count?: number },
  requestId?: string
): NextResponse<ApiSuccess<T>> {
  const timestamp = new Date().toISOString()
  const id = requestId || generateRequestId()

  const response: ApiSuccess<T> = {
    data,
    success: true,
    requestId: id,
    timestamp,
    meta,
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Request-ID': id,
      'X-Timestamp': timestamp,
    },
  })
}

/**
 * Handle validation errors from Zod
 */
export function createValidationErrorResponse(
  errors: any[],
  requestId?: string
): NextResponse<ApiError> {
  const details = errors.map((err) => ({
    field: err.path?.join('.') || 'unknown',
    message: err.message || 'Validation error',
    code: err.code || 'VALIDATION_ERROR',
  }))

  return createErrorResponse(
    'Validation failed',
    400,
    { validationErrors: details },
    requestId
  )
}

/**
 * Handle database errors
 */
export function createDatabaseErrorResponse(
  error: any,
  requestId?: string
): NextResponse<ApiError> {
  // Prisma error codes
  const prismaErrors: Record<string, { message: string; statusCode: number }> = {
    P2002: { message: 'Unique constraint violation', statusCode: 409 },
    P2003: { message: 'Foreign key constraint violation', statusCode: 400 },
    P2012: { message: 'Missing required field', statusCode: 400 },
    P2025: { message: 'Record not found', statusCode: 404 },
    P1001: { message: 'Database connection error', statusCode: 503 },
    P1008: { message: 'Database connection timeout', statusCode: 503 },
    P1009: { message: 'Database connection error', statusCode: 503 },
  }

  const errorCode = error.code
  const prismaError = prismaErrors[errorCode]

  if (prismaError) {
    return createErrorResponse(
      prismaError.message,
      prismaError.statusCode,
      {
        databaseError: true,
        originalError: errorCode,
        meta: error.meta
      },
      requestId
    )
  }

  // Handle timeout errors
  if (error.name === 'PrismaClientUnknownRequestError' || error.message?.includes('timeout')) {
    return createErrorResponse(
      'Database operation timed out',
      504,
      { databaseError: true, timeout: true },
      requestId
    )
  }

  // Generic database error
  return createErrorResponse(
    'Database operation failed',
    500,
    { databaseError: true },
    requestId
  )
}

/**
 * Handle authentication errors
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required',
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(message, 401, { authError: true }, requestId)
}

/**
 * Handle authorization errors
 */
export function createAuthorizationErrorResponse(
  message: string = 'Insufficient permissions',
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(message, 403, { authorizationError: true }, requestId)
}

/**
 * Handle not found errors
 */
export function createNotFoundErrorResponse(
  resource: string = 'Resource',
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(
    `${resource} not found`,
    404,
    { notFound: true },
    requestId
  )
}

/**
 * Handle rate limit errors
 */
export function createRateLimitErrorResponse(
  retryAfter?: number,
  requestId?: string
): NextResponse<ApiError> {
  const response = createErrorResponse(
    'Rate limit exceeded',
    429,
    { rateLimited: true, retryAfter },
    requestId
  )

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString())
  }

  return response
}

/**
 * Handle file upload errors
 */
export function createUploadErrorResponse(
  message: string,
  fileSizeLimit?: number,
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(
    message,
    413,
    {
      uploadError: true,
      fileSizeLimit: fileSizeLimit ? `${fileSizeLimit / (1024 * 1024)}MB` : undefined
    },
    requestId
  )
}

/**
 * Handle timeout errors
 */
export function createTimeoutErrorResponse(
  operation: string = 'Operation',
  timeoutMs?: number,
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(
    `${operation} timed out`,
    408,
    { timeout: true, timeoutMs },
    requestId
  )
}

/**
 * Create a generic server error response
 */
export function createServerErrorResponse(
  message: string = 'Internal server error',
  requestId?: string
): NextResponse<ApiError> {
  return createErrorResponse(message, 500, { serverError: true }, requestId)
}