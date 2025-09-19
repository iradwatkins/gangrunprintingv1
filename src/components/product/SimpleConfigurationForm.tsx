'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FileUploadZone from './FileUploadZone'
import AddonAccordion from './AddonAccordion'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'

// Simplified types
interface SimpleConfigData {
  quantities: Array<{
    id: string
    value: number
    label: string
  }>
  sizes: Array<{
    id: string
    name: string
    displayName: string
    width: number
    height: number
    squareInches: number
    priceMultiplier: number
    isDefault: boolean
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
    pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT'
    price: number
    priceDisplay: string
    isDefault: boolean
    additionalTurnaroundDays: number
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

interface SimpleProductConfiguration {
  quantity: string
  size: string
  paper: string
  coating: string
  sides: string
  turnaround: string
  uploadedFiles: UploadedFile[]
  selectedAddons: string[]
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

  // Simple configuration state
  const [configuration, setConfiguration] = useState<SimpleProductConfiguration>({
    quantity: '',
    size: '',
    paper: '',
    coating: '',
    sides: '',
    turnaround: '',
    uploadedFiles: [],
    selectedAddons: [],
  })

  // Fetch configuration data
  useEffect(() => {
    console.log('🔄 SimpleConfigurationForm useEffect triggered with productId:', productId)
    console.log('🔄 productId type:', typeof productId)
    console.log('🔄 productId truthy:', !!productId)

    async function fetchConfiguration() {
      try {
        setLoading(true)
        setError(null)
        console.log('📡 Starting fetch for productId:', productId)

        const response = await fetch(`/api/products/${productId}/configuration`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response ok:', response.ok)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: SimpleConfigData = await response.json()
        console.log('✅ Configuration data received:', data)
        console.log('✅ Turnaround times count:', data.turnaroundTimes?.length || 0)
        console.log('✅ Add-ons count:', data.addons?.length || 0)

        setConfigData(data)

        // Set defaults
        const newConfig = {
          quantity: data.defaults.quantity || data.quantities[0]?.id || '',
          size: data.defaults.size || data.sizes[0]?.id || '',
          paper: data.defaults.paper || data.paperStocks[0]?.id || '',
          coating: data.defaults.coating || data.paperStocks[0]?.coatings[0]?.id || '',
          sides: data.defaults.sides || data.paperStocks[0]?.sides[0]?.id || '',
          turnaround: data.defaults.turnaround || data.turnaroundTimes[0]?.id || '',
          uploadedFiles: [],
          selectedAddons: data.defaults.addons || [],
        }
        console.log('✅ Setting default configuration:', newConfig)
        setConfiguration(newConfig)
      } catch (err) {
        console.error('❌ Failed to fetch configuration:', err)
        setError(err instanceof Error ? err.message : 'Failed to load configuration')
      } finally {
        console.log('🏁 Setting loading to false')
        setLoading(false)
      }
    }

    if (productId) {
      console.log('✅ ProductId exists, starting fetch...')
      fetchConfiguration()
    } else {
      console.log('❌ ProductId is missing, skipping fetch')
      console.log('❌ ProductId value:', productId)
    }
  }, [productId])

  // Calculate price
  const calculatePrice = (config: SimpleProductConfiguration): number => {
    if (!configData) return 0

    const quantityOption = configData.quantities.find(q => q.id === config.quantity)
    const sizeOption = configData.sizes.find(s => s.id === config.size)
    const paperOption = configData.paperStocks.find(p => p.id === config.paper)

    if (!quantityOption || !sizeOption || !paperOption) return 0

    // Find coating and sides options for the selected paper
    const coatingOption = paperOption.coatings.find(c => c.id === config.coating)
    const sidesOption = paperOption.sides.find(s => s.id === config.sides)

    if (!coatingOption || !sidesOption) return 0

    const quantity = quantityOption.value
    const basePrice = paperOption.pricePerUnit
    const sizeMultiplier = sizeOption.priceMultiplier
    const coatingMultiplier = coatingOption.priceMultiplier
    const sidesMultiplier = sidesOption.priceMultiplier

    // Calculate base product price
    const baseProductPrice = quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

    // Calculate addon costs
    let addonCosts = 0
    if (config.selectedAddons && config.selectedAddons.length > 0) {
      config.selectedAddons.forEach(addonId => {
        const addon = configData.addons?.find(a => a.id === addonId)
        if (addon) {
          switch (addon.pricingModel) {
            case 'FIXED_FEE':
              addonCosts += addon.price
              break
            case 'PERCENTAGE':
              addonCosts += baseProductPrice * addon.price
              break
            case 'PER_UNIT':
              addonCosts += quantity * addon.price
              break
          }
        }
      })
    }

    const subtotalWithAddons = baseProductPrice + addonCosts

    // Calculate turnaround costs
    const turnaroundOption = configData.turnaroundTimes?.find(t => t.id === config.turnaround)
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
          finalPrice = subtotalWithAddons + (quantity * turnaroundOption.basePrice)
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

    const quantityOption = configData.quantities.find(q => q.id === config.quantity)
    const sizeOption = configData.sizes.find(s => s.id === config.size)
    const paperOption = configData.paperStocks.find(p => p.id === config.paper)

    if (!quantityOption || !sizeOption || !paperOption) return 0

    // Find coating and sides options for the selected paper
    const coatingOption = paperOption.coatings.find(c => c.id === config.coating)
    const sidesOption = paperOption.sides.find(s => s.id === config.sides)

    if (!coatingOption || !sidesOption) return 0

    const quantity = quantityOption.value
    const basePrice = paperOption.pricePerUnit
    const sizeMultiplier = sizeOption.priceMultiplier
    const coatingMultiplier = coatingOption.priceMultiplier
    const sidesMultiplier = sidesOption.priceMultiplier

    // Calculate base product price
    const baseProductPrice = quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

    // Calculate addon costs
    let addonCosts = 0
    if (config.selectedAddons && config.selectedAddons.length > 0) {
      config.selectedAddons.forEach(addonId => {
        const addon = configData.addons?.find(a => a.id === addonId)
        if (addon) {
          switch (addon.pricingModel) {
            case 'FIXED_FEE':
              addonCosts += addon.price
              break
            case 'PERCENTAGE':
              addonCosts += baseProductPrice * addon.price
              break
            case 'PER_UNIT':
              addonCosts += quantity * addon.price
              break
          }
        }
      })
    }

    return baseProductPrice + addonCosts
  }

  // Handle configuration changes
  const handleConfigurationChange = (field: keyof SimpleProductConfiguration, value: string) => {
    let newConfig = { ...configuration, [field]: value }

    // If paper changed, reset coating and sides to defaults for that paper
    if (field === 'paper' && configData) {
      const selectedPaper = configData.paperStocks.find(p => p.id === value)
      if (selectedPaper) {
        const defaultCoating = selectedPaper.coatings.find(c => c.isDefault) || selectedPaper.coatings[0]
        const defaultSides = selectedPaper.sides.find(s => s.isDefault) || selectedPaper.sides[0]

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

  // Handle turnaround changes
  const handleTurnaroundChange = (turnaroundId: string) => {
    if (!configData) return

    const selectedTurnaround = configData.turnaroundTimes.find(t => t.id === turnaroundId)
    let newConfig = { ...configuration, turnaround: turnaroundId }

    // If turnaround requires no coating, force coating to "No Coating" if available
    if (selectedTurnaround?.requiresNoCoating) {
      const selectedPaper = configData.paperStocks.find(p => p.id === configuration.paper)
      const noCoatingOption = selectedPaper?.coatings.find(c => c.name === 'No Coating')
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <h3 className="text-sm font-medium text-red-800 mb-1">Configuration Error</h3>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-800 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
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
        <Label htmlFor="quantity" className="text-base font-medium">
          Quantity
        </Label>
        <Select
          value={configuration.quantity}
          onValueChange={(value) => handleConfigurationChange('quantity', value)}
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
      </div>

      {/* Size Selection */}
      <div className="space-y-2">
        <Label htmlFor="size" className="text-base font-medium">
          Size
        </Label>
        <Select
          value={configuration.size}
          onValueChange={(value) => handleConfigurationChange('size', value)}
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
                    <div className="text-sm text-gray-500">{size.squareInches} sq in</div>
                  </div>
                  {size.priceMultiplier !== 1.0 && (
                    <span className="text-sm text-gray-500 ml-4">
                      {size.priceMultiplier > 1.0 ? `${size.priceMultiplier.toFixed(1)}x` : `${size.priceMultiplier.toFixed(2)}x`}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Paper Stock Selection */}
      <div className="space-y-2">
        <Label htmlFor="paper" className="text-base font-medium">
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
      {configuration.paper && (() => {
        const selectedPaper = configData.paperStocks.find(p => p.id === configuration.paper)
        return selectedPaper && (
          <div className="space-y-2">
            <Label htmlFor="coating" className="text-base font-medium">
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
                    <div className="flex justify-between items-center w-full">
                      <span>{coating.name}</span>
                      {coating.priceMultiplier !== 1.0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          {coating.priceMultiplier > 1.0 ? '+' : ''}{((coating.priceMultiplier - 1) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })()}

      {/* Sides Selection */}
      {configuration.paper && (() => {
        const selectedPaper = configData.paperStocks.find(p => p.id === configuration.paper)
        return selectedPaper && (
          <div className="space-y-2">
            <Label htmlFor="sides" className="text-base font-medium">
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
                    <div className="flex justify-between items-center w-full">
                      <span>{sides.name}</span>
                      {sides.priceMultiplier !== 1.0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          {sides.priceMultiplier > 1.0 ? '+' : ''}{((sides.priceMultiplier - 1) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })()}

      {/* File Upload Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Upload Your Design Files
        </Label>
        <FileUploadZone
          onFilesUploaded={handleFilesUploaded}
          maxFiles={5}
          maxFileSize={10}
          maxTotalSize={50}
        />
      </div>

      {/* Add-ons & Upgrades Section */}
      <AddonAccordion
        addons={configData.addons || []}
        selectedAddons={configuration.selectedAddons}
        onAddonChange={handleAddonChange}
        disabled={loading}
      />

      {/* Turnaround Time Selection */}
      <TurnaroundTimeSelector
        turnaroundTimes={configData.turnaroundTimes || []}
        selectedTurnaroundId={configuration.turnaround}
        onTurnaroundChange={handleTurnaroundChange}
        baseProductPrice={calculateBasePrice(configuration)}
        quantity={configData.quantities.find(q => q.id === configuration.quantity)?.value || 1}
        currentCoating={configuration.coating}
        disabled={loading}
      />
    </div>
  )
}