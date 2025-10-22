'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'
import toast from '@/lib/toast'
import { AddonAccordion } from './addons/AddonAccordion'

interface ProductImage {
  id: string
  url: string
  thumbnailUrl?: string | null
  isPrimary: boolean
}

interface ProductInfo {
  id: string
  name: string
  slug: string
  productionTime: number
  ProductImage: ProductImage[]
}

interface Addon {
  id: string
  name: string
  description?: string
  priceType: 'FLAT' | 'PERCENTAGE' | 'CUSTOM'
  price: number
  pricePercentage?: number
  isRequired: boolean
  isMultiple: boolean
}

interface SimpleQuantityTestProps {
  productId: string
  product: ProductInfo
  initialConfiguration?: any // Pre-fetched configuration from server
  addons?: Addon[] // Optional addons to display
  onAddonChange?: (addonId: string, selected: boolean) => void
  uploadedFiles?: any[] // Artwork files uploaded by user
}

export default function SimpleQuantityTest({
  productId,
  uploadedFiles = [],
  product,
  initialConfiguration,
  addons = [],
  onAddonChange,
}: SimpleQuantityTestProps) {
  // Cart and routing hooks
  const { addItem, clearCart } = useCart()
  const router = useRouter()

  // State for configuration options
  const [quantities, setQuantities] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [paperStocks, setPaperStocks] = useState<any[]>([])
  const [turnaroundTimes, setTurnaroundTimes] = useState<any[]>([])
  const [addonsList, setAddonsList] = useState<any[]>([]) // Addons from API
  const [designOptions, setDesignOptions] = useState<any[]>([]) // Design options from API (flat array)
  const [selectedQuantity, setSelectedQuantity] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedPaper, setSelectedPaper] = useState('')
  const [selectedCoating, setSelectedCoating] = useState('')
  const [selectedSides, setSelectedSides] = useState('')
  const [selectedTurnaround, setSelectedTurnaround] = useState('')
  const [selectedDesignOption, setSelectedDesignOption] = useState('') // Selected design option
  const [selectedDesignSide, setSelectedDesignSide] = useState<'oneSide' | 'twoSides' | ''>('') // Selected side for design (Standard/Rush)
  const [customQuantity, setCustomQuantity] = useState('')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [loading, setLoading] = useState(!initialConfiguration) // Start loaded if we have initial data
  const [error, setError] = useState('')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]) // Track selected addon IDs

  useEffect(() => {

    // If we have initial configuration from server, use it immediately
    if (initialConfiguration) {
      const data = initialConfiguration

      setQuantities(data.quantities || [])
      setSizes(data.sizes || [])
      setPaperStocks(data.paperStocks || [])
      setTurnaroundTimes(data.turnaroundTimes || [])
      setAddonsList(data.addons || []) // Save addons from API
      setDesignOptions(data.designOptions || []) // Save design options from API (flat array)
      setSelectedQuantity(data.defaults?.quantity || data.quantities?.[0]?.id || '')
      setSelectedSize(data.defaults?.size || data.sizes?.[0]?.id || '')
      setSelectedPaper(data.defaults?.paper || data.paperStocks?.[0]?.id || '')
      setSelectedCoating(data.defaults?.coating || data.paperStocks?.[0]?.coatings?.[0]?.id || '')
      setSelectedSides(data.defaults?.sides || data.paperStocks?.[0]?.sides?.[0]?.id || '')
      setSelectedTurnaround(data.defaults?.turnaround || data.turnaroundTimes?.[0]?.id || '')
      // Set default design option (first one marked as default, or first in list)
      const defaultOption = data.designOptions?.find((opt: any) => opt.isDefault) || data.designOptions?.[0]
      setSelectedDesignOption(defaultOption?.id || '')

      setLoading(false)
      return // Don't fetch from API if we have server data
    } else {
    }

    // Fallback: Fetch from API if no initial configuration provided
    if (!productId) {
      console.error('[SimpleQuantityTest] useEffect - No product ID')
      setError('No product ID provided')
      setLoading(false)
      return
    }

    let mounted = true
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.error('[SimpleQuantityTest] TIMEOUT - fetch took too long')
        setError('Request timed out after 10 seconds. The server may be experiencing high load. Please try again.')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    async function fetchData() {
      try {

        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(`/api/products/${productId}/configuration`, {
          signal: controller.signal,
        })
        clearTimeout(fetchTimeout)


        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!mounted) return

        setQuantities(data.quantities || [])
        setSizes(data.sizes || [])
        setPaperStocks(data.paperStocks || [])
        setTurnaroundTimes(data.turnaroundTimes || [])
        setAddonsList(data.addons || []) // Save addons from API
        setDesignOptions(data.designOptions || []) // Save design options from API (flat array)
        setSelectedQuantity(data.defaults?.quantity || data.quantities?.[0]?.id || '')
        setSelectedSize(data.defaults?.size || data.sizes?.[0]?.id || '')
        setSelectedPaper(data.defaults?.paper || data.paperStocks?.[0]?.id || '')
        setSelectedCoating(data.defaults?.coating || data.paperStocks?.[0]?.coatings?.[0]?.id || '')
        setSelectedSides(data.defaults?.sides || data.paperStocks?.[0]?.sides?.[0]?.id || '')
        setSelectedTurnaround(data.defaults?.turnaround || data.turnaroundTimes?.[0]?.id || '')
        // Set default design option (first one marked as default, or first in list)
        const defaultOption = data.designOptions?.find((opt: any) => opt.isDefault) || data.designOptions?.[0]
        setSelectedDesignOption(defaultOption?.id || '')

        setLoading(false)
        clearTimeout(timeoutId)
      } catch (err) {
        if (!mounted) return

        console.error('[SimpleQuantityTest] FETCH ERROR:', err)

        // Provide more specific error messages
        let errorMessage = 'Failed to load product configuration'
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Request timed out. The server took too long to respond.'
          } else if (err.message.includes('HTTP')) {
            errorMessage = `Server error: ${err.message}. Please try again.`
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your internet connection.'
          } else {
            errorMessage = err.message
          }
        }

        setError(errorMessage)
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchData()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [productId, initialConfiguration])

  // Memoize data arrays to prevent them from triggering useEffect re-renders
  // These arrays are only set once during initial fetch and never change
  const memoizedQuantities = useMemo(() => quantities, [quantities.length])
  const memoizedSizes = useMemo(() => sizes, [sizes.length])
  const memoizedPaperStocks = useMemo(() => paperStocks, [paperStocks.length])
  const memoizedTurnaroundTimes = useMemo(() => turnaroundTimes, [turnaroundTimes.length])

  if (loading) {
    return <div className="p-4 text-gray-500" data-testid="product-configuration-loading">Loading quantities...</div>
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50" data-testid="product-configuration-error">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fillRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Unable to Load Product Configuration</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-2 text-xs text-red-600">
              {error.includes('timed out') && (
                <p>The server is taking longer than expected. This may be due to high traffic.</p>
              )}
              {error.includes('Network error') && (
                <p>Please check your internet connection and try again.</p>
              )}
              {error.includes('Server error') && (
                <p>Our server encountered an issue. Please try again in a moment.</p>
              )}
            </div>
            <button
              className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              data-testid="retry-button"
              onClick={() => {
                setError('')
                setLoading(true)
                window.location.reload()
              }}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (memoizedQuantities.length === 0) {
    return <div className="p-4 text-yellow-600">No quantities available</div>
  }

  // Check if custom quantity is selected
  const selectedQtyObj = memoizedQuantities.find((q) => q.id === selectedQuantity)
  const isCustomQuantity = selectedQtyObj?.isCustom || false

  // Check if custom size is selected
  const selectedSizeObj = memoizedSizes.find((s) => s.id === selectedSize)
  const isCustomSize = selectedSizeObj?.isCustom || false

  // Get selected paper stock and its options
  const selectedPaperObj = memoizedPaperStocks.find((p) => p.id === selectedPaper)
  const availableCoatings = selectedPaperObj?.coatings || []
  const availableSides = selectedPaperObj?.sides || []

  // Get final quantity value
  const finalQuantity =
    isCustomQuantity && customQuantity ? parseInt(customQuantity) : selectedQtyObj?.value

  // Get final size dimensions
  const finalSize =
    isCustomSize && customWidth && customHeight
      ? `${customWidth}" × ${customHeight}"`
      : selectedSizeObj?.displayName || selectedSizeObj?.name

  // Get paper, coating, sides, turnaround names
  const finalPaper = selectedPaperObj?.name || 'Not set'
  const finalCoating = availableCoatings.find((c) => c.id === selectedCoating)?.name || 'Not set'
  const finalSides = availableSides.find((s) => s.id === selectedSides)?.name || 'Not set'
  const selectedTurnaroundObj = memoizedTurnaroundTimes.find((t) => t.id === selectedTurnaround)
  const finalTurnaround = selectedTurnaroundObj
    ? `${selectedTurnaroundObj.displayName || selectedTurnaroundObj.name} (${selectedTurnaroundObj.daysMin}-${selectedTurnaroundObj.daysMax} days)`
    : 'Not set'

  // Calculate base price
  const calculatePrice = () => {
    // Safety check - return 0 if any required data is missing
    if (!finalQuantity || !selectedSizeObj || !selectedPaperObj) return 0

    try {
      const quantity = finalQuantity
      const squareInches =
        isCustomSize && customWidth && customHeight
          ? parseFloat(customWidth) * parseFloat(customHeight)
          : selectedSizeObj.squareInches || 0

      if (squareInches === 0) return 0

      const paperPricePerSqInch = selectedPaperObj.pricePerSqInch || 0.0005
      const coatingMultiplier =
        availableCoatings.find((c) => c.id === selectedCoating)?.priceMultiplier || 1.0
      const sidesMultiplier =
        availableSides.find((s) => s.id === selectedSides)?.priceMultiplier || 1.0

      // Base calculation: Quantity × Square Inches × Paper Price × Coating Multiplier × Sides Multiplier
      const basePrice =
        quantity * squareInches * paperPricePerSqInch * coatingMultiplier * sidesMultiplier

      return basePrice
    } catch (error) {
      console.error('[SimpleQuantityTest] Price calculation error:', error)
      return 0
    }
  }

  const calculatedPrice = calculatePrice()

  // Calculate price with turnaround time
  const calculateTurnaroundPrice = (turnaround: any) => {
    const basePrice = calculatedPrice
    if (basePrice === 0) return 0

    // Apply turnaround pricing based on model
    if (turnaround.pricingModel === 'FLAT') {
      return basePrice + (turnaround.basePrice || 0)
    } else if (turnaround.pricingModel === 'PERCENTAGE') {
      // PERCENTAGE: Base × Multiplier (NOT Base + Base × Multiplier)
      // Example: $100 base × 1.3 = $130 (30% markup total)
      // Database stores TOTAL multiplier: 1.1 (10%), 1.3 (30%), 1.5 (50%), 2.0 (100%)
      return basePrice * (turnaround.priceMultiplier || 1)
    } else if (turnaround.pricingModel === 'CUSTOM') {
      // Custom model: (Base × Multiplier) + Flat Fee
      return basePrice * (turnaround.priceMultiplier || 1) + (turnaround.basePrice || 0)
    }
    return basePrice
  }

  // Calculate addon prices
  const calculateAddonPrice = () => {
    if (selectedAddons.length === 0) return 0

    let addonTotal = 0
    const basePrice = calculatedPrice

    selectedAddons.forEach(addonId => {
      const addon = addonsList.find(a => a.id === addonId)
      if (!addon) return

      if (addon.pricingModel === 'FIXED_FEE') {
        addonTotal += addon.price || 0
      } else if (addon.pricingModel === 'PERCENTAGE') {
        addonTotal += basePrice * (addon.price || 0)
      }
    })

    return addonTotal
  }

  // Calculate design option price
  const calculateDesignPrice = (design: any) => {
    if (!design) return 0


    // FREE design option
    if (design.pricingType === 'FREE') {
      return 0
    }

    // FLAT pricing (single fixed price)
    if (design.pricingType === 'FLAT' && design.basePrice) {
      const price = design.basePrice
      return price
    }

    // SIDE_BASED pricing (different prices for side 1 and side 2)
    if (design.pricingType === 'SIDE_BASED') {
      if (selectedDesignSide === 'oneSide') {
        const price = design.sideOnePrice || 0
        return price
      } else if (selectedDesignSide === 'twoSides') {
        const price = design.sideTwoPrice || 0
        return price
      }
      return 0 // No side selected yet
    }

    return 0
  }

  // Calculate selected design price for total
  const getSelectedDesignPrice = () => {
    if (!selectedDesignOption) return 0

    // Find the option from flat designOptions array
    const selectedOption = designOptions.find((opt: any) => opt.id === selectedDesignOption)

    return calculateDesignPrice(selectedOption)
  }

  // Determine if current design option requires side selection
  const requiresSideSelection = () => {
    const selectedOption = designOptions.find((opt: any) => opt.id === selectedDesignOption)
    return selectedOption?.requiresSideSelection === true
  }

  // Handle design side selection (oneSide or twoSides)
  const handleDesignSideChange = (side: 'oneSide' | 'twoSides') => {
    setSelectedDesignSide(side)
  }

  // Calculate TOTAL price including selected turnaround time, addons, and design
  const calculateTotalPrice = () => {
    const basePrice = calculatedPrice
    const addonPrice = calculateAddonPrice()
    const designPrice = getSelectedDesignPrice()


    // If no turnaround time selected, return base + addons + design
    if (!selectedTurnaroundObj) {
      const total = basePrice + addonPrice + designPrice
      return total
    }

    // Add turnaround time pricing to base price, then add addons and design
    const total = calculateTurnaroundPrice(selectedTurnaroundObj) + addonPrice + designPrice
    return total
  }

  const totalPrice = calculateTotalPrice()

  // Check if configuration is complete
  const isConfigurationComplete = !!(
    (selectedQuantity || customQuantity) &&
    (selectedSize || (customWidth && customHeight)) &&
    selectedPaper &&
    selectedCoating &&
    selectedSides &&
    selectedTurnaround
  )

  // Handle Add to Cart - Navigate to /cart page instead of opening drawer
  const handleAddToCart = () => {
    if (!isConfigurationComplete) {
      toast.error('Please complete your product configuration')
      return
    }

    if (totalPrice <= 0) {
      toast.error('Invalid price calculation')
      return
    }

    // Get primary image
    const primaryImage = product.ProductImage.find((img) => img.isPrimary)
    const imageUrl =
      primaryImage?.thumbnailUrl || primaryImage?.url || product.ProductImage[0]?.url || ''

    // Calculate dimensions for shipping
    const width =
      isCustomSize && customWidth ? parseFloat(customWidth) : selectedSizeObj?.width || 8.5
    const height =
      isCustomSize && customHeight ? parseFloat(customHeight) : selectedSizeObj?.height || 11
    const paperWeight = selectedPaperObj?.weight || selectedPaperObj?.pricePerSqInch || 0.0015 // Default to 0.0015 lbs per sq inch

    // Build cart item matching CartItem type
    const cartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: `${product.slug}-${selectedQuantity || customQuantity}-${Date.now()}`,
      price: totalPrice / (finalQuantity || 1), // Price PER UNIT (cart will multiply by quantity)
      quantity: finalQuantity || 1,
      categoryId: product.ProductCategory?.id || undefined,
      categoryName: product.ProductCategory?.name || undefined,
      turnaround: selectedTurnaroundObj
        ? {
            id: selectedTurnaroundObj.id,
            name: selectedTurnaroundObj.name,
            displayName: selectedTurnaroundObj.displayName || selectedTurnaroundObj.name,
            description: selectedTurnaroundObj.description,
            daysMin: selectedTurnaroundObj.daysMin,
            daysMax: selectedTurnaroundObj.daysMax,
            pricingModel: selectedTurnaroundObj.pricingModel,
            basePrice: selectedTurnaroundObj.basePrice || 0,
            priceMultiplier: selectedTurnaroundObj.priceMultiplier || 1,
            requiresNoCoating: selectedTurnaroundObj.requiresNoCoating || false,
            restrictedCoatings: selectedTurnaroundObj.restrictedCoatings || [],
            totalPrice: totalPrice,
            pricePerUnit: totalPrice / (finalQuantity || 1),
          }
        : {
            id: '',
            name: 'Standard',
            displayName: 'Standard',
            daysMin: product.productionTime,
            pricingModel: 'FLAT' as const,
            basePrice: 0,
            priceMultiplier: 1,
            requiresNoCoating: false,
            restrictedCoatings: [],
            totalPrice: totalPrice,
            pricePerUnit: totalPrice / (finalQuantity || 1),
          },
      options: {
        size: finalSize || 'Not set',
        paperStock: finalPaper,
        paperStockId: selectedPaper,
        coating: finalCoating,
        sides: finalSides,
      },
      // Shipping calculation data
      dimensions: {
        width,
        height,
      },
      paperStockWeight: paperWeight,
      image: imageUrl,
      // Artwork files
      artworkFiles: uploadedFiles.map(file => ({
        id: file.id,
        name: file.file.name,
        preview: file.preview,
        url: file.url,
        type: file.file.type,
        size: file.file.size
      }))
    }

    try {
      // Add item to cart (supports multiple products)
      addItem(cartItem)
      toast.success('Product added to cart!')
      // Navigate to checkout page
      router.push('/checkout')
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div className="space-y-4" data-testid="product-configuration">
      {/* Quantity */}
      <div>
        <Label className="text-sm font-semibold uppercase">QUANTITY</Label>
        <Select
          value={selectedQuantity}
          onValueChange={(value) => {
            setSelectedQuantity(value)
            setCustomQuantity('') // Reset custom when changing selection
          }}
        >
          <SelectTrigger className="w-full mt-2" data-testid="quantity-select">
            <SelectValue placeholder="Select quantity" />
          </SelectTrigger>
          <SelectContent>
            {memoizedQuantities.map((qty) => (
              <SelectItem key={qty.id} value={qty.id}>
                {qty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Quantity Input */}
        {isCustomQuantity && (
          <div className="mt-2">
            <Label className="text-xs text-gray-600">
              Enter custom quantity ({selectedQtyObj?.customMin || 0} -{' '}
              {selectedQtyObj?.customMax || 100000})
            </Label>
            <Input
              className="mt-1"
              max={selectedQtyObj?.customMax || 100000}
              min={selectedQtyObj?.customMin || 0}
              placeholder="Enter quantity"
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Size */}
      {memoizedSizes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">SIZE</Label>
          <Select
            value={selectedSize}
            onValueChange={(value) => {
              setSelectedSize(value)
              setCustomWidth('')
              setCustomHeight('')
            }}
          >
            <SelectTrigger className="w-full mt-2" data-testid="size-select">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {memoizedSizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.displayName || size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Size Inputs */}
          {isCustomSize && (
            <div className="mt-2 space-y-2">
              <Label className="text-xs text-gray-600">Enter custom dimensions (inches)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    className="mt-1"
                    max={selectedSizeObj?.customMaxWidth || 100}
                    min={selectedSizeObj?.customMinWidth || 0}
                    placeholder="Width"
                    step="0.25"
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    className="mt-1"
                    max={selectedSizeObj?.customMaxHeight || 100}
                    min={selectedSizeObj?.customMinHeight || 0}
                    placeholder="Height"
                    step="0.25"
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paper Stock */}
      {memoizedPaperStocks.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">PAPER STOCK</Label>
          <Select
            data-testid="paper-stock-select"
            value={selectedPaper}
            onValueChange={(value) => {
              setSelectedPaper(value)
              // Reset coating and sides when paper changes
              const newPaper = memoizedPaperStocks.find((p) => p.id === value)
              setSelectedCoating(newPaper?.coatings?.[0]?.id || '')
              setSelectedSides(newPaper?.sides?.[0]?.id || '')
            }}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select paper stock" />
            </SelectTrigger>
            <SelectContent>
              {memoizedPaperStocks.map((paper) => (
                <SelectItem key={paper.id} value={paper.id}>
                  {paper.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Coating */}
      {availableCoatings.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">COATING</Label>
          <Select value={selectedCoating} onValueChange={setSelectedCoating}>
            <SelectTrigger className="w-full mt-2 text-foreground" data-testid="coating-select">
              <SelectValue className="text-foreground" placeholder="Select coating" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {availableCoatings.map((coating) => (
                <SelectItem key={coating.id} className="text-foreground" value={coating.id}>
                  {coating.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sides */}
      {availableSides.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">SIDES</Label>
          <Select value={selectedSides} onValueChange={setSelectedSides}>
            <SelectTrigger className="w-full mt-2 text-foreground" data-testid="sides-select">
              <SelectValue className="text-foreground" placeholder="Select sides" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {availableSides.map((side) => (
                <SelectItem key={side.id} className="text-foreground" value={side.id}>
                  {side.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Design Options - Single Dropdown */}
      {designOptions.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">DESIGN OPTIONS</Label>
          <Select
            value={selectedDesignOption}
            onValueChange={(value) => {
              setSelectedDesignOption(value)
              // Clear side selection if new option doesn't require it
              const newOption = designOptions.find((opt: any) => opt.id === value)
              if (!newOption?.requiresSideSelection) {
                setSelectedDesignSide('')
              }
            }}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select design option" />
            </SelectTrigger>
            <SelectContent>
              {designOptions.map((option: any) => {
                // Format label based on design option type - match exact specification
                let label = option.name
                const price = calculateDesignPrice(option)

                // Add price to Minor/Major changes in dropdown label
                if (option.id === 'design_minor_changes') {
                  label = 'Design Changes - Minor 25'
                } else if (option.id === 'design_major_changes') {
                  label = 'Design Changes - Major 75.00'
                }

                return (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{label}</span>
                      {/* Don't show price labels - all prices are either in option label or sub-dropdown */}
                      {option.id !== 'design_minor_changes' &&
                       option.id !== 'design_major_changes' &&
                       option.id !== 'design_standard' &&
                       option.id !== 'design_rush' &&
                       option.id !== 'design_upload_own' && (
                        <span className="ml-2 font-semibold text-primary">
                          {price > 0 ? `+$${price.toFixed(2)}` : 'FREE'}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {/* Side Selection Sub-Dropdown for Standard/Rush Custom Design */}
          {requiresSideSelection() && (
            <div className="ml-6 space-y-2 mt-3 p-3 border rounded-lg bg-gray-50">
              <Label className="text-sm font-medium">Select Sides *</Label>
              <Select
                value={selectedDesignSide}
                onValueChange={handleDesignSideChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose number of sides..." />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const selectedDesign = designOptions.find((d: any) => d.id === selectedDesignOption)
                    if (selectedDesign?.sideOptions) {
                      return (
                        <>
                          <SelectItem value="oneSide">
                            One Side Price ($) {selectedDesign.sideOptions.oneSide.price.toFixed(0)}
                          </SelectItem>
                          <SelectItem value="twoSides">
                            Two Sides Price ($) {selectedDesign.sideOptions.twoSides.price.toFixed(0)}
                          </SelectItem>
                        </>
                      )
                    }
                    return null
                  })()}
                </SelectContent>
              </Select>
              {!selectedDesignSide && (
                <p className="text-sm text-orange-600">
                  ⚠️ Please select the number of sides for your design
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Options & Add-ons - BEFORE turnaround */}
      {addonsList.length > 0 && (
        <div className="mt-6">
          <AddonAccordion
            addons={addonsList}
            disabled={false}
            selectedAddons={selectedAddons}
            onAddonChange={(newSelectedAddons: string[]) => {
              // Update local state for price calculation
              setSelectedAddons(newSelectedAddons)
            }}
          />
        </div>
      )}

      {/* Turnaround Time */}
      {memoizedTurnaroundTimes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase mb-3 block">TURNAROUND TIME</Label>
          <div className="space-y-2" data-testid="turnaround-select">
            {memoizedTurnaroundTimes.map((turnaround) => {
              const turnaroundPrice = calculateTurnaroundPrice(turnaround)
              const addonPrice = calculateAddonPrice()
              const designPrice = getSelectedDesignPrice()
              const totalWithAddonsAndDesign = turnaroundPrice + addonPrice + designPrice
              return (
                <label
                  key={turnaround.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    checked={selectedTurnaround === turnaround.id}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                    data-testid="turnaround-option"
                    name="turnaround"
                    type="radio"
                    value={turnaround.id}
                    onChange={(e) => setSelectedTurnaround(e.target.value)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{turnaround.displayName || turnaround.name}</div>
                    <div className="text-sm text-gray-600">
                      {turnaround.daysMin === turnaround.daysMax
                        ? `${turnaround.daysMin} business day${turnaround.daysMin > 1 ? 's' : ''}`
                        : `${turnaround.daysMin}-${turnaround.daysMax} business days`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-700">
                      ${totalWithAddonsAndDesign.toFixed(2)}
                    </div>
                    {turnaround.priceMultiplier !== 1 || turnaround.basePrice > 0 ? (
                      <div className="text-xs text-gray-500">
                        Base: ${calculatedPrice.toFixed(2)}
                      </div>
                    ) : null}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Price Display */}
      {isConfigurationComplete && (
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total Price:</span>
            <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Continue to Upload Button */}
      {isConfigurationComplete ? (
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-6"
          data-testid="add-to-cart-button"
          size="lg"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Continue to Upload Artwork
        </Button>
      ) : (
        <div className="w-full p-4 text-center text-sm text-muted-foreground bg-muted rounded border">
          Please complete all configuration options above to continue
        </div>
      )}
    </div>
  )
}
