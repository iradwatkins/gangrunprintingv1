'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import toast from '@/lib/toast'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    categoryId: ''
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      setCategoriesError(null)

      try {
        const response = await fetch('/api/product-categories?active=true')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        // Error is already captured in state for UI display
        setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Product - Step 1</h1>
            <p className="text-muted-foreground">Ultra basic test to see if page renders</p>
          </div>
        </div>

        {/* Basic Product Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Product - Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  const sku = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)
                  setFormData(prev => ({ ...prev, name, sku }))
                }}
                placeholder="e.g., Premium Business Cards"
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Auto-generated from name"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Base Price * ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading categories...</span>
                </div>
              ) : categoriesError ? (
                <div className="p-3 border border-red-200 rounded-md bg-red-50">
                  <p className="text-sm text-red-600">Error: {categoriesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={() => {
                  const selectedCategory = categories.find(c => c.id === formData.categoryId)
                  // Show success toast notification
                  toast.success(`Creating product: ${formData.name}`)

                  // TODO: Implement API call to create product
                  // const productData = {
                  //   name: formData.name,
                  //   sku: formData.sku,
                  //   price: parseFloat(formData.price),
                  //   categoryId: formData.categoryId,
                  //   categoryName: selectedCategory?.name || 'None'
                  // }
                  // await createProduct(productData)
                }}
                disabled={!formData.name || !formData.sku || !formData.price || !formData.categoryId}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Product (Test)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {formData.name || 'Not entered'}</p>
              <p><strong>SKU:</strong> {formData.sku || 'Not generated'}</p>
              <p><strong>Price:</strong> {formData.price ? `$${formData.price}` : 'Not entered'}</p>
              <p><strong>Category:</strong> {
                formData.categoryId
                  ? categories.find(c => c.id === formData.categoryId)?.name || 'Unknown'
                  : 'Not selected'
              }</p>
              <p className="mt-4 text-muted-foreground">
                Categories loaded: {categories.length} |
                {loadingCategories ? ' Loading...' : categoriesError ? ' Error loading' : ' Ready'}
              </p>
              <p className="text-muted-foreground">
                This is a test form. When you fill in all fields, the Create Product button will become enabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}