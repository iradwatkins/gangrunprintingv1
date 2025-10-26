/**
 * Error System Index
 * Complete ultra-independent error handling system for product modules
 */

// Import for local utility use
import {
  ModuleErrorType,
  ModuleErrorSeverity,
  type IndependentModuleError,
} from './ModuleErrorSystem'

// Core error system
export {
  ModuleErrorFactory,
  ModuleErrorState,
  ModuleErrorRecovery,
  useModuleErrors,
  ModuleErrorType, // Enum - needs value export
  ModuleErrorSeverity, // Enum - needs value export
} from './ModuleErrorSystem'

export type {
  IndependentModuleError,
  ModuleErrorRecoveryAction,
  UseModuleErrorsOptions,
} from './ModuleErrorSystem'

// Error display components
export {
  ModuleErrorDisplay,
  ModuleErrorList,
  ModuleErrorIndicator,
  ModuleFieldError,
  ModuleSuccessIndicator,
  ModuleErrorBoundary,
} from './ModuleErrorComponents'

export type {
  ModuleErrorDisplayProps,
  ModuleErrorListProps,
  ModuleErrorIndicatorProps,
  ModuleFieldErrorProps,
  ModuleSuccessIndicatorProps,
  ModuleErrorBoundaryProps,
} from './ModuleErrorComponents'

// Utility functions
export const ErrorUtils = {
  /**
   * Check if any errors are blocking
   */
  hasBlockingErrors: (errors: IndependentModuleError[]): boolean => {
    return errors.some(
      (error) =>
        error.severity === ModuleErrorSeverity.ERROR ||
        error.severity === ModuleErrorSeverity.CRITICAL
    )
  },

  /**
   * Filter errors by severity
   */
  filterBySeverity: (
    errors: IndependentModuleError[],
    severity: ModuleErrorSeverity
  ): IndependentModuleError[] => {
    return errors.filter((error) => error.severity === severity)
  },

  /**
   * Filter errors by field
   */
  filterByField: (errors: IndependentModuleError[], field: string): IndependentModuleError[] => {
    return errors.filter((error) => error.field === field)
  },

  /**
   * Get most severe error level from a list
   */
  getMaxSeverity: (errors: IndependentModuleError[]): ModuleErrorSeverity | null => {
    if (errors.length === 0) return null

    const severityLevels = [
      ModuleErrorSeverity.INFO,
      ModuleErrorSeverity.WARNING,
      ModuleErrorSeverity.ERROR,
      ModuleErrorSeverity.CRITICAL,
    ]

    return errors.reduce((maxSeverity, error) => {
      const currentIndex = severityLevels.indexOf(error.severity)
      const maxIndex = severityLevels.indexOf(maxSeverity)
      return currentIndex > maxIndex ? error.severity : maxSeverity
    }, ModuleErrorSeverity.INFO)
  },

  /**
   * Group errors by field
   */
  groupByField: (errors: IndependentModuleError[]): Record<string, IndependentModuleError[]> => {
    return errors.reduce(
      (groups, error) => {
        const key = error.field || 'general'
        if (!groups[key]) groups[key] = []
        groups[key].push(error)
        return groups
      },
      {} as Record<string, IndependentModuleError[]>
    )
  },

  /**
   * Create error summary
   */
  createSummary: (errors: IndependentModuleError[]) => {
    const byType: Record<ModuleErrorType, number> = {} as any
    const bySeverity: Record<ModuleErrorSeverity, number> = {} as any

    errors.forEach((error) => {
      byType[error.errorType] = (byType[error.errorType] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })

    return {
      total: errors.length,
      byType,
      bySeverity,
      hasBlocking: ErrorUtils.hasBlockingErrors(errors),
      maxSeverity: ErrorUtils.getMaxSeverity(errors),
    }
  },
}
