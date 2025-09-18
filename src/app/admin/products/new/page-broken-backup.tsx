'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useApiBundle } from '@/hooks/use-api'
import toast from '@/lib/toast'

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  isActive: boolean
}

interface QuantityGroup {
  id: string
  name: string
  values: string
  defaultValue: string
  valuesList: string[]
  hasCustomOption: boolean
  isActive: boolean
}

interface SizeGroup {
  id: string
  name: string
  values: string
  defaultValue: string
  valuesList: string[]
  hasCustomOption: boolean
  isActive: boolean
}

interface AddOn {
  id: string
  name: string
  description?: string
  pricingModel: string
  isActive: boolean
}

interface ApiData {
  categories: Category[]
  paperStocks: PaperStock[]
  quantities: QuantityGroup[]
  sizes: SizeGroup[]
  addOns: AddOn[]
}

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    basePrice: '',
    setupFee: '',
    productionTime: '3',
    isActive: true,
    isFeatured: false,
    gangRunEligible: false,
    rushAvailable: false,
    rushDays: '',
    rushFee: '',
    selectedPaperStocks: [] as string[],
    defaultPaperStock: '',
    selectedQuantityGroup: '',
    selectedSizeGroup: '',
    selectedAddOns: [] as string[]
  })

  // Fetch all required data for form
  const { data, loading, errors } = useApiBundle<ApiData>({
    categories: '/api/product-categories?active=true',
    paperStocks: '/api/paper-stocks',
    quantities: '/api/quantities?active=true',
    sizes: '/api/sizes?active=true',
    addOns: '/api/add-ons?active=true'
  })

  // Auto-generate SKU from name
  useEffect(() => {
    if (formData.name && !formData.sku) {
      const sku = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8)

      setFormData(prev => ({ ...prev, sku }))
    }
  }, [formData.name, formData.sku])

  const handlePaperStockToggle = (stockId: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedPaperStocks.includes(stockId)
      const newSelected = isSelected
        ? prev.selectedPaperStocks.filter(id => id !== stockId)
        : [...prev.selectedPaperStocks, stockId]

      // If this was the default and we're removing it, clear default
      const newDefault = isSelected && prev.defaultPaperStock === stockId
        ? (newSelected[0] || '')
        : prev.defaultPaperStock

      return {
        ...prev,
        selectedPaperStocks: newSelected,
        defaultPaperStock: newDefault
      }
    })
  }

  const handleAddOnToggle = (addOnId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addOnId)
        ? prev.selectedAddOns.filter(id => id !== addOnId)
        : [...prev.selectedAddOns, addOnId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Validate required fields
      if (!formData.name || !formData.sku || !formData.categoryId) {
        throw new Error('Please fill in all required fields')
      }

      if (formData.selectedPaperStocks.length === 0) {
        throw new Error('Please select at least one paper stock')
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        basePrice: parseFloat(formData.basePrice) || 0,
        setupFee: parseFloat(formData.setupFee) || 0,
        productionTime: parseInt(formData.productionTime) || 3,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        gangRunEligible: formData.gangRunEligible,
        rushAvailable: formData.rushAvailable,
        rushDays: formData.rushAvailable ? parseInt(formData.rushDays) || null : null,
        rushFee: formData.rushAvailable ? parseFloat(formData.rushFee) || null : null,
        selectedPaperStocks: formData.selectedPaperStocks,
        defaultPaperStock: formData.defaultPaperStock,
        selectedQuantityGroup: formData.selectedQuantityGroup || null,
        selectedSizeGroup: formData.selectedSizeGroup || null,
        selectedAddOns: formData.selectedAddOns
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      setSubmitSuccess(true)
      toast.success('Product created successfully!')

      // Redirect to product list after a short delay
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)

    } catch (error) {
      console.error('Error creating product:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create product')
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading) {
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

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product form data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show errors if any critical data failed to load
  const hasErrors = Object.values(errors).some(error => error !== null)
  if (hasErrors) {
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
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load required data. Please try refreshing the page.
            <br />
            Errors: {Object.entries(errors).filter(([, error]) => error).map(([key, error]) => `${key}: ${error}`).join(', ')}
          </AlertDescription>
        </Alert>
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
      </div>

      {submitSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Product created successfully! Redirecting to products list...
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Product SKU"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief product description for listings"
                maxLength={150}
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed product description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="basePrice">Base Price ($) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paper Stock Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Paper Stock Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select which paper stocks are available for this product. Choose a default option.
            </div>

            <div className="grid gap-3">
              {data.paperStocks?.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`stock-${stock.id}`}
                      checked={formData.selectedPaperStocks.includes(stock.id)}
                      onChange={() => handlePaperStockToggle(stock.id)}
                      className="rounded"
                    />
                    <div>
                      <Label htmlFor={`stock-${stock.id}`} className="font-medium">
                        {stock.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Weight: {stock.weight} | ${stock.pricePerSqInch}/sq in
                      </p>
                    </div>
                  </div>

                  {formData.selectedPaperStocks.includes(stock.id) && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`default-${stock.id}`}
                        name="defaultPaperStock"
                        checked={formData.defaultPaperStock === stock.id}
                        onChange={() => setFormData(prev => ({ ...prev, defaultPaperStock: stock.id }))}
                        className="rounded"
                      />
                      <Label htmlFor={`default-${stock.id}`} className="text-sm">
                        Default
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quantity and Size Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Quantity & Size Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantityGroup">Quantity Group</Label>
                <Select
                  value={formData.selectedQuantityGroup}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, selectedQuantityGroup: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity group" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.quantities?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.valuesList.join(', ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sizeGroup">Size Group</Label>
                <Select
                  value={formData.selectedSizeGroup}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, selectedSizeGroup: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size group" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.sizes?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.valuesList.join(', ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle>Add-on Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select which add-ons are available for this product.
            </div>

            <div className="grid gap-3">
              {data.addOns?.map((addOn) => (
                <div key={addOn.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={`addon-${addOn.id}`}
                    checked={formData.selectedAddOns.includes(addOn.id)}
                    onChange={() => handleAddOnToggle(addOn.id)}
                    className="rounded"
                  />
                  <div>
                    <Label htmlFor={`addon-${addOn.id}`} className="font-medium">
                      {addOn.name}
                    </Label>
                    {addOn.description && (
                      <p className="text-sm text-muted-foreground">
                        {addOn.description}
                      </p>
                    )}
                    <Badge variant="outline" className="mt-1">
                      {addOn.pricingModel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Production & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="productionTime">Production Time (days)</Label>
                <Input
                  id="productionTime"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.productionTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionTime: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="setupFee">Setup Fee ($)</Label>
                <Input
                  id="setupFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.setupFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupFee: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="rushAvailable"
                  checked={formData.rushAvailable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rushAvailable: checked }))}
                />
                <Label htmlFor="rushAvailable">Rush service available</Label>
              </div>

              {formData.rushAvailable && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="rushDays">Rush turnaround (days)</Label>
                    <Input
                      id="rushDays"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.rushDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, rushDays: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rushFee">Rush fee ($)</Label>
                    <Input
                      id="rushFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.rushFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, rushFee: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Product is active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
              />
              <Label htmlFor="isFeatured">Featured product</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="gangRunEligible"
                checked={formData.gangRunEligible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gangRunEligible: checked }))}
              />
              <Label htmlFor="gangRunEligible">Gang run eligible</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Product...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}