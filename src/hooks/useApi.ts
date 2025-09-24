import { useCallback, useEffect, useState } from 'react'

import toast from '@/lib/toast'

export interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  headers?: Record<string, string>
  onSuccess?: (data: Record<string, unknown>) => void
  onError?: (error: Error) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
}

export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (options?: Partial<UseApiOptions>) => Promise<T | null>
  refetch: () => Promise<T | null>
  reset: () => void
}

/**
 * Custom hook for API calls with loading states and error handling
 */
export function useApi<T = any>(url: string, options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (overrideOptions: Partial<UseApiOptions> = {}): Promise<T | null> => {
      const finalOptions = { ...options, ...overrideOptions }
      const {
        method = 'GET',
        body,
        headers = {},
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
      } = finalOptions

      setLoading(true)
      setError(null)

      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }

        if (body && method !== 'GET') {
          fetchOptions.body = JSON.stringify(body)
        }

        const response = await fetch(url, fetchOptions)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const responseData = await response.json()
        setData(responseData)

        if (onSuccess) {
          onSuccess(responseData)
        }

        if (showSuccessToast) {
          toast.success(successMessage || 'Operation completed successfully')
        }

        return responseData
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error('An unexpected error occurred')
        setError(errorObject)

        if (onError) {
          onError(errorObject)
        }

        if (showErrorToast) {
          toast.error(errorObject.message)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [url, options]
  )

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  }
}

/**
 * Hook for API calls that execute immediately on mount
 */
export function useApiQuery<T = any>(url: string, options: UseApiOptions = {}): UseApiReturn<T> {
  const apiResult = useApi<T>(url, options)

  useEffect(() => {
    apiResult.execute()
  }, [url]) // Only re-run if URL changes

  return apiResult
}

/**
 * Hook for mutation API calls (POST, PUT, DELETE)
 */
export function useApiMutation<TRequest = any, TResponse = any>(
  url: string,
  options: UseApiOptions = {}
): {
  mutate: (data: TRequest, overrideOptions?: Partial<UseApiOptions>) => Promise<TResponse | null>
  loading: boolean
  error: Error | null
  reset: () => void
} {
  const { execute, loading, error, reset } = useApi<TResponse>(url, options)

  const mutate = useCallback(
    (data: TRequest, overrideOptions: Partial<UseApiOptions> = {}) => {
      return execute({
        method: 'POST',
        body: data,
        ...overrideOptions,
      })
    },
    [execute]
  )

  return { mutate, loading, error, reset }
}

/**
 * Hook for form submissions
 */
export function useFormSubmission<T = any>(
  url: string,
  options: {
    method?: 'POST' | 'PUT'
    onSuccess?: (data: Record<string, unknown>) => void
    successMessage?: string
    redirectTo?: string
  } = {}
) {
  const { method = 'POST', onSuccess, successMessage, redirectTo } = options

  return useApiMutation<T>(url, {
    method,
    showSuccessToast: true,
    successMessage: successMessage || `${method === 'POST' ? 'Created' : 'Updated'} successfully`,
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data)
      }
      if (redirectTo) {
        window.location.href = redirectTo
      }
    },
  })
}

/**
 * Hook for delete operations
 */
export function useDelete(
  baseUrl: string,
  options: {
    onSuccess?: () => void
    confirmMessage?: string
  } = {}
) {
  const { onSuccess, confirmMessage = 'Are you sure you want to delete this item?' } = options

  const { mutate, loading, error } = useApiMutation(`${baseUrl}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Deleted successfully',
    onSuccess,
  })

  const deleteItem = useCallback(
    (id: string) => {
      if (window.confirm(confirmMessage)) {
        return mutate(null, { method: 'DELETE' })
      }
      return Promise.resolve(null)
    },
    [mutate, confirmMessage]
  )

  return { deleteItem, loading, error }
}
