'use client'

import { useState } from 'react'
import { ArrowLeft, Upload, ShoppingCart, Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import { ProductImageGallery } from './ProductImageGallery'
import SimpleConfigurationForm from './SimpleConfigurationForm'

interface ProductImage {
  id: string
  url: string
  thumbnailUrl?: string
  largeUrl?: string
  mediumUrl?: string
  webpUrl?: string
  blurDataUrl?: string
  alt?: string
  caption?: string
  isPrimary: boolean
  sortOrder: number
  width?: number
  height?: number
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

  // Product configuration state - now managed by ProductConfigurationForm
  const [productConfiguration, setProductConfiguration] = useState<any>(null)
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState<number>(product.basePrice)

  // Customer image upload state
  const [customerImages, setCustomerImages] = useState<CustomerImage[]>([])
  const [uploadingImages, setUploadingImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Handle customer image upload
  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return

    setIsUploading(true)
    setUploadingImages([...uploadingImages, ...files])

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('productId', product.id)
        formData.append('isCustomerUpload', 'true')

        const response = await fetch('/api/products/upload-customer-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error('Upload failed')
        }

        const data = await response.json()

        setCustomerImages((prev) => [
          ...prev,
          {
            id: data.id,
            url: data.url,
            thumbnailUrl: data.thumbnailUrl,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          },
        ])

        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setUploadingImages([])
    setIsUploading(false)
  }

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/customer-images?imageId=${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setCustomerImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image deleted successfully')
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  // Handle configuration changes from ProductConfigurationForm
  const handleConfigurationChange = (config: Record<string, unknown>, isComplete: boolean) => {
    setProductConfiguration(config)
    setIsConfigurationComplete(isComplete)
  }

  // Handle price changes from ProductConfigurationForm
  const handlePriceChange = (price: number) => {
    setCalculatedPrice(price)
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (
      !productConfiguration ||
      !productConfiguration.uploadedFiles ||
      productConfiguration.uploadedFiles.length === 0
    ) {
      toast.error('Please upload your design file')
      return
    }

    if (!isConfigurationComplete || !productConfiguration) {
      toast.error('Please complete your product configuration')
      return
    }

    const uploadedFile = productConfiguration.uploadedFiles[0]

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: `${product.slug}-${productConfiguration.paper}-${productConfiguration.quantity}`,
      price: calculatedPrice,
      quantity: parseInt(productConfiguration.quantity) || 1,
      turnaround: `${product.productionTime} business days`,
      options: {
        size: productConfiguration.size || 'Standard',
        paperStock: productConfiguration.paper,
        paperStockId: productConfiguration.paper,
        sides: productConfiguration.sides,
        coating: productConfiguration.coating,
      },
      fileUrl: uploadedFile?.thumbnailUrl || '',
      fileName: uploadedFile?.originalName || '',
      fileSize: uploadedFile?.size || 0,
      image:
        product.ProductImage.find((img) => img.isPrimary)?.thumbnailUrl ||
        product.ProductImage[0]?.thumbnailUrl ||
        product.ProductImage[0]?.url,
    })

    toast.success('Product added to cart!')
    openCart()
  }

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
              {/* Simple Configuration Form - Already includes turnaround times, add-ons, and file upload in correct order */}
              <SimpleConfigurationForm
                productId={product.id}
                onConfigurationChange={(config, price) => {
                  handleConfigurationChange(config, true)
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

          {/* Price Display and Cart Button */}
          <div className="border-t pt-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground">Total Price</span>
                <p className="text-3xl font-bold">${calculatedPrice.toFixed(2)}</p>
                {product.setupFee > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Includes ${product.setupFee.toFixed(2)} setup fee
                  </p>
                )}
              </div>
              <Badge className="mb-1" variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {product.productionTime} days
              </Badge>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full"
              disabled={!productConfiguration?.uploadedFiles?.length || !isConfigurationComplete}
              size="lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {!productConfiguration?.uploadedFiles?.length && (
              <p className="text-sm text-destructive text-center mt-2">
                Please upload your design file before adding to cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
