'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'
import toast from '@/lib/toast'

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

interface SimpleQuantityTestProps {
  productId: string
  product: ProductInfo
  initialConfiguration?: any // Pre-fetched configuration from server
}

export default function SimpleQuantityTest({ productId, product, initialConfiguration }: SimpleQuantityTestProps) {
  // Cart and routing hooks
  const { addItem, openCart, clearCart } = useCart()
  const router = useRouter()

  // State for configuration options
  const [quantities, setQuantities] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [paperStocks, setPaperStocks] = useState<any[]>([])
  const [turnaroundTimes, setTurnaroundTimes] = useState<any[]>([])
  const [selectedQuantity, setSelectedQuantity] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedPaper, setSelectedPaper] = useState('')
  const [selectedCoating, setSelectedCoating] = useState('')
  const [selectedSides, setSelectedSides] = useState('')
  const [selectedTurnaround, setSelectedTurnaround] = useState('')
  const [customQuantity, setCustomQuantity] = useState('')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [loading, setLoading] = useState(!initialConfiguration) // Start loaded if we have initial data
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('[SimpleQuantityTest] useEffect triggered. initialConfiguration:', !!initialConfiguration)

    // If we have initial configuration from server, use it immediately
    if (initialConfiguration) {
      console.log('[SimpleQuantityTest] Using server-fetched configuration')
      console.log('[SimpleQuantityTest] Quantities count:', initialConfiguration.quantities?.length || 0)
      const data = initialConfiguration

      setQuantities(data.quantities || [])
      setSizes(data.sizes || [])
      setPaperStocks(data.paperStocks || [])
      setTurnaroundTimes(data.turnaroundTimes || [])
      setSelectedQuantity(data.defaults?.quantity || data.quantities?.[0]?.id || '')
      setSelectedSize(data.defaults?.size || data.sizes?.[0]?.id || '')
      setSelectedPaper(data.defaults?.paper || data.paperStocks?.[0]?.id || '')
      setSelectedCoating(data.defaults?.coating || data.paperStocks?.[0]?.coatings?.[0]?.id || '')
      setSelectedSides(data.defaults?.sides || data.paperStocks?.[0]?.sides?.[0]?.id || '')
      setSelectedTurnaround(data.defaults?.turnaround || data.turnaroundTimes?.[0]?.id || '')

      setLoading(false)
      console.log('[SimpleQuantityTest] Configuration applied. Quantities state:', data.quantities?.length || 0)
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
        setSelectedQuantity(data.defaults?.quantity || data.quantities?.[0]?.id || '')
        setSelectedSize(data.defaults?.size || data.sizes?.[0]?.id || '')
        setSelectedPaper(data.defaults?.paper || data.paperStocks?.[0]?.id || '')
        setSelectedCoating(data.defaults?.coating || data.paperStocks?.[0]?.coatings?.[0]?.id || '')
        setSelectedSides(data.defaults?.sides || data.paperStocks?.[0]?.sides?.[0]?.id || '')
        setSelectedTurnaround(data.defaults?.turnaround || data.turnaroundTimes?.[0]?.id || '')

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
  const selectedQtyObj = memoizedQuantities.find(q => q.id === selectedQuantity)
  const isCustomQuantity = selectedQtyObj?.isCustom || false

  // Check if custom size is selected
  const selectedSizeObj = memoizedSizes.find(s => s.id === selectedSize)
  const isCustomSize = selectedSizeObj?.isCustom || false

  // Get selected paper stock and its options
  const selectedPaperObj = memoizedPaperStocks.find(p => p.id === selectedPaper)
  const availableCoatings = selectedPaperObj?.coatings || []
  const availableSides = selectedPaperObj?.sides || []

  // Get final quantity value
  const finalQuantity = isCustomQuantity && customQuantity ? parseInt(customQuantity) : selectedQtyObj?.value

  // Get final size dimensions
  const finalSize = isCustomSize && customWidth && customHeight
    ? `${customWidth}" × ${customHeight}"`
    : selectedSizeObj?.displayName || selectedSizeObj?.name

  // Get paper, coating, sides, turnaround names
  const finalPaper = selectedPaperObj?.name || 'Not set'
  const finalCoating = availableCoatings.find(c => c.id === selectedCoating)?.name || 'Not set'
  const finalSides = availableSides.find(s => s.id === selectedSides)?.name || 'Not set'
  const selectedTurnaroundObj = memoizedTurnaroundTimes.find(t => t.id === selectedTurnaround)
  const finalTurnaround = selectedTurnaroundObj
    ? `${selectedTurnaroundObj.displayName || selectedTurnaroundObj.name} (${selectedTurnaroundObj.daysMin}-${selectedTurnaroundObj.daysMax} days)`
    : 'Not set'

  // Calculate base price
  const calculatePrice = () => {
    // Safety check - return 0 if any required data is missing
    if (!finalQuantity || !selectedSizeObj || !selectedPaperObj) return 0

    try {
      const quantity = finalQuantity
      const squareInches = isCustomSize && customWidth && customHeight
        ? parseFloat(customWidth) * parseFloat(customHeight)
        : selectedSizeObj.squareInches || 0

      if (squareInches === 0) return 0

      const paperPricePerSqInch = selectedPaperObj.pricePerSqInch || 0.0005
      const coatingMultiplier = availableCoatings.find(c => c.id === selectedCoating)?.priceMultiplier || 1.0
      const sidesMultiplier = availableSides.find(s => s.id === selectedSides)?.priceMultiplier || 1.0

      // Base calculation: Quantity × Square Inches × Paper Price × Coating Multiplier × Sides Multiplier
      const basePrice = quantity * squareInches * paperPricePerSqInch * coatingMultiplier * sidesMultiplier

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
      // PERCENTAGE: Base + (Base × Multiplier)
      // Example: $100 base + ($100 × 0.3) = $130 (30% extra)
      return basePrice + (basePrice * (turnaround.priceMultiplier || 0))
    } else if (turnaround.pricingModel === 'CUSTOM') {
      // Custom model combines both: (Base + Percentage) + Flat Fee
      return basePrice + (basePrice * (turnaround.priceMultiplier || 0)) + (turnaround.basePrice || 0)
    }
    return basePrice
  }

  // Calculate TOTAL price including selected turnaround time
  const calculateTotalPrice = () => {
    const basePrice = calculatedPrice

    // If no turnaround time selected, just return base price
    if (!selectedTurnaroundObj) return basePrice

    // Add turnaround time pricing to base price
    return calculateTurnaroundPrice(selectedTurnaroundObj)
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

  // Handle Add to Cart
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
    const primaryImage = product.ProductImage.find(img => img.isPrimary)
    const imageUrl = primaryImage?.thumbnailUrl || primaryImage?.url || product.ProductImage[0]?.url || ''

    // Calculate dimensions for shipping
    const width = isCustomSize && customWidth ? parseFloat(customWidth) : (selectedSizeObj?.width || 8.5)
    const height = isCustomSize && customHeight ? parseFloat(customHeight) : (selectedSizeObj?.height || 11)
    const paperWeight = selectedPaperObj?.weight || selectedPaperObj?.pricePerSqInch || 0.0015 // Default to 0.0015 lbs per sq inch

    // Build cart item matching CartItem type
    const cartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: `${product.slug}-${selectedQuantity || customQuantity}-${Date.now()}`,
      price: totalPrice / (finalQuantity || 1), // Price PER UNIT (cart will multiply by quantity)
      quantity: finalQuantity || 1,
      turnaround: selectedTurnaroundObj ? {
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
      } : {
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
      toast.success('Product added to cart!')
      openCart()
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div className="space-y-4 p-4 border border-green-500 rounded">
      <div className="text-green-600 font-bold">✅ Configuration Loading!</div>

      {/* Quantity */}
      <div>
        <Label className="text-sm font-semibold uppercase">QUANTITY</Label>
        <Select value={selectedQuantity} onValueChange={(value) => {
          setSelectedQuantity(value)
          setCustomQuantity('') // Reset custom when changing selection
        }}>
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
              Enter custom quantity ({selectedQtyObj?.customMin || 0} - {selectedQtyObj?.customMax || 100000})
            </Label>
            <Input
              type="number"
              min={selectedQtyObj?.customMin || 0}
              max={selectedQtyObj?.customMax || 100000}
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* Size */}
      {memoizedSizes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase">SIZE</Label>
          <Select value={selectedSize} onValueChange={(value) => {
            setSelectedSize(value)
            setCustomWidth('')
            setCustomHeight('')
          }}>
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
                    type="number"
                    step="0.25"
                    min={selectedSizeObj?.customMinWidth || 0}
                    max={selectedSizeObj?.customMaxWidth || 100}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="Width"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    step="0.25"
                    min={selectedSizeObj?.customMinHeight || 0}
                    max={selectedSizeObj?.customMaxHeight || 100}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="Height"
                    className="mt-1"
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
          <Select value={selectedPaper} onValueChange={(value) => {
            setSelectedPaper(value)
            // Reset coating and sides when paper changes
            const newPaper = memoizedPaperStocks.find(p => p.id === value)
            setSelectedCoating(newPaper?.coatings?.[0]?.id || '')
            setSelectedSides(newPaper?.sides?.[0]?.id || '')
          }}>
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
              <SelectValue placeholder="Select coating" className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {availableCoatings.map((coating) => (
                <SelectItem key={coating.id} value={coating.id} className="text-foreground">
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
              <SelectValue placeholder="Select sides" className="text-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {availableSides.map((side) => (
                <SelectItem key={side.id} value={side.id} className="text-foreground">
                  {side.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    type="radio"
                    name="turnaround"
                    value={turnaround.id}
                    checked={selectedTurnaround === turnaround.id}
                    onChange={(e) => setSelectedTurnaround(e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{turnaround.displayName || turnaround.name}</div>
                    <div className="text-sm text-gray-600">
                      {turnaround.daysMin === turnaround.daysMax
                        ? `${turnaround.daysMin} business day${turnaround.daysMin > 1 ? 's' : ''}`
                        : `${turnaround.daysMin}-${turnaround.daysMax} business days`
                      }
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

      {/* Price Summary */}
      <div className="border-t-2 border-green-600 pt-4">
        <div className="text-lg font-bold text-green-700 mb-3">
          Total Price: ${totalPrice.toFixed(2)}
        </div>
        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded space-y-1">
          <div><strong>Quantity:</strong> {finalQuantity || 'Not set'}</div>
          <div><strong>Size:</strong> {finalSize || 'Not set'}</div>
          <div><strong>Paper:</strong> {finalPaper}</div>
          <div><strong>Coating:</strong> {finalCoating}</div>
          <div><strong>Sides:</strong> {finalSides}</div>
          <div><strong>Turnaround:</strong> {finalTurnaround}</div>
        </div>
      </div>

      {/* Add to Cart Button */}
      {isConfigurationComplete ? (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6"
          size="lg"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart - ${totalPrice.toFixed(2)}
        </Button>
      ) : (
        <div className="w-full p-4 text-center text-sm text-gray-500 bg-gray-100 rounded border border-gray-300">
          Please complete all configuration options above to add this product to your cart
        </div>
      )}
    </div>
  )
}
