/**
 * ModuleErrorComponents.tsx
 * Ultra-independent error display components for product modules
 * Each error component is self-contained and module-agnostic
 */

'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import {
  IndependentModuleError,
  ModuleErrorSeverity,
  ModuleErrorType,
  ModuleErrorRecoveryAction
} from './ModuleErrorSystem'

// =============================================================================
// ERROR DISPLAY COMPONENTS
// =============================================================================

/**
 * Props for error display components
 */
export interface ModuleErrorDisplayProps {
  error: IndependentModuleError
  onDismiss?: (errorId: string) => void
  onRetry?: (errorId: string) => void
  onRecovery?: (errorId: string, actionId: string) => void
  recoveryActions?: ModuleErrorRecoveryAction[]
  compact?: boolean
  showDetails?: boolean
  className?: string
}

/**
 * Get appropriate icon for error severity
 */
function getErrorIcon(severity: ModuleErrorSeverity) {
  switch (severity) {
    case ModuleErrorSeverity.CRITICAL:
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case ModuleErrorSeverity.ERROR:
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case ModuleErrorSeverity.WARNING:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case ModuleErrorSeverity.INFO:
      return <Info className="h-4 w-4 text-blue-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

/**
 * Get appropriate styling for error severity
 */
function getErrorStyling(severity: ModuleErrorSeverity) {
  switch (severity) {
    case ModuleErrorSeverity.CRITICAL:
      return {
        alertClass: 'border-red-600 bg-red-50',
        titleClass: 'text-red-800',
        descClass: 'text-red-700'
      }
    case ModuleErrorSeverity.ERROR:
      return {
        alertClass: 'border-red-500 bg-red-50',
        titleClass: 'text-red-800',
        descClass: 'text-red-700'
      }
    case ModuleErrorSeverity.WARNING:
      return {
        alertClass: 'border-yellow-500 bg-yellow-50',
        titleClass: 'text-yellow-800',
        descClass: 'text-yellow-700'
      }
    case ModuleErrorSeverity.INFO:
      return {
        alertClass: 'border-blue-500 bg-blue-50',
        titleClass: 'text-blue-800',
        descClass: 'text-blue-700'
      }
    default:
      return {
        alertClass: 'border-gray-500 bg-gray-50',
        titleClass: 'text-gray-800',
        descClass: 'text-gray-700'
      }
  }
}

/**
 * Single error display component - completely independent
 */
export function ModuleErrorDisplay({
  error,
  onDismiss,
  onRetry,
  onRecovery,
  recoveryActions = [],
  compact = false,
  showDetails = false,
  className = ''
}: ModuleErrorDisplayProps) {
  const styling = getErrorStyling(error.severity)
  const icon = getErrorIcon(error.severity)

  // Format timestamp
  const timeAgo = React.useMemo(() => {
    const now = new Date()
    const diff = now.getTime() - error.timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [error.timestamp])

  return (
    <Alert className={`${styling.alertClass} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {icon}
          <div className="flex-1 min-w-0">
            {/* Error title/message */}
            <AlertTitle className={`${styling.titleClass} text-sm font-medium`}>
              {error.userMessage}
              {error.field && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {error.field}
                </Badge>
              )}
            </AlertTitle>

            {/* Error description */}
            {!compact && (
              <AlertDescription className={`${styling.descClass} text-xs mt-1`}>
                {error.message !== error.userMessage && error.message}

                {/* Constraint information */}
                {error.constraint && (
                  <div className="mt-1 text-xs opacity-75">
                    {error.constraint.min !== undefined && error.constraint.max !== undefined && (
                      `Range: ${error.constraint.min} - ${error.constraint.max}`
                    )}
                    {error.constraint.pattern && (
                      `Format: ${error.constraint.pattern}`
                    )}
                    {error.constraint.allowed && (
                      `Allowed: ${error.constraint.allowed.join(', ')}`
                    )}
                  </div>
                )}
              </AlertDescription>
            )}

            {/* Technical details (dev mode) */}
            {showDetails && error.technicalDetails && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-75">
                  Technical Details
                </summary>
                <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                  {error.technicalDetails}
                </pre>
              </details>
            )}

            {/* Recovery actions */}
            {recoveryActions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {recoveryActions.map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.destructive ? "destructive" : "outline"}
                    className="text-xs h-6"
                    onClick={() => onRecovery?.(error.id, action.id)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Error metadata */}
            <div className="flex items-center gap-2 mt-1 text-xs opacity-60">
              <span>{error.moduleType}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {error.retryable && (
                <>
                  <span>•</span>
                  <span>retryable</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 ml-2">
          {/* Retry button */}
          {error.retryable && onRetry && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onRetry(error.id)}
              title="Retry"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}

          {/* Help link */}
          {error.helpUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(error.helpUrl, '_blank')}
              title="Help"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}

          {/* Dismiss button */}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onDismiss(error.id)}
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

/**
 * Multiple errors display component - groups related errors
 */
export interface ModuleErrorListProps {
  errors: IndependentModuleError[]
  onDismiss?: (errorId: string) => void
  onDismissAll?: () => void
  onRetry?: (errorId: string) => void
  onRecovery?: (errorId: string, actionId: string) => void
  recoveryActions?: Record<string, ModuleErrorRecoveryAction[]>
  maxDisplayed?: number
  groupByField?: boolean
  compact?: boolean
  className?: string
}

export function ModuleErrorList({
  errors,
  onDismiss,
  onDismissAll,
  onRetry,
  onRecovery,
  recoveryActions = {},
  maxDisplayed = 5,
  groupByField = true,
  compact = false,
  className = ''
}: ModuleErrorListProps) {
  // Group errors by field if requested
  const groupedErrors = React.useMemo(() => {
    if (!groupByField) {
      return { '': errors }
    }

    return errors.reduce((groups, error) => {
      const key = error.field || 'general'
      if (!groups[key]) groups[key] = []
      groups[key].push(error)
      return groups
    }, {} as Record<string, IndependentModuleError[]>)
  }, [errors, groupByField])

  // Calculate display counts
  const totalErrors = errors.length
  const displayedErrors = errors.slice(0, maxDisplayed)
  const hiddenCount = totalErrors - maxDisplayed

  if (errors.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Error summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-800">
            {totalErrors} error{totalErrors > 1 ? 's' : ''} found
          </span>
        </div>

        {onDismissAll && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismissAll}
            className="text-xs h-6"
          >
            Dismiss All
          </Button>
        )}
      </div>

      {/* Error groups */}
      {Object.entries(groupedErrors).map(([field, fieldErrors]) => (
        <div key={field} className="space-y-1">
          {/* Field header */}
          {groupByField && field !== '' && field !== 'general' && (
            <h4 className="text-xs font-medium text-gray-700 capitalize">
              {field} ({fieldErrors.length})
            </h4>
          )}

          {/* Errors in this field */}
          {fieldErrors.slice(0, maxDisplayed).map((error) => (
            <ModuleErrorDisplay
              key={error.id}
              error={error}
              onDismiss={onDismiss}
              onRetry={onRetry}
              onRecovery={onRecovery}
              recoveryActions={recoveryActions[error.errorType] || []}
              compact={compact}
              showDetails={false}
            />
          ))}
        </div>
      ))}

      {/* Hidden errors indicator */}
      {hiddenCount > 0 && (
        <div className="text-xs text-gray-500 text-center py-2">
          ... and {hiddenCount} more error{hiddenCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

/**
 * Compact error indicator - shows just error count with tooltip
 */
export interface ModuleErrorIndicatorProps {
  errors: IndependentModuleError[]
  onClick?: () => void
  className?: string
}

export function ModuleErrorIndicator({
  errors,
  onClick,
  className = ''
}: ModuleErrorIndicatorProps) {
  const errorCount = errors.length
  const hasBlocking = errors.some(e =>
    e.severity === ModuleErrorSeverity.ERROR ||
    e.severity === ModuleErrorSeverity.CRITICAL
  )

  if (errorCount === 0) return null

  const severityColor = hasBlocking ? 'text-red-500' : 'text-yellow-500'

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1 text-xs ${severityColor} hover:opacity-75 ${className}`}
      title={`${errorCount} error${errorCount > 1 ? 's' : ''}`}
    >
      <AlertCircle className="h-3 w-3" />
      <span>{errorCount}</span>
    </button>
  )
}

/**
 * Field-specific error display - attaches to form fields
 */
export interface ModuleFieldErrorProps {
  errors: IndependentModuleError[]
  field: string
  className?: string
}

export function ModuleFieldError({
  errors,
  field,
  className = ''
}: ModuleFieldErrorProps) {
  const fieldErrors = errors.filter(error => error.field === field)

  if (fieldErrors.length === 0) return null

  // Show only the most recent/severe error for the field
  const primaryError = fieldErrors.reduce((most, current) => {
    if (current.severity === ModuleErrorSeverity.CRITICAL) return current
    if (current.severity === ModuleErrorSeverity.ERROR && most.severity !== ModuleErrorSeverity.CRITICAL) return current
    if (current.timestamp > most.timestamp && most.severity === current.severity) return current
    return most
  }, fieldErrors[0])

  return (
    <div className={`text-xs text-red-600 mt-1 ${className}`}>
      {primaryError.userMessage}
      {fieldErrors.length > 1 && (
        <span className="ml-1 text-red-500">
          (+{fieldErrors.length - 1} more)
        </span>
      )}
    </div>
  )
}

/**
 * Success state component - shows when module has no errors
 */
export interface ModuleSuccessIndicatorProps {
  message?: string
  className?: string
}

export function ModuleSuccessIndicator({
  message = "All valid",
  className = ''
}: ModuleSuccessIndicatorProps) {
  return (
    <div className={`inline-flex items-center space-x-1 text-xs text-green-600 ${className}`}>
      <CheckCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

/**
 * Error boundary for individual modules - prevents error propagation
 */
interface ModuleErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export interface ModuleErrorBoundaryProps {
  children: React.ReactNode
  moduleName: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ModuleErrorBoundary extends React.Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Module Error Boundary (${this.props.moduleName}):`, error, errorInfo)
    this.props.onError?.(error, errorInfo)
    this.setState({ errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.resetError} />
      }

      // Default error fallback
      return (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {this.props.moduleName} Error
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="space-y-2">
              <p>This module encountered an unexpected error and has been disabled to prevent further issues.</p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.resetError}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Module
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.reload()}
                  className="text-xs"
                >
                  Reload Page
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Error Details</summary>
                  <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

export default {
  ModuleErrorDisplay,
  ModuleErrorList,
  ModuleErrorIndicator,
  ModuleFieldError,
  ModuleSuccessIndicator,
  ModuleErrorBoundary
}