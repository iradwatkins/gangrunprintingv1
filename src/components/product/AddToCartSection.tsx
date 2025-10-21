'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import type { SimpleProductConfiguration, UploadedFile } from '@/hooks/useProductConfiguration'

interface ProductInfo {
  id: string
  name: string
  slug: string
  productionTime: number
  images: Array<{
    isPrimary: boolean
    thumbnailUrl?: string | null
    url: string
  }>
}

interface AddToCartSectionProps {
  product: ProductInfo
  configuration: SimpleProductConfiguration
  isConfigurationComplete: boolean
  calculatedPrice: number
  getQuantityValue: (config: SimpleProductConfiguration) => number
  className?: string
}

export function AddToCartSection({
  product,
  configuration,
  isConfigurationComplete,
  calculatedPrice,
  getQuantityValue,
  className = '',
}: AddToCartSectionProps) {
  const { addItem } = useCart()

  const quantity = getQuantityValue(configuration)

  const handleAddToCart = () => {
    // Validation - only check configuration completeness
    if (!isConfigurationComplete) {
      toast.error('Please complete your product configuration')
      return
    }

    if (quantity <= 0) {
      toast.error('Please select a valid quantity')
      return
    }

    // Build cart item WITHOUT file upload requirement
    const cartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: generateSku(product.slug, configuration),
      price: calculatedPrice,
      quantity: quantity,
      turnaround: `${product.productionTime} business days`,
      options: {
        size: getSelectedOptionName(configuration.size, 'size'),
        paperStock: getSelectedOptionName(configuration.paper, 'paper'),
        paperStockId: configuration.paper,
        sides: getSelectedOptionName(configuration.sides, 'sides'),
        coating: getSelectedOptionName(configuration.coating, 'coating'),
        turnaround: getSelectedOptionName(configuration.turnaround, 'turnaround'),
        addons: configuration.selectedAddons,
        customDimensions:
          configuration.customWidth && configuration.customHeight
            ? `${configuration.customWidth}" × ${configuration.customHeight}"`
            : undefined,
      },
      image: getPrimaryImage(product.images),
    }

    try {
      addItem(cartItem)
      toast.success('Product added to cart!')
      // Cart drawer will auto-open from context
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Add to cart error:', error)
    }
  }

  const generateSku = (productSlug: string, config: SimpleProductConfiguration): string => {
    const parts = [
      productSlug,
      config.paper?.slice(0, 8) || 'paper',
      config.size?.slice(0, 8) || 'size',
      quantity.toString(),
    ]
    return parts.join('-')
  }

  const getSelectedOptionName = (optionId: string, type: string): string => {
    // This would ideally use the configData to get proper names
    // For now, return the ID as fallback
    return optionId || `Unknown ${type}`
  }

  const getPrimaryImage = (images: ProductInfo['images']): string => {
    const primary = images.find((img) => img.isPrimary)
    if (primary?.thumbnailUrl) return primary.thumbnailUrl
    if (primary?.url) return primary.url
    if (images[0]?.thumbnailUrl) return images[0].thumbnailUrl
    if (images[0]?.url) return images[0].url
    return ''
  }

  return (
    <div className={className}>
      {/* Add to Cart Button */}
      <Button
        className="w-full"
        disabled={!isConfigurationComplete || quantity <= 0}
        size="lg"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart - ${calculatedPrice.toFixed(2)}
      </Button>

      {/* Validation Messages */}
      <div className="mt-2 space-y-1">
        {!isConfigurationComplete && (
          <p className="text-sm text-destructive text-center">
            Please complete your product configuration
          </p>
        )}
        {quantity <= 0 && (
          <p className="text-sm text-destructive text-center">Please select a valid quantity</p>
        )}
        {isConfigurationComplete && quantity > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Review cart, select shipping, and proceed to checkout
          </p>
        )}
      </div>
    </div>
  )
}
