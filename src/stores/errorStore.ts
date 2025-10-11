import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AppError {
  id: string
  message: string
  title?: string
  type: 'error' | 'warning' | 'info'
  timestamp: number
  context?: Record<string, any>
  retry?: () => void
  dismissible?: boolean
}

interface ErrorState {
  errors: AppError[]
  globalError: AppError | null
}

interface ErrorActions {
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string
  removeError: (id: string) => void
  clearErrors: () => void
  setGlobalError: (error: AppError | null) => void
  updateError: (id: string, updates: Partial<AppError>) => void
}

type ErrorStore = ErrorState & ErrorActions

export const useErrorStore = create<ErrorStore>()(
  devtools(
    (set, get) => ({
      // State
      errors: [],
      globalError: null,

      // Actions
      addError: (errorData) => {
        const error: AppError = {
          ...errorData,
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          dismissible: errorData.dismissible ?? true,
        }

        set(
          (state) => ({
            errors: [...state.errors, error],
          }),
          false,
          'addError'
        )

        // Auto-dismiss non-critical errors after 5 seconds
        if (error.type !== 'error' && error.dismissible) {
          setTimeout(() => {
            get().removeError(error.id)
          }, 5000)
        }

        return error.id
      },

      removeError: (id) =>
        set(
          (state) => ({
            errors: state.errors.filter((error) => error.id !== id),
          }),
          false,
          'removeError'
        ),

      clearErrors: () =>
        set(
          {
            errors: [],
            globalError: null,
          },
          false,
          'clearErrors'
        ),

      setGlobalError: (error) =>
        set(
          {
            globalError: error,
          },
          false,
          'setGlobalError'
        ),

      updateError: (id, updates) =>
        set(
          (state) => ({
            errors: state.errors.map((error) =>
              error.id === id ? { ...error, ...updates } : error
            ),
          }),
          false,
          'updateError'
        ),
    }),
    {
      name: 'error-store',
    }
  )
)

// Helper functions for common error patterns
export const errorHelpers = {
  // Network errors
  networkError: (retry?: () => void): Omit<AppError, 'id' | 'timestamp'> => ({
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    type: 'error',
    retry,
  }),

  // Validation errors
  validationError: (message: string): Omit<AppError, 'id' | 'timestamp'> => ({
    title: 'Validation Error',
    message,
    type: 'warning',
  }),

  // API errors
  apiError: (
    message: string,
    context?: Record<string, any>
  ): Omit<AppError, 'id' | 'timestamp'> => ({
    title: 'API Error',
    message,
    type: 'error',
    context,
  }),

  // Success messages
  successMessage: (message: string): Omit<AppError, 'id' | 'timestamp'> => ({
    message,
    type: 'info',
  }),

  // Generic errors with retry
  retryableError: (
    message: string,
    retry: () => void,
    title?: string
  ): Omit<AppError, 'id' | 'timestamp'> => ({
    title: title || 'Error',
    message,
    type: 'error',
    retry,
  }),
}

// Custom hook for easier error handling
export const useErrorHandler = () => {
  const { addError, removeError, clearErrors } = useErrorStore()

  const handleError = (error: Error | string, context?: Record<string, any>) => {
    const message = error instanceof Error ? error.message : error
    return addError(errorHelpers.apiError(message, context))
  }

  const handleNetworkError = (retry?: () => void) => {
    return addError(errorHelpers.networkError(retry))
  }

  const handleValidationError = (message: string) => {
    return addError(errorHelpers.validationError(message))
  }

  const showSuccess = (message: string) => {
    return addError(errorHelpers.successMessage(message))
  }

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    showSuccess,
    removeError,
    clearErrors,
  }
}
