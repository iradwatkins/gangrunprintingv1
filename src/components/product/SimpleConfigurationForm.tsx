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
  defaults: {
    quantity: string
    size: string
    paper: string
    coating: string
    sides: string
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
  uploadedFiles: UploadedFile[]
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
    uploadedFiles: [],
  })

  // Fetch configuration data
  useEffect(() => {
    async function fetchConfiguration() {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching configuration for product:', productId)

        const response = await fetch(`/api/products/${productId}/configuration`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: SimpleConfigData = await response.json()
        console.log('Configuration data received:', data)

        setConfigData(data)

        // Set defaults
        setConfiguration({
          quantity: data.defaults.quantity || data.quantities[0]?.id || '',
          size: data.defaults.size || data.sizes[0]?.id || '',
          paper: data.defaults.paper || data.paperStocks[0]?.id || '',
          coating: data.defaults.coating || data.paperStocks[0]?.coatings[0]?.id || '',
          sides: data.defaults.sides || data.paperStocks[0]?.sides[0]?.id || '',
          uploadedFiles: [],
        })
      } catch (err) {
        console.error('Failed to fetch configuration:', err)
        setError(err instanceof Error ? err.message : 'Failed to load configuration')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchConfiguration()
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

    return quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier
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

      {/* Current Configuration Summary */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Configuration:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            Quantity: {configData.quantities.find(q => q.id === configuration.quantity)?.label || 'None'}
          </div>
          <div>
            Size: {configData.sizes.find(s => s.id === configuration.size)?.displayName || 'None'}
            {(() => {
              const selectedSize = configData.sizes.find(s => s.id === configuration.size)
              return selectedSize && selectedSize.priceMultiplier !== 1.0 && (
                <span className="ml-1 text-xs text-gray-500">
                  ({selectedSize.priceMultiplier.toFixed(1)}x)
                </span>
              )
            })()}
          </div>
          <div>
            Paper: {configData.paperStocks.find(p => p.id === configuration.paper)?.name || 'None'}
          </div>
          {configuration.paper && (() => {
            const selectedPaper = configData.paperStocks.find(p => p.id === configuration.paper)
            const selectedCoating = selectedPaper?.coatings.find(c => c.id === configuration.coating)
            const selectedSides = selectedPaper?.sides.find(s => s.id === configuration.sides)

            return (
              <>
                <div>
                  Coating: {selectedCoating?.name || 'None'}
                  {selectedCoating && selectedCoating.priceMultiplier !== 1.0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({selectedCoating.priceMultiplier > 1.0 ? '+' : ''}{((selectedCoating.priceMultiplier - 1) * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
                <div>
                  Sides: {selectedSides?.name || 'None'}
                  {selectedSides && selectedSides.priceMultiplier !== 1.0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({selectedSides.priceMultiplier > 1.0 ? '+' : ''}{((selectedSides.priceMultiplier - 1) * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              </>
            )
          })()}
          <div>
            Files: {configuration.uploadedFiles.length === 0
              ? 'No files uploaded'
              : `${configuration.uploadedFiles.length} file${configuration.uploadedFiles.length > 1 ? 's' : ''} uploaded`
            }
          </div>
          <div className="font-medium pt-2 border-t">
            Total Price: ${calculatePrice(configuration).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}