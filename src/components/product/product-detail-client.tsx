'use client'

import { useState } from 'react'
import { ArrowLeft, Upload, ShoppingCart, Clock, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import { ProductImageGallery } from './ProductImageGallery'

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
  shortDescription?: string
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

  // Product configuration state
  const [selectedPaperStock, setSelectedPaperStock] = useState<string>(() => {
    if (product.productPaperStockSets?.[0]?.paperStockSet?.paperStockItems) {
      const defaultItem = product.productPaperStockSets[0].paperStockSet.paperStockItems.find(item => item.isDefault)
      return defaultItem?.paperStock.id || product.productPaperStockSets[0].paperStockSet.paperStockItems[0]?.paperStock.id || ''
    }
    return ''
  })

  const [selectedQuantity, setSelectedQuantity] = useState<number>(() => {
    if (product.productQuantityGroups?.[0]?.quantityGroup?.values) {
      const quantities = product.productQuantityGroups[0].quantityGroup.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v && v !== 'custom')
      if (quantities.length > 0) {
        return parseInt(quantities[0])
      }
    }
    return 100
  })

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (product.productSizeGroups?.[0]?.sizeGroup?.values) {
      const sizes = product.productSizeGroups[0].sizeGroup.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v && v !== 'custom')
      if (sizes.length > 0) {
        return '0'
      }
    }
    return '0'
  })

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
        console.error('Upload error:', error)
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
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  // Calculate price
  const calculatePrice = () => {
    let price = product.basePrice

    // Add paper stock cost
    if (product.productPaperStockSets?.[0]?.paperStockSet?.paperStockItems) {
      const paperStockItem = product.productPaperStockSets[0].paperStockSet.paperStockItems.find(
        (item) => item.paperStock.id === selectedPaperStock
      )
      // Note: paperStockItems don't have additionalCost, price calculation would be based on paperStock.pricePerSqInch
      // This would need to be implemented based on actual pricing logic
    }

    // Add quantity-based pricing (simplified)
    const quantityMultiplier = selectedQuantity >= 1000 ? 0.8 : selectedQuantity >= 500 ? 0.9 : 1.0
    price = price * quantityMultiplier

    return price
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (customerImages.length === 0) {
      toast.error('Please upload your design file')
      return
    }

    const selectedPaper = product.productPaperStockSets?.[0]?.paperStockSet?.paperStockItems.find(
      (item) => item.paperStock.id === selectedPaperStock
    )
    const sizeGroup = product.productSizeGroups[0]?.sizeGroup
    const sizeValues =
      sizeGroup?.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v && v !== 'custom') || []
    const selectedSizeData = sizeValues[parseInt(selectedSize)] || null

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: `${product.slug}-${selectedPaperStock}-${selectedQuantity}`,
      price: calculatePrice(),
      quantity: selectedQuantity,
      turnaround: `${product.productionTime} business days`,
      options: {
        size: selectedSizeData || 'Standard',
        paperStock: selectedPaper?.paperStock.name,
        paperStockId: selectedPaperStock,
        sides: 'Double',
      },
      fileUrl: customerImages[0]?.url,
      fileName: customerImages[0]?.fileName,
      fileSize: customerImages[0]?.fileSize,
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
            images={product.ProductImage}
            productName={product.name}
            productCategory={product.ProductCategory.name}
            showThumbnails={true}
            enableZoom={true}
            enableLightbox={true}
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
              {/* Paper Type */}
              {product.productPaperStockSets?.[0]?.paperStockSet?.paperStockItems?.length > 0 && (
                <div>
                  <Label className="text-base mb-3 block">Paper Type</Label>
                  <Select value={selectedPaperStock} onValueChange={setSelectedPaperStock}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.productPaperStockSets[0].paperStockSet.paperStockItems.map((item) => (
                        <SelectItem key={item.paperStock.id} value={item.paperStock.id}>
                          {item.paperStock.name}
                          {item.isDefault && ' (Default)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              {product?.productQuantityGroups?.length > 0 &&
                product.productQuantityGroups[0]?.quantityGroup?.values && (
                  <div>
                    <Label className="text-base mb-3 block">Quantity</Label>
                    <Select
                      value={selectedQuantity.toString()}
                      onValueChange={(v) => setSelectedQuantity(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {product.productQuantityGroups[0].quantityGroup.values
                          .split(',')
                          .map((v) => v.trim())
                          .filter((v) => v && v !== 'custom')
                          .map((qty: string) => (
                            <SelectItem key={qty} value={qty}>
                              {parseInt(qty).toLocaleString()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Size */}
              {product?.productSizeGroups?.length > 0 &&
                product.productSizeGroups[0]?.sizeGroup?.values && (
                  <div>
                    <Label className="text-base mb-3 block">Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {product.productSizeGroups[0].sizeGroup.values
                          .split(',')
                          .map((v) => v.trim())
                          .filter((v) => v && v !== 'custom')
                          .map((size: string, index: number) => (
                            <SelectItem key={index} value={index.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Customer File Upload */}
              <div>
                <Label className="text-base mb-3 block">Upload Your Design</Label>

                {/* Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-4 mb-4">
                  <Input
                    multiple
                    accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.svg"
                    className="hidden"
                    id="customer-files"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(Array.from(e.target.files))
                      }
                    }}
                  />
                  <Label
                    className="cursor-pointer flex flex-col items-center justify-center"
                    htmlFor="customer-files"
                  >
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, AI, PSD, JPG, PNG, SVG (max. 10MB each)
                    </span>
                  </Label>
                </div>

                {/* Uploaded Images */}
                {(customerImages.length > 0 || uploadingImages.length > 0) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files</Label>
                    <div className="space-y-2">
                      {customerImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          {image.thumbnailUrl ? (
                            <Image
                              alt={image.fileName}
                              className="w-12 h-12 object-cover rounded"
                              height={48}
                              src={image.thumbnailUrl}
                              width={48}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Upload className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{image.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {uploadingImages.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg opacity-50"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Uploading...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground">Total Price</span>
                <p className="text-3xl font-bold">${calculatePrice().toFixed(2)}</p>
                {product.setupFee > 0 && (
                  <p className="text-sm text-muted-foreground">
                    + ${product.setupFee.toFixed(2)} setup fee
                  </p>
                )}
              </div>
              <Badge className="mb-1" variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {product.productionTime} days
              </Badge>
            </div>
            <Button
              className="w-full"
              disabled={customerImages.length === 0 || isUploading}
              size="lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            {customerImages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please upload your design file to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
