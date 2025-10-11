/**
 * Loading System Index
 * Complete ultra-independent loading state management for product modules
 */

// Core loading system
export {
  ModuleLoadingType,
  ModuleLoadingPriority,
  ModuleLoadingOperation,
  ModuleLoadingState,
  ModuleLoadingManager,
  useModuleLoading,
  UseModuleLoadingOptions,
  combineModuleLoadingStates,
  createModuleDisabledState,
} from './ModuleLoadingSystem'

// Loading display components
export {
  ModuleLoadingSpinner,
  ModuleLoadingProgress,
  ModuleLoadingDisplay,
  ModuleLoadingIndicator,
  ModuleLoadingSkeleton,
  ModuleLoadingSuccess,
  ModuleLoadingBoundary,
  ModuleLoadingSpinnerProps,
  ModuleLoadingProgressProps,
  ModuleLoadingDisplayProps,
  ModuleLoadingIndicatorProps,
  ModuleLoadingSkeletonProps,
  ModuleLoadingSuccessProps,
  ModuleLoadingBoundaryProps,
} from './ModuleLoadingComponents'

// Utility functions
export const LoadingUtils = {
  /**
   * Check if any operations are high/critical priority
   */
  hasHighPriorityLoading: (state: ModuleLoadingState): boolean => {
    return state.hasHighPriorityLoading
  },

  /**
   * Get operations by type
   */
  getOperationsByType: (
    state: ModuleLoadingState,
    type: ModuleLoadingType
  ): ModuleLoadingOperation[] => {
    return Array.from(state.operations.values()).filter((op) => op.type === type)
  },

  /**
   * Calculate total estimated time for all operations
   */
  getTotalEstimatedTime: (state: ModuleLoadingState): number | null => {
    const operations = Array.from(state.operations.values())
    const estimates = operations.map((op) => op.estimatedDuration).filter(Boolean) as number[]

    return estimates.length > 0 ? Math.max(...estimates) : null
  },

  /**
   * Format loading duration for display
   */
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  },

  /**
   * Create loading state summary
   */
  createLoadingSummary: (state: ModuleLoadingState) => ({
    isLoading: state.isLoading,
    operationCount: state.totalOperations,
    progress: state.overallProgress,
    hasBlocking: state.hasCriticalLoading,
    timeRemaining: state.estimatedTimeRemaining,
  }),
}
