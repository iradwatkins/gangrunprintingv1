'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductImageUpload } from '@/components/admin/product-image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiBundle } from '@/hooks/use-api'
import toast from '@/lib/toast'
import { ArrowLeft, Save, Loader2, Calculator, AlertCircle, RefreshCw } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [testing, setTesting] = useState(false)
  // Use bundled API fetching with caching and deduplication
  const { data: apiData, loading: apiLoading, errors } = useApiBundle({
    categories: '/api/product-categories',
    paperStocks: '/api/paper-stocks',
    quantityGroups: '/api/quantities',
    sizeGroups: '/api/sizes',
    addOns: '/api/add-ons'
  }, { ttl: 5 * 60 * 1000 }) // 5 minutes cache

  const categories = apiData.categories || []
  const paperStocks = apiData.paperStocks || []
  const quantityGroups = apiData.quantityGroups || []
  const sizeGroups = apiData.sizeGroups || []
  const addOns = apiData.addOns || []

  // Debug logging to track component state
  useEffect(() => {
    console.log('🎯 NewProductPage: Component state update')
    console.log('📊 Loading state:', apiLoading)
    console.log('📊 Data state:', {
      categories: categories.length,
      paperStocks: paperStocks.length,
      quantityGroups: quantityGroups.length,
      sizeGroups: sizeGroups.length,
      addOns: addOns.length
    })
    console.log('📊 Errors state:', errors)
  }, [apiLoading, categories.length, paperStocks.length, quantityGroups.length, sizeGroups.length, addOns.length, errors])

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    isActive: true,
    isFeatured: false,
    images: [],

    // Paper Stocks - Multiple selection with default
    selectedPaperStocks: [] as string[], // Multiple paper stock IDs
    defaultPaperStock: '', // Single default paper stock ID

    // Single selections
    selectedQuantityGroup: '', // Single quantity group ID
    selectedSizeGroup: '', // Single size group ID

    // Multiple selections
    selectedAddOns: [] as string[], // Multiple add-ons

    // Turnaround
    productionTime: 3,
    rushAvailable: false,
    rushDays: 1,
    rushFee: 0,

    // Pricing
    basePrice: 0,
    setupFee: 0,
  })

  // Auto-generate SKU like URL slug when name changes
  useEffect(() => {
    if (formData.name) {
      const sku = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, sku }))
    }
  }, [formData.name])

  // Set default selections when data loads
  useEffect(() => {
    if (quantityGroups.length > 0 && !formData.selectedQuantityGroup) {
      setFormData(prev => ({ ...prev, selectedQuantityGroup: quantityGroups[0].id }))
    }
  }, [quantityGroups, formData.selectedQuantityGroup])

  useEffect(() => {
    if (sizeGroups.length > 0 && !formData.selectedSizeGroup) {
      setFormData(prev => ({ ...prev, selectedSizeGroup: sizeGroups[0].id }))
    }
  }, [sizeGroups, formData.selectedSizeGroup])

  const handlePaperStockToggle = (stockId: string, checked: boolean) => {
    if (checked) {
      const newSelectedStocks = [...formData.selectedPaperStocks, stockId]
      setFormData({
        ...formData,
        selectedPaperStocks: newSelectedStocks,
        // Auto-set as default if it's the first paper stock selected
        defaultPaperStock: formData.selectedPaperStocks.length === 0 ? stockId : formData.defaultPaperStock
      })
    } else {
      const newSelectedStocks = formData.selectedPaperStocks.filter(id => id !== stockId)
      setFormData({
        ...formData,
        selectedPaperStocks: newSelectedStocks,
        // Clear default if this was the default paper stock
        defaultPaperStock: formData.defaultPaperStock === stockId ?
          (newSelectedStocks.length > 0 ? newSelectedStocks[0] : '') :
          formData.defaultPaperStock
      })
    }
  }

  const testPrice = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/products/test-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice: formData.basePrice,
          setupFee: formData.setupFee,
          paperStocks: formData.selectedPaperStocks,
          defaultPaperStock: formData.defaultPaperStock,
          quantityGroup: formData.selectedQuantityGroup,
          sizeGroup: formData.selectedSizeGroup,
          addOns: formData.selectedAddOns
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Test Price: $${result.totalPrice.toFixed(2)}`)
      } else {
        toast.error('Failed to calculate price')
      }
    } catch (error) {
      toast.error('Price calculation error')
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.selectedPaperStocks.length === 0) {
      toast.error('Please select at least one paper stock')
      return
    }

    if (!formData.defaultPaperStock) {
      toast.error('Please set a default paper stock')
      return
    }

    if (!formData.selectedQuantityGroup) {
      toast.error('Please select a quantity group')
      return
    }

    if (!formData.selectedSizeGroup) {
      toast.error('Please select a size group')
      return
    }

    setLoading(true)
    try {
      // Step 1: Create product without images
      const productData = { ...formData, images: [] }
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const product = await response.json()

      // Step 2: Upload images with productId if any images were selected
      if (formData.images && formData.images.length > 0) {
        setUploadingImages(true)
        setUploadProgress(`Uploading ${formData.images.length} image(s)...`)

        let uploadErrors = []
        let successCount = 0

        const imageUploadPromises = formData.images.map(async (image, index) => {
          // If image has a file property, it needs to be uploaded
          if (image.file) {
            try {
              setUploadProgress(`Uploading image ${index + 1} of ${formData.images.length}...`)

              const uploadFormData = new FormData()
              uploadFormData.append('file', image.file)
              uploadFormData.append('productId', product.id)
              uploadFormData.append('isPrimary', String(index === 0))
              uploadFormData.append('sortOrder', String(index))

              const uploadRes = await fetch('/api/products/upload-image', {
                method: 'POST',
                body: uploadFormData
              })

              if (!uploadRes.ok) {
                const errorText = await uploadRes.text()
                throw new Error(`Image ${index + 1} upload failed: ${errorText}`)
              }

              // Clean up blob URL after successful upload
              if (image.url.startsWith('blob:')) {
                URL.revokeObjectURL(image.url)
              }

              successCount++
              setUploadProgress(`Uploaded ${successCount} of ${formData.images.length} images`)
              return await uploadRes.json()
            } catch (error) {
              console.error(`Failed to upload image ${index + 1}:`, error)
              uploadErrors.push(error.message)
              return null
            }
          }
          return null
        })

        const results = await Promise.allSettled(imageUploadPromises)
        setUploadingImages(false)
        setUploadProgress('')

        // Check if any uploads failed
        const failedCount = uploadErrors.length
        if (failedCount > 0) {
          toast.error(`${failedCount} image(s) failed to upload. Product created without some images.`)
        } else if (successCount > 0) {
          toast.success(`Successfully uploaded ${successCount} image(s)`)
        }
      }

      toast.success('Product created successfully')
      router.push('/admin/products')
    } catch (error) {
      toast.error('Failed to create product')
      console.error('Product creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Basic Info Card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Additional form section skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Show loading state while fetching initial data
  if (apiLoading) {
    return <LoadingSkeleton />
  }

  // Show error state if critical data failed to load
  const criticalErrors = [errors.categories, errors.paperStocks, errors.quantityGroups, errors.sizeGroups].filter(Boolean)
  if (criticalErrors.length > 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="ghost" onClick={() => router.push('/admin/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Create Product</h1>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Required Data</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Some required data could not be loaded. This prevents the product creation form from working properly.
            </p>
            <div className="space-y-2 mb-4">
              {errors.categories && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Categories:</span>
                  <span>{errors.categories}</span>
                </div>
              )}
              {errors.paperStocks && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Paper Stocks:</span>
                  <span>{errors.paperStocks}</span>
                </div>
              )}
              {errors.quantityGroups && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Quantity Groups:</span>
                  <span>{errors.quantityGroups}</span>
                </div>
              )}
              {errors.sizeGroups && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Size Groups:</span>
                  <span>{errors.sizeGroups}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push('/admin/products')}>
                Return to Products
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Show partial data that did load */}
        {(categories.length > 0 || paperStocks.length > 0 || quantityGroups.length > 0 || sizeGroups.length > 0) && (
          <Alert>
            <AlertTitle>Partial Data Loaded</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The following data loaded successfully:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {categories.length > 0 && <div>✓ Categories: {categories.length} items</div>}
                {paperStocks.length > 0 && <div>✓ Paper Stocks: {paperStocks.length} items</div>}
                {quantityGroups.length > 0 && <div>✓ Quantity Groups: {quantityGroups.length} items</div>}
                {sizeGroups.length > 0 && <div>✓ Size Groups: {sizeGroups.length} items</div>}
                {addOns.length > 0 && <div>✓ Add-ons: {addOns.length} items</div>}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Product</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testPrice} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            <span className="ml-2">Test Price</span>
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploadingImages}>
            {(loading || uploadingImages) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">
              {uploadingImages ? uploadProgress : loading ? 'Saving...' : 'Save Product'}
            </span>
          </Button>
        </div>
      </div>

      {/* Basic Info & Images */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info & Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div data-testid="product-name">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label>Product Images</Label>
            <ProductImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({...formData, images})}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
              />
              <Label>Featured</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantity Group - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>Quantity Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a quantity set for this product. Customers will see the quantities from this set, with the default quantity pre-selected.
            </p>
            <div>
              <Label htmlFor="quantity-group">Quantity Set</Label>
              <Select
                value={formData.selectedQuantityGroup}
                onValueChange={(value) => setFormData({...formData, selectedQuantityGroup: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity set" />
                </SelectTrigger>
                <SelectContent>
                  {quantityGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-muted-foreground">{group.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview selected quantity group */}
            {formData.selectedQuantityGroup && (
              <div className="border rounded-lg p-3 bg-muted/50">
                {(() => {
                  const selectedGroup = quantityGroups.find(g => g.id === formData.selectedQuantityGroup)
                  if (!selectedGroup) return null

                  return (
                    <div>
                      <p className="font-medium text-sm mb-2">Preview: {selectedGroup.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedGroup.valuesList?.map((value: string, index: number) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              value === selectedGroup.defaultValue
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-background text-foreground border'
                            }`}
                          >
                            {value}
                            {value === selectedGroup.defaultValue && ' (default)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paper Stock - Multiple selection with default */}
      <Card>
        <CardHeader>
          <CardTitle>Paper Stock Options *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select available paper stocks for this product. One must be set as default.
            Customers will see these options in a dropdown on the frontend, with the default pre-selected.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {paperStocks.map(stock => (
              <div key={stock.id} className="border rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`stock-${stock.id}`}
                    checked={formData.selectedPaperStocks.includes(stock.id)}
                    onCheckedChange={(checked) => handlePaperStockToggle(stock.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`stock-${stock.id}`} className="font-medium cursor-pointer">
                        {stock.name} - {stock.weight}pt
                      </Label>
                      {formData.defaultPaperStock === stock.id && (
                        <Badge variant="secondary" className="text-xs">DEFAULT</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${stock.pricePerSqInch}/sq in
                    </div>
                    {formData.selectedPaperStocks.includes(stock.id) && (
                      <div className="mt-2">
                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="defaultPaperStock"
                            checked={formData.defaultPaperStock === stock.id}
                            onChange={() => setFormData({ ...formData, defaultPaperStock: stock.id })}
                            className="w-4 h-4"
                          />
                          <span>Set as default paper stock</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Size Group - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>Size Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a size set for this product. Customers will see the sizes from this set, with the default size pre-selected.
            </p>
            <div>
              <Label htmlFor="size-group">Size Set</Label>
              <Select
                value={formData.selectedSizeGroup}
                onValueChange={(value) => setFormData({...formData, selectedSizeGroup: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size set" />
                </SelectTrigger>
                <SelectContent>
                  {sizeGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-muted-foreground">{group.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview selected size group */}
            {formData.selectedSizeGroup && (
              <div className="border rounded-lg p-3 bg-muted/50">
                {(() => {
                  const selectedGroup = sizeGroups.find(g => g.id === formData.selectedSizeGroup)
                  if (!selectedGroup) return null

                  return (
                    <div>
                      <p className="font-medium text-sm mb-2">Preview: {selectedGroup.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedGroup.valuesList?.map((value: string, index: number) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              value === selectedGroup.defaultValue
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-background text-foreground border'
                            }`}
                          >
                            {value}
                            {value === selectedGroup.defaultValue && ' (default)'}
                          </span>
                        ))}
                      </div>
                      {selectedGroup.hasCustomOption && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Custom dimensions: {selectedGroup.customMinWidth}"×{selectedGroup.customMinHeight}" to {selectedGroup.customMaxWidth}"×{selectedGroup.customMaxHeight}"
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add-on Options - Multiple selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add-on Options (Choose Multiple)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {addOns.filter(addon => addon.isActive).map(addon => (
              <div key={addon.id} className="flex items-center gap-2">
                <Checkbox
                  id={`addon-${addon.id}`}
                  checked={formData.selectedAddOns.includes(addon.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, selectedAddOns: [...formData.selectedAddOns, addon.id]})
                    } else {
                      setFormData({...formData, selectedAddOns: formData.selectedAddOns.filter(id => id !== addon.id)})
                    }
                  }}
                />
                <Label htmlFor={`addon-${addon.id}`} className="cursor-pointer font-normal">
                  {addon.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Turnaround Times */}
      <Card>
        <CardHeader>
          <CardTitle>Turnaround Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="production">Production Time (days)</Label>
              <Input
                id="production"
                type="number"
                value={formData.productionTime}
                onChange={(e) => setFormData({...formData, productionTime: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="base-price">Base Price ($)</Label>
              <Input
                id="base-price"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.rushAvailable}
                onCheckedChange={(checked) => setFormData({...formData, rushAvailable: checked})}
              />
              <Label>Rush Available</Label>
            </div>
            {formData.rushAvailable && (
              <>
                <div className="flex items-center gap-2">
                  <Label>Rush Days:</Label>
                  <Input
                    type="number"
                    className="w-20"
                    value={formData.rushDays}
                    onChange={(e) => setFormData({...formData, rushDays: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Rush Fee ($):</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-24"
                    value={formData.rushFee}
                    onChange={(e) => setFormData({...formData, rushFee: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}