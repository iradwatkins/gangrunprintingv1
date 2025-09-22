// Sentry functionality temporarily disabled for build
import { type User } from '@prisma/client'

// No-op functions for temporary build fix
export function initSentry() {}

export function reportError(error: Error, context?: any) {
  :', error, context)
}

export function reportBusinessError(message: string, level: string, context?: any) {
  :', message, level, context)
}

export function addBreadcrumb(message: string, category?: string, data?: any) {
  :', message, category, data)
}

export function trackApiRoute(route: string, method: string, context?: any) {
  :', method, route, context)
}

export function setUser(user: User | null) {
  :', user?.email)
}

export function captureException(error: Error, context?: any) {
  :', error, context)
}

export function captureMessage(message: string, level?: string) {
  :', message, level)
}

export function recordMetric(name: string, value: number, tags?: any) {
  :', name, value, tags)
}
