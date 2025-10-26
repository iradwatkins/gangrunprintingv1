/**
 * Utility functions for handling null/undefined conversions
 *
 * Prisma returns `null` for nullable fields, but TypeScript often expects `undefined`.
 * These helpers provide type-safe conversions between null and undefined.
 *
 * Created: October 25, 2025 (Code Janitor Task)
 */

/**
 * Converts null to undefined, passes through other values
 * Useful for Prisma nullable fields that need to be undefined
 *
 * @example
 * const name: string | undefined = nullToUndefined(user.name) // user.name is string | null
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

/**
 * Converts undefined to null, passes through other values
 * Useful when sending data to Prisma that expects null
 *
 * @example
 * await prisma.user.update({
 *   data: { phone: undefinedToNull(phoneNumber) }
 * })
 */
export function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value
}

/**
 * Converts empty string to null
 * Useful for form inputs that should be null when empty
 *
 * @example
 * const phone = emptyToNull(formData.phone) // "" becomes null
 */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  return value
}

/**
 * Converts null, undefined, or empty string to undefined
 * Useful for optional form fields
 *
 * @example
 * const company = emptyToUndefined(formData.company)
 */
export function emptyToUndefined(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return value
}

/**
 * Provides a fallback value for null or undefined
 * Type-safe version of nullish coalescing
 *
 * @example
 * const displayName = withFallback(user.name, 'Anonymous')
 */
export function withFallback<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback
}

/**
 * Transforms an object's null values to undefined
 * Useful for converting Prisma results to TypeScript-friendly format
 *
 * @example
 * const user = nullToUndefinedDeep(await prisma.user.findUnique(...))
 */
export function nullToUndefinedDeep<T extends object>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' && item !== null
        ? nullToUndefinedDeep(item)
        : (item === null ? undefined : item)
    ) as T
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      result[key] = undefined
    } else if (typeof value === 'object' && value !== null) {
      result[key] = nullToUndefinedDeep(value)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Safely access nested properties that might be null
 * Returns undefined if any part of the chain is null/undefined
 *
 * @example
 * const cityName = safeAccess(order, 'shippingAddress', 'city')
 */
export function safeAccess<T, K1 extends keyof T>(
  obj: T | null | undefined,
  key1: K1
): T[K1] | undefined
export function safeAccess<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2
): T[K1][K2] | undefined
export function safeAccess<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2,
  key3: K3
): T[K1][K2][K3] | undefined
export function safeAccess(obj: any, ...keys: string[]): any {
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[key]
  }
  return current === null ? undefined : current
}
