'use client'

import React from 'react'
import { reportError, addBreadcrumb } from '@/lib/sentry'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean
  name?: string
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  componentName?: string
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  componentName,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          {componentName ? `Error in ${componentName} component` : 'An unexpected error occurred'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <div className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded-lg overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex gap-2">
          <Button className="flex items-center gap-2" onClick={resetError}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Error Boundary Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Add breadcrumb for error context
    addBreadcrumb(`Error in ${this.props.name || 'Component'}`, 'error', {
      componentStack: errorInfo.componentStack,
    })

    // Report to Sentry with component context
    reportError(error, {
      componentName: this.props.name,
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      isolate: this.props.isolate,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Update state
    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          componentName={this.props.name}
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    isolate?: boolean
    name?: string
  }
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary
      fallback={options?.fallback}
      isolate={options?.isolate}
      name={options?.name || Component.displayName || Component.name}
      onError={options?.onError}
    >
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ))

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Specialized error boundaries for different parts of the app

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ children: React.ReactNode; pageName?: string }> = ({
  children,
  pageName,
}) => (
  <ErrorBoundary isolate={true} name={`Page: ${pageName}`} onError={(error, errorInfo) => {}}>
    {children}
  </ErrorBoundary>
)

// Component-level error boundary
export const ComponentErrorBoundary: React.FC<{
  children: React.ReactNode
  componentName?: string
}> = ({ children, componentName }) => (
  <ErrorBoundary isolate={false} name={componentName}>
    {children}
  </ErrorBoundary>
)

// Critical operation error boundary
export const CriticalErrorBoundary: React.FC<{
  children: React.ReactNode
  operationName?: string
}> = ({ children, operationName }) => (
  <ErrorBoundary
    isolate={true}
    name={`Critical: ${operationName}`}
    onError={(error, errorInfo) => {
      // Critical errors should be reported immediately
      reportError(error, {
        critical: true,
        operation: operationName,
        componentStack: errorInfo.componentStack,
      })
    }}
  >
    {children}
  </ErrorBoundary>
)

// Async error handler for promises
export function handleAsyncError(error: Error, context?: string) {
  addBreadcrumb(`Async error in ${context || 'Unknown context'}`, 'error')

  reportError(error, {
    asyncError: true,
    context,
  })
}

// Custom hook for error handling in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: string) => {
    handleAsyncError(error, context)
  }, [])
}
