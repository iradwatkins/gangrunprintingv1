// Sentry functionality temporarily disabled for build
import { type User } from '@prisma/client'

// No-op functions for temporary build fix
export function initSentry() {
  console.log('Sentry temporarily disabled')
}

export function reportError(error: Error, context?: any) {
  console.error('Error (Sentry disabled):', error, context)
}

export function reportBusinessError(message: string, level: string, context?: any) {
  console.warn('Business Error (Sentry disabled):', message, level, context)
}

export function addBreadcrumb(message: string, category?: string, data?: any) {
  console.log('Breadcrumb (Sentry disabled):', message, category, data)
}

export function trackApiRoute(route: string, method: string, context?: any) {
  console.log('API Track (Sentry disabled):', method, route, context)
}

export function setUser(user: User | null) {
  console.log('User set (Sentry disabled):', user?.email)
}

export function captureException(error: Error, context?: any) {
  console.error('Exception (Sentry disabled):', error, context)
}

export function captureMessage(message: string, level?: string) {
  console.log('Message (Sentry disabled):', message, level)
}

export function recordMetric(name: string, value: number, tags?: any) {
  console.log('Metric (Sentry disabled):', name, value, tags)
}
