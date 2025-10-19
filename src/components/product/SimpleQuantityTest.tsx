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
}

export default function SimpleQuantityTest({
  productId,
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
    console.log(
      '[SimpleQuantityTest] useEffect triggered. initialConfiguration:',
      !!initialConfiguration
    )

    // If we have initial configuration from server, use it immediately
    if (initialConfiguration) {
      console.log('[SimpleQuantityTest] Using server-fetched configuration')
      console.log(
        '[SimpleQuantityTest] Quantities count:',
        initialConfiguration.quantities?.length || 0
      )
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
      console.log(
        '[SimpleQuantityTest] Configuration applied. Quantities state:',
        data.quantities?.length || 0
      )
      return // Don't fetch from API if we have server data
    } else {
      console.log('[SimpleQuantityTest] No initialConfiguration, will fetch from API')
    }

    // Fallback: Fetch from API if no initial configuration provided
    if (!productId) {
      console.error('[SimpleQuantityTest] useEffect - No product ID')
      setError('No product ID provided')
      setLoading(false)
      return
    }

    console.log('[SimpleQuantityTest] Fetching configuration from API (fallback)')
    let mounted = true
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.error('[SimpleQuantityTest] TIMEOUT - fetch took too long')
        setError('Request timed out after 10 seconds')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    async function fetchData() {
      try {
        console.log('[SimpleQuantityTest] START FETCH for product:', productId)

        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(`/api/products/${productId}/configuration`, {
          signal: controller.signal,
        })
        clearTimeout(fetchTimeout)

        console.log('[SimpleQuantityTest] Response received:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log('[SimpleQuantityTest] Data parsed successfully:', {
          quantities: data.quantities?.length,
          sizes: data.sizes?.length,
          paperStocks: data.paperStocks?.length,
        })

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

        console.log('[SimpleQuantityTest] State updated, setting loading to false')
        setLoading(false)
        clearTimeout(timeoutId)
      } catch (err) {
        if (!mounted) return

        console.error('[SimpleQuantityTest] FETCH ERROR:', err)
        setError(err instanceof Error ? err.message : 'Failed to load configuration')
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
    return <div className="p-4 text-gray-500">Loading quantities...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
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

    console.log('[calculateDesignPrice] Design option:', design)
    console.log('[calculateDesignPrice] Pricing type:', design.pricingType)
    console.log('[calculateDesignPrice] Base price:', design.basePrice)
    console.log('[calculateDesignPrice] Side one price:', design.sideOnePrice)
    console.log('[calculateDesignPrice] Side two price:', design.sideTwoPrice)
    console.log('[calculateDesignPrice] Selected design side:', selectedDesignSide)

    // FREE design option
    if (design.pricingType === 'FREE') {
      return 0
    }

    // FLAT pricing (single fixed price)
    if (design.pricingType === 'FLAT' && design.basePrice) {
      const price = design.basePrice
      console.log('[calculateDesignPrice] FLAT price:', price)
      return price
    }

    // SIDE_BASED pricing (different prices for side 1 and side 2)
    if (design.pricingType === 'SIDE_BASED') {
      if (selectedDesignSide === 'oneSide') {
        const price = design.sideOnePrice || 0
        console.log('[calculateDesignPrice] SIDE_BASED oneSide price:', price)
        return price
      } else if (selectedDesignSide === 'twoSides') {
        const price = design.sideTwoPrice || 0
        console.log('[calculateDesignPrice] SIDE_BASED twoSides price:', price)
        return price
      }
      console.log('[calculateDesignPrice] SIDE_BASED but no side selected')
      return 0 // No side selected yet
    }

    console.log('[calculateDesignPrice] No matching pricing type, returning 0')
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

    console.log('[calculateTotalPrice] Base price:', basePrice)
    console.log('[calculateTotalPrice] Addon price:', addonPrice)
    console.log('[calculateTotalPrice] Design price:', designPrice)
    console.log('[calculateTotalPrice] Selected turnaround:', selectedTurnaroundObj)

    // If no turnaround time selected, return base + addons + design
    if (!selectedTurnaroundObj) {
      const total = basePrice + addonPrice + designPrice
      console.log('[calculateTotalPrice] Total (no turnaround):', total)
      return total
    }

    // Add turnaround time pricing to base price, then add addons and design
    const total = calculateTurnaroundPrice(selectedTurnaroundObj) + addonPrice + designPrice
    console.log('[calculateTotalPrice] Total (with turnaround):', total)
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

  // Handle Add to Cart - Navigate to upload page instead of opening cart drawer
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
    }

    try {
      // Clear cart first (single product model)
      clearCart()
      // Add new item
      addItem(cartItem)
      toast.success('Product configured! Proceeding to upload artwork...')

      // Navigate to upload artwork page instead of opening cart drawer
      router.push('/cart/upload-artwork')
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div className="space-y-4">
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
          <SelectTrigger className="w-full mt-2">
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
            <SelectTrigger className="w-full mt-2">
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
            <SelectTrigger className="w-full mt-2 text-foreground">
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
            <SelectTrigger className="w-full mt-2 text-foreground">
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
                let price = calculateDesignPrice(option)

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
          <div className="space-y-2">
            {memoizedTurnaroundTimes.map((turnaround) => {
              const turnaroundPrice = calculateTurnaroundPrice(turnaround)
              return (
                <label
                  key={turnaround.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    checked={selectedTurnaround === turnaround.id}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
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
                      ${turnaroundPrice.toFixed(2)}
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
