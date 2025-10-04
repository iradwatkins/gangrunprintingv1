'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductBasicInfo } from '@/components/admin/product-form/product-basic-info'
import { ProductImageUpload } from '@/components/admin/product-form/product-image-upload'
import { ProductSpecifications } from '@/components/admin/product-form/product-specifications'
import { ProductAdditionalOptions } from '@/components/admin/product-form/product-additional-options'
import { useProductForm } from '@/hooks/use-product-form'
import toast from '@/lib/toast'
import {
  ArrowLeft,
  Save,
  Loader2,
  Calculator,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronRight,
} from 'lucide-react'
import { responseToJsonSafely } from '@/lib/safe-json'

export default function NewProductPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [testing, setTesting] = useState(false)

  const {
    formData,
    options,
    loading,
    errors,
    updateFormData,
    fetchOptions,
    validateForm,
    transformForSubmission,
  } = useProductForm()

  useEffect(() => {
    fetchOptions()
  }, [])

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

  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0
    let total = 8 // Total required fields

    if (formData.name) completed++
    if (formData.sku) completed++
    if (formData.categoryId) completed++
    if (formData.description) completed++
    if (formData.selectedQuantityGroup) completed++
    if (formData.selectedSizeGroup) completed++
    if (formData.selectedPaperStockSet) completed++
    if (formData.imageUrl) completed++

    return Math.round((completed / total) * 100)
  }

  const progress = calculateProgress()

  const handleSubmit = async () => {
    // Enhanced validation with specific error messages
    const validationErrors = []
    if (!formData.name) validationErrors.push('Product name is required')
    if (!formData.categoryId) validationErrors.push('Category must be selected')
    if (!formData.selectedQuantityGroup) validationErrors.push('Quantity group must be selected')
    if (!formData.selectedSizeGroup) validationErrors.push('Size group must be selected')
    if (!formData.selectedPaperStockSet) validationErrors.push('Paper stock must be selected')

    if (validationErrors.length > 0) {
      toast.error(`Please fix the following:\n${validationErrors.join('\n')}`)
      return
    }

    if (!validateForm()) return

    setSubmitting(true)

    try {
      const productData = await transformForSubmission()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Failed to create product'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.data?.error || errorMessage

          if (errorData.details?.validationErrors) {
            const validationMessages = errorData.details.validationErrors
              .map((err: Record<string, unknown>) => `${err.field}: ${err.message}`)
              .join(', ')
            errorMessage = `Validation failed: ${validationMessages}`
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      const product = responseData.data || responseData
      if (!product || !product.id) {
        throw new Error('Invalid product response: missing product data')
      }

      toast.success('Product created successfully')
      router.push('/admin/products')
    } catch (error) {
      const err = error as Error
      if (err.name === 'AbortError') {
        toast.error('Request timeout. Please try again.')
      } else if (err.message?.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.')
      } else {
        toast.error(err.message || 'Failed to create product')
      }
      } finally {
      setSubmitting(false)
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="container mx-auto py-6 space-y-6">
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
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

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
              Some required data could not be loaded. This prevents the product creation form from working properly.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => fetchOptions()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push('/admin/products')}>
                Return to Products
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Quick fill for testing
  const handleQuickFill = () => {
    if (options.categories.length > 0 &&
        options.quantityGroups.length > 0 &&
        options.sizeGroups.length > 0 &&
        options.paperStockSets.length > 0) {
      updateFormData({
        name: 'Test Product ' + Date.now(),
        categoryId: options.categories[0].id,
        description: 'Test product description',
        selectedQuantityGroup: options.quantityGroups[0].id,
        selectedSizeGroup: options.sizeGroups[0].id,
        selectedPaperStockSet: options.paperStockSets[0].id,
        selectedAddOnSet: options.addOnSets.length > 0 ? options.addOnSets[0].id : '',
        selectedTurnaroundTimeSet: options.turnaroundTimeSets.length > 0 ? options.turnaroundTimeSets[0].id : '',
      })
      toast.success('Form filled with test data')
    } else {
      toast.error('Configuration options not loaded yet')
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Product Creation Progress</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center justify-center mb-8 space-x-2">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            formData.name && formData.categoryId ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {formData.name && formData.categoryId ? <CheckCircle2 className="h-5 w-5" /> : <span>1</span>}
          </div>
          <span className="ml-2 text-sm font-medium">Basic Info</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            formData.selectedQuantityGroup && formData.selectedSizeGroup && formData.selectedPaperStockSet
              ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {formData.selectedQuantityGroup && formData.selectedSizeGroup && formData.selectedPaperStockSet
              ? <CheckCircle2 className="h-5 w-5" /> : <span>2</span>}
          </div>
          <span className="ml-2 text-sm font-medium">Specifications</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            formData.selectedAddOnSet || formData.selectedTurnaroundTimeSet
              ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            <span>3</span>
          </div>
          <span className="ml-2 text-sm font-medium">Options</span>
        </div>
      </div>

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
            variant="outline"
            onClick={handleQuickFill}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
            title="Quick fill form with test data"
          >
            Quick Fill (Test)
          </Button>
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
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">
              {submitting ? 'Creating...' : 'Create Product'}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid gap-6">
        <ProductBasicInfo
          formData={{
            name: formData.name,
            sku: formData.sku,
            categoryId: formData.categoryId,
            description: formData.description,
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
          }}
          categories={options.categories}
          onUpdate={updateFormData}
        />

        <ProductImageUpload
          imageUrl={formData.imageUrl}
          imageData={formData.imageData}
          onImageUpdate={(url, imageData) => updateFormData({ imageUrl: url, imageData })}
        />

        <ProductSpecifications
          formData={{
            selectedQuantityGroup: formData.selectedQuantityGroup,
            selectedSizeGroup: formData.selectedSizeGroup,
            selectedPaperStockSet: formData.selectedPaperStockSet,
          }}
          quantityGroups={options.quantityGroups}
          sizeGroups={options.sizeGroups}
          paperStockSets={options.paperStockSets}
          onUpdate={updateFormData}
        />

        <ProductAdditionalOptions
          formData={{
            selectedAddOnSet: formData.selectedAddOnSet,
            selectedTurnaroundTimeSet: formData.selectedTurnaroundTimeSet,
          }}
          addOnSets={options.addOnSets}
          turnaroundTimeSets={options.turnaroundTimeSets}
          onUpdate={updateFormData}
        />

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
              disabled={submitting}
              onClick={handleSubmit}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-2">
                {submitting ? 'Creating...' : 'Create Product'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
