import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface LoadingState {
  id: string
  label?: string
  progress?: number // 0-100 for progress bars
  type: 'spinner' | 'progress' | 'skeleton'
  blocking?: boolean // Whether it should block user interaction
  context?: string // Context identifier (e.g., 'product-config', 'cart', etc.)
}

interface LoadingStoreState {
  loadingStates: LoadingState[]
  globalLoading: boolean
}

interface LoadingActions {
  startLoading: (options: Omit<LoadingState, 'id'>) => string
  stopLoading: (id: string) => void
  updateProgress: (id: string, progress: number) => void
  updateLabel: (id: string, label: string) => void
  clearAllLoading: () => void
  setGlobalLoading: (loading: boolean) => void
  isLoading: (context?: string) => boolean
  getLoadingState: (context: string) => LoadingState | undefined
}

type LoadingStore = LoadingStoreState & LoadingActions

export const useLoadingStore = create<LoadingStore>()(
  devtools(
    (set, get) => ({
      // State
      loadingStates: [],
      globalLoading: false,

      // Actions
      startLoading: (options) => {
        const id = `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const loadingState: LoadingState = {
          ...options,
          id,
          blocking: options.blocking ?? false,
          type: options.type ?? 'spinner',
        }

        set(
          (state) => ({
            loadingStates: [...state.loadingStates, loadingState],
          }),
          false,
          'startLoading'
        )

        return id
      },

      stopLoading: (id) =>
        set(
          (state) => ({
            loadingStates: state.loadingStates.filter((loading) => loading.id !== id),
          }),
          false,
          'stopLoading'
        ),

      updateProgress: (id, progress) =>
        set(
          (state) => ({
            loadingStates: state.loadingStates.map((loading) =>
              loading.id === id
                ? { ...loading, progress: Math.max(0, Math.min(100, progress)) }
                : loading
            ),
          }),
          false,
          'updateProgress'
        ),

      updateLabel: (id, label) =>
        set(
          (state) => ({
            loadingStates: state.loadingStates.map((loading) =>
              loading.id === id ? { ...loading, label } : loading
            ),
          }),
          false,
          'updateLabel'
        ),

      clearAllLoading: () =>
        set(
          {
            loadingStates: [],
            globalLoading: false,
          },
          false,
          'clearAllLoading'
        ),

      setGlobalLoading: (loading) =>
        set(
          {
            globalLoading: loading,
          },
          false,
          'setGlobalLoading'
        ),

      isLoading: (context) => {
        const state = get()
        if (state.globalLoading) return true
        if (!context) return state.loadingStates.length > 0
        return state.loadingStates.some((loading) => loading.context === context)
      },

      getLoadingState: (context) => {
        const state = get()
        return state.loadingStates.find((loading) => loading.context === context)
      },
    }),
    {
      name: 'loading-store',
    }
  )
)

// Helper functions for common loading patterns
export const loadingHelpers = {
  // API request loading
  apiRequest: (label: string, context?: string): Omit<LoadingState, 'id'> => ({
    label,
    type: 'spinner',
    blocking: false,
    context,
  }),

  // File upload with progress
  fileUpload: (label: string = 'Uploading files...'): Omit<LoadingState, 'id'> => ({
    label,
    type: 'progress',
    progress: 0,
    blocking: true,
    context: 'file-upload',
  }),

  // Page loading with skeleton
  pageLoading: (context: string): Omit<LoadingState, 'id'> => ({
    label: 'Loading...',
    type: 'skeleton',
    blocking: false,
    context,
  }),

  // Form submission
  formSubmission: (label: string = 'Submitting...'): Omit<LoadingState, 'id'> => ({
    label,
    type: 'spinner',
    blocking: true,
    context: 'form-submission',
  }),

  // Data fetching
  dataFetching: (label: string, context: string): Omit<LoadingState, 'id'> => ({
    label,
    type: 'spinner',
    blocking: false,
    context,
  }),
}

// Custom hook for easier loading management
export const useLoadingManager = () => {
  const {
    startLoading,
    stopLoading,
    updateProgress,
    updateLabel,
    isLoading,
    getLoadingState,
    clearAllLoading,
  } = useLoadingStore()

  // Higher-order function to wrap async operations with loading
  const withLoading = async <T>(
    operation: () => Promise<T>,
    loadingOptions: Omit<LoadingState, 'id'>,
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const loadingId = startLoading(loadingOptions)

    try {
      if (onProgress && loadingOptions.type === 'progress') {
        // Simulate progress updates if callback is provided
        const progressInterval = setInterval(() => {
          const currentState = getLoadingState(loadingOptions.context || '')
          const currentProgress = currentState?.progress || 0
          if (currentProgress < 90) {
            const newProgress = currentProgress + Math.random() * 10
            updateProgress(loadingId, newProgress)
            onProgress(newProgress)
          }
        }, 200)

        const result = await operation()
        clearInterval(progressInterval)
        updateProgress(loadingId, 100)

        // Brief delay to show completion
        setTimeout(() => stopLoading(loadingId), 300)

        return result
      } else {
        const result = await operation()
        stopLoading(loadingId)
        return result
      }
    } catch (error) {
      stopLoading(loadingId)
      throw error
    }
  }

  const startApiLoading = (label: string, context?: string) => {
    return startLoading(loadingHelpers.apiRequest(label, context))
  }

  const startFileUpload = (label?: string) => {
    return startLoading(loadingHelpers.fileUpload(label))
  }

  const startFormSubmission = (label?: string) => {
    return startLoading(loadingHelpers.formSubmission(label))
  }

  return {
    startLoading,
    stopLoading,
    updateProgress,
    updateLabel,
    isLoading,
    getLoadingState,
    clearAllLoading,
    withLoading,
    startApiLoading,
    startFileUpload,
    startFormSubmission,
  }
}
