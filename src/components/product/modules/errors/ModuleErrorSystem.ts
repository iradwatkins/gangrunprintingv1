/**
 * ModuleErrorSystem.ts
 * Ultra-independent error handling system for product modules
 * Each module manages its own errors without dependencies on others
 */

import { type ModuleError, type ModuleType } from '../types/StandardModuleTypes'

// =============================================================================
// ERROR CLASSIFICATION SYSTEM
// =============================================================================

/**
 * Comprehensive error type classification
 * Each module can have these error types independently
 */
export enum ModuleErrorType {
  // Input validation errors
  REQUIRED_FIELD_MISSING = 'required_field_missing',
  INVALID_VALUE = 'invalid_value',
  VALUE_OUT_OF_RANGE = 'value_out_of_range',
  INVALID_FORMAT = 'invalid_format',

  // Data/configuration errors
  MISSING_DATA = 'missing_data',
  INVALID_CONFIGURATION = 'invalid_configuration',
  INCOMPATIBLE_SELECTION = 'incompatible_selection',

  // Network/API errors
  NETWORK_ERROR = 'network_error',
  API_ERROR = 'api_error',
  TIMEOUT = 'timeout',

  // Processing errors
  CALCULATION_ERROR = 'calculation_error',
  PARSING_ERROR = 'parsing_error',
  TRANSFORMATION_ERROR = 'transformation_error',

  // File/upload errors (for image module)
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_FILE_TYPE = 'invalid_file_type',
  UPLOAD_FAILED = 'upload_failed',

  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  CONSTRAINT_VIOLATION = 'constraint_violation',

  // Unknown/system errors
  UNKNOWN_ERROR = 'unknown_error',
  SYSTEM_ERROR = 'system_error',
}

/**
 * Error severity levels for prioritizing error handling
 */
export enum ModuleErrorSeverity {
  INFO = 'info', // Informational, doesn't prevent function
  WARNING = 'warning', // Warning, but module can still function
  ERROR = 'error', // Error, prevents module function
  CRITICAL = 'critical', // Critical, may affect other modules
}

/**
 * Enhanced module error interface with full independence
 */
export interface IndependentModuleError extends ModuleError {
  // Core error properties
  id: string // Unique error identifier
  moduleType: ModuleType // Which module generated this error
  errorType: ModuleErrorType // Classification of error
  severity: ModuleErrorSeverity // How severe the error is
  timestamp: Date // When error occurred

  // Error details
  field?: string // Specific field that has error
  value?: any // Value that caused error
  constraint?: {
    // Constraint that was violated
    min?: number
    max?: number
    pattern?: string
    allowed?: any[]
  }

  // Recovery information
  canRecover: boolean // Whether error is recoverable
  recoveryActions?: string[] // Suggested recovery actions
  retryable: boolean // Whether operation can be retried

  // User guidance
  userMessage: string // User-friendly error message
  technicalDetails?: string // Technical details for debugging
  helpUrl?: string // Link to help documentation

  // Context (completely independent)
  moduleState?: any // Module's state when error occurred
  userInput?: any // User input that caused error
  metadata?: Record<string, any> // Additional context data
}

// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================

/**
 * Create standardized module errors with consistent patterns
 */
export class ModuleErrorFactory {
  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create a validation error for invalid user input
   */
  static createValidationError(
    moduleType: ModuleType,
    field: string,
    value: any,
    constraint?: IndependentModuleError['constraint'],
    userMessage?: string
  ): IndependentModuleError {
    return {
      id: this.generateErrorId(),
      moduleType,
      errorType: ModuleErrorType.INVALID_VALUE,
      severity: ModuleErrorSeverity.ERROR,
      timestamp: new Date(),
      field,
      value,
      constraint,
      canRecover: true,
      retryable: true,
      message: userMessage || `Invalid value for ${field}`,
      userMessage: userMessage || `Please check the value for ${field}`,
      type: 'validation',
    }
  }

  /**
   * Create a required field error
   */
  static createRequiredFieldError(moduleType: ModuleType, field: string): IndependentModuleError {
    return {
      id: this.generateErrorId(),
      moduleType,
      errorType: ModuleErrorType.REQUIRED_FIELD_MISSING,
      severity: ModuleErrorSeverity.ERROR,
      timestamp: new Date(),
      field,
      canRecover: true,
      retryable: true,
      message: `${field} is required`,
      userMessage: `Please select a ${field.toLowerCase()}`,
      type: 'validation',
    }
  }

  /**
   * Create a range validation error
   */
  static createRangeError(
    moduleType: ModuleType,
    field: string,
    value: number,
    min: number,
    max: number
  ): IndependentModuleError {
    return {
      id: this.generateErrorId(),
      moduleType,
      errorType: ModuleErrorType.VALUE_OUT_OF_RANGE,
      severity: ModuleErrorSeverity.ERROR,
      timestamp: new Date(),
      field,
      value,
      constraint: { min, max },
      canRecover: true,
      retryable: true,
      message: `${field} must be between ${min} and ${max}`,
      userMessage: `${field} must be between ${min.toLocaleString()} and ${max.toLocaleString()}`,
      type: 'validation',
    }
  }

  /**
   * Create a network/API error
   */
  static createNetworkError(
    moduleType: ModuleType,
    operation: string,
    originalError?: Error
  ): IndependentModuleError {
    return {
      id: this.generateErrorId(),
      moduleType,
      errorType: ModuleErrorType.NETWORK_ERROR,
      severity: ModuleErrorSeverity.WARNING,
      timestamp: new Date(),
      canRecover: true,
      retryable: true,
      message: `Network error during ${operation}`,
      userMessage: 'Connection problem. Please check your internet and try again.',
      technicalDetails: originalError?.message,
      recoveryActions: ['Check internet connection', 'Retry operation', 'Refresh page'],
      type: 'network',
    }
  }

  /**
   * Create a business rule violation error
   */
  static createBusinessRuleError(
    moduleType: ModuleType,
    rule: string,
    userMessage: string,
    context?: any
  ): IndependentModuleError {
    return {
      id: this.generateErrorId(),
      moduleType,
      errorType: ModuleErrorType.BUSINESS_RULE_VIOLATION,
      severity: ModuleErrorSeverity.ERROR,
      timestamp: new Date(),
      canRecover: true,
      retryable: false,
      message: `Business rule violation: ${rule}`,
      userMessage,
      context,
      type: 'configuration',
    }
  }

  /**
   * Create a file upload error
   */
  static createFileError(
    moduleType: ModuleType,
    fileName: string,
    errorType:
      | ModuleErrorType.FILE_TOO_LARGE
      | ModuleErrorType.INVALID_FILE_TYPE
      | ModuleErrorType.UPLOAD_FAILED,
    details?: any
  ): IndependentModuleError {
    const errorMessages = {
      [ModuleErrorType.FILE_TOO_LARGE]: `File "${fileName}" is too large`,
      [ModuleErrorType.INVALID_FILE_TYPE]: `File "${fileName}" has an invalid type`,
      [ModuleErrorType.UPLOAD_FAILED]: `Failed to upload "${fileName}"`,
    }

    return {
      id: this.generateErrorId(),
      moduleType,
      errorType,
      severity: ModuleErrorSeverity.ERROR,
      timestamp: new Date(),
      field: 'file',
      value: fileName,
      canRecover: true,
      retryable: errorType === ModuleErrorType.UPLOAD_FAILED,
      message: errorMessages[errorType],
      userMessage: errorMessages[errorType],
      context: details,
      type: 'processing',
    }
  }
}

// =============================================================================
// MODULE ERROR STATE MANAGEMENT
// =============================================================================

/**
 * Independent error state manager for each module
 * Each module instance has its own error state
 */
export class ModuleErrorState {
  private errors: Map<string, IndependentModuleError> = new Map()
  private readonly moduleType: ModuleType

  constructor(moduleType: ModuleType) {
    this.moduleType = moduleType
  }

  /**
   * Add an error to this module's state
   */
  addError(error: IndependentModuleError): void {
    this.errors.set(error.id, error)
  }

  /**
   * Remove a specific error
   */
  removeError(errorId: string): void {
    this.errors.delete(errorId)
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear()
  }

  /**
   * Clear errors of a specific type
   */
  clearErrorsByType(errorType: ModuleErrorType): void {
    for (const [id, error] of this.errors.entries()) {
      if (error.errorType === errorType) {
        this.errors.delete(id)
      }
    }
  }

  /**
   * Clear errors for a specific field
   */
  clearErrorsByField(field: string): void {
    for (const [id, error] of this.errors.entries()) {
      if (error.field === field) {
        this.errors.delete(id)
      }
    }
  }

  /**
   * Get all current errors
   */
  getErrors(): IndependentModuleError[] {
    return Array.from(this.errors.values())
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ModuleErrorSeverity): IndependentModuleError[] {
    return this.getErrors().filter((error) => error.severity === severity)
  }

  /**
   * Get errors by type
   */
  getErrorsByType(errorType: ModuleErrorType): IndependentModuleError[] {
    return this.getErrors().filter((error) => error.errorType === errorType)
  }

  /**
   * Get errors for a specific field
   */
  getErrorsByField(field: string): IndependentModuleError[] {
    return this.getErrors().filter((error) => error.field === field)
  }

  /**
   * Check if module has any errors
   */
  hasErrors(): boolean {
    return this.errors.size > 0
  }

  /**
   * Check if module has critical errors
   */
  hasCriticalErrors(): boolean {
    return this.getErrorsBySeverity(ModuleErrorSeverity.CRITICAL).length > 0
  }

  /**
   * Check if module has blocking errors (error or critical)
   */
  hasBlockingErrors(): boolean {
    return this.getErrors().some(
      (error) =>
        error.severity === ModuleErrorSeverity.ERROR ||
        error.severity === ModuleErrorSeverity.CRITICAL
    )
  }

  /**
   * Get the most severe error level
   */
  getMaxSeverity(): ModuleErrorSeverity | null {
    const errors = this.getErrors()
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
  }

  /**
   * Get summary of error state
   */
  getErrorSummary(): {
    total: number
    byType: Record<ModuleErrorType, number>
    bySeverity: Record<ModuleErrorSeverity, number>
    hasBlocking: boolean
  } {
    const errors = this.getErrors()
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
      hasBlocking: this.hasBlockingErrors(),
    }
  }
}

// =============================================================================
// ERROR RECOVERY SYSTEM
// =============================================================================

/**
 * Recovery action interface
 */
export interface ModuleErrorRecoveryAction {
  id: string
  label: string
  description: string
  action: () => Promise<boolean> | boolean
  destructive?: boolean
  requiresConfirmation?: boolean
}

/**
 * Error recovery manager for independent error recovery
 */
export class ModuleErrorRecovery {
  private recoveryActions: Map<string, ModuleErrorRecoveryAction[]> = new Map()

  /**
   * Register recovery actions for specific error types
   */
  registerRecoveryActions(errorType: ModuleErrorType, actions: ModuleErrorRecoveryAction[]): void {
    this.recoveryActions.set(errorType, actions)
  }

  /**
   * Get recovery actions for an error
   */
  getRecoveryActions(error: IndependentModuleError): ModuleErrorRecoveryAction[] {
    return this.recoveryActions.get(error.errorType) || []
  }

  /**
   * Execute a recovery action
   */
  async executeRecoveryAction(actionId: string, error: IndependentModuleError): Promise<boolean> {
    const actions = this.getRecoveryActions(error)
    const action = actions.find((a) => a.id === actionId)

    if (!action) {
      console.warn(`Recovery action ${actionId} not found for error ${error.id}`)
      return false
    }

    try {
      return await action.action()
    } catch (recoveryError) {
      console.error(`Recovery action ${actionId} failed:`, recoveryError)
      return false
    }
  }
}

// =============================================================================
// ERROR BOUNDARY HOOK
// =============================================================================

/**
 * React hook for independent module error handling
 */
import { useState, useCallback, useMemo } from 'react'

export interface UseModuleErrorsOptions {
  moduleType: ModuleType
  onError?: (error: IndependentModuleError) => void
  onClear?: () => void
  autoRetry?: boolean
  maxRetries?: number
}

export function useModuleErrors(options: UseModuleErrorsOptions) {
  const { moduleType, onError, onClear, autoRetry = false, maxRetries = 3 } = options

  // Independent error state for this module
  const [errorState] = useState(() => new ModuleErrorState(moduleType))
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map())

  // Force re-render when errors change
  const [errorVersion, setErrorVersion] = useState(0)
  const forceUpdate = useCallback(() => setErrorVersion((v) => v + 1), [])

  /**
   * Add error with automatic retry logic
   */
  const addError = useCallback(
    (error: IndependentModuleError) => {
      errorState.addError(error)
      onError?.(error)

      // Auto-retry logic for retryable errors
      if (autoRetry && error.retryable) {
        const attempts = retryAttempts.get(error.id) || 0
        if (attempts < maxRetries) {
          setRetryAttempts((prev) => new Map(prev).set(error.id, attempts + 1))
          // Could implement actual retry logic here
        }
      }

      forceUpdate()
    },
    [errorState, onError, autoRetry, maxRetries, retryAttempts, forceUpdate]
  )

  /**
   * Remove specific error
   */
  const removeError = useCallback(
    (errorId: string) => {
      errorState.removeError(errorId)
      setRetryAttempts((prev) => {
        const next = new Map(prev)
        next.delete(errorId)
        return next
      })
      forceUpdate()
    },
    [errorState, forceUpdate]
  )

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    errorState.clearErrors()
    setRetryAttempts(new Map())
    onClear?.()
    forceUpdate()
  }, [errorState, onClear, forceUpdate])

  /**
   * Clear errors by type
   */
  const clearErrorsByType = useCallback(
    (errorType: ModuleErrorType) => {
      errorState.clearErrorsByType(errorType)
      forceUpdate()
    },
    [errorState, forceUpdate]
  )

  /**
   * Clear errors by field
   */
  const clearErrorsByField = useCallback(
    (field: string) => {
      errorState.clearErrorsByField(field)
      forceUpdate()
    },
    [errorState, forceUpdate]
  )

  /**
   * Validate and add validation errors
   */
  const validate = useCallback(
    (
      field: string,
      value: any,
      validationRules: {
        required?: boolean
        min?: number
        max?: number
        pattern?: RegExp
        custom?: (value: any) => boolean | string
      }
    ): boolean => {
      // Clear existing errors for this field
      clearErrorsByField(field)

      let isValid = true

      // Required validation
      if (validationRules.required && (!value || value === '')) {
        addError(ModuleErrorFactory.createRequiredFieldError(moduleType, field))
        isValid = false
      }

      // Range validation for numbers
      if (
        typeof value === 'number' &&
        (validationRules.min !== undefined || validationRules.max !== undefined)
      ) {
        const min = validationRules.min ?? -Infinity
        const max = validationRules.max ?? Infinity

        if (value < min || value > max) {
          addError(ModuleErrorFactory.createRangeError(moduleType, field, value, min, max))
          isValid = false
        }
      }

      // Pattern validation
      if (
        validationRules.pattern &&
        typeof value === 'string' &&
        !validationRules.pattern.test(value)
      ) {
        addError(
          ModuleErrorFactory.createValidationError(
            moduleType,
            field,
            value,
            { pattern: validationRules.pattern.source },
            `${field} format is invalid`
          )
        )
        isValid = false
      }

      // Custom validation
      if (validationRules.custom) {
        const customResult = validationRules.custom(value)
        if (typeof customResult === 'string') {
          addError(
            ModuleErrorFactory.createValidationError(
              moduleType,
              field,
              value,
              undefined,
              customResult
            )
          )
          isValid = false
        } else if (!customResult) {
          addError(
            ModuleErrorFactory.createValidationError(
              moduleType,
              field,
              value,
              undefined,
              `${field} is invalid`
            )
          )
          isValid = false
        }
      }

      return isValid
    },
    [moduleType, addError, clearErrorsByField]
  )

  // Computed values that update when errors change
  const errors = useMemo(() => errorState.getErrors(), [errorState, errorVersion])
  const hasErrors = useMemo(() => errorState.hasErrors(), [errorState, errorVersion])
  const hasBlockingErrors = useMemo(
    () => errorState.hasBlockingErrors(),
    [errorState, errorVersion]
  )
  const errorSummary = useMemo(() => errorState.getErrorSummary(), [errorState, errorVersion])

  return {
    // Error state
    errors,
    hasErrors,
    hasBlockingErrors,
    errorSummary,

    // Error management
    addError,
    removeError,
    clearErrors,
    clearErrorsByType,
    clearErrorsByField,

    // Validation
    validate,

    // Utility functions
    getErrorsByField: useCallback(
      (field: string) => errorState.getErrorsByField(field),
      [errorState, errorVersion]
    ),
    getErrorsByType: useCallback(
      (type: ModuleErrorType) => errorState.getErrorsByType(type),
      [errorState, errorVersion]
    ),
    getErrorsBySeverity: useCallback(
      (severity: ModuleErrorSeverity) => errorState.getErrorsBySeverity(severity),
      [errorState, errorVersion]
    ),
  }
}
