// Application-specific error classes for proper error handling

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, true, { resource, identifier })
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, true)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403, true)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context)
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 422, true, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(`Database operation failed: ${message}`, 500, true, {
      originalError: originalError?.message,
      stack: originalError?.stack,
    })
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: Error) {
    super(`External service error (${service}): ${message}`, 502, true, {
      service,
      originalError: originalError?.message,
    })
  }
}

export class RateLimitError extends AppError {
  constructor(limit: number, window: string) {
    super(`Rate limit exceeded: ${limit} requests per ${window}`, 429, true, {
      limit,
      window,
    })
  }
}

// Error handler utility
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

// Convert unknown errors to AppError
export function normalizeError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message || defaultMessage, 500, false, {
      originalName: error.name,
      originalStack: error.stack,
    })
  }

  return new AppError(defaultMessage, 500, false, {
    originalError: String(error),
  })
}

export default AppError
