'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSkeleton, ErrorState } from '@/components/common/loading'
import FileUploadZone from './FileUploadZone'
import AddonAccordionWithVariable from './AddonAccordionWithVariable'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'
import { validateCustomSize, calculateSquareInches } from '@/lib/utils/size-transformer'

// Simplified types
interface SimpleConfigData {
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
    price?: number
    priceDisplay?: string
    configuration?: {
      type?: string
      basePrice?: number
      pricePerPiece?: number
      displayPrice?: string
      [key: string]: any
    }
    isDefault?: boolean
    additionalTurnaroundDays?: number
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

interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  uploadedAt: string
  isImage: boolean
}

interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

interface SimpleProductConfiguration {
  quantity: string
  customQuantity?: number // For custom quantity input when "Custom" is selected
  size: string
  customWidth?: number // For custom width input when "Custom" size is selected
  customHeight?: number // For custom height input when "Custom" size is selected
  paper: string
  coating: string
  sides: string
  turnaround: string
  uploadedFiles: UploadedFile[]
  selectedAddons: string[]
  variableDataConfig?: VariableDataConfig // For Variable Data add-on
  perforationConfig?: PerforationConfig // For Perforation add-on
  bandingConfig?: BandingConfig // For Banding add-on
  cornerRoundingConfig?: CornerRoundingConfig // For Corner Rounding add-on
}

interface SimpleConfigurationFormProps {
  productId: string
  onConfigurationChange?: (config: SimpleProductConfiguration, price: number) => void
}

export default function SimpleConfigurationForm({
  productId,
  onConfigurationChange,
}: SimpleConfigurationFormProps) {
  const [configData, setConfigData] = useState<SimpleConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Custom quantity handling
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customQuantityInput, setCustomQuantityInput] = useState('')
  const [quantityError, setQuantityError] = useState('')

  // Custom size handling
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false)
  const [customWidthInput, setCustomWidthInput] = useState('')
  const [customHeightInput, setCustomHeightInput] = useState('')
  const [sizeError, setSizeError] = useState('')

  // Simple configuration state
  const [configuration, setConfiguration] = useState<SimpleProductConfiguration>({
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
  })

  // Fetch configuration data
  useEffect(() => {
    async function fetchConfiguration() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${productId}/configuration`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: SimpleConfigData = await response.json()

        setConfigData(data)

        // Set defaults
        const newConfig = {
          quantity: data.defaults.quantity || data.quantities[0]?.id || '',
          customQuantity: undefined,
          size: data.defaults.size || data.sizes[0]?.id || '',
          paper: data.defaults.paper || data.paperStocks[0]?.id || '',
          coating: data.defaults.coating || data.paperStocks[0]?.coatings[0]?.id || '',
          sides: data.defaults.sides || data.paperStocks[0]?.sides[0]?.id || '',
          turnaround: data.defaults.turnaround || data.turnaroundTimes[0]?.id || '',
          uploadedFiles: [],
          selectedAddons: data.defaults.addons || [],
        }
        setConfiguration(newConfig)
      } catch (err) {
        console.error('Configuration fetch error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration'
        setError(`Unable to load product configuration: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchConfiguration()
    } else {
    }
  }, [productId])

  // Helper function to get the actual quantity value (handles both regular and custom quantities)
  const getQuantityValue = (config: SimpleProductConfiguration): number => {
    // If Custom is selected and a custom value is provided, use it
    const selectedQuantity = configData?.quantities.find((q) => q.id === config.quantity)
    if (selectedQuantity?.isCustom && config.customQuantity !== undefined && config.customQuantity > 0) {
      return config.customQuantity
    }

    // Otherwise use the preset value
    return selectedQuantity?.value || 0
  }

  // Helper function to get the actual size dimensions (handles both regular and custom sizes)
  const getSizeDimensions = (config: SimpleProductConfiguration): { width: number; height: number; squareInches: number } => {
    const selectedSize = configData?.sizes.find((s) => s.id === config.size)

    if (selectedSize?.isCustom && config.customWidth && config.customHeight) {
      // Custom size selected with dimensions provided
      return {
        width: config.customWidth,
        height: config.customHeight,
        squareInches: config.customWidth * config.customHeight
      }
    }

    // Use preset size dimensions
    return {
      width: selectedSize?.width || 0,
      height: selectedSize?.height || 0,
      squareInches: selectedSize?.squareInches || 0
    }
  }

  // Calculate price
  const calculatePrice = (config: SimpleProductConfiguration): number => {
    if (!configData) return 0

    const quantityOption = configData.quantities.find((q) => q.id === config.quantity)
    const sizeOption = configData.sizes.find((s) => s.id === config.size)
    const paperOption = configData.paperStocks.find((p) => p.id === config.paper)

    if (!sizeOption || !paperOption) return 0

    // Find coating and sides options for the selected paper
    const coatingOption = paperOption.coatings.find((c) => c.id === config.coating)
    const sidesOption = paperOption.sides.find((s) => s.id === config.sides)

    if (!coatingOption || !sidesOption) return 0

    const quantity = getQuantityValue(config)
    const basePrice = paperOption.pricePerUnit

    // For custom sizes, calculate size multiplier based on square inches
    let sizeMultiplier = sizeOption.priceMultiplier
    if (sizeOption.isCustom && config.customWidth && config.customHeight) {
      const squareInches = config.customWidth * config.customHeight
      // Apply progressive pricing based on square inches
      if (squareInches <= 10) sizeMultiplier = 1.0
      else if (squareInches <= 25) sizeMultiplier = 1.2
      else if (squareInches <= 50) sizeMultiplier = 1.5
      else if (squareInches <= 100) sizeMultiplier = 2.0
      else sizeMultiplier = 2.5 + (squareInches - 100) * 0.01
    }

    const coatingMultiplier = coatingOption.priceMultiplier
    const sidesMultiplier = sidesOption.priceMultiplier

    // Calculate base product price
    const baseProductPrice =
      quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

    // Calculate addon costs
    let addonCosts = 0
    if (config.selectedAddons && config.selectedAddons.length > 0) {
      config.selectedAddons.forEach((addonId) => {
        const addon = configData.addons?.find((a) => a.id === addonId)
        if (addon) {
          // Skip Variable Data, Perforation, and Banding addons as they're handled separately
          if (addon.configuration?.type === 'variable_data' || addon.configuration?.type === 'perforation' || addon.configuration?.type === 'banding') {
            return
          }

          switch (addon.pricingModel) {
            case 'FIXED_FEE':
            case 'FLAT':
              addonCosts += addon.price || 0
              break
            case 'PERCENTAGE':
              addonCosts += baseProductPrice * (addon.price || 0)
              break
            case 'PER_UNIT':
              addonCosts += quantity * (addon.price || 0)
              break
          }
        }
      })
    }

    // Add Variable Data cost if enabled
    if (config.variableDataConfig?.enabled) {
      const variableDataCost = 60 + (0.02 * quantity)
      addonCosts += variableDataCost
    }

    // Add Perforation cost if enabled
    if (config.perforationConfig?.enabled) {
      const perforationCost = 20 + (0.01 * quantity)
      addonCosts += perforationCost
    }

    // Add Banding cost if enabled
    if (config.bandingConfig?.enabled && config.bandingConfig.itemsPerBundle > 0) {
      const numberOfBundles = Math.ceil(quantity / config.bandingConfig.itemsPerBundle)
      const bandingCost = numberOfBundles * 0.75
      addonCosts += bandingCost
    }

    // Add Corner Rounding cost if enabled
    if (config.cornerRoundingConfig?.enabled) {
      const cornerRoundingCost = 20 + (0.01 * quantity)
      addonCosts += cornerRoundingCost
    }

    const subtotalWithAddons = baseProductPrice + addonCosts

    // Calculate turnaround costs
    const turnaroundOption = configData.turnaroundTimes?.find((t) => t.id === config.turnaround)
    let finalPrice = subtotalWithAddons

    if (turnaroundOption) {
      switch (turnaroundOption.pricingModel) {
        case 'FLAT':
          finalPrice = subtotalWithAddons + turnaroundOption.basePrice
          break
        case 'PERCENTAGE':
          finalPrice = subtotalWithAddons * turnaroundOption.priceMultiplier
          break
        case 'PER_UNIT':
          finalPrice = subtotalWithAddons + quantity * turnaroundOption.basePrice
          break
        default:
          finalPrice = subtotalWithAddons
      }
    }

    return finalPrice
  }

  // Calculate base price without turnaround (for TurnaroundTimeSelector)
  const calculateBasePrice = (config: SimpleProductConfiguration): number => {
    if (!configData) return 0

    const quantityOption = configData.quantities.find((q) => q.id === config.quantity)
    const sizeOption = configData.sizes.find((s) => s.id === config.size)
    const paperOption = configData.paperStocks.find((p) => p.id === config.paper)

    if (!sizeOption || !paperOption) return 0

    // Find coating and sides options for the selected paper
    const coatingOption = paperOption.coatings.find((c) => c.id === config.coating)
    const sidesOption = paperOption.sides.find((s) => s.id === config.sides)

    if (!coatingOption || !sidesOption) return 0

    const quantity = getQuantityValue(config)
    const basePrice = paperOption.pricePerUnit

    // For custom sizes, calculate size multiplier based on square inches
    let sizeMultiplier = sizeOption.priceMultiplier
    if (sizeOption.isCustom && config.customWidth && config.customHeight) {
      const squareInches = config.customWidth * config.customHeight
      // Apply progressive pricing based on square inches
      if (squareInches <= 10) sizeMultiplier = 1.0
      else if (squareInches <= 25) sizeMultiplier = 1.2
      else if (squareInches <= 50) sizeMultiplier = 1.5
      else if (squareInches <= 100) sizeMultiplier = 2.0
      else sizeMultiplier = 2.5 + (squareInches - 100) * 0.01
    }

    const coatingMultiplier = coatingOption.priceMultiplier
    const sidesMultiplier = sidesOption.priceMultiplier

    // Calculate base product price
    const baseProductPrice =
      quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

    // Calculate addon costs
    let addonCosts = 0
    if (config.selectedAddons && config.selectedAddons.length > 0) {
      config.selectedAddons.forEach((addonId) => {
        const addon = configData.addons?.find((a) => a.id === addonId)
        if (addon) {
          // Skip Variable Data, Perforation, and Banding addons as they're handled separately
          if (addon.configuration?.type === 'variable_data' || addon.configuration?.type === 'perforation' || addon.configuration?.type === 'banding') {
            return
          }

          switch (addon.pricingModel) {
            case 'FIXED_FEE':
            case 'FLAT':
              addonCosts += addon.price || 0
              break
            case 'PERCENTAGE':
              addonCosts += baseProductPrice * (addon.price || 0)
              break
            case 'PER_UNIT':
              addonCosts += quantity * (addon.price || 0)
              break
          }
        }
      })
    }

    // Add Variable Data cost if enabled
    if (config.variableDataConfig?.enabled) {
      const variableDataCost = 60 + (0.02 * quantity)
      addonCosts += variableDataCost
    }

    // Add Perforation cost if enabled
    if (config.perforationConfig?.enabled) {
      const perforationCost = 20 + (0.01 * quantity)
      addonCosts += perforationCost
    }

    // Add Banding cost if enabled
    if (config.bandingConfig?.enabled && config.bandingConfig.itemsPerBundle > 0) {
      const numberOfBundles = Math.ceil(quantity / config.bandingConfig.itemsPerBundle)
      const bandingCost = numberOfBundles * 0.75
      addonCosts += bandingCost
    }

    // Add Corner Rounding cost if enabled
    if (config.cornerRoundingConfig?.enabled) {
      const cornerRoundingCost = 20 + (0.01 * quantity)
      addonCosts += cornerRoundingCost
    }

    return baseProductPrice + addonCosts
  }

  // Handle configuration changes
  const handleConfigurationChange = (field: keyof SimpleProductConfiguration, value: string | number) => {
    let newConfig = { ...configuration }

    if (field === 'customQuantity') {
      newConfig.customQuantity = typeof value === 'number' ? value : undefined
    } else {
      newConfig = { ...newConfig, [field]: value }
    }

    // If paper changed, reset coating and sides to defaults for that paper
    if (field === 'paper' && configData) {
      const selectedPaper = configData.paperStocks.find((p) => p.id === value)
      if (selectedPaper) {
        const defaultCoating =
          selectedPaper.coatings.find((c) => c.isDefault) || selectedPaper.coatings[0]
        const defaultSides = selectedPaper.sides.find((s) => s.isDefault) || selectedPaper.sides[0]

        newConfig = {
          ...newConfig,
          coating: defaultCoating?.id || '',
          sides: defaultSides?.id || '',
        }
      }
    }

    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle file uploads
  const handleFilesUploaded = (files: UploadedFile[]) => {
    const newConfig = { ...configuration, uploadedFiles: files }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle addon changes
  const handleAddonChange = (selectedAddonIds: string[]) => {
    const newConfig = { ...configuration, selectedAddons: selectedAddonIds }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle Variable Data changes
  const handleVariableDataChange = (variableData: VariableDataConfig) => {
    const newConfig = { ...configuration, variableDataConfig: variableData }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle Perforation changes
  const handlePerforationChange = (perforation: PerforationConfig) => {
    const newConfig = { ...configuration, perforationConfig: perforation }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle Banding changes
  const handleBandingChange = (banding: BandingConfig) => {
    const newConfig = { ...configuration, bandingConfig: banding }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle Corner Rounding changes
  const handleCornerRoundingChange = (cornerRounding: CornerRoundingConfig) => {
    const newConfig = { ...configuration, cornerRoundingConfig: cornerRounding }
    setConfiguration(newConfig)

    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Handle quantity selection (including custom quantities)
  const handleQuantityChange = (selectedQuantityId: string) => {
    // Find the selected quantity in the API response
    const selectedQuantity = configData?.quantities.find(q => q.id === selectedQuantityId)

    if (selectedQuantity?.isCustom) {
      // Show custom input field for Custom option
      setShowCustomInput(true)
      setQuantityError('')
      setCustomQuantityInput('')
      // Set the quantity ID but clear custom value until user enters it
      handleConfigurationChange('quantity', selectedQuantityId)
      handleConfigurationChange('customQuantity', undefined)
    } else {
      // Hide custom input and use standard quantity
      setShowCustomInput(false)
      setCustomQuantityInput('')
      setQuantityError('')
      handleConfigurationChange('quantity', selectedQuantityId)
      handleConfigurationChange('customQuantity', undefined)
    }
  }

  // Handle custom quantity input
  const handleCustomQuantityInput = (value: string) => {
    setCustomQuantityInput(value)
    setQuantityError('')

    const numValue = parseInt(value, 10)

    if (value === '' || isNaN(numValue)) {
      handleConfigurationChange('customQuantity', undefined)
      return
    }

    // Find current selected quantity option for validation
    const selectedQuantity = configData?.quantities.find(q => q.id === configuration.quantity)

    if (selectedQuantity?.isCustom) {
      // Validate against customMin and customMax
      const minValue = selectedQuantity.customMin || 55000
      const maxValue = selectedQuantity.customMax || 100000

      if (numValue < minValue) {
        setQuantityError(`Minimum quantity is ${minValue.toLocaleString()}`)
        handleConfigurationChange('customQuantity', undefined)
      } else if (numValue > maxValue) {
        setQuantityError(`Maximum quantity is ${maxValue.toLocaleString()}`)
        handleConfigurationChange('customQuantity', undefined)
      } else {
        // Valid custom quantity
        handleConfigurationChange('customQuantity', numValue)
      }
    }
  }

  // Handle size selection (including custom sizes)
  const handleSizeChange = (selectedSizeId: string) => {
    // Find the selected size in the API response
    const selectedSize = configData?.sizes.find(s => s.id === selectedSizeId)

    if (selectedSize?.isCustom) {
      // Show custom input fields for Custom option
      setShowCustomSizeInput(true)
      setSizeError('')
      setCustomWidthInput('')
      setCustomHeightInput('')
      // Set the size ID but clear custom values until user enters them
      handleConfigurationChange('size', selectedSizeId)
      handleConfigurationChange('customWidth', undefined)
      handleConfigurationChange('customHeight', undefined)
    } else {
      // Hide custom input and use standard size
      setShowCustomSizeInput(false)
      setCustomWidthInput('')
      setCustomHeightInput('')
      setSizeError('')
      handleConfigurationChange('size', selectedSizeId)
      handleConfigurationChange('customWidth', undefined)
      handleConfigurationChange('customHeight', undefined)
    }
  }

  // Handle custom width input
  const handleCustomWidthInput = (value: string) => {
    setCustomWidthInput(value)
    setSizeError('')

    const numValue = parseFloat(value)

    if (value === '' || isNaN(numValue)) {
      handleConfigurationChange('customWidth', undefined)
      return
    }

    // Find current selected size option for validation
    const selectedSize = configData?.sizes.find(s => s.id === configuration.size)

    if (selectedSize?.isCustom) {
      // Validate against customMinWidth and customMaxWidth
      const minWidth = selectedSize.customMinWidth || 1
      const maxWidth = selectedSize.customMaxWidth || 96

      if (numValue < minWidth) {
        setSizeError(`Minimum width is ${minWidth}" `)
        handleConfigurationChange('customWidth', undefined)
      } else if (numValue > maxWidth) {
        setSizeError(`Maximum width is ${maxWidth}"`)
        handleConfigurationChange('customWidth', undefined)
      } else {
        // Valid custom width
        handleConfigurationChange('customWidth', numValue)
      }
    }
  }

  // Handle custom height input
  const handleCustomHeightInput = (value: string) => {
    setCustomHeightInput(value)
    setSizeError('')

    const numValue = parseFloat(value)

    if (value === '' || isNaN(numValue)) {
      handleConfigurationChange('customHeight', undefined)
      return
    }

    // Find current selected size option for validation
    const selectedSize = configData?.sizes.find(s => s.id === configuration.size)

    if (selectedSize?.isCustom) {
      // Validate against customMinHeight and customMaxHeight
      const minHeight = selectedSize.customMinHeight || 1
      const maxHeight = selectedSize.customMaxHeight || 96

      if (numValue < minHeight) {
        setSizeError(`Minimum height is ${minHeight}"`)
        handleConfigurationChange('customHeight', undefined)
      } else if (numValue > maxHeight) {
        setSizeError(`Maximum height is ${maxHeight}"`)
        handleConfigurationChange('customHeight', undefined)
      } else {
        // Valid custom height
        handleConfigurationChange('customHeight', numValue)
      }
    }
  }

  // Handle turnaround changes
  const handleTurnaroundChange = (turnaroundId: string) => {
    if (!configData) return

    const selectedTurnaround = configData.turnaroundTimes.find((t) => t.id === turnaroundId)
    let newConfig = { ...configuration, turnaround: turnaroundId }

    // If turnaround requires no coating, force coating to "No Coating" if available
    if (selectedTurnaround?.requiresNoCoating) {
      const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paper)
      const noCoatingOption = selectedPaper?.coatings.find((c) => c.name === 'No Coating')
      if (noCoatingOption) {
        newConfig = { ...newConfig, coating: noCoatingOption.id }
      }
    }

    setConfiguration(newConfig)
    const price = calculatePrice(newConfig)
    onConfigurationChange?.(newConfig, price)
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton count={5} />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Configuration Error"
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // No data state
  if (!configData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No configuration data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quantity Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium" htmlFor="quantity">
          Quantity
        </Label>
        <Select
          value={configuration.quantity}
          onValueChange={handleQuantityChange}
        >
          <SelectTrigger id="quantity">
            <SelectValue placeholder="Select quantity" />
          </SelectTrigger>
          <SelectContent>
            {configData.quantities.map((quantity) => (
              <SelectItem key={quantity.id} value={quantity.id}>
                {quantity.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Quantity Input */}
        {showCustomInput && (
          <div className="space-y-2 mt-3">
            <Label className="text-sm font-medium text-gray-600" htmlFor="custom-quantity">
              Enter Custom Quantity
            </Label>
            <Input
              id="custom-quantity"
              type="number"
              placeholder="Enter quantity between 55,000 and 100,000..."
              value={customQuantityInput}
              onChange={(e) => handleCustomQuantityInput(e.target.value)}
              className={quantityError ? 'border-red-500' : ''}
            />
            {quantityError && (
              <p className="text-sm text-red-600">{quantityError}</p>
            )}
            {(() => {
              const selectedQuantity = configData?.quantities.find(q => q.id === configuration.quantity)
              return selectedQuantity?.isCustom && (selectedQuantity.customMin || selectedQuantity.customMax) && (
                <p className="text-xs text-gray-500">
                  {selectedQuantity.customMin && selectedQuantity.customMax
                    ? `Range: ${selectedQuantity.customMin.toLocaleString()} - ${selectedQuantity.customMax.toLocaleString()} units`
                    : selectedQuantity.customMin
                    ? `Minimum: ${selectedQuantity.customMin.toLocaleString()} units`
                    : selectedQuantity.customMax
                    ? `Maximum: ${selectedQuantity.customMax.toLocaleString()} units`
                    : null
                  }
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* Size Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium" htmlFor="size">
          Size
        </Label>
        <Select
          value={configuration.size}
          onValueChange={handleSizeChange}
        >
          <SelectTrigger id="size">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {configData.sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <div className="font-medium">{size.displayName}</div>
                    {size.isCustom && (
                      <div className="text-sm text-gray-500">Enter custom dimensions</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Size Input Fields */}
        {showCustomSizeInput && (
          <div className="space-y-3 mt-3 p-3 border rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-600">Enter Custom Dimensions (inches)</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600" htmlFor="custom-width">
                  Width
                </Label>
                <Input
                  id="custom-width"
                  type="number"
                  step="0.25"
                  placeholder="Width in inches"
                  value={customWidthInput}
                  onChange={(e) => handleCustomWidthInput(e.target.value)}
                  className={sizeError && sizeError.includes('width') ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600" htmlFor="custom-height">
                  Height
                </Label>
                <Input
                  id="custom-height"
                  type="number"
                  step="0.25"
                  placeholder="Height in inches"
                  value={customHeightInput}
                  onChange={(e) => handleCustomHeightInput(e.target.value)}
                  className={sizeError && sizeError.includes('height') ? 'border-red-500' : ''}
                />
              </div>
            </div>
            {sizeError && (
              <p className="text-sm text-red-600">{sizeError}</p>
            )}
            {configuration.customWidth && configuration.customHeight && (
              <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                <span className="font-medium">Custom Size:</span> {configuration.customWidth}" × {configuration.customHeight}"
                <span className="ml-2">({(configuration.customWidth * configuration.customHeight).toFixed(1)} sq in)</span>
              </div>
            )}
            {(() => {
              const selectedSize = configData?.sizes.find(s => s.id === configuration.size)
              return selectedSize?.isCustom && (selectedSize.customMinWidth || selectedSize.customMaxWidth) && (
                <p className="text-xs text-gray-500">
                  Dimensions range:
                  {selectedSize.customMinWidth && selectedSize.customMaxWidth
                    ? ` Width ${selectedSize.customMinWidth}"-${selectedSize.customMaxWidth}", Height ${selectedSize.customMinHeight}"-${selectedSize.customMaxHeight}"`
                    : ' Contact for custom size limits'
                  }
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* Paper Stock Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium" htmlFor="paper">
          Paper Stock
        </Label>
        <Select
          value={configuration.paper}
          onValueChange={(value) => handleConfigurationChange('paper', value)}
        >
          <SelectTrigger id="paper">
            <SelectValue placeholder="Select paper stock" />
          </SelectTrigger>
          <SelectContent>
            {configData.paperStocks.map((paper) => (
              <SelectItem key={paper.id} value={paper.id}>
                <div>
                  <div className="font-medium">{paper.name}</div>
                  <div className="text-sm text-gray-500">{paper.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coating Selection */}
      {configuration.paper &&
        (() => {
          const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paper)
          return (
            selectedPaper && (
              <div className="space-y-2">
                <Label className="text-base font-medium" htmlFor="coating">
                  Coating
                </Label>
                <Select
                  value={configuration.coating}
                  onValueChange={(value) => handleConfigurationChange('coating', value)}
                >
                  <SelectTrigger id="coating">
                    <SelectValue placeholder="Select coating" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPaper.coatings.map((coating) => (
                      <SelectItem key={coating.id} value={coating.id}>
                        {coating.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          )
        })()}

      {/* Sides Selection */}
      {configuration.paper &&
        (() => {
          const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paper)
          return (
            selectedPaper && (
              <div className="space-y-2">
                <Label className="text-base font-medium" htmlFor="sides">
                  Sides
                </Label>
                <Select
                  value={configuration.sides}
                  onValueChange={(value) => handleConfigurationChange('sides', value)}
                >
                  <SelectTrigger id="sides">
                    <SelectValue placeholder="Select sides" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPaper.sides.map((sides) => (
                      <SelectItem key={sides.id} value={sides.id}>
                        {sides.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          )
        })()}

      {/* File Upload Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Upload Your Design Files</Label>
        <FileUploadZone
          maxFiles={5}
          maxFileSize={10}
          maxTotalSize={50}
          onFilesUploaded={handleFilesUploaded}
        />
      </div>

      {/* Add-ons & Upgrades Section (includes Variable Data) */}
      <AddonAccordionWithVariable
        addons={configData.addons || []}
        disabled={loading}
        selectedAddons={configuration.selectedAddons}
        onAddonChange={handleAddonChange}
        variableDataConfig={configuration.variableDataConfig}
        onVariableDataChange={handleVariableDataChange}
        perforationConfig={configuration.perforationConfig}
        onPerforationChange={handlePerforationChange}
        bandingConfig={configuration.bandingConfig}
        onBandingChange={handleBandingChange}
        cornerRoundingConfig={configuration.cornerRoundingConfig}
        onCornerRoundingChange={handleCornerRoundingChange}
        quantity={getQuantityValue(configuration)}
      />

      {/* Turnaround Time Selection */}
      <TurnaroundTimeSelector
        baseProductPrice={calculateBasePrice(configuration)}
        currentCoating={configuration.coating}
        disabled={loading}
        quantity={getQuantityValue(configuration) || 1}
        selectedTurnaroundId={configuration.turnaround}
        turnaroundTimes={configData?.turnaroundTimes || []}
        onTurnaroundChange={handleTurnaroundChange}
      />
    </div>
  )
}
