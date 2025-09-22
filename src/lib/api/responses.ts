import { NextResponse } from 'next/server'

export interface ErrorResponse {
  error: string
  details?: string
  code?: string
}

export interface SuccessResponse<T = any> {
  data?: T
  message?: string
}

/**
 * Standard error response utility
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: string,
  code?: string
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    error: message,
    ...(details && { details }),
    ...(code && { code }),
  }

  return NextResponse.json(response, { status })
}

/**
 * Standard success response utility
 */
export function successResponse<T>(
  data?: T,
  status: number = 200,
  message?: string
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    ...(data !== undefined && { data }),
    ...(message && { message }),
  }

  return NextResponse.json(response, { status })
}

/**
 * Common error responses
 */
export const commonErrors = {
  unauthorized: () => errorResponse('Unauthorized', 401),
  adminRequired: () => errorResponse('Unauthorized - Admin access required', 401),
  forbidden: () => errorResponse('Forbidden', 403),
  notFound: (resource = 'Resource') => errorResponse(`${resource} not found`, 404),
  badRequest: (message = 'Bad request') => errorResponse(message, 400),
  validationError: (message = 'Validation failed') => errorResponse(message, 400),
  internalError: (message = 'Internal server error') => errorResponse(message, 500),
  conflict: (message = 'Resource conflict') => errorResponse(message, 409),
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error: any): NextResponse {
  switch (error.code) {
    case 'P2002':
      return commonErrors.conflict('A record with this unique field already exists')
    case 'P2025':
      return commonErrors.notFound()
    case 'P2003':
      return commonErrors.badRequest('Foreign key constraint violation')
    case 'P2016':
      return commonErrors.notFound()
    default:
      return commonErrors.internalError()
  }
}

/**
 * Catch-all error handler for API routes
 */
export function handleApiError(
  error: any,
  defaultMessage: string = 'Operation failed'
): NextResponse {
  // Handle known error types
  if (error.code && error.code.startsWith('P')) {
    return handlePrismaError(error)
  }

  if (error instanceof Error) {
    return errorResponse(defaultMessage, 500, error.message)
  }

  return commonErrors.internalError(defaultMessage)
}
