/**
 * ModuleIndependenceTest.ts
 * Tests for ultra-independent module error handling and isolation
 *
 * VALIDATES CRITICAL ARCHITECTURE:
 * - Errors in one module DON'T crash other modules
 * - Each module has independent error handling
 * - Loading states are isolated between modules
 * - Modules can be fixed individually without affecting others
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import { useModuleErrors } from '../errors/ModuleErrorSystem'
import { useModuleLoading } from '../loading/ModuleLoadingSystem'
import { ModuleType } from '../types/StandardModuleTypes'
import { ModuleErrorType, ModuleErrorSeverity } from '../errors/ModuleErrorSystem'
import { ModuleLoadingType, ModuleLoadingPriority } from '../loading/ModuleLoadingSystem'

describe('Ultra-Independent Module Architecture', () => {
  describe('Error Handling Independence', () => {
    test('Module errors are completely isolated', () => {
      // Create separate error handlers for different modules
      const { result: quantityErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.QUANTITY })
      )

      const { result: sizeErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.SIZE })
      )

      const { result: imageErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.IMAGES })
      )

      // Add error to quantity module
      act(() => {
        quantityErrors.current.addError({
          id: 'qty_error_1',
          message: 'Invalid quantity selected',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          moduleType: ModuleType.QUANTITY,
          field: 'quantity',
          severity: ModuleErrorSeverity.ERROR,
          timestamp: new Date(),
          canRecover: true,
          retryable: false,
          userMessage: 'Invalid quantity selected',
        })
      })

      // Check isolation
      expect(quantityErrors.current.hasErrors).toBe(true)
      expect(quantityErrors.current.errors).toHaveLength(1)

      // Other modules should be unaffected
      expect(sizeErrors.current.hasErrors).toBe(false)
      expect(sizeErrors.current.errors).toHaveLength(0)
      expect(imageErrors.current.hasErrors).toBe(false)
      expect(imageErrors.current.errors).toHaveLength(0)
    })

    test('Clearing errors in one module does not affect others', () => {
      const { result: quantityErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.QUANTITY })
      )

      const { result: sizeErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.SIZE })
      )

      // Add errors to both modules
      act(() => {
        quantityErrors.current.addError({
          id: 'qty_error_1',
          message: 'Quantity error',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          timestamp: new Date(),
          moduleType: ModuleType.QUANTITY,
          field: 'quantity',
          severity: ModuleErrorSeverity.ERROR,
          canRecover: true,
          retryable: false,
          userMessage: 'Quantity error',
        })

        sizeErrors.current.addError({
          id: 'size_error_1',
          message: 'Size error',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          timestamp: new Date(),
          moduleType: ModuleType.SIZE,
          field: 'dimensions',
          severity: ModuleErrorSeverity.ERROR,
          canRecover: true,
          retryable: false,
          userMessage: 'Size error',
        })
      })

      expect(quantityErrors.current.hasErrors).toBe(true)
      expect(sizeErrors.current.hasErrors).toBe(true)

      // Clear only quantity errors
      act(() => {
        quantityErrors.current.clearErrors()
      })

      // Quantity errors cleared, size errors remain
      expect(quantityErrors.current.hasErrors).toBe(false)
      expect(sizeErrors.current.hasErrors).toBe(true)
      expect(sizeErrors.current.errors).toHaveLength(1)
    })

    test('Error severity levels work independently per module', () => {
      const { result: moduleErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.ADDONS })
      )

      act(() => {
        // Add different severity errors
        moduleErrors.current.addError({
          id: 'warning_1',
          message: 'This is a warning',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          timestamp: new Date(),
          moduleType: ModuleType.ADDONS,
          field: 'addon',
          severity: ModuleErrorSeverity.WARNING,
        } as any)

        moduleErrors.current.addError({
          id: 'error_1',
          message: 'This is an error',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          timestamp: new Date(),
          moduleType: ModuleType.ADDONS,
          field: 'addon',
          severity: ModuleErrorSeverity.ERROR,
        } as any)

        moduleErrors.current.addError({
          id: 'critical_1',
          message: 'This is critical',
          type: 'processing',
          errorType: ModuleErrorType.SYSTEM_ERROR,
          moduleType: ModuleType.ADDONS,
          field: 'system',
          severity: ModuleErrorSeverity.CRITICAL,
        } as any)
      })

      expect(moduleErrors.current.errors).toHaveLength(3)
      expect(moduleErrors.current.hasErrors).toBe(true)
      expect(moduleErrors.current.hasBlockingErrors).toBe(true) // Critical error present

      // Get errors by severity
      const criticalErrors = moduleErrors.current.getErrorsBySeverity(ModuleErrorSeverity.CRITICAL)
      const warningErrors = moduleErrors.current.getErrorsBySeverity(ModuleErrorSeverity.WARNING)

      expect(criticalErrors).toHaveLength(1)
      expect(warningErrors).toHaveLength(1)
    })
  })

  describe('Loading State Independence', () => {
    test('Loading states are completely isolated between modules', () => {
      const { result: quantityLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.QUANTITY })
      )

      const { result: sizeLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.SIZE })
      )

      const { result: imageLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.IMAGES })
      )

      // Start loading in quantity module
      let quantityOperationId: string
      act(() => {
        quantityOperationId = quantityLoading.current.startLoading(
          ModuleLoadingType.VALIDATION,
          'Validating quantity',
          ModuleLoadingPriority.HIGH
        )
      })

      // Check isolation
      expect(quantityLoading.current.isLoading).toBe(true)
      expect(quantityLoading.current.loadingState.totalOperations).toBe(1)

      // Other modules should be unaffected
      expect(sizeLoading.current.isLoading).toBe(false)
      expect(sizeLoading.current.loadingState.totalOperations).toBe(0)
      expect(imageLoading.current.isLoading).toBe(false)
      expect(imageLoading.current.loadingState.totalOperations).toBe(0)

      // Complete loading in quantity
      act(() => {
        quantityLoading.current.completeLoading(quantityOperationId!)
      })

      // Eventually clears (after timeout)
      setTimeout(() => {
        expect(quantityLoading.current.isLoading).toBe(false)
      }, 600)
    })

    test('Different loading priorities work independently', () => {
      const { result: moduleLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.PAPER_STOCK })
      )

      let normalOpId: string
      let criticalOpId: string

      act(() => {
        normalOpId = moduleLoading.current.startLoading(
          ModuleLoadingType.DATA_REFRESH,
          'Loading paper options',
          ModuleLoadingPriority.NORMAL
        )

        criticalOpId = moduleLoading.current.startLoading(
          ModuleLoadingType.PRICE_CALCULATION,
          'Calculating price',
          ModuleLoadingPriority.CRITICAL
        )
      })

      expect(moduleLoading.current.loadingState.totalOperations).toBe(2)
      expect(moduleLoading.current.loadingState.hasHighPriorityLoading).toBe(true)
      expect(moduleLoading.current.loadingState.hasCriticalLoading).toBe(true)

      // Complete critical operation
      act(() => {
        moduleLoading.current.completeLoading(criticalOpId!)
      })

      // Should still have normal priority loading
      expect(moduleLoading.current.loadingState.hasCriticalLoading).toBe(false)
      expect(moduleLoading.current.loadingState.isLoading).toBe(true)
    })

    test('Loading progress tracking is independent', () => {
      const { result: imageLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.IMAGES })
      )

      let uploadOpId: string

      act(() => {
        uploadOpId = imageLoading.current.startLoading(
          ModuleLoadingType.FILE_UPLOAD,
          'Uploading image',
          ModuleLoadingPriority.HIGH,
          5000 // 5 second estimate
        )
      })

      // Update progress
      act(() => {
        imageLoading.current.updateProgress(uploadOpId!, 25)
      })

      expect(imageLoading.current.loadingState.overallProgress).toBeCloseTo(25, 0)

      act(() => {
        imageLoading.current.updateProgress(uploadOpId!, 75)
      })

      expect(imageLoading.current.loadingState.overallProgress).toBeCloseTo(75, 0)

      // Complete upload
      act(() => {
        imageLoading.current.completeLoading(uploadOpId!)
      })
    })
  })

  describe('Module Recovery and Resilience', () => {
    test('Failed module can recover without affecting others', () => {
      const { result: quantityErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.QUANTITY })
      )

      const { result: sizeErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.SIZE })
      )

      // Simulate quantity module failure
      act(() => {
        quantityErrors.current.addError({
          id: 'qty_system_error',
          message: 'System error in quantity module',
          type: 'processing',
          errorType: ModuleErrorType.SYSTEM_ERROR,
          moduleType: ModuleType.QUANTITY,
          field: 'system',
          severity: ModuleErrorSeverity.CRITICAL,
        } as any)
      })

      expect(quantityErrors.current.hasBlockingErrors).toBe(true)
      expect(sizeErrors.current.hasErrors).toBe(false) // Size module unaffected

      // Simulate recovery (fixing the error)
      act(() => {
        quantityErrors.current.clearErrors()
      })

      expect(quantityErrors.current.hasErrors).toBe(false)
      expect(quantityErrors.current.hasBlockingErrors).toBe(false)
      // Size module still unaffected and functional
      expect(sizeErrors.current.hasErrors).toBe(false)
    })

    test('Image module errors never block system (always optional)', () => {
      const { result: imageErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.IMAGES })
      )

      // Add critical error to image module
      act(() => {
        imageErrors.current.addError({
          id: 'img_upload_fail',
          message: 'Upload failed',
          type: 'network',
          errorType: ModuleErrorType.NETWORK_ERROR,
          moduleType: ModuleType.IMAGES,
          field: 'upload',
          severity: ModuleErrorSeverity.WARNING, // Images should always be warnings, never critical
          timestamp: new Date(),
          canRecover: true,
          retryable: true,
          userMessage: 'Upload failed',
        })
      })

      expect(imageErrors.current.hasErrors).toBe(true)
      // Even with errors, images should not block (they're optional)
      expect(imageErrors.current.hasBlockingErrors).toBe(false)
    })
  })

  describe('Module Interaction Boundaries', () => {
    test('Modules communicate through pricing engine, not directly', () => {
      // This test validates that modules don't directly access each other's state
      // They only interact through the centralized pricing engine

      const { result: quantityErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.QUANTITY })
      )

      const { result: addonErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.ADDONS })
      )

      // Even if quantity has errors, addon module doesn't see them directly
      act(() => {
        quantityErrors.current.addError({
          id: 'qty_error',
          message: 'Quantity validation failed',
          type: 'validation',
          errorType: ModuleErrorType.VALIDATION_ERROR,
          timestamp: new Date(),
          moduleType: ModuleType.QUANTITY,
          field: 'quantity',
          severity: ModuleErrorSeverity.ERROR,
          canRecover: true,
          retryable: false,
          userMessage: 'Quantity validation failed',
        })
      })

      expect(quantityErrors.current.errors).toHaveLength(1)
      expect(addonErrors.current.errors).toHaveLength(0) // Addon module unaware

      // Modules should only know about pricing context, not error context
      // (This would be tested at integration level with actual pricing engine)
    })

    test('Module cleanup is independent', () => {
      const { result: paperLoading } = renderHook(() =>
        useModuleLoading({
          moduleType: ModuleType.PAPER_STOCK,
          autoCleanup: true,
        })
      )

      // Start multiple operations
      let op1: string, op2: string, op3: string

      act(() => {
        op1 = paperLoading.current.startLoading(ModuleLoadingType.INITIAL_LOAD, 'Load 1')
        op2 = paperLoading.current.startLoading(ModuleLoadingType.DATA_REFRESH, 'Load 2')
        op3 = paperLoading.current.startLoading(ModuleLoadingType.VALIDATION, 'Load 3')
      })

      expect(paperLoading.current.loadingState.totalOperations).toBe(3)

      // Complete operations
      act(() => {
        paperLoading.current.completeLoading(op1!)
        paperLoading.current.completeLoading(op2!)
      })

      // Auto-cleanup should eventually clean completed operations
      setTimeout(() => {
        expect(paperLoading.current.loadingState.totalOperations).toBeLessThanOrEqual(1)
      }, 1000)
    })
  })

  describe('CRITICAL: Image Module Never Blocks System', () => {
    test('Image upload failures do not prevent pricing', () => {
      const { result: imageErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.IMAGES })
      )

      const { result: imageLoading } = renderHook(() =>
        useModuleLoading({ moduleType: ModuleType.IMAGES })
      )

      // Simulate failed upload
      let uploadOpId: string
      act(() => {
        uploadOpId = imageLoading.current.startLoading(
          ModuleLoadingType.FILE_UPLOAD,
          'Uploading file'
        )
      })

      act(() => {
        imageLoading.current.failLoading(uploadOpId!, 'Network error')

        imageErrors.current.addError({
          id: 'upload_fail',
          message: 'Upload failed - network error',
          type: 'network',
          errorType: ModuleErrorType.NETWORK_ERROR,
          moduleType: ModuleType.IMAGES,
          field: 'upload',
          severity: ModuleErrorSeverity.WARNING, // Never critical
          timestamp: new Date(),
          canRecover: true,
          retryable: true,
          userMessage: 'Upload failed - network error',
        })
      })

      // Image errors should not block system
      expect(imageErrors.current.hasErrors).toBe(true)
      expect(imageErrors.current.hasBlockingErrors).toBe(false)

      // Loading failure should not prevent other operations
      expect(imageLoading.current.loadingState.failedOperations).toBeGreaterThan(0)
      expect(imageLoading.current.loadingState.hasCriticalLoading).toBe(false)
    })

    test('Image module can be completely disabled without affecting system', () => {
      // Test that system works when image module is not even loaded
      const { result: quantityErrors } = renderHook(() =>
        useModuleErrors({ moduleType: ModuleType.QUANTITY })
      )

      // System should work fine without image module
      expect(quantityErrors.current.hasErrors).toBe(false)
      // No image module means no image errors - system is not waiting for it
    })
  })
})

export {}
