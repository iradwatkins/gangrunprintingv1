/**
 * ModuleLoadingComponents.tsx
 * Ultra-independent loading UI components for product modules
 * Each module shows its own loading state without affecting others
 */

'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Upload,
  Calculator,
  Database
} from 'lucide-react'
import {
  ModuleLoadingState,
  ModuleLoadingOperation,
  ModuleLoadingType,
  ModuleLoadingPriority
} from './ModuleLoadingSystem'

// =============================================================================
// LOADING INDICATOR COMPONENTS
// =============================================================================

/**
 * Get appropriate icon for loading operation type
 */
function getLoadingIcon(type: ModuleLoadingType, size: number = 16) {
  const iconProps = { size, className: "animate-spin" }

  switch (type) {
    case ModuleLoadingType.INITIAL_LOAD:
    case ModuleLoadingType.DATA_REFRESH:
      return <Database {...iconProps} />
    case ModuleLoadingType.PRICE_CALCULATION:
      return <Calculator {...iconProps} />
    case ModuleLoadingType.FILE_UPLOAD:
      return <Upload {...iconProps} />
    case ModuleLoadingType.VALIDATION:
      return <CheckCircle {...iconProps} />
    default:
      return <Loader2 {...iconProps} />
  }
}

/**
 * Get priority styling for loading operations
 */
function getPriorityStyling(priority: ModuleLoadingPriority) {
  switch (priority) {
    case ModuleLoadingPriority.CRITICAL:
      return {
        badgeVariant: 'destructive' as const,
        progressClass: 'bg-red-500',
        textClass: 'text-red-700'
      }
    case ModuleLoadingPriority.HIGH:
      return {
        badgeVariant: 'default' as const,
        progressClass: 'bg-blue-500',
        textClass: 'text-blue-700'
      }
    case ModuleLoadingPriority.NORMAL:
      return {
        badgeVariant: 'secondary' as const,
        progressClass: 'bg-gray-500',
        textClass: 'text-gray-700'
      }
    case ModuleLoadingPriority.LOW:
      return {
        badgeVariant: 'outline' as const,
        progressClass: 'bg-gray-400',
        textClass: 'text-gray-600'
      }
  }
}

/**
 * Simple loading spinner for modules
 */
export interface ModuleLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  type?: ModuleLoadingType
  className?: string
}

export function ModuleLoadingSpinner({
  size = 'md',
  type = ModuleLoadingType.INITIAL_LOAD,
  className = ''
}: ModuleLoadingSpinnerProps) {
  const sizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {getLoadingIcon(type, sizes[size])}
    </div>
  )
}

/**
 * Progress bar for specific loading operation
 */
export interface ModuleLoadingProgressProps {
  operation: ModuleLoadingOperation
  showDetails?: boolean
  onCancel?: (operationId: string) => void
  className?: string
}

export function ModuleLoadingProgress({
  operation,
  showDetails = false,
  onCancel,
  className = ''
}: ModuleLoadingProgressProps) {
  const styling = getPriorityStyling(operation.priority)
  const progress = operation.progress || 0

  // Calculate elapsed time
  const elapsedTime = React.useMemo(() => {
    const now = new Date()
    const elapsed = now.getTime() - operation.startTime.getTime()
    const seconds = Math.floor(elapsed / 1000)

    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }, [operation.startTime])

  // Estimate remaining time
  const remainingTime = React.useMemo(() => {
    if (!operation.estimatedDuration || progress <= 0) return null

    const elapsed = new Date().getTime() - operation.startTime.getTime()
    const progressRatio = progress / 100
    const totalEstimated = elapsed / progressRatio
    const remaining = totalEstimated - elapsed

    if (remaining <= 0) return null

    const seconds = Math.floor(remaining / 1000)
    if (seconds < 60) return `${seconds}s remaining`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s remaining`
  }, [operation.startTime, operation.estimatedDuration, progress])

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getLoadingIcon(operation.type, 14)}
          <span className={`text-sm font-medium ${styling.textClass}`}>
            {operation.label}
          </span>
          <Badge variant={styling.badgeVariant} className="text-xs">
            {operation.priority}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {progress.toFixed(0)}%
          </span>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => onCancel(operation.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {showDetails && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Elapsed: {elapsedTime}</span>
          {remainingTime && <span>{remainingTime}</span>}
        </div>
      )}
    </div>
  )
}

/**
 * Complete loading state display for a module
 */
export interface ModuleLoadingDisplayProps {
  loadingState: ModuleLoadingState
  moduleName: string
  showAllOperations?: boolean
  showProgress?: boolean
  onCancelOperation?: (operationId: string) => void
  onClearAll?: () => void
  className?: string
}

export function ModuleLoadingDisplay({
  loadingState,
  moduleName,
  showAllOperations = true,
  showProgress = true,
  onCancelOperation,
  onClearAll,
  className = ''
}: ModuleLoadingDisplayProps) {
  const operations = Array.from(loadingState.operations.values())

  if (operations.length === 0) {
    return null
  }

  // Sort operations by priority and start time
  const sortedOperations = operations.sort((a, b) => {
    const priorityOrder = {
      [ModuleLoadingPriority.CRITICAL]: 4,
      [ModuleLoadingPriority.HIGH]: 3,
      [ModuleLoadingPriority.NORMAL]: 2,
      [ModuleLoadingPriority.LOW]: 1
    }

    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    return a.startTime.getTime() - b.startTime.getTime()
  })

  return (
    <div className={`space-y-3 p-3 bg-gray-50 border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm font-medium text-gray-900">
            {moduleName} Loading
          </span>
          <Badge variant="outline" className="text-xs">
            {operations.length} operation{operations.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {onClearAll && operations.length > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            className="text-xs h-6"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      {showProgress && loadingState.overallProgress !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Overall Progress</span>
            <span>{loadingState.overallProgress.toFixed(0)}%</span>
          </div>
          <Progress value={loadingState.overallProgress} className="h-2" />
        </div>
      )}

      {/* Individual Operations */}
      {showAllOperations && (
        <div className="space-y-2">
          {sortedOperations.map((operation) => (
            <ModuleLoadingProgress
              key={operation.id}
              operation={operation}
              showDetails={false}
              onCancel={onCancelOperation}
            />
          ))}
        </div>
      )}

      {/* Time Estimates */}
      {loadingState.estimatedTimeRemaining && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Est. {Math.ceil(loadingState.estimatedTimeRemaining / 1000)}s remaining</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact loading indicator - just shows loading state
 */
export interface ModuleLoadingIndicatorProps {
  loadingState: ModuleLoadingState
  onClick?: () => void
  className?: string
}

export function ModuleLoadingIndicator({
  loadingState,
  onClick,
  className = ''
}: ModuleLoadingIndicatorProps) {
  if (!loadingState.isLoading) return null

  const highPriorityCount = Array.from(loadingState.operations.values())
    .filter(op =>
      op.priority === ModuleLoadingPriority.HIGH ||
      op.priority === ModuleLoadingPriority.CRITICAL
    ).length

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 ${className}`}
      title={`${loadingState.totalOperations} loading operation${loadingState.totalOperations > 1 ? 's' : ''}`}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{loadingState.totalOperations}</span>
      {highPriorityCount > 0 && (
        <Badge variant="destructive" className="text-xs h-4">
          {highPriorityCount}
        </Badge>
      )}
    </button>
  )
}

/**
 * Loading skeleton for module content
 */
export interface ModuleLoadingSkeletonProps {
  lines?: number
  showTitle?: boolean
  showProgress?: boolean
  className?: string
}

export function ModuleLoadingSkeleton({
  lines = 3,
  showTitle = true,
  showProgress = false,
  className = ''
}: ModuleLoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && <Skeleton className="h-5 w-32" />}

      {showProgress && <Skeleton className="h-2 w-full" />}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Success indicator - shows when module loading completes
 */
export interface ModuleLoadingSuccessProps {
  message?: string
  onDismiss?: () => void
  autoHide?: number // milliseconds
  className?: string
}

export function ModuleLoadingSuccess({
  message = "Loading complete",
  onDismiss,
  autoHide,
  className = ''
}: ModuleLoadingSuccessProps) {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (autoHide && autoHide > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, autoHide)

      return () => clearTimeout(timer)
    }
  }, [autoHide, onDismiss])

  if (!visible) return null

  return (
    <div className={`inline-flex items-center space-x-2 text-xs text-green-600 ${className}`}>
      <CheckCircle className="h-3 w-3" />
      <span>{message}</span>
      {onDismiss && (
        <Button
          size="sm"
          variant="ghost"
          className="h-3 w-3 p-0"
          onClick={() => {
            setVisible(false)
            onDismiss()
          }}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </div>
  )
}

/**
 * Combined loading and error boundary for modules
 */
export interface ModuleLoadingBoundaryProps {
  children: React.ReactNode
  loadingState: ModuleLoadingState
  hasErrors: boolean
  moduleName: string
  onRetry?: () => void
  fallbackContent?: React.ReactNode
}

export function ModuleLoadingBoundary({
  children,
  loadingState,
  hasErrors,
  moduleName,
  onRetry,
  fallbackContent
}: ModuleLoadingBoundaryProps) {
  // Show loading skeleton during critical loading
  if (loadingState.hasCriticalLoading) {
    return fallbackContent || <ModuleLoadingSkeleton />
  }

  // Show errors with loading context
  if (hasErrors && !loadingState.isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{moduleName} has errors</span>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Show loading indicator overlay for high priority operations */}
      {loadingState.hasHighPriorityLoading && (
        <div className="absolute top-0 right-0 z-10">
          <ModuleLoadingIndicator loadingState={loadingState} />
        </div>
      )}

      {/* Module content */}
      <div className={loadingState.isLoading ? 'opacity-75' : ''}>
        {children}
      </div>
    </div>
  )
}

export default {
  ModuleLoadingSpinner,
  ModuleLoadingProgress,
  ModuleLoadingDisplay,
  ModuleLoadingIndicator,
  ModuleLoadingSkeleton,
  ModuleLoadingSuccess,
  ModuleLoadingBoundary
}