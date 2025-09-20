'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import { ProductImageUpload } from '@/components/admin/product-image-upload' // Temporarily disabled
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import toast from '@/lib/toast'
import { ArrowLeft, Save, Loader2, Calculator, AlertCircle, RefreshCw, Upload, X } from 'lucide-react'
import { responseToJsonSafely } from '@/lib/safe-json'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [testing, setTesting] = useState(false)

  // Data state - simple fetch pattern like paper-stocks page
  const [categories, setCategories] = useState([])
  const [paperStockSets, setPaperStockSets] = useState([])
  const [quantityGroups, setQuantityGroups] = useState([])
  const [sizeGroups, setSizeGroups] = useState([])
  const [addOnSets, setAddOnSets] = useState([])
  const [turnaroundTimeSets, setTurnaroundTimeSets] = useState([])
  const [apiLoading, setApiLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    isActive: true,
    isFeatured: false,
    imageUrl: '', // Simple single image URL

    // Single selections
    selectedPaperStockSet: '', // Single paper stock set ID
    selectedQuantityGroup: '', // Single quantity group ID
    selectedSizeGroup: '', // Single size group ID
    selectedAddOnSet: '', // Single addon set ID
    selectedTurnaroundTimeSet: '', // Single turnaround time set ID

    // Turnaround
    productionTime: 3,
    rushAvailable: false,
    rushDays: 1,
    rushFee: 0,

    // Pricing
    basePrice: 0,
    setupFee: 0,
  })

  // Fetch data on component mount - simple pattern like paper-stocks page
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setApiLoading(true)
      const [categoriesRes, paperStockGroupsRes, quantitiesRes, sizesRes, addOnSetsRes, turnaroundTimeSetsRes] =
        await Promise.all([
          fetch('/api/product-categories'),
          fetch('/api/paper-stock-sets'),
          fetch('/api/quantities'),
          fetch('/api/sizes'),
          fetch('/api/addon-sets'),
          fetch('/api/turnaround-time-sets'),
        ])

      const newErrors = {}

      // Handle categories
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data)
      } else {
        newErrors.categories = 'Failed to load categories'
        console.error('Failed to fetch categories:', categoriesRes.status)
      }

      // Handle paper stock sets
      if (paperStockGroupsRes.ok) {
        const data = await paperStockGroupsRes.json()
        setPaperStockSets(data)
      } else {
        newErrors.paperStockSets = 'Failed to load paper stock sets'
        console.error('Failed to fetch paper stock sets:', paperStockGroupsRes.status)
      }

      // Handle quantity groups
      if (quantitiesRes.ok) {
        const data = await quantitiesRes.json()
        setQuantityGroups(data)
      } else {
        newErrors.quantityGroups = 'Failed to load quantity groups'
        console.error('Failed to fetch quantity groups:', quantitiesRes.status)
      }

      // Handle size groups
      if (sizesRes.ok) {
        const data = await sizesRes.json()
        setSizeGroups(data)
      } else {
        newErrors.sizeGroups = 'Failed to load size groups'
        console.error('Failed to fetch size groups:', sizesRes.status)
      }

      // Handle addon sets
      if (addOnSetsRes.ok) {
        const data = await addOnSetsRes.json()
        setAddOnSets(data)
      } else {
        newErrors.addOnSets = 'Failed to load addon sets'
        console.error('Failed to fetch addon sets:', addOnSetsRes.status)
      }

      // Handle turnaround time sets
      if (turnaroundTimeSetsRes.ok) {
        const data = await turnaroundTimeSetsRes.json()
        setTurnaroundTimeSets(data)
      } else {
        newErrors.turnaroundTimeSets = 'Failed to load turnaround time sets'
        console.error('Failed to fetch turnaround time sets:', turnaroundTimeSetsRes.status)
      }

      setErrors(newErrors)
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrors({
        categories: 'Network error',
        paperStockSets: 'Network error',
        quantityGroups: 'Network error',
        sizeGroups: 'Network error',
        addOnSets: 'Network error',
        turnaroundTimeSets: 'Network error',
      })
    } finally {
      setApiLoading(false)
    }
  }

  // Auto-generate SKU like URL slug when name changes
  useEffect(() => {
    if (formData.name) {
      const sku = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, sku }))
    }
  }, [formData.name])

  // Set default selections when data loads
  useEffect(() => {
    if (paperStockSets.length > 0 && !formData.selectedPaperStockSet) {
      setFormData((prev) => ({ ...prev, selectedPaperStockSet: paperStockSets[0].id }))
    }
  }, [paperStockSets, formData.selectedPaperStockSet])

  useEffect(() => {
    if (quantityGroups.length > 0 && !formData.selectedQuantityGroup) {
      setFormData((prev) => ({ ...prev, selectedQuantityGroup: quantityGroups[0].id }))
    }
  }, [quantityGroups, formData.selectedQuantityGroup])

  useEffect(() => {
    if (sizeGroups.length > 0 && !formData.selectedSizeGroup) {
      setFormData((prev) => ({ ...prev, selectedSizeGroup: sizeGroups[0].id }))
    }
  }, [sizeGroups, formData.selectedSizeGroup])

  useEffect(() => {
    if (addOnSets.length > 0 && !formData.selectedAddOnSet) {
      setFormData((prev) => ({ ...prev, selectedAddOnSet: addOnSets[0].id }))
    }
  }, [addOnSets, formData.selectedAddOnSet])

  useEffect(() => {
    if (turnaroundTimeSets.length > 0 && !formData.selectedTurnaroundTimeSet) {
      setFormData((prev) => ({ ...prev, selectedTurnaroundTimeSet: turnaroundTimeSets[0].id }))
    }
  }, [turnaroundTimeSets, formData.selectedTurnaroundTimeSet])

  const testPrice = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/products/test-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice: formData.basePrice,
          setupFee: formData.setupFee,
          paperStockSet: formData.selectedPaperStockSet,
          quantityGroup: formData.selectedQuantityGroup,
          sizeGroup: formData.selectedSizeGroup,
          addOns: formData.selectedAddOns,
        }),
      })

      if (response.ok) {
        const result = await responseToJsonSafely<any>(response, 'test-price')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('isPrimary', 'true')
      uploadFormData.append('sortOrder', '0')

      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()

      // Update form data with the uploaded image URL
      setFormData(prev => ({
        ...prev,
        imageUrl: data.url
      }))

      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
      console.error('Image upload error:', error)
    } finally {
      setUploadingImage(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.selectedPaperStockSet) {
      toast.error('Please select a paper stock set')
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

    // Transform complex data to match simple API format
    const simplifiedData = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      description: formData.description || '',
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      paperStockSetId: formData.selectedPaperStockSet,
      quantityGroupId: formData.selectedQuantityGroup,
      sizeGroupId: formData.selectedSizeGroup,
      basePrice: formData.basePrice || 0,
      setupFee: formData.setupFee || 0,
      productionTime: formData.productionTime || 3,
      imageUrl: formData.imageUrl || null,
    }

    console.log('Sending simplified data:', simplifiedData)

    try {
      // Use the working simple API endpoint
      const response = await fetch('/api/products/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simplifiedData),
      })

      const responseText = await response.text()
      console.log('Response status:', response.status)
      console.log('Response text:', responseText)

      if (!response.ok) {
        let errorMessage = 'Failed to create product'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use the text
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let product
      try {
        product = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse product response:', e)
        throw new Error('Invalid response from server')
      }

      // Step 2: Handle images if needed (simplified for now)
      // TODO: Re-enable image upload after basic product creation works
      if (formData.images && formData.images.length > 0) {
        console.log('Images detected but upload temporarily disabled for stability')
        // Will re-enable after confirming basic product creation works
      }

      toast.success('Product created successfully')
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product')
      console.error('Product creation error:', error)
    } finally {
      setLoading(false)
      setUploadingImages(false)
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
  const criticalErrors = [
    errors.categories,
    errors.paperStockSets,
    errors.quantityGroups,
    errors.sizeGroups,
  ].filter(Boolean)
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
              Some required data could not be loaded. This prevents the product creation form from
              working properly.
            </p>
            <div className="space-y-2 mb-4">
              {errors.categories && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Categories:</span>
                  <span>{errors.categories}</span>
                </div>
              )}
              {errors.paperStockSets && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Paper Stock Sets:</span>
                  <span>{errors.paperStockSets}</span>
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
        {(categories.length > 0 ||
          paperStockSets.length > 0 ||
          quantityGroups.length > 0 ||
          sizeGroups.length > 0) && (
          <Alert>
            <AlertTitle>Partial Data Loaded</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The following data loaded successfully:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {categories.length > 0 && <div>✓ Categories: {categories.length} items</div>}
                {paperStockSets.length > 0 && (
                  <div>✓ Paper Stock Sets: {paperStockSets.length} items</div>
                )}
                {quantityGroups.length > 0 && (
                  <div>✓ Quantity Groups: {quantityGroups.length} items</div>
                )}
                {sizeGroups.length > 0 && <div>✓ Size Groups: {sizeGroups.length} items</div>}
                {addOnSets.length > 0 && <div>✓ AddOn Sets: {addOnSets.length} items</div>}
                {turnaroundTimeSets.length > 0 && (
                  <div>✓ Turnaround Time Sets: {turnaroundTimeSets.length} items</div>
                )}
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
          <Button disabled={testing} variant="outline" onClick={testPrice}>
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            <span className="ml-2">Test Price</span>
          </Button>
          <Button disabled={loading || uploadingImage} onClick={handleSubmit}>
            {loading || uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">
              {uploadingImage ? 'Uploading...' : loading ? 'Saving...' : 'Save Product'}
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input readOnly className="bg-muted" id="sku" value={formData.sku} />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Product Image</Label>
            {!formData.imageUrl ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="product-image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="product-image"
                  className={`cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                      <p className="text-sm font-medium">Uploading image...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload product image</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports JPEG, PNG (max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Image uploaded successfully</p>
                    <p className="text-xs text-muted-foreground">
                      This image will be visible to customers
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
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
              Select a quantity set for this product. Customers will see the quantities from this
              set, with the default quantity pre-selected.
            </p>
            <div>
              <Label htmlFor="quantity-group">Quantity Set</Label>
              <Select
                value={formData.selectedQuantityGroup}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedQuantityGroup: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity set" />
                </SelectTrigger>
                <SelectContent>
                  {quantityGroups.map((group) => (
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
                  const selectedGroup = quantityGroups.find(
                    (g) => g.id === formData.selectedQuantityGroup
                  )
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

      {/* Paper Stock Group - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>Paper Stock Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a paper stock set for this product. Customers will see the paper stocks from
              this set, with the default paper stock pre-selected.
            </p>
            <div>
              <Label htmlFor="paper-stock-set">Paper Stock Set</Label>
              <Select
                value={formData.selectedPaperStockSet}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedPaperStockSet: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select paper stock set" />
                </SelectTrigger>
                <SelectContent>
                  {paperStockSets.map((group) => (
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

            {/* Preview selected paper stock set */}
            {formData.selectedPaperStockSet && (
              <div className="border rounded-lg p-3 bg-muted/50">
                {(() => {
                  const selectedGroup = paperStockSets.find(
                    (g) => g.id === formData.selectedPaperStockSet
                  )
                  if (!selectedGroup) return null

                  return (
                    <div>
                      <p className="font-medium text-sm mb-2">Preview: {selectedGroup.name}</p>
                      <div className="space-y-1">
                        {selectedGroup.paperStockItems?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`px-2 py-1 text-xs rounded flex items-center justify-between ${
                              item.isDefault
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-background text-foreground border'
                            }`}
                          >
                            <span>
                              {item.paperStock.name} - {item.paperStock.weight}pt
                            </span>
                            <span className="text-xs opacity-70">
                              ${item.paperStock.pricePerSqInch}/sq in
                              {item.isDefault && ' (default)'}
                            </span>
                          </div>
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

      {/* Size Group - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>Size Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a size set for this product. Customers will see the sizes from this set, with
              the default size pre-selected.
            </p>
            <div>
              <Label htmlFor="size-group">Size Set</Label>
              <Select
                value={formData.selectedSizeGroup}
                onValueChange={(value) => setFormData({ ...formData, selectedSizeGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size set" />
                </SelectTrigger>
                <SelectContent>
                  {sizeGroups.map((group) => (
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
                  const selectedGroup = sizeGroups.find((g) => g.id === formData.selectedSizeGroup)
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
                          Custom dimensions: {selectedGroup.customMinWidth}"×
                          {selectedGroup.customMinHeight}" to {selectedGroup.customMaxWidth}"×
                          {selectedGroup.customMaxHeight}"
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

      {/* AddOn Set - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>AddOn Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an addon set for this product. Customers will see the addons from this set,
              allowing them to add extra features to their order.
            </p>
            <div>
              <Label htmlFor="addon-set">AddOn Set</Label>
              <Select
                value={formData.selectedAddOnSet}
                onValueChange={(value) => setFormData({ ...formData, selectedAddOnSet: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select addon set" />
                </SelectTrigger>
                <SelectContent>
                  {addOnSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{set.name}</span>
                        {set.description && (
                          <span className="text-xs text-muted-foreground">{set.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview selected addon set */}
            {formData.selectedAddOnSet && (
              <div className="border rounded-lg p-3 bg-muted/50">
                {(() => {
                  const selectedSet = addOnSets.find((s) => s.id === formData.selectedAddOnSet)
                  if (!selectedSet) return null

                  return (
                    <div>
                      <p className="font-medium text-sm mb-2">Preview: {selectedSet.name}</p>
                      <div className="text-xs text-muted-foreground">
                        Contains {selectedSet._count?.addOnSetItems || 0} add-ons
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Turnaround Time Set - Single selection */}
      <Card>
        <CardHeader>
          <CardTitle>Turnaround Time Set (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a turnaround time set for this product. Customers will see the turnaround
              options from this set, with pricing adjustments for faster delivery.
            </p>
            <div>
              <Label htmlFor="turnaround-time-set">Turnaround Time Set</Label>
              <Select
                value={formData.selectedTurnaroundTimeSet}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedTurnaroundTimeSet: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select turnaround time set" />
                </SelectTrigger>
                <SelectContent>
                  {turnaroundTimeSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{set.name}</span>
                        {set.description && (
                          <span className="text-xs text-muted-foreground">{set.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview selected turnaround time set */}
            {formData.selectedTurnaroundTimeSet && (
              <div className="border rounded-lg p-3 bg-muted/50">
                {(() => {
                  const selectedSet = turnaroundTimeSets.find(
                    (s) => s.id === formData.selectedTurnaroundTimeSet
                  )
                  if (!selectedSet) return null

                  return (
                    <div>
                      <p className="font-medium text-sm mb-2">Preview: {selectedSet.name}</p>
                      <div className="space-y-1">
                        {selectedSet.turnaroundTimeItems?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`px-2 py-1 text-xs rounded flex items-center justify-between ${
                              item.isDefault
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-background text-foreground border'
                            }`}
                          >
                            <span>{item.turnaroundTime.displayName}</span>
                            <span className="text-xs opacity-70">
                              {item.turnaroundTime.basePrice > 0 &&
                                `+$${item.turnaroundTime.basePrice}`}
                              {item.isDefault && ' (default)'}
                            </span>
                          </div>
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

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-price">Base Price ($)</Label>
              <Input
                id="base-price"
                step="0.01"
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="setup-fee">Setup Fee ($)</Label>
              <Input
                id="setup-fee"
                step="0.01"
                type="number"
                value={formData.setupFee}
                onChange={(e) =>
                  setFormData({ ...formData, setupFee: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="production">Default Production Time (days)</Label>
              <Input
                id="production"
                type="number"
                value={formData.productionTime}
                onChange={(e) =>
                  setFormData({ ...formData, productionTime: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
