/**
 * StandardModuleHooks.ts
 * Standardized hook implementations for all product modules
 * These hooks provide independent functionality with consistent pricing contributions
 */

import { useMemo, useCallback, useEffect } from 'react'
import {
  type ModulePricingContribution,
  StandardModuleValue,
  type ModuleError,
  ModuleType,

  // Specific module types
  type QuantityItem,
  QuantityValue,
  type QuantityModuleValue,
  type SizeItem,
  SizeValue,
  type SizeModuleValue,
  type PaperStockItem,
  PaperStockValue,
  type PaperStockModuleValue,
  type AddonItem,
  AddonValue,
  type AddonsModuleValue,
  type TurnaroundItem,
  TurnaroundValue,
  type TurnaroundModuleValue,
  ImageItem,
  ImageValue,
  ImageModuleValue,
  type VariableDataConfig,
  type PerforationConfig,
  type BandingConfig,
  type CornerRoundingConfig,
} from '../types/StandardModuleTypes'

import { useModuleErrors, ModuleErrorFactory, ModuleErrorType } from '../errors/ModuleErrorSystem'

// =============================================================================
// QUANTITY MODULE HOOK
// =============================================================================

export interface UseQuantityModuleProps {
  quantities: QuantityItem[]
  value: string
  customValue?: number
}

export function useQuantityModule({
  quantities,
  value,
  customValue,
}: UseQuantityModuleProps): QuantityModuleValue {
  // Ultra-independent error handling for this module instance
  const moduleErrors = useModuleErrors({
    moduleType: ModuleType.QUANTITY,
    onError: (error) => {
      // Could log errors, send to monitoring, etc.
      console.log(`Quantity Module Error:`, error)
    },
  })

  // Find selected quantity
  const selectedQuantity = useMemo(
    () => quantities.find((q) => q.id === value),
    [quantities, value]
  )

  // Calculate actual quantity value
  const actualQuantity = useMemo(() => {
    if (!selectedQuantity) return 0

    if (selectedQuantity.isCustom && customValue !== undefined && customValue > 0) {
      return customValue
    }

    return selectedQuantity.value || 0
  }, [selectedQuantity, customValue])

  // Ultra-independent validation with automatic error management
  const isValid = useMemo(() => {
    // Clear all previous errors
    moduleErrors.clearErrors()

    let valid = true

    // Required field validation
    if (!selectedQuantity) {
      moduleErrors.addError(
        ModuleErrorFactory.createRequiredFieldError(ModuleType.QUANTITY, 'quantity')
      )
      valid = false
    } else {
      // Custom quantity validation
      if (selectedQuantity.isCustom) {
        if (customValue === undefined || customValue === null || customValue <= 0) {
          moduleErrors.addError(
            ModuleErrorFactory.createRequiredFieldError(ModuleType.QUANTITY, 'customQuantity')
          )
          valid = false
        } else {
          const min = selectedQuantity.customMin || 1
          const max = selectedQuantity.customMax || 999999

          if (customValue < min || customValue > max) {
            moduleErrors.addError(
              ModuleErrorFactory.createRangeError(
                ModuleType.QUANTITY,
                'customQuantity',
                customValue,
                min,
                max
              )
            )
            valid = false
          }
        }
      }
    }

    return valid
  }, [selectedQuantity, customValue, moduleErrors])

  // Calculate pricing contribution (completely independent)
  const pricing: ModulePricingContribution = useMemo(() => {
    if (!isValid || !selectedQuantity) {
      return {
        basePrice: 0,
        multiplier: 1,
        isValid: false,
      }
    }

    const priceMultiplier = selectedQuantity.priceMultiplier || 1

    return {
      multiplier: priceMultiplier,
      isValid: true,
      calculation: {
        description: `Quantity: ${actualQuantity} × ${priceMultiplier}`,
        breakdown: [
          {
            item: `${actualQuantity} units`,
            cost: priceMultiplier,
            type: 'multiplier',
          },
        ],
      },
    }
  }, [isValid, selectedQuantity, actualQuantity])

  // Display information
  const display = useMemo(
    () => ({
      description: selectedQuantity?.label || 'No quantity selected',
      summary: `${actualQuantity} units`,
      showInSummary: true,
    }),
    [selectedQuantity, actualQuantity]
  )

  // Primary error for backward compatibility (use first blocking error)
  const primaryError: ModuleError | null = useMemo(() => {
    const blockingErrors = moduleErrors.errors.filter(
      (e) => e.severity === 'error' || e.severity === 'critical'
    )
    const firstError = blockingErrors[0]

    if (!firstError) return null

    return {
      message: firstError.message,
      type: firstError.type || 'validation',
      context: firstError.context,
    }
  }, [moduleErrors.errors])

  return {
    // Legacy compatibility
    quantityId: value,
    customValue,
    actualValue: actualQuantity,

    // Standard interface
    value: {
      quantityId: value,
      customValue,
      actualValue: actualQuantity,
    },
    pricing,
    display,
    isValid,
    error: primaryError,
    actualQuantity,

    // Ultra-independent error handling
    errors: moduleErrors.errors,
    hasErrors: moduleErrors.hasErrors,
    hasBlockingErrors: moduleErrors.hasBlockingErrors,
    clearErrors: moduleErrors.clearErrors,
    getErrorsByField: moduleErrors.getErrorsByField,
  }
}

// =============================================================================
// SIZE MODULE HOOK
// =============================================================================

export interface UseSizeModuleProps {
  sizes: SizeItem[]
  value: string
  customWidth?: number
  customHeight?: number
}

export function useSizeModule({
  sizes,
  value,
  customWidth,
  customHeight,
}: UseSizeModuleProps): SizeModuleValue {
  // Ultra-independent error handling for this module instance
  const moduleErrors = useModuleErrors({
    moduleType: ModuleType.SIZE,
    onError: (error) => {
      console.log(`Size Module Error:`, error)
    },
  })

  // Find selected size
  const selectedSize = useMemo(() => sizes.find((s) => s.id === value), [sizes, value])

  // Calculate dimensions
  const dimensions = useMemo(() => {
    if (!selectedSize) {
      return { width: 0, height: 0, squareInches: 0 }
    }

    if (selectedSize.isCustom && customWidth && customHeight) {
      return {
        width: customWidth,
        height: customHeight,
        squareInches: customWidth * customHeight,
      }
    }

    return {
      width: selectedSize.width || 0,
      height: selectedSize.height || 0,
      squareInches: selectedSize.squareInches || 0,
    }
  }, [selectedSize, customWidth, customHeight])

  // Ultra-independent validation with automatic error management
  const isValid = useMemo(() => {
    // Clear all previous errors
    moduleErrors.clearErrors()

    let valid = true

    // Required field validation
    if (!selectedSize) {
      moduleErrors.addError(ModuleErrorFactory.createRequiredFieldError(ModuleType.SIZE, 'size'))
      valid = false
    } else {
      // Custom size validation
      if (selectedSize.isCustom) {
        if (!customWidth || customWidth <= 0) {
          moduleErrors.addError(
            ModuleErrorFactory.createRequiredFieldError(ModuleType.SIZE, 'customWidth')
          )
          valid = false
        }

        if (!customHeight || customHeight <= 0) {
          moduleErrors.addError(
            ModuleErrorFactory.createRequiredFieldError(ModuleType.SIZE, 'customHeight')
          )
          valid = false
        }

        if (customWidth && customWidth > 0) {
          const minWidth = selectedSize.customMinWidth || 1
          const maxWidth = selectedSize.customMaxWidth || 96

          if (customWidth < minWidth || customWidth > maxWidth) {
            moduleErrors.addError(
              ModuleErrorFactory.createRangeError(
                ModuleType.SIZE,
                'customWidth',
                customWidth,
                minWidth,
                maxWidth
              )
            )
            valid = false
          }
        }

        if (customHeight && customHeight > 0) {
          const minHeight = selectedSize.customMinHeight || 1
          const maxHeight = selectedSize.customMaxHeight || 96

          if (customHeight < minHeight || customHeight > maxHeight) {
            moduleErrors.addError(
              ModuleErrorFactory.createRangeError(
                ModuleType.SIZE,
                'customHeight',
                customHeight,
                minHeight,
                maxHeight
              )
            )
            valid = false
          }
        }
      }
    }

    return valid
  }, [selectedSize, customWidth, customHeight, moduleErrors])

  // Calculate pricing contribution (completely independent)
  const pricing: ModulePricingContribution = useMemo(() => {
    if (!isValid || !selectedSize) {
      return {
        multiplier: 1,
        isValid: false,
      }
    }

    let multiplier = selectedSize.priceMultiplier

    // Dynamic pricing for custom sizes
    if (selectedSize.isCustom && customWidth && customHeight) {
      const squareInches = customWidth * customHeight
      if (squareInches <= 10) multiplier = 1.0
      else if (squareInches <= 25) multiplier = 1.2
      else if (squareInches <= 50) multiplier = 1.5
      else if (squareInches <= 100) multiplier = 2.0
      else multiplier = 2.5 + (squareInches - 100) * 0.01
    }

    return {
      multiplier,
      isValid: true,
      calculation: {
        description: `Size: ${dimensions.width}" × ${dimensions.height}" (${dimensions.squareInches} sq in)`,
        breakdown: [
          {
            item: `${dimensions.squareInches} square inches`,
            cost: multiplier,
            type: 'multiplier',
          },
        ],
      },
    }
  }, [isValid, selectedSize, dimensions, customWidth, customHeight])

  // Display information
  const display = useMemo(
    () => ({
      description: selectedSize?.displayName || 'No size selected',
      summary: `${dimensions.width}" × ${dimensions.height}"`,
      showInSummary: true,
    }),
    [selectedSize, dimensions]
  )

  // Primary error for backward compatibility (use first blocking error)
  const primaryError: ModuleError | null = useMemo(() => {
    const blockingErrors = moduleErrors.errors.filter(
      (e) => e.severity === 'error' || e.severity === 'critical'
    )
    const firstError = blockingErrors[0]

    if (!firstError) return null

    return {
      message: firstError.message,
      type: firstError.type || 'validation',
      context: firstError.context,
    }
  }, [moduleErrors.errors])

  return {
    // Legacy compatibility
    sizeId: value,
    customWidth,
    customHeight,
    width: dimensions.width,
    height: dimensions.height,
    squareInches: dimensions.squareInches,

    // Standard interface
    value: {
      sizeId: value,
      customWidth,
      customHeight,
      actualWidth: dimensions.width,
      actualHeight: dimensions.height,
      squareInches: dimensions.squareInches,
    },
    pricing,
    display,
    dimensions,
    isValid,
    error: primaryError,

    // Ultra-independent error handling
    errors: moduleErrors.errors,
    hasErrors: moduleErrors.hasErrors,
    hasBlockingErrors: moduleErrors.hasBlockingErrors,
    clearErrors: moduleErrors.clearErrors,
    getErrorsByField: moduleErrors.getErrorsByField,
  }
}

// =============================================================================
// PAPER STOCK MODULE HOOK
// =============================================================================

export interface UsePaperStockModuleProps {
  paperStocks: PaperStockItem[]
  paperId: string
  coatingId: string
  sidesId: string
}

export function usePaperStockModule({
  paperStocks,
  paperId,
  coatingId,
  sidesId,
}: UsePaperStockModuleProps): PaperStockModuleValue {
  // Find selected items
  const paper = useMemo(() => paperStocks.find((p) => p.id === paperId), [paperStocks, paperId])

  const coating = useMemo(() => paper?.coatings.find((c) => c.id === coatingId), [paper, coatingId])

  const sides = useMemo(() => paper?.sides.find((s) => s.id === sidesId), [paper, sidesId])

  // Calculate available options
  const availableCoatings = useMemo(() => paper?.coatings || [], [paper])

  const availableSides = useMemo(() => paper?.sides || [], [paper])

  // Calculate total multiplier
  const totalMultiplier = useMemo(() => {
    const coatingMultiplier = coating?.priceMultiplier || 1
    const sidesMultiplier = sides?.priceMultiplier || 1
    return coatingMultiplier * sidesMultiplier
  }, [coating, sides])

  // Validate selection
  const isValid = useMemo(() => {
    return !!(paper && coating && sides)
  }, [paper, coating, sides])

  // Calculate pricing contribution
  const pricing: ModulePricingContribution = useMemo(() => {
    if (!isValid || !paper || !coating || !sides) {
      return {
        basePrice: 0,
        multiplier: 1,
        isValid: false,
      }
    }

    return {
      basePrice: paper.pricePerUnit,
      multiplier: totalMultiplier,
      isValid: true,
      calculation: {
        description: `${paper.name}, ${coating.name}, ${sides.name}`,
        breakdown: [
          {
            item: paper.name,
            cost: paper.pricePerUnit,
            type: 'base_price',
          },
          {
            item: coating.name,
            cost: coating.priceMultiplier,
            type: 'multiplier',
          },
          {
            item: sides.name,
            cost: sides.priceMultiplier,
            type: 'multiplier',
          },
        ],
      },
    }
  }, [isValid, paper, coating, sides, totalMultiplier])

  // Display information
  const display = useMemo(
    () => ({
      description: paper
        ? `${paper.name} - ${coating?.name} - ${sides?.name}`
        : 'No paper stock selected',
      summary: paper?.name || '',
      showInSummary: true,
    }),
    [paper, coating, sides]
  )

  // Error handling
  const error: ModuleError | null = useMemo(() => {
    if (isValid) return null

    if (!paper) {
      return {
        message: 'Please select a paper stock',
        type: 'validation',
      }
    }

    if (!coating) {
      return {
        message: 'Please select a coating option',
        type: 'validation',
      }
    }

    if (!sides) {
      return {
        message: 'Please select sides option',
        type: 'validation',
      }
    }

    return null
  }, [isValid, paper, coating, sides])

  return {
    // Legacy compatibility
    paperId,
    coatingId,
    sidesId,
    paper,
    coating,
    sides,

    // Standard interface
    value: {
      paperId,
      coatingId,
      sidesId,
      paper,
      coating,
      sides,
    },
    pricing,
    display,
    availableCoatings,
    availableSides,
    totalMultiplier,
    isValid,
    error,
  }
}

// =============================================================================
// ADD-ONS MODULE HOOK (INDEPENDENT VERSION)
// =============================================================================

export interface UseAddonsModuleProps {
  addons: AddonItem[]
  selectedAddonIds: string[]
  specialConfigs?: {
    variableData?: VariableDataConfig
    perforation?: PerforationConfig
    banding?: BandingConfig
    cornerRounding?: CornerRoundingConfig
  }
  // ❌ REMOVED: quantity dependency for true independence
}

export function useAddonsModule({
  addons,
  selectedAddonIds,
  specialConfigs = {},
}: UseAddonsModuleProps): AddonsModuleValue {
  // Find selected addons
  const selectedAddons = useMemo(
    () =>
      selectedAddonIds.map((id) => addons.find((a) => a.id === id)).filter(Boolean) as AddonItem[],
    [addons, selectedAddonIds]
  )

  // Calculate total addon cost (excluding special addons)
  const totalAddonCost = useMemo(() => {
    return selectedAddons.reduce((total, addon) => {
      // Skip special addons - they're calculated separately
      if (
        addon.configuration?.type === 'variable_data' ||
        addon.configuration?.type === 'perforation' ||
        addon.configuration?.type === 'banding' ||
        addon.configuration?.type === 'corner_rounding'
      ) {
        return total
      }

      // For independent calculation, only handle FIXED_FEE and FLAT pricing
      // PER_UNIT and PERCENTAGE require external context and violate independence
      switch (addon.pricingModel) {
        case 'FIXED_FEE':
        case 'FLAT':
          return total + addon.price
        case 'PER_UNIT':
        case 'PERCENTAGE':
          // These will be handled by the pricing engine with proper context
          return total
        default:
          return total
      }
    }, 0)
  }, [selectedAddons])

  // Calculate special addon costs (with independent logic)
  const specialAddonCosts = useMemo(() => {
    let cost = 0

    // These calculations are now independent - no external quantity needed
    if (specialConfigs.variableData?.enabled) {
      cost += 60 // Base cost only - per-unit cost handled by pricing engine
    }

    if (specialConfigs.perforation?.enabled) {
      cost += 20 // Base cost only
    }

    if (specialConfigs.banding?.enabled && specialConfigs.banding.itemsPerBundle > 0) {
      // Can't calculate without quantity, so just base cost
      cost += 10 // Base banding cost
    }

    if (specialConfigs.cornerRounding?.enabled) {
      cost += 20 // Base cost only
    }

    return cost
  }, [specialConfigs])

  // Calculate additional turnaround days
  const additionalTurnaroundDays = useMemo(() => {
    return selectedAddons.reduce((total, addon) => total + (addon.additionalTurnaroundDays || 0), 0)
  }, [selectedAddons])

  // Validate selection
  const isValid = useMemo(() => {
    // No validation errors for addons - they're optional
    return true
  }, [])

  // Calculate pricing contribution (independent)
  const pricing: ModulePricingContribution = useMemo(() => {
    const addonCost = totalAddonCost + specialAddonCosts

    return {
      addonCost,
      isValid: true,
      calculation: {
        description: `${selectedAddons.length} add-ons selected`,
        breakdown: [
          ...selectedAddons
            .filter((addon) => addon.pricingModel === 'FIXED_FEE' || addon.pricingModel === 'FLAT')
            .map((addon) => ({
              item: addon.name,
              cost: addon.price,
              type: 'addon',
            })),
          ...(specialAddonCosts > 0
            ? [
                {
                  item: 'Special add-ons base cost',
                  cost: specialAddonCosts,
                  type: 'special_addon',
                },
              ]
            : []),
        ],
      },
    }
  }, [selectedAddons, totalAddonCost, specialAddonCosts])

  // Display information
  const display = useMemo(
    () => ({
      description:
        selectedAddons.length > 0
          ? `${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''} selected`
          : 'No add-ons selected',
      summary: selectedAddons.map((a) => a.name).join(', '),
      showInSummary: selectedAddons.length > 0,
    }),
    [selectedAddons]
  )

  return {
    // Legacy compatibility
    selectedAddons: selectedAddonIds,
    variableDataConfig: specialConfigs.variableData,
    perforationConfig: specialConfigs.perforation,
    bandingConfig: specialConfigs.banding,
    cornerRoundingConfig: specialConfigs.cornerRounding,
    totalAddonsPrice: totalAddonCost,

    // Standard interface
    value: {
      selectedAddonIds,
      selectedAddons,
      specialConfigs,
    },
    pricing,
    display,
    totalAddonCost,
    specialAddonCosts,
    additionalTurnaroundDays,
    isValid,
  }
}

// =============================================================================
// TURNAROUND MODULE HOOK (INDEPENDENT VERSION)
// =============================================================================

export interface UseTurnaroundModuleProps {
  turnaroundTimes: TurnaroundItem[]
  selectedTurnaroundId: string
  currentCoating?: string // Only for compatibility checks
  // ❌ REMOVED: baseProductPrice and quantity dependencies
}

export function useTurnaroundModule({
  turnaroundTimes,
  selectedTurnaroundId,
  currentCoating,
}: UseTurnaroundModuleProps): TurnaroundModuleValue {
  // Find selected turnaround
  const turnaround = useMemo(
    () => turnaroundTimes.find((t) => t.id === selectedTurnaroundId),
    [turnaroundTimes, selectedTurnaroundId]
  )

  // Check coating compatibility
  const isCompatible = useMemo(() => {
    if (!turnaround) return false

    // Check if turnaround requires no coating
    if (turnaround.requiresNoCoating && currentCoating) {
      // Need to check if current coating is "no coating"
      // This is a validation concern, not a pricing concern
      return true // For now, assume compatible
    }

    // Check restricted coatings
    if (turnaround.restrictedCoatings.length > 0 && currentCoating) {
      return !turnaround.restrictedCoatings.includes(currentCoating)
    }

    return true
  }, [turnaround, currentCoating])

  // Calculate estimated delivery date
  const estimatedDeliveryDate = useMemo(() => {
    if (!turnaround) return undefined

    const startDate = new Date()
    let businessDays = turnaround.daysMin
    const currentDate = new Date(startDate)

    while (businessDays > 0) {
      currentDate.setDate(currentDate.getDate() + 1)

      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        businessDays--
      }
    }

    return currentDate
  }, [turnaround])

  // Days range
  const daysRange = useMemo(
    () => ({
      min: turnaround?.daysMin || 0,
      max: turnaround?.daysMax || turnaround?.daysMin || 0,
    }),
    [turnaround]
  )

  // Validate selection
  const isValid = useMemo(() => {
    return !!(turnaround && isCompatible)
  }, [turnaround, isCompatible])

  // Calculate pricing contribution (independent - no external price needed)
  const pricing: ModulePricingContribution = useMemo(() => {
    if (!isValid || !turnaround) {
      return {
        multiplier: 1,
        isValid: false,
      }
    }

    // Independent pricing calculation
    switch (turnaround.pricingModel) {
      case 'FLAT':
        return {
          addonCost: turnaround.basePrice,
          isValid: true,
          calculation: {
            description: `${turnaround.displayName} (flat rate)`,
            breakdown: [
              {
                item: turnaround.displayName,
                cost: turnaround.basePrice,
                type: 'flat_fee',
              },
            ],
          },
        }

      case 'PERCENTAGE':
        return {
          multiplier: turnaround.priceMultiplier,
          isValid: true,
          calculation: {
            description: `${turnaround.displayName} (${((turnaround.priceMultiplier - 1) * 100).toFixed(1)}% markup)`,
            breakdown: [
              {
                item: turnaround.displayName,
                cost: turnaround.priceMultiplier,
                type: 'multiplier',
              },
            ],
          },
        }

      case 'PER_UNIT':
        // Independent calculation - just return the per-unit cost
        // The pricing engine will multiply by quantity
        return {
          perUnitCost: turnaround.basePrice,
          isValid: true,
          calculation: {
            description: `${turnaround.displayName} (per unit)`,
            breakdown: [
              {
                item: `${turnaround.displayName} per unit`,
                cost: turnaround.basePrice,
                type: 'per_unit',
              },
            ],
          },
        }

      default:
        return {
          multiplier: 1,
          isValid: true,
        }
    }
  }, [isValid, turnaround])

  // Display information
  const display = useMemo(
    () => ({
      description: turnaround?.displayName || 'No turnaround selected',
      summary: turnaround
        ? `${turnaround.daysMin}-${turnaround.daysMax || turnaround.daysMin} days`
        : '',
      showInSummary: true,
    }),
    [turnaround]
  )

  // Error handling
  const error: ModuleError | null = useMemo(() => {
    if (isValid) return null

    if (!turnaround) {
      return {
        message: 'Please select a turnaround time',
        type: 'validation',
      }
    }

    if (!isCompatible) {
      return {
        message: 'Selected turnaround is not compatible with current coating',
        type: 'validation',
      }
    }

    return null
  }, [isValid, turnaround, isCompatible])

  return {
    // Legacy compatibility
    turnaroundId: selectedTurnaroundId,
    turnaround,
    estimatedDeliveryDate,
    turnaroundPrice: 0, // ❌ DEPRECATED: Moved to pricing contribution
    daysMin: daysRange.min,
    daysMax: daysRange.max,

    // Standard interface
    value: {
      turnaroundId: selectedTurnaroundId,
      turnaround,
      estimatedDeliveryDate,
      isValidWithCurrentCoating: isCompatible,
    },
    pricing,
    display,
    estimatedDeliveryDate,
    isCompatible,
    daysRange,
    isValid,
    error,
  }
}

// =============================================================================
// IMAGE MODULE HOOK (NEW IMPLEMENTATION)
// =============================================================================

import { useState, useCallback } from 'react'
import {
  useModuleLoading,
  ModuleLoadingType,
  ModuleLoadingPriority,
} from '../loading/ModuleLoadingSystem'

export interface UseImageModuleOptions {
  moduleType: ModuleType
  initialState?: { images: any[] }
  onChange?: (newState: any) => void
  onUploadComplete?: (result: any) => void
  onError?: (error: Error) => void
  config?: {
    maxFiles?: number
    maxFileSize?: number
    requiresUpload?: boolean
  }
}

/**
 * Ultra-independent Image Module Hook
 * CRITICAL: Always optional, never blocks pricing/checkout
 */
export function useImageModule(options: UseImageModuleOptions) {
  const {
    moduleType,
    initialState = { images: [] },
    onChange,
    onUploadComplete,
    onError,
    config = {},
  } = options

  // Ultra-independent error handling for this module instance
  const moduleErrors = useModuleErrors({
    moduleType: ModuleType.IMAGES,
    onError: (error) => {
      console.log(`Image Module Error:`, error)
      onError?.(new Error(error.message))
    },
  })

  // Ultra-independent loading state management
  const moduleLoading = useModuleLoading({
    moduleType: ModuleType.IMAGES,
    onLoadingChange: (isLoading, state) => {
      // Loading state changes don't affect other modules
    },
    onOperationComplete: (operation) => {
      if (operation.type === ModuleLoadingType.FILE_UPLOAD) {
        onUploadComplete?.(operation.context)
      }
    },
  })

  // Internal module state
  const [moduleState, setModuleState] = useState(initialState)

  // Update module state
  const updateModuleState = useCallback(
    (newState: any) => {
      setModuleState(newState)
      onChange?.(newState)
    },
    [onChange]
  )

  // Add error to module
  const addModuleError = useCallback(
    (type: string, message: string) => {
      moduleErrors.addError({
        id: `img_${Date.now()}`,
        message,
        type: 'validation',
        moduleType: ModuleType.IMAGES,
        field: type,
        severity: 'warning', // Images are always optional
      })
    },
    [moduleErrors]
  )

  // Clear errors
  const clearModuleErrors = useCallback(() => {
    moduleErrors.clearErrors()
  }, [moduleErrors])

  // Start loading operation
  const startModuleLoading = useCallback(
    (
      type: ModuleLoadingType,
      label: string,
      priority: ModuleLoadingPriority = ModuleLoadingPriority.NORMAL,
      estimatedDuration?: number
    ): string => {
      return moduleLoading.startLoading(type, label, priority, estimatedDuration)
    },
    [moduleLoading]
  )

  // Complete loading operation
  const completeModuleLoading = useCallback(
    (operationId: string, context?: any) => {
      return moduleLoading.completeLoading(operationId, context)
    },
    [moduleLoading]
  )

  // Fail loading operation
  const failModuleLoading = useCallback(
    (operationId: string, reason?: string) => {
      return moduleLoading.failLoading(operationId, reason)
    },
    [moduleLoading]
  )

  // Calculate pricing contribution - Images NEVER affect pricing
  const pricing: ModulePricingContribution = useMemo(
    () => ({
      isValid: true, // Always valid because always optional
      calculation: {
        description: 'Images (no pricing impact)',
        breakdown: [
          {
            type: 'info',
            item: 'Image uploads are optional',
            cost: 0,
          },
        ],
      },
    }),
    []
  )

  // Display information
  const display = useMemo(() => {
    const imageCount = moduleState.images?.length || 0
    const uploadingCount =
      moduleState.images?.filter((img: any) => img.uploadState === 'uploading').length || 0
    const completedCount =
      moduleState.images?.filter((img: any) => img.uploadState === 'completed').length || 0

    let description = 'No images uploaded'
    if (uploadingCount > 0) {
      description = `${uploadingCount} uploading...`
    } else if (completedCount > 0) {
      description = `${completedCount} image${completedCount > 1 ? 's' : ''} uploaded`
    }

    return {
      description,
      summary: imageCount > 0 ? `${imageCount} files` : 'Optional',
      showInSummary: false, // Don't clutter summary - images are optional
    }
  }, [moduleState])

  // Validation - Images are ALWAYS valid (optional)
  const isValid = useMemo(() => true, []) // Always valid because always optional

  return {
    // Module state management
    moduleState,
    updateModuleState,

    // Error handling (ultra-independent)
    moduleErrors,
    addModuleError,
    clearModuleErrors,

    // Loading state (ultra-independent)
    moduleLoading: moduleLoading.loadingState,
    startModuleLoading,
    completeModuleLoading,
    failModuleLoading,

    // Standard interface
    value: {
      images: moduleState.images || [],
      hasUploads: (moduleState.images?.length || 0) > 0,
      isOptional: true, // Always true for images
    },
    pricing,
    display,
    isValid,
    error: null, // Images never have blocking errors

    // Ultra-independent characteristics:
    // - Errors don't crash other modules
    // - Loading states don't block other modules
    // - Always optional, never required
    // - System works completely without images
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combine multiple module pricing contributions into a single contribution
 */
export function combineModulePricingContributions(
  contributions: ModulePricingContribution[]
): ModulePricingContribution {
  const validContributions = contributions.filter((c) => c.isValid)

  if (validContributions.length === 0) {
    return { isValid: false }
  }

  return {
    basePrice: validContributions.reduce((sum, c) => sum + (c.basePrice || 0), 0),
    multiplier: validContributions.reduce((product, c) => product * (c.multiplier || 1), 1),
    addonCost: validContributions.reduce((sum, c) => sum + (c.addonCost || 0), 0),
    perUnitCost: validContributions.reduce((sum, c) => sum + (c.perUnitCost || 0), 0),
    percentageCost: validContributions.reduce((sum, c) => sum + (c.percentageCost || 0), 0),
    isValid: true,
    calculation: {
      description: 'Combined module contributions',
      breakdown: validContributions.flatMap((c) => c.calculation?.breakdown || []),
    },
  }
}

/**
 * Validate all module selections
 */
export function validateAllModules(
  moduleValues: Array<{ isValid: boolean; error: ModuleError | null }>
): { isValid: boolean; errors: ModuleError[] } {
  const errors = moduleValues.map((mv) => mv.error).filter(Boolean) as ModuleError[]

  return {
    isValid: errors.length === 0,
    errors,
  }
}
