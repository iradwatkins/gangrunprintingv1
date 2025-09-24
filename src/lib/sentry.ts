// Sentry functionality temporarily disabled for build

// No-op functions for temporary build fix
export function initSentry() : unknown {}

export function reportError(error: Error, context?: Record<string, unknown>) {
  :', error, context)
}

export function reportBusinessError(message: string, level: string, context?: Record<string, unknown>) {
  :', message, level, context)
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  :', message, category, data)
}

export function trackApiRoute(route: string, method: string, context?: Record<string, unknown>) {
  :', method, route, context)
}

export function setUser(user: User | null) {
  :', user?.email)
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  :', error, context)
}

export function captureMessage(message: string, level?: string) {
  :', message, level)
}

export function recordMetric(name: string, value: number, tags?: Record<string, unknown>) {
  :', name, value, tags)
}
