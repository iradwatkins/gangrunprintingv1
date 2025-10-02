'use client'

import { useState, useEffect, useCallback } from 'react'
import { useErrorHandler } from '@/stores/errorStore'
import { useLoadingManager } from '@/stores/loadingStore'

// Types extracted from SimpleConfigurationForm for reusability
export interface SimpleConfigData {
  quantities: Array<{
    id: string
    value: number | null
    label: string
    isCustom?: boolean
    customMin?: number
    customMax?: number
  }>
  sizes: Array<{
    id: string
    name: string
    displayName: string
    width: number | null
    height: number | null
    squareInches: number | null
    priceMultiplier: number
    isDefault: boolean
    isCustom?: boolean
    customMinWidth?: number | null
    customMaxWidth?: number | null
    customMinHeight?: number | null
    customMaxHeight?: number | null
  }>
  paperStocks: Array<{
    id: string
    name: string
    description: string
    pricePerUnit: number
    coatings: Array<{
      id: string
      name: string
      priceMultiplier: number
      isDefault: boolean
    }>
    sides: Array<{
      id: string
      name: string
      priceMultiplier: number
      isDefault: boolean
    }>
  }>
  addons: Array<{
    id: string
    name: string
    description: string
    pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
    price: number
    priceDisplay: string
    isDefault: boolean
    additionalTurnaroundDays: number
    configuration?: any
  }>
  turnaroundTimes: Array<{
    id: string
    name: string
    displayName: string
    description?: string
    daysMin: number
    daysMax?: number
    pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
    basePrice: number
    priceMultiplier: number
    requiresNoCoating: boolean
    restrictedCoatings: string[]
    isDefault: boolean
  }>
  defaults: {
    quantity: string
    size: string
    paper: string
    coating: string
    sides: string
    addons: string[]
    turnaround: string
  }
}

export interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  uploadedAt: string
  isImage: boolean
}

export interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

export interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

export interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

export interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

export interface SimpleProductConfiguration {
  quantity: string
  customQuantity?: number
  size: string
  customWidth?: number
  customHeight?: number
  paper: string
  coating: string
  sides: string
  turnaround: string
  uploadedFiles: UploadedFile[]
  selectedAddons: string[]
  variableDataConfig?: VariableDataConfig
  perforationConfig?: PerforationConfig
  bandingConfig?: BandingConfig
  cornerRoundingConfig?: CornerRoundingConfig
}

interface UseProductConfigurationProps {
  productId: string
  onConfigurationChange?: (config: SimpleProductConfiguration) => void
}

interface ConfigurationState {
  configData: SimpleConfigData | null
  configuration: SimpleProductConfiguration
  validationErrors: {
    quantity: string
    size: string
  }
}

export function useProductConfiguration({
  productId,
  onConfigurationChange
}: UseProductConfigurationProps) {
  const { handleError, clearErrors } = useErrorHandler()
  const { withLoading, isLoading } = useLoadingManager()

  const [state, setState] = useState<ConfigurationState>({
    configData: null,
    configuration: {
      quantity: '',
      customQuantity: undefined,
      size: '',
      paper: '',
      coating: '',
      sides: '',
      turnaround: '',
      uploadedFiles: [],
      selectedAddons: [],
      variableDataConfig: undefined,
      perforationConfig: undefined,
      bandingConfig: undefined,
      cornerRoundingConfig: undefined,
    },
    validationErrors: {
      quantity: '',
      size: '',
    },
  })

  // Custom quantity/size input tracking
  const [customInputs, setCustomInputs] = useState({
    showCustomQuantityInput: false,
    showCustomSizeInput: false,
    customQuantityValue: '',
    customWidthValue: '',
    customHeightValue: '',
  })

  // Fetch configuration data with centralized loading and error handling
  const fetchConfiguration = useCallback(async () => {
    if (!productId) return

    try {
      clearErrors() // Clear any previous errors

      console.log('[useProductConfiguration] Fetching config for product:', productId)

      const response = await fetch(`/api/products/${productId}/configuration`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      })

      console.log('[useProductConfiguration] Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SimpleConfigData = await response.json()
      console.log('[useProductConfiguration] Data received:', {
        quantities: data.quantities?.length,
        sizes: data.sizes?.length,
        paperStocks: data.paperStocks?.length,
      })

      // Set defaults
      const defaultConfig: SimpleProductConfiguration = {
        quantity: data.defaults.quantity || data.quantities[0]?.id || '',
        customQuantity: undefined,
        size: data.defaults.size || data.sizes[0]?.id || '',
        paper: data.defaults.paper || data.paperStocks[0]?.id || '',
        coating: data.defaults.coating || data.paperStocks[0]?.coatings[0]?.id || '',
        sides: data.defaults.sides || data.paperStocks[0]?.sides[0]?.id || '',
        turnaround: data.defaults.turnaround || data.turnaroundTimes[0]?.id || '',
        uploadedFiles: [],
        selectedAddons: data.defaults.addons || [],
        variableDataConfig: undefined,
        perforationConfig: undefined,
        bandingConfig: undefined,
        cornerRoundingConfig: undefined,
      }

      setState(prev => ({
        ...prev,
        configData: data,
        configuration: defaultConfig,
      }))

      onConfigurationChange?.(defaultConfig)
    } catch (err) {
      console.error('[useProductConfiguration] Error:', err)
      handleError(err instanceof Error ? err : new Error('Failed to load configuration'))
    }
  }, [productId, onConfigurationChange, handleError, clearErrors])

  useEffect(() => {
    fetchConfiguration()
  }, [fetchConfiguration])

  // Helper to get actual quantity value
  const getQuantityValue = useCallback((config: SimpleProductConfiguration): number => {
    const selectedQuantity = state.configData?.quantities.find(q => q.id === config.quantity)
    if (selectedQuantity?.isCustom && config.customQuantity !== undefined && config.customQuantity > 0) {
      return config.customQuantity
    }
    return selectedQuantity?.value || 0
  }, [state.configData])

  // Helper to get size dimensions
  const getSizeDimensions = useCallback((config: SimpleProductConfiguration) => {
    const selectedSize = state.configData?.sizes.find(s => s.id === config.size)

    if (selectedSize?.isCustom && config.customWidth && config.customHeight) {
      return {
        width: config.customWidth,
        height: config.customHeight,
        squareInches: config.customWidth * config.customHeight,
      }
    }

    return {
      width: selectedSize?.width || 0,
      height: selectedSize?.height || 0,
      squareInches: selectedSize?.squareInches || 0,
    }
  }, [state.configData])

  // Update configuration
  const updateConfiguration = useCallback((updates: Partial<SimpleProductConfiguration>) => {
    setState(prev => {
      const newConfig = { ...prev.configuration, ...updates }

      // Handle paper change side effects
      if ('paper' in updates && state.configData) {
        const selectedPaper = state.configData.paperStocks.find(p => p.id === updates.paper)
        if (selectedPaper) {
          const defaultCoating = selectedPaper.coatings.find(c => c.isDefault) || selectedPaper.coatings[0]
          const defaultSides = selectedPaper.sides.find(s => s.isDefault) || selectedPaper.sides[0]

          newConfig.coating = defaultCoating?.id || ''
          newConfig.sides = defaultSides?.id || ''
        }
      }

      onConfigurationChange?.(newConfig)

      return {
        ...prev,
        configuration: newConfig,
      }
    })
  }, [state.configData, onConfigurationChange])

  // Handle quantity changes with validation
  const updateQuantity = useCallback((quantityId: string, customValue?: number) => {
    const selectedQuantity = state.configData?.quantities.find(q => q.id === quantityId)

    if (selectedQuantity?.isCustom) {
      setCustomInputs(prev => ({
        ...prev,
        showCustomQuantityInput: true,
        customQuantityValue: customValue?.toString() || '',
      }))

      // Validate custom quantity
      if (customValue !== undefined) {
        const minValue = selectedQuantity.customMin || 55000
        const maxValue = selectedQuantity.customMax || 100000

        let quantityError = ''
        if (customValue < minValue) {
          quantityError = `Minimum quantity is ${minValue.toLocaleString()}`
        } else if (customValue > maxValue) {
          quantityError = `Maximum quantity is ${maxValue.toLocaleString()}`
        }

        setState(prev => ({
          ...prev,
          validationErrors: { ...prev.validationErrors, quantity: quantityError },
        }))

        if (!quantityError) {
          updateConfiguration({ quantity: quantityId, customQuantity: customValue })
        }
      } else {
        updateConfiguration({ quantity: quantityId, customQuantity: undefined })
      }
    } else {
      setCustomInputs(prev => ({
        ...prev,
        showCustomQuantityInput: false,
        customQuantityValue: '',
      }))
      setState(prev => ({
        ...prev,
        validationErrors: { ...prev.validationErrors, quantity: '' },
      }))
      updateConfiguration({ quantity: quantityId, customQuantity: undefined })
    }
  }, [state.configData, updateConfiguration])

  // Handle size changes with validation
  const updateSize = useCallback((sizeId: string, customWidth?: number, customHeight?: number) => {
    const selectedSize = state.configData?.sizes.find(s => s.id === sizeId)

    if (selectedSize?.isCustom) {
      setCustomInputs(prev => ({
        ...prev,
        showCustomSizeInput: true,
        customWidthValue: customWidth?.toString() || '',
        customHeightValue: customHeight?.toString() || '',
      }))

      // Validate custom dimensions
      let sizeError = ''
      if (customWidth !== undefined) {
        const minWidth = selectedSize.customMinWidth || 1
        const maxWidth = selectedSize.customMaxWidth || 96
        if (customWidth < minWidth) {
          sizeError = `Minimum width is ${minWidth}"`
        } else if (customWidth > maxWidth) {
          sizeError = `Maximum width is ${maxWidth}"`
        }
      }

      if (customHeight !== undefined && !sizeError) {
        const minHeight = selectedSize.customMinHeight || 1
        const maxHeight = selectedSize.customMaxHeight || 96
        if (customHeight < minHeight) {
          sizeError = `Minimum height is ${minHeight}"`
        } else if (customHeight > maxHeight) {
          sizeError = `Maximum height is ${maxHeight}"`
        }
      }

      setState(prev => ({
        ...prev,
        validationErrors: { ...prev.validationErrors, size: sizeError },
      }))

      if (!sizeError && customWidth && customHeight) {
        updateConfiguration({
          size: sizeId,
          customWidth,
          customHeight
        })
      }
    } else {
      setCustomInputs(prev => ({
        ...prev,
        showCustomSizeInput: false,
        customWidthValue: '',
        customHeightValue: '',
      }))
      setState(prev => ({
        ...prev,
        validationErrors: { ...prev.validationErrors, size: '' },
      }))
      updateConfiguration({
        size: sizeId,
        customWidth: undefined,
        customHeight: undefined
      })
    }
  }, [state.configData, updateConfiguration])

  // Handle turnaround changes with coating restrictions
  const updateTurnaround = useCallback((turnaroundId: string) => {
    const selectedTurnaround = state.configData?.turnaroundTimes.find(t => t.id === turnaroundId)
    let updates: Partial<SimpleProductConfiguration> = { turnaround: turnaroundId }

    // Handle "no coating" requirement
    if (selectedTurnaround?.requiresNoCoating && state.configData) {
      const selectedPaper = state.configData.paperStocks.find(p => p.id === state.configuration.paper)
      const noCoatingOption = selectedPaper?.coatings.find(c => c.name === 'No Coating')
      if (noCoatingOption) {
        updates.coating = noCoatingOption.id
      }
    }

    updateConfiguration(updates)
  }, [state.configData, state.configuration.paper, updateConfiguration])

  return {
    // State
    ...state,
    customInputs,
    loading: isLoading('product-configuration'), // Use centralized loading state
    error: null, // Errors are now handled centrally by the error store

    // Helpers
    getQuantityValue: (config?: SimpleProductConfiguration) =>
      getQuantityValue(config || state.configuration),
    getSizeDimensions: (config?: SimpleProductConfiguration) =>
      getSizeDimensions(config || state.configuration),

    // Actions
    updateConfiguration,
    updateQuantity,
    updateSize,
    updateTurnaround,
    refetch: fetchConfiguration,
  }
}