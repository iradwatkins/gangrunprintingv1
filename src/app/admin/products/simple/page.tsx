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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import toast from '@/lib/toast'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'

export default function SimpleProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiLoading, setApiLoading] = useState(true)

  // Data from database
  const [categories, setCategories] = useState([])
  const [paperStocks, setPaperStocks] = useState([])
  const [quantityGroups, setQuantityGroups] = useState([])
  const [sizeGroups, setSizeGroups] = useState([])

  // Form data - simplified
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    isActive: true,
    isFeatured: false,
    paperStockId: '',
    quantityGroupId: '',
    sizeGroupId: '',
    basePrice: 0,
    setupFee: 0,
    productionTime: 3,
  })

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Auto-generate SKU from name
  useEffect(() => {
    if (formData.name) {
      const sku = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, sku }))
    }
  }, [formData.name])

  const fetchDropdownData = async () => {
    try {
      setApiLoading(true)

      const [catRes, paperRes, qtyRes, sizeRes] = await Promise.all([
        fetch('/api/product-categories'),
        fetch('/api/paper-stocks'),
        fetch('/api/quantities'),
        fetch('/api/sizes')
      ])

      if (catRes.ok) {
        const data = await catRes.json()
        setCategories(data)
        console.log('Categories loaded:', data.length)
      }

      if (paperRes.ok) {
        const data = await paperRes.json()
        setPaperStocks(data)
        console.log('Paper stocks loaded:', data.length)
      }

      if (qtyRes.ok) {
        const data = await qtyRes.json()
        setQuantityGroups(data)
        console.log('Quantity groups loaded:', data.length)
      }

      if (sizeRes.ok) {
        const data = await sizeRes.json()
        setSizeGroups(data)
        console.log('Size groups loaded:', data.length)
      }

    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      toast.error('Failed to load form data')
    } finally {
      setApiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.categoryId || !formData.paperStockId ||
        !formData.quantityGroupId || !formData.sizeGroupId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    console.log('Submitting form data:', formData)

    try {
      const response = await fetch('/api/products/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      console.log('Response:', response.status, result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      toast.success('Product created successfully!')
      router.push('/admin/products')

    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  if (apiLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading form data...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if we have the required data
  const hasRequiredData = categories.length > 0 && paperStocks.length > 0 &&
                          quantityGroups.length > 0 && sizeGroups.length > 0

  if (!hasRequiredData) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Required Data</AlertTitle>
          <AlertDescription>
            <p className="mb-2">The following data is missing:</p>
            {categories.length === 0 && <p>• No categories found</p>}
            {paperStocks.length === 0 && <p>• No paper stocks found</p>}
            {quantityGroups.length === 0 && <p>• No quantity groups found</p>}
            {sizeGroups.length === 0 && <p>• No size groups found</p>}
            <p className="mt-2">Please run the database seed scripts first.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Simple Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Standard Business Cards"
                required
              />
            </div>

            {/* SKU (auto-generated) */}
            <div>
              <Label htmlFor="sku">SKU (auto-generated)</Label>
              <Input
                id="sku"
                value={formData.sku}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({...formData, categoryId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paper Stock */}
            <div>
              <Label htmlFor="paperStock">Paper Stock *</Label>
              <Select
                value={formData.paperStockId}
                onValueChange={(value) => setFormData({...formData, paperStockId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select paper stock" />
                </SelectTrigger>
                <SelectContent>
                  {paperStocks.map((stock: any) => (
                    <SelectItem key={stock.id} value={stock.id}>
                      {stock.name} - {stock.weight}pt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Group */}
            <div>
              <Label htmlFor="quantityGroup">Quantity Options *</Label>
              <Select
                value={formData.quantityGroupId}
                onValueChange={(value) => setFormData({...formData, quantityGroupId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity group" />
                </SelectTrigger>
                <SelectContent>
                  {quantityGroups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Group */}
            <div>
              <Label htmlFor="sizeGroup">Size Options *</Label>
              <Select
                value={formData.sizeGroupId}
                onValueChange={(value) => setFormData({...formData, sizeGroupId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size group" />
                </SelectTrigger>
                <SelectContent>
                  {sizeGroups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Product description..."
              />
            </div>

            {/* Production Time */}
            <div>
              <Label htmlFor="productionTime">Production Time (days)</Label>
              <Input
                id="productionTime"
                type="number"
                min="1"
                value={formData.productionTime}
                onChange={(e) => setFormData({...formData, productionTime: parseInt(e.target.value) || 3})}
              />
            </div>

            {/* Toggles */}
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

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}