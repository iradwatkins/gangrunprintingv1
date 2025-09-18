'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, ShoppingCart, Clock, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import Image from 'next/image'

interface ProductImage {
  id: string
  url: string
  thumbnailUrl?: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
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
  productPaperStocks: Array<{
    paperStock: {
      id: string
      name: string
      description?: string
    }
    isDefault: boolean
    additionalCost: number
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

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { addItem, openCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Product configuration state
  const [selectedPaperStock, setSelectedPaperStock] = useState<string>('')
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0)
  const [selectedSize, setSelectedSize] = useState<string>('')

  // Customer image upload state
  const [customerImages, setCustomerImages] = useState<CustomerImage[]>([])
  const [uploadingImages, setUploadingImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Fetch product data with simple pattern - no complex caching
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        console.log(`Fetching product data for slug: ${params.slug}`)
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/by-slug/${params.slug}`)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch product: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('Product data received:', data)

        if (data?.product) {
          setProduct(data.product)

          // Set default selections
          if (data.product.productPaperStocks?.length > 0) {
            const defaultPaper = data.product.productPaperStocks.find((p: any) => p.isDefault) || data.product.productPaperStocks[0]
            setSelectedPaperStock(defaultPaper.paperStock.id)
          }

          if (data.product.productQuantityGroups?.length > 0 && data.product.productQuantityGroups[0].quantityGroup?.values) {
            const quantities = data.product.productQuantityGroups[0].quantityGroup.values.split(',').map((v: string) => v.trim()).filter((v: string) => v && v !== 'custom')
            if (quantities.length > 0) {
              setSelectedQuantity(parseInt(quantities[0]))
            }
          }

          if (data.product.productSizeGroups?.length > 0 && data.product.productSizeGroups[0].sizeGroup?.values) {
            const sizes = data.product.productSizeGroups[0].sizeGroup.values.split(',').map((v: string) => v.trim()).filter((v: string) => v && v !== 'custom')
            if (sizes.length > 0) {
              setSelectedSize('0') // First size option
            }
          }
        } else {
          throw new Error('Product not found in response')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [params.slug])

  // Handle customer image upload
  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return

    setIsUploading(true)
    setUploadingImages([...uploadingImages, ...files])

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('productId', product?.id || '')
        formData.append('isCustomerUpload', 'true')

        const response = await fetch('/api/products/upload-customer-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()

        setCustomerImages(prev => [...prev, {
          id: data.id,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        }])

        toast.success(`${file.name} uploaded successfully`)

      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}: ${error.message}`)
      }
    }

    setUploadingImages([])
    setIsUploading(false)
  }

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/customer-images?imageId=${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setCustomerImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Image deleted successfully')

    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  // Calculate price
  const calculatePrice = () => {
    if (!product) return 0

    let price = product.basePrice

    // Add paper stock cost
    const paperStock = product.productPaperStocks.find(p => p.paperStock.id === selectedPaperStock)
    if (paperStock) {
      price += paperStock.additionalCost
    }

    // Add quantity-based pricing (simplified - using base price)
    // In a real implementation, you'd have a pricing table based on quantity
    const quantityMultiplier = selectedQuantity >= 1000 ? 0.8 : selectedQuantity >= 500 ? 0.9 : 1.0
    price = price * quantityMultiplier

    return price
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return

    if (customerImages.length === 0) {
      toast.error('Please upload your design file')
      return
    }

    const selectedPaper = product.productPaperStocks.find(p => p.paperStock.id === selectedPaperStock)
    const sizeGroup = product.productSizeGroups[0]?.sizeGroup
    const sizeValues = sizeGroup?.values.split(',').map(v => v.trim()).filter(v => v && v !== 'custom') || []
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
        sides: 'Double'
      },
      fileUrl: customerImages[0]?.url,
      fileName: customerImages[0]?.fileName,
      fileSize: customerImages[0]?.fileSize,
      image: product.ProductImage.find(img => img.isPrimary)?.thumbnailUrl || product.ProductImage[0]?.url
    })

    toast.success('Product added to cart!')
    openCart()
  }

  // Debug information in development
  useEffect(() => {
    console.log('Product Page State:', {
      loading,
      error,
      productExists: !!product,
      productName: product?.name,
      slug: params.slug
    })
  }, [loading, error, product, params.slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 mt-4">Loading product...</span>
          <span className="text-xs text-muted-foreground mt-2">Slug: {params.slug}</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Loading Error</h1>
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 font-medium">Error Details:</p>
              <p className="text-red-600 text-sm mt-2">{error || 'The requested product could not be found'}</p>
              <div className="mt-4 text-left text-xs text-gray-600">
                <p>Slug: {params.slug}</p>
                <p>Endpoint: /api/products/by-slug/{params.slug}</p>
              </div>
            </div>
          </div>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = product.ProductImage.find(img => img.isPrimary) || product.ProductImage[0]
  const galleryImages = product.ProductImage.sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6" href="/products">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((image) => (
                <div key={image.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt || `${product.name} image`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <Badge className="mb-2" variant="secondary">{product.ProductCategory.name}</Badge>
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
              {product.productPaperStocks.length > 0 && (
                <div>
                  <Label className="text-base mb-3 block">Paper Type</Label>
                  <Select value={selectedPaperStock} onValueChange={setSelectedPaperStock}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.productPaperStocks.map((item) => (
                        <SelectItem key={item.paperStock.id} value={item.paperStock.id}>
                          {item.paperStock.name}
                          {item.additionalCost > 0 && ` (+$${item.additionalCost})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              {product?.productQuantityGroups?.length > 0 && product.productQuantityGroups[0]?.quantityGroup?.values && (
                <div>
                  <Label className="text-base mb-3 block">Quantity</Label>
                  <Select value={selectedQuantity.toString()} onValueChange={(v) => setSelectedQuantity(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.productQuantityGroups[0].quantityGroup.values.split(',').map(v => v.trim()).filter(v => v && v !== 'custom').map((qty: string) => (
                        <SelectItem key={qty} value={qty}>
                          {parseInt(qty).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size */}
              {product?.productSizeGroups?.length > 0 && product.productSizeGroups[0]?.sizeGroup?.values && (
                <div>
                  <Label className="text-base mb-3 block">Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.productSizeGroups[0].sizeGroup.values.split(',').map(v => v.trim()).filter(v => v && v !== 'custom').map((size: string, index: number) => (
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
                    accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.svg"
                    className="hidden"
                    id="customer-files"
                    type="file"
                    multiple
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
                        <div key={image.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          {image.thumbnailUrl ? (
                            <Image
                              src={image.thumbnailUrl}
                              alt={image.fileName}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded"
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
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
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
                  <p className="text-sm text-muted-foreground">+ ${product.setupFee.toFixed(2)} setup fee</p>
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