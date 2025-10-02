/**
 * ModuleLoadingSystem.ts
 * Ultra-independent loading state management for product modules
 * Each module manages its own loading states without dependencies on others
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ModuleType } from '../types/StandardModuleTypes'

// =============================================================================
// LOADING STATE TYPES
// =============================================================================

/**
 * Different types of loading operations each module can perform
 */
export enum ModuleLoadingType {
  // Data loading
  INITIAL_LOAD = 'initial_load',           // Loading initial configuration data
  DATA_REFRESH = 'data_refresh',           // Refreshing/reloading data
  VALIDATION = 'validation',               // Processing validation

  // Calculations
  PRICE_CALCULATION = 'price_calculation', // Calculating pricing
  COMPATIBILITY_CHECK = 'compatibility_check', // Checking compatibility rules

  // Network operations
  API_REQUEST = 'api_request',            // Generic API calls
  SAVE = 'save',                          // Saving configuration

  // File operations (for image module)
  FILE_UPLOAD = 'file_upload',            // Uploading files
  FILE_PROCESSING = 'file_processing',    // Processing uploaded files

  // User interactions
  USER_INPUT_PROCESSING = 'user_input_processing', // Processing user input
  RECOVERY = 'recovery'                   // Recovery operations
}

/**
 * Loading operation priorities for UI feedback
 */
export enum ModuleLoadingPriority {
  LOW = 'low',           // Background operations
  NORMAL = 'normal',     // Standard operations
  HIGH = 'high',         // Important operations that should show progress
  CRITICAL = 'critical'  // Blocking operations that must complete
}

/**
 * Comprehensive loading state for each operation
 */
export interface ModuleLoadingOperation {
  id: string                            // Unique operation identifier
  type: ModuleLoadingType              // Type of loading operation
  priority: ModuleLoadingPriority      // Priority level
  startTime: Date                      // When operation started
  label: string                        // Human-readable description
  progress?: number                    // Progress percentage (0-100)
  estimatedDuration?: number           // Estimated duration in ms
  context?: any                        // Additional context data
  metadata?: Record<string, any>       // Extra metadata
}

/**
 * Module loading state summary
 */
export interface ModuleLoadingState {
  // Current operations
  operations: Map<string, ModuleLoadingOperation>

  // State flags
  isLoading: boolean                   // Any operations running
  hasHighPriorityLoading: boolean      // High/critical operations running
  hasCriticalLoading: boolean          // Critical operations running

  // Progress information
  overallProgress?: number             // Combined progress of all operations
  estimatedTimeRemaining?: number      // Estimated time for all operations

  // Operation counts
  totalOperations: number
  completedOperations: number
  failedOperations: number
}

// =============================================================================
// LOADING STATE MANAGEMENT
// =============================================================================

/**
 * Independent loading state manager for each module
 */
export class ModuleLoadingManager {
  private operations: Map<string, ModuleLoadingOperation> = new Map()
  private readonly moduleType: ModuleType
  private listeners: Set<() => void> = new Set()

  constructor(moduleType: ModuleType) {
    this.moduleType = moduleType
  }

  /**
   * Start a new loading operation
   */
  startOperation(
    type: ModuleLoadingType,
    label: string,
    priority: ModuleLoadingPriority = ModuleLoadingPriority.NORMAL,
    estimatedDuration?: number,
    context?: any
  ): string {
    const id = `${this.moduleType}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const operation: ModuleLoadingOperation = {
      id,
      type,
      priority,
      startTime: new Date(),
      label,
      progress: 0,
      estimatedDuration,
      context,
      metadata: {
        moduleType: this.moduleType
      }
    }

    this.operations.set(id, operation)
    this.notifyListeners()
    return id
  }

  /**
   * Update progress for an operation
   */
  updateProgress(operationId: string, progress: number, context?: any): boolean {
    const operation = this.operations.get(operationId)
    if (!operation) return false

    operation.progress = Math.max(0, Math.min(100, progress))
    if (context) {
      operation.context = { ...operation.context, ...context }
    }

    this.notifyListeners()
    return true
  }

  /**
   * Complete an operation
   */
  completeOperation(operationId: string, context?: any): boolean {
    const operation = this.operations.get(operationId)
    if (!operation) return false

    operation.progress = 100
    if (context) {
      operation.context = { ...operation.context, ...context }
    }

    // Remove after a short delay to allow UI to show completion
    setTimeout(() => {
      this.operations.delete(operationId)
      this.notifyListeners()
    }, 500)

    this.notifyListeners()
    return true
  }

  /**
   * Cancel/fail an operation
   */
  failOperation(operationId: string, reason?: string): boolean {
    const operation = this.operations.get(operationId)
    if (!operation) return false

    operation.context = {
      ...operation.context,
      failed: true,
      failureReason: reason
    }

    // Remove after a delay
    setTimeout(() => {
      this.operations.delete(operationId)
      this.notifyListeners()
    }, 1000)

    this.notifyListeners()
    return true
  }

  /**
   * Clear all operations
   */
  clearAll(): void {
    this.operations.clear()
    this.notifyListeners()
  }

  /**
   * Clear operations of specific type
   */
  clearByType(type: ModuleLoadingType): void {
    for (const [id, operation] of this.operations.entries()) {
      if (operation.type === type) {
        this.operations.delete(id)
      }
    }
    this.notifyListeners()
  }

  /**
   * Get current loading state
   */
  getState(): ModuleLoadingState {
    const operations = Array.from(this.operations.values())

    const isLoading = operations.length > 0
    const hasHighPriorityLoading = operations.some(op =>
      op.priority === ModuleLoadingPriority.HIGH ||
      op.priority === ModuleLoadingPriority.CRITICAL
    )
    const hasCriticalLoading = operations.some(op =>
      op.priority === ModuleLoadingPriority.CRITICAL
    )

    // Calculate overall progress
    let overallProgress: number | undefined
    if (operations.length > 0) {
      const totalProgress = operations.reduce((sum, op) => sum + (op.progress || 0), 0)
      overallProgress = totalProgress / operations.length
    }

    // Estimate time remaining
    let estimatedTimeRemaining: number | undefined
    if (operations.length > 0) {
      const now = new Date().getTime()
      const estimates = operations
        .map(op => {
          if (!op.estimatedDuration || !op.progress) return null

          const elapsed = now - op.startTime.getTime()
          const progressRatio = op.progress / 100

          if (progressRatio <= 0) return op.estimatedDuration

          const totalEstimated = elapsed / progressRatio
          return totalEstimated - elapsed
        })
        .filter(Boolean) as number[]

      if (estimates.length > 0) {
        estimatedTimeRemaining = Math.max(...estimates)
      }
    }

    return {
      operations: new Map(this.operations),
      isLoading,
      hasHighPriorityLoading,
      hasCriticalLoading,
      overallProgress,
      estimatedTimeRemaining,
      totalOperations: operations.length,
      completedOperations: 0, // Completed operations are removed
      failedOperations: operations.filter(op => op.context?.failed).length
    }
  }

  /**
   * Get operations by type
   */
  getOperationsByType(type: ModuleLoadingType): ModuleLoadingOperation[] {
    return Array.from(this.operations.values()).filter(op => op.type === type)
  }

  /**
   * Get operations by priority
   */
  getOperationsByPriority(priority: ModuleLoadingPriority): ModuleLoadingOperation[] {
    return Array.from(this.operations.values()).filter(op => op.priority === priority)
  }

  /**
   * Check if specific operation type is running
   */
  isOperationRunning(type: ModuleLoadingType): boolean {
    return this.getOperationsByType(type).length > 0
  }

  /**
   * Add change listener
   */
  addListener(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback())
  }
}

// =============================================================================
// REACT HOOK FOR MODULE LOADING
// =============================================================================

export interface UseModuleLoadingOptions {
  moduleType: ModuleType
  autoCleanup?: boolean          // Auto-cleanup completed operations
  maxOperations?: number         // Max concurrent operations
  onLoadingChange?: (isLoading: boolean, state: ModuleLoadingState) => void
  onOperationComplete?: (operation: ModuleLoadingOperation) => void
  onOperationFail?: (operation: ModuleLoadingOperation, reason?: string) => void
}

/**
 * Ultra-independent React hook for module loading state
 */
export function useModuleLoading(options: UseModuleLoadingOptions) {
  const {
    moduleType,
    autoCleanup = true,
    maxOperations = 10,
    onLoadingChange,
    onOperationComplete,
    onOperationFail
  } = options

  // Create manager instance (stable across re-renders)
  const [manager] = useState(() => new ModuleLoadingManager(moduleType))

  // Loading state
  const [loadingState, setLoadingState] = useState<ModuleLoadingState>(manager.getState())

  // Force update trigger
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const forceUpdate = useCallback(() => setUpdateTrigger(prev => prev + 1), [])

  // Cleanup timer ref
  const cleanupTimer = useRef<NodeJS.Timeout>()

  // Update loading state when manager changes
  const updateLoadingState = useCallback(() => {
    const newState = manager.getState()
    setLoadingState(newState)
    onLoadingChange?.(newState.isLoading, newState)
  }, [manager, onLoadingChange])

  // Subscribe to manager changes
  useEffect(() => {
    const unsubscribe = manager.addListener(updateLoadingState)
    return unsubscribe
  }, [manager, updateLoadingState])

  // Auto-cleanup logic
  useEffect(() => {
    if (!autoCleanup) return

    if (cleanupTimer.current) {
      clearTimeout(cleanupTimer.current)
    }

    cleanupTimer.current = setTimeout(() => {
      // Clean up old completed operations
      const state = manager.getState()
      if (state.totalOperations > maxOperations) {
        // This would be implemented by the manager
        // For now, just ensure we don't accumulate too many
      }
    }, 5000)

    return () => {
      if (cleanupTimer.current) {
        clearTimeout(cleanupTimer.current)
      }
    }
  }, [manager, autoCleanup, maxOperations, updateTrigger])

  // Start loading operation
  const startLoading = useCallback((
    type: ModuleLoadingType,
    label: string,
    priority: ModuleLoadingPriority = ModuleLoadingPriority.NORMAL,
    estimatedDuration?: number,
    context?: any
  ): string => {
    return manager.startOperation(type, label, priority, estimatedDuration, context)
  }, [manager])

  // Update progress
  const updateProgress = useCallback((
    operationId: string,
    progress: number,
    context?: any
  ): boolean => {
    return manager.updateProgress(operationId, progress, context)
  }, [manager])

  // Complete operation
  const completeLoading = useCallback((
    operationId: string,
    context?: any
  ): boolean => {
    const success = manager.completeOperation(operationId, context)
    if (success) {
      // Find operation for callback
      const operation = Array.from(manager.getState().operations.values()).find(op => op.id === operationId)
      if (operation) {
        onOperationComplete?.(operation)
      }
    }
    return success
  }, [manager, onOperationComplete])

  // Fail operation
  const failLoading = useCallback((
    operationId: string,
    reason?: string
  ): boolean => {
    const success = manager.failOperation(operationId, reason)
    if (success) {
      // Find operation for callback
      const operation = Array.from(manager.getState().operations.values()).find(op => op.id === operationId)
      if (operation) {
        onOperationFail?.(operation, reason)
      }
    }
    return success
  }, [manager, onOperationFail])

  // Clear all loading
  const clearLoading = useCallback(() => {
    manager.clearAll()
  }, [manager])

  // Clear by type
  const clearLoadingByType = useCallback((type: ModuleLoadingType) => {
    manager.clearByType(type)
  }, [manager])

  // Convenience methods for common operations
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    type: ModuleLoadingType,
    label: string,
    priority: ModuleLoadingPriority = ModuleLoadingPriority.NORMAL
  ): Promise<T> => {
    const operationId = startLoading(type, label, priority)

    try {
      const result = await operation()
      completeLoading(operationId)
      return result
    } catch (error) {
      failLoading(operationId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }, [startLoading, completeLoading, failLoading])

  // Check specific loading states
  const isLoadingType = useCallback((type: ModuleLoadingType): boolean => {
    return manager.isOperationRunning(type)
  }, [manager, updateTrigger]) // Include updateTrigger to force re-computation

  return {
    // Loading state
    loadingState,
    isLoading: loadingState.isLoading,
    hasHighPriorityLoading: loadingState.hasHighPriorityLoading,
    hasCriticalLoading: loadingState.hasCriticalLoading,
    overallProgress: loadingState.overallProgress,

    // Operation management
    startLoading,
    updateProgress,
    completeLoading,
    failLoading,
    clearLoading,
    clearLoadingByType,

    // Convenience methods
    withLoading,
    isLoadingType,

    // Specific loading checks
    isInitialLoading: isLoadingType(ModuleLoadingType.INITIAL_LOAD),
    isValidating: isLoadingType(ModuleLoadingType.VALIDATION),
    isCalculating: isLoadingType(ModuleLoadingType.PRICE_CALCULATION),
    isSaving: isLoadingType(ModuleLoadingType.SAVE),
    isUploading: isLoadingType(ModuleLoadingType.FILE_UPLOAD),

    // Advanced state
    getOperationsByType: useCallback((type: ModuleLoadingType) => manager.getOperationsByType(type), [manager, updateTrigger]),
    getOperationsByPriority: useCallback((priority: ModuleLoadingPriority) => manager.getOperationsByPriority(priority), [manager, updateTrigger])
  }
}

// =============================================================================
// LOADING COMPOSITION UTILITIES
// =============================================================================

/**
 * Combine loading states from multiple modules
 */
export function combineModuleLoadingStates(states: ModuleLoadingState[]): ModuleLoadingState {
  const allOperations = new Map<string, ModuleLoadingOperation>()

  states.forEach(state => {
    state.operations.forEach((operation, id) => {
      allOperations.set(id, operation)
    })
  })

  const operations = Array.from(allOperations.values())

  const isLoading = operations.length > 0
  const hasHighPriorityLoading = operations.some(op =>
    op.priority === ModuleLoadingPriority.HIGH ||
    op.priority === ModuleLoadingPriority.CRITICAL
  )
  const hasCriticalLoading = operations.some(op =>
    op.priority === ModuleLoadingPriority.CRITICAL
  )

  // Calculate combined progress
  let overallProgress: number | undefined
  if (operations.length > 0) {
    const totalProgress = operations.reduce((sum, op) => sum + (op.progress || 0), 0)
    overallProgress = totalProgress / operations.length
  }

  return {
    operations: allOperations,
    isLoading,
    hasHighPriorityLoading,
    hasCriticalLoading,
    overallProgress,
    totalOperations: operations.length,
    completedOperations: 0,
    failedOperations: operations.filter(op => op.context?.failed).length
  }
}

/**
 * Create disabled state based on loading and error conditions
 */
export function createModuleDisabledState(
  loadingState: ModuleLoadingState,
  hasBlockingErrors: boolean,
  forcedDisabled: boolean = false
): {
  isDisabled: boolean
  disabledReason: string
  canInteract: boolean
} {
  if (forcedDisabled) {
    return {
      isDisabled: true,
      disabledReason: 'Module is disabled',
      canInteract: false
    }
  }

  if (hasBlockingErrors) {
    return {
      isDisabled: true,
      disabledReason: 'Please fix errors first',
      canInteract: false
    }
  }

  if (loadingState.hasCriticalLoading) {
    return {
      isDisabled: true,
      disabledReason: 'Processing...',
      canInteract: false
    }
  }

  if (loadingState.hasHighPriorityLoading) {
    return {
      isDisabled: false,
      disabledReason: 'Loading...',
      canInteract: true // Can interact but with loading feedback
    }
  }

  return {
    isDisabled: false,
    disabledReason: '',
    canInteract: true
  }
}