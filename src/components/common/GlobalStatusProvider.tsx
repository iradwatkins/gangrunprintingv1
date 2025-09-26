'use client'

import { useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useErrorStore } from '@/stores/errorStore'
import { useLoadingStore } from '@/stores/loadingStore'

interface GlobalStatusProviderProps {
  children: React.ReactNode
}

export function GlobalStatusProvider({ children }: GlobalStatusProviderProps) {
  const { errors, globalError, removeError } = useErrorStore()
  const { loadingStates, globalLoading } = useLoadingStore()

  // Get the most recent error for display
  const latestError = errors[errors.length - 1]

  // Get blocking loading states
  const blockingLoading = loadingStates.filter((state) => state.blocking)
  const hasBlockingLoading = blockingLoading.length > 0 || globalLoading

  const getErrorIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'info':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getErrorVariant = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <>
      {children}

      {/* Global Loading Overlay */}
      {hasBlockingLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            {blockingLoading.map((loading) => (
              <div key={loading.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium">{loading.label || 'Loading...'}</span>
                </div>
                {loading.type === 'progress' && typeof loading.progress === 'number' && (
                  <Progress value={loading.progress} className="w-full" />
                )}
              </div>
            ))}
            {globalLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {globalError && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Alert variant={getErrorVariant(globalError.type)}>
              {getErrorIcon(globalError.type)}
              <AlertTitle>{globalError.title || 'Error'}</AlertTitle>
              <AlertDescription className="mt-2">
                {globalError.message}
                {globalError.retry && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={globalError.retry}
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeError(globalError.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Toast-style Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
        {errors.slice(-3).map((error) => ( // Show only last 3 errors
          <Alert
            key={error.id}
            variant={getErrorVariant(error.type)}
            className="shadow-lg border"
          >
            {getErrorIcon(error.type)}
            <AlertTitle className="flex items-center justify-between">
              {error.title || 'Notification'}
              {error.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeError(error.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </AlertTitle>
            <AlertDescription className="mt-1">
              {error.message}
              {error.retry && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={error.retry}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Non-blocking Loading Indicators */}
      {loadingStates.filter((state) => !state.blocking).length > 0 && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2">
            {loadingStates
              .filter((state) => !state.blocking)
              .slice(-2) // Show only last 2 loading states
              .map((loading) => (
                <div key={loading.id} className="flex items-center space-x-2 text-sm">
                  {loading.type === 'spinner' && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                  )}
                  {loading.type === 'skeleton' && (
                    <div className="animate-pulse h-3 w-3 bg-gray-300 rounded" />
                  )}
                  <span>{loading.label || 'Loading...'}</span>
                  {loading.type === 'progress' && typeof loading.progress === 'number' && (
                    <div className="w-16">
                      <Progress value={loading.progress} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}