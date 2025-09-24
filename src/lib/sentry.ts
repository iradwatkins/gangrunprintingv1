// Sentry functionality temporarily disabled for build

// No-op functions for temporary build fix
export function initSentry() : unknown {}

export function reportError(error: Error, context?: Record<string, unknown>) {
  console.log('reportError:', error, context)
}

export function reportBusinessError(message: string, level: string, context?: Record<string, unknown>) {
  console.log('reportBusinessError:', message, level, context)
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  console.log('addBreadcrumb:', message, category, data)
}

export function trackApiRoute(route: string, method: string, context?: Record<string, unknown>) {
  console.log('trackApiRoute:', method, route, context)
}

export function setUser(user: any | null) {
  console.log('setUser:', user?.email)
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  console.log('captureException:', error, context)
}

export function captureMessage(message: string, level?: string) {
  console.log('captureMessage:', message, level)
}

export function recordMetric(name: string, value: number, tags?: Record<string, unknown>) {
  console.log('recordMetric:', name, value, tags)
}
