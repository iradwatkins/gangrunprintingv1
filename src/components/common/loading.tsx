import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface LoadingSkeletonProps {
  className?: string
  count?: number
}

/**
 * Reusable loading skeleton component
 */
export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className={cn('h-10 bg-gray-200 rounded animate-pulse', className)}></div>
        </div>
      ))}
    </div>
  )
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

/**
 * Reusable loading spinner component
 */
export function LoadingSpinner({ size = 'md', className, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/**
 * Reusable empty state component
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * Reusable error state component
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('border border-red-200 rounded-md p-4 bg-red-50', className)}>
      <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
      <p className="text-sm text-red-600 mb-3">{message}</p>
      {onRetry && (
        <button className="text-sm text-red-800 underline hover:no-underline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
