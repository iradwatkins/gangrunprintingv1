import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export function getErrorCode(error: unknown): string | undefined {
  if (isPrismaError(error)) {
    return error.code
  }
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  return undefined
}
