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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import toast from '@/lib/toast'
import {
  ArrowLeft,
  Save,
  Loader2,
  Calculator,
  AlertCircle,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  Settings,
  Clock,
  FileText
} from 'lucide-react'
import { responseToJsonSafely } from '@/lib/safe-json'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [testing, setTesting] = useState(false)

  // Data state - simple fetch pattern like paper-stocks page
  const [categories, setCategories] = useState<any[]>([])
  const [paperStockSets, setPaperStockSets] = useState<any[]>([])
  const [quantityGroups, setQuantityGroups] = useState<any[]>([])
  const [sizeGroups, setSizeGroups] = useState<any[]>([])
  const [addOnSets, setAddOnSets] = useState<any[]>([])
  const [turnaroundTimeSets, setTurnaroundTimeSets] = useState<any[]>([])
  const [apiLoading, setApiLoading] = useState(true)
  const [errors, setErrors] = useState<any>({})

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
  })

  // Fetch data on component mount - simple pattern like paper-stocks page
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setApiLoading(true)
      const [
        categoriesRes,
        paperStockGroupsRes,
        quantitiesRes,
        sizesRes,
        addOnSetsRes,
        turnaroundTimeSetsRes,
      ] = await Promise.all([
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

  // Don't auto-set add-on sets and turnaround time sets as they are optional

  const testPrice = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/products/test-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperStockSet: formData.selectedPaperStockSet,
          quantityGroup: formData.selectedQuantityGroup,
          sizeGroup: formData.selectedSizeGroup,
          addOns: formData.selectedAddOnSet,
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
      toast.error('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Check file size (max 10MB for better compatibility)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      toast.error(
        `Image is ${sizeMB}MB but must be less than 10MB. Please compress or resize the image.`
      )
      return
    }

    // Check image dimensions
    const img = new Image()
    const imageUrl = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(imageUrl) // Clean up

      // Check minimum dimensions (100x100)
      if (img.width < 100 || img.height < 100) {
        toast.error(`Image is ${img.width}x${img.height}px but must be at least 100x100 pixels`)
        return
      }

      // Check maximum dimensions - reasonable limits for product display images
      // Allow slightly larger images since they'll be optimized for web
      if (img.width > 6000 || img.height > 6000) {
        toast.error(
          `Image is ${img.width}x${img.height}px but cannot exceed 6000x6000 pixels for product display`
        )
        return
      }

      // Proceed with upload with retry logic
      setUploadingImage(true)
      let attempt = 0
      const maxAttempts = 3
      const baseDelay = 1000 // 1 second

      const uploadWithRetry = async (): Promise<void> => {
        attempt++

        try {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('isPrimary', 'true')
          uploadFormData.append('sortOrder', '0')

          // Aggressive timeout for faster feedback
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          const response = await fetch('/api/products/upload-image', {
            method: 'POST',
            body: uploadFormData,
            signal: controller.signal,
            // Remove keepalive as it can cause issues
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: 'Upload failed',
              data: null
            }))

            // Handle specific API error responses
            if (response.status === 413) {
              throw new Error('File too large. Please compress the image to under 10MB.')
            } else if (response.status === 408) {
              throw new Error('Upload timeout. The file may be too large or connection is slow.')
            } else if (response.status === 503) {
              throw new Error('Storage service temporarily unavailable. Please try again.')
            } else {
              throw new Error(errorData.data?.error || errorData.error || 'Failed to upload image')
            }
          }

          const data = await response.json()

          // Handle standardized API response format
          const imageUrl = data.data?.url || data.url
          if (!imageUrl) {
            throw new Error('Invalid response: missing image URL')
          }

          // Update form data with the uploaded image URL
          setFormData((prev) => ({
            ...prev,
            imageUrl: imageUrl,
          }))

          toast.success('Image uploaded successfully')

        } catch (error: any) {
          console.error(`Upload attempt ${attempt} failed:`, error)

          // Don't retry certain errors
          const nonRetryableErrors = [
            'File too large',
            'Invalid file type',
            'Authentication',
            'Unauthorized'
          ]

          const isNonRetryable = nonRetryableErrors.some(errorText =>
            error.message?.includes(errorText)
          )

          if (attempt >= maxAttempts || isNonRetryable) {
            // Handle specific error types for final attempt
            if (error.name === 'AbortError') {
              toast.error('Upload timeout. Please try with a smaller file or check your connection.')
            } else if (error.message?.includes('ERR_CONNECTION_CLOSED')) {
              toast.error('Connection interrupted. Please check your internet connection and try again.')
            } else if (error.message?.includes('fetch')) {
              toast.error('Network error. Please check your internet connection.')
            } else {
              toast.error(error.message || 'Failed to upload image')
            }
            throw error
          }

          // Wait before retry with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1)
          toast.error(`Upload failed. Retrying in ${delay / 1000} seconds... (${attempt}/${maxAttempts})`)

          await new Promise(resolve => setTimeout(resolve, delay))
          return uploadWithRetry()
        }
      }

      try {
        await uploadWithRetry()
      } catch (error) {
        // Final error already handled in uploadWithRetry
      } finally {
        setUploadingImage(false)
        // Reset file input
        if (e.target) e.target.value = ''
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl) // Clean up
      toast.error('Failed to load image. Please ensure the file is a valid image.')
      // Reset file input
      if (e.target) e.target.value = ''
    }

    img.src = imageUrl
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }))
  }

  const handleSubmit = async () => {
    // Comprehensive validation
    if (!formData.name?.trim()) {
      toast.error('Product name is required')
      return
    }

    if (!formData.sku?.trim()) {
      toast.error('SKU is required')
      return
    }

    if (!formData.categoryId?.trim()) {
      toast.error('Please select a product category')
      return
    }

    if (!formData.selectedPaperStockSet?.trim()) {
      toast.error('Please select a paper stock set')
      return
    }

    if (!formData.selectedQuantityGroup?.trim()) {
      toast.error('Please select a quantity group')
      return
    }

    if (!formData.selectedSizeGroup?.trim()) {
      toast.error('Please select a size group')
      return
    }

    // Check if data is still loading
    if (apiLoading) {
      toast.error('Please wait for data to load before submitting')
      return
    }

    setLoading(true)

    // Transform data to match full API format
    const fullProductData = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      description: formData.description || null,
      shortDescription: null,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      paperStockSetId: formData.selectedPaperStockSet,
      quantityGroupId: formData.selectedQuantityGroup,
      sizeGroupId: formData.selectedSizeGroup,
      selectedAddOns: [], // Full endpoint expects array, not individual addOnSetId
      productionTime: 3,
      rushAvailable: false,
      rushDays: null,
      rushFee: null,
      basePrice: 0,
      setupFee: 0,
      images: formData.imageUrl ? [{
        url: formData.imageUrl,
        isPrimary: true,
        alt: `${formData.name} product image`,
      }] : [],
    }

    try {
      // Use the full API endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProductData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Failed to create product'
        try {
          const errorData = await response.json()
          // Handle standardized API error response
          errorMessage = errorData.error || errorData.data?.error || errorMessage

          // Handle validation errors with details
          if (errorData.details?.validationErrors) {
            const validationMessages = errorData.details.validationErrors
              .map((err: any) => `${err.field}: ${err.message}`)
              .join(', ')
            errorMessage = `Validation failed: ${validationMessages}`
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError)
        throw new Error('Invalid response from server')
      }

      // Handle standardized API success response
      const product = responseData.data || responseData
      if (!product || !product.id) {
        throw new Error('Invalid product response: missing product data')
      }

      toast.success('Product created successfully')
      router.push('/admin/products')
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Request timeout. Please try again.')
      } else if (error.message?.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.')
      } else {
        toast.error(error.message || 'Failed to create product')
      }
      console.error('Product creation error:', error)
    } finally {
      setLoading(false)
      setUploadingImage(false)
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
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Product</h1>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={testing}
            variant="outline"
            onClick={testPrice}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            <span className="ml-2">Test Price</span>
          </Button>
          <Button
            disabled={loading || uploadingImage}
            onClick={handleSubmit}
          >
            {loading || uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">
              {uploadingImage ? 'Uploading...' : loading ? 'Creating...' : 'Create Product'}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Form - Single Page */}
      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium Business Cards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU (Auto-generated)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Product Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category..." />
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
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured Product</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!formData.imageUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  id="product-image"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label
                  className={`cursor-pointer block ${uploadingImage ? 'opacity-50' : ''}`}
                  htmlFor="product-image"
                >
                  {uploadingImage ? (
                    <div className="space-y-2">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                      <p className="text-sm font-medium">Processing image...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-gray-500">
                        JPEG, PNG, WebP, GIF - Max 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  alt="Product preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                  src={formData.imageUrl}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600">Image uploaded successfully</p>
                  <p className="text-xs text-gray-500 mt-1">{formData.imageUrl}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveImage}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Product Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Quantity Options *</Label>
              <Select
                value={formData.selectedQuantityGroup}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedQuantityGroup: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose quantity set..." />
                </SelectTrigger>
                <SelectContent>
                  {quantityGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Size Options *</Label>
              <Select
                value={formData.selectedSizeGroup}
                onValueChange={(value) => setFormData({ ...formData, selectedSizeGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose size set..." />
                </SelectTrigger>
                <SelectContent>
                  {sizeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Paper Stock *</Label>
              <Select
                value={formData.selectedPaperStockSet}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedPaperStockSet: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose paper stock set..." />
                </SelectTrigger>
                <SelectContent>
                  {paperStockSets.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Additional Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Add-on Options (Optional)</Label>
              <Select
                value={formData.selectedAddOnSet || "none"}
                onValueChange={(value) => setFormData({ ...formData, selectedAddOnSet: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose add-on set..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No add-ons</SelectItem>
                  {addOnSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Turnaround Times (Optional)</Label>
              <Select
                value={formData.selectedTurnaroundTimeSet || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedTurnaroundTimeSet: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose turnaround time set..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No turnaround options</SelectItem>
                  {turnaroundTimeSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="flex justify-between items-center py-6 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              disabled={testing}
              variant="outline"
              onClick={testPrice}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              <span className="ml-2">Test Price</span>
            </Button>
            <Button
              disabled={loading || uploadingImage}
              onClick={handleSubmit}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading || uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-2">
                {uploadingImage ? 'Uploading...' : loading ? 'Creating...' : 'Create Product'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}