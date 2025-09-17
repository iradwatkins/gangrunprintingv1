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
import toast from '@/lib/toast'
import { ArrowLeft, Save, Loader2, Calculator } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [paperStocks, setPaperStocks] = useState<any[]>([])
  const [quantities, setQuantities] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [addOns, setAddOns] = useState<any[]>([])

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

    // Paper Stock
    selectedPaperStocks: [] as string[],

    // Quantities
    selectedQuantities: [] as string[],

    // Sizes
    selectedSizes: [] as string[],

    // Add-ons
    selectedAddOns: [] as string[],

    // Turnaround
    productionTime: 3,
    rushAvailable: false,
    rushDays: 1,
    rushFee: 0,

    // Pricing
    basePrice: 0,
    setupFee: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

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

  const fetchData = async () => {
    try {
      const [catRes, paperRes, qtyRes, sizeRes, addOnRes] = await Promise.all([
        fetch('/api/product-categories'),
        fetch('/api/paper-stocks'),
        fetch('/api/quantities'),
        fetch('/api/sizes'),
        fetch('/api/add-ons')
      ])

      if (catRes.ok) setCategories(await catRes.json())
      if (paperRes.ok) setPaperStocks(await paperRes.json())
      if (qtyRes.ok) setQuantities(await qtyRes.json())
      if (sizeRes.ok) setSizes(await sizeRes.json())
      if (addOnRes.ok) setAddOns(await addOnRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const testPrice = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/pricing/calculate-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice: formData.basePrice,
          setupFee: formData.setupFee,
          paperStocks: formData.selectedPaperStocks,
          quantities: formData.selectedQuantities,
          sizes: formData.selectedSizes,
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

    setLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Product created successfully')
        router.push('/admin/products')
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Save Product</span>
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
            <div>
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

      {/* Paper Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Paper Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {paperStocks.map(stock => (
              <div key={stock.id} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.selectedPaperStocks.includes(stock.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, selectedPaperStocks: [...formData.selectedPaperStocks, stock.id]})
                    } else {
                      setFormData({...formData, selectedPaperStocks: formData.selectedPaperStocks.filter(id => id !== stock.id)})
                    }
                  }}
                />
                <Label className="cursor-pointer">{stock.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quantity Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quantity Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {quantities.map(qty => (
              <div key={qty.id} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.selectedQuantities.includes(qty.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, selectedQuantities: [...formData.selectedQuantities, qty.id]})
                    } else {
                      setFormData({...formData, selectedQuantities: formData.selectedQuantities.filter(id => id !== qty.id)})
                    }
                  }}
                />
                <Label className="cursor-pointer">{qty.displayValue}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Size Options */}
      <Card>
        <CardHeader>
          <CardTitle>Size Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {sizes.map(size => (
              <div key={size.id} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.selectedSizes.includes(size.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, selectedSizes: [...formData.selectedSizes, size.id]})
                    } else {
                      setFormData({...formData, selectedSizes: formData.selectedSizes.filter(id => id !== size.id)})
                    }
                  }}
                />
                <Label className="cursor-pointer">{size.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-on Options */}
      <Card>
        <CardHeader>
          <CardTitle>Add-on Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {addOns.filter(addon => addon.isActive).map(addon => (
              <div key={addon.id} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.selectedAddOns.includes(addon.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, selectedAddOns: [...formData.selectedAddOns, addon.id]})
                    } else {
                      setFormData({...formData, selectedAddOns: formData.selectedAddOns.filter(id => id !== addon.id)})
                    }
                  }}
                />
                <Label className="cursor-pointer">{addon.name}</Label>
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