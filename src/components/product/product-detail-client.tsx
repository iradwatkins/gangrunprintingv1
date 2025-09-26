'use client'

import { useState } from 'react'
import { ArrowLeft, Clock, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { ProductImageGallery } from './ProductImageGallery'
import ProductConfigurationForm from './ProductConfigurationForm'
import { PriceCalculator } from './PriceCalculator'
import { AddToCartSection } from './AddToCartSection'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { usePriceCalculation } from '@/hooks/usePriceCalculation'

interface ProductImage {
  id: string
  url: string
  thumbnailUrl?: string | null
  largeUrl?: string | null
  mediumUrl?: string | null
  webpUrl?: string | null
  blurDataUrl?: string | null
  alt?: string | null
  caption?: string | null
  isPrimary: boolean
  sortOrder: number
  width?: number | null
  height?: number | null
  fileSize?: number | null
  mimeType?: string | null
  createdAt?: Date
  updatedAt?: Date
  productId?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  basePrice: number
  setupFee: number
  productionTime: number
  isActive: boolean
  ProductCategory: {
    id: string
    name: string
  }
  ProductImage: ProductImage[]
  productPaperStockSets: Array<{
    paperStockSet: {
      id: string
      name: string
      description?: string
      paperStockItems: Array<{
        id: string
        paperStock: {
          id: string
          name: string
          description?: string
        }
        isDefault: boolean
        sortOrder: number
      }>
    }
    isDefault: boolean
  }>
  productQuantityGroups: Array<{
    quantityGroup: {
      id: string
      name: string
      values: string
      defaultValue: string
    }
  }>
  productSizeGroups: Array<{
    sizeGroup: {
      id: string
      name: string
      values: string
      defaultValue: string
    }
  }>
}

interface CustomerImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem, openCart } = useCart()

  // Legacy state management for backward compatibility with SimpleConfigurationForm
  const [productConfiguration, setProductConfiguration] = useState<any>(null)
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState<number>(product.basePrice)

  // Image upload management using new hook
  const imageUpload = useImageUpload({
    productId: product.id,
    onImagesChange: (images) => {
      // Update product configuration with uploaded files for backward compatibility
      if (productConfiguration) {
        const uploadedFiles = images.map(img => ({
          fileId: img.id,
          originalName: img.fileName,
          size: img.fileSize,
          mimeType: 'image/jpeg',
          thumbnailUrl: img.thumbnailUrl,
          uploadedAt: img.uploadedAt,
          isImage: true,
        }))
        setProductConfiguration({
          ...productConfiguration,
          uploadedFiles
        })
      }
    },
  })

  // Image upload handlers are now handled by the useImageUpload hook

  // Handle configuration changes from ProductConfigurationForm
  const handleConfigurationChange = (config: Record<string, unknown>, isComplete: boolean) => {
    setProductConfiguration(config)
    setIsConfigurationComplete(isComplete)
  }

  // Handle price changes from ProductConfigurationForm
  const handlePriceChange = (price: number) => {
    setCalculatedPrice(price)
  }

  // Add to cart logic is now handled by the AddToCartSection component

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        href="/products"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images - Now using optimized gallery */}
        <div>
          <ProductImageGallery
            enableLightbox={true}
            enableZoom={true}
            images={product.ProductImage}
            productCategory={product.ProductCategory.name}
            productName={product.name}
            showThumbnails={true}
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <Badge className="mb-2" variant="secondary">
              {product.ProductCategory.name}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {product.productionTime} business days
              </div>
            </div>
          </div>

          <Tabs className="mb-6" defaultValue="customize">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="customize">
              {/* Refactored Configuration Form with modular architecture */}
              <ProductConfigurationForm
                productId={product.id}
                basePrice={product.basePrice}
                setupFee={product.setupFee}
                onConfigurationChange={(config, isComplete) => {
                  handleConfigurationChange(config, isComplete)
                }}
                onPriceChange={(price) => {
                  handlePriceChange(price)
                }}
              />
            </TabsContent>

            <TabsContent className="space-y-4" value="specifications">
              <div>
                <h3 className="font-semibold mb-2">Product Specifications</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd>{product.ProductCategory.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Production Time:</dt>
                    <dd>{product.productionTime} business days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Setup Fee:</dt>
                    <dd>${product.setupFee.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Professional quality printing
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Free design review
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    100% satisfaction guarantee
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Fast turnaround times
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Price Display and Cart Button - Now using extracted components */}
          {productConfiguration && (
            <>
              <PriceCalculator
                configData={null} // Will be populated when we switch to new configuration
                configuration={productConfiguration}
                getQuantityValue={() => parseInt(productConfiguration.quantity) || 1}
                setupFee={product.setupFee}
                productionTime={product.productionTime}
              />

              <AddToCartSection
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  productionTime: product.productionTime,
                  images: product.ProductImage,
                }}
                configuration={productConfiguration}
                isConfigurationComplete={isConfigurationComplete}
                calculatedPrice={calculatedPrice}
                getQuantityValue={() => parseInt(productConfiguration.quantity) || 1}
                className="mt-4"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
