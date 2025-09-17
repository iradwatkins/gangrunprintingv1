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

    // Single selections
    selectedPaperStock: '', // Single paper stock ID
    selectedQuantity: '', // Single quantity ID
    selectedSize: '', // Single size ID

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

      if (paperRes.ok) {
        const paperData = await paperRes.json()
        setPaperStocks(paperData)
        // Set first paper stock as default
        if (paperData.length > 0) {
          setFormData(prev => ({ ...prev, selectedPaperStock: paperData[0].id }))
        }
      }

      if (qtyRes.ok) {
        const qtyData = await qtyRes.json()
        setQuantities(qtyData)
        // Set first quantity as default
        if (qtyData.length > 0) {
          setFormData(prev => ({ ...prev, selectedQuantity: qtyData[0].id }))
        }
      }

      if (sizeRes.ok) {
        const sizeData = await sizeRes.json()
        setSizes(sizeData)
        // Set first size as default
        if (sizeData.length > 0) {
          setFormData(prev => ({ ...prev, selectedSize: sizeData[0].id }))
        }
      }

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
          paperStock: formData.selectedPaperStock,
          quantity: formData.selectedQuantity,
          size: formData.selectedSize,
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

    if (!formData.selectedPaperStock) {
      toast.error('Please select a paper stock')
      return
    }

    if (!formData.selectedQuantity) {
      toast.error('Please select a quantity option')
      return
    }

    if (!formData.selectedSize) {
      toast.error('Please select a size option')
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

      {/* Quantity Options - MOVED UP */}
      <Card>
        <CardHeader>
          <CardTitle>Quantity Option (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.selectedQuantity}
            onValueChange={(value) => setFormData({...formData, selectedQuantity: value})}
            className="grid grid-cols-4 gap-4"
          >
            {quantities.map(qty => (
              <div key={qty.id} className="flex items-center gap-2">
                <RadioGroupItem value={qty.id} id={`qty-${qty.id}`} />
                <Label htmlFor={`qty-${qty.id}`} className="cursor-pointer font-normal">
                  {qty.displayValue}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Paper Stock - Now as dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>Paper Stock *</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.selectedPaperStock}
            onValueChange={(value) => setFormData({...formData, selectedPaperStock: value})}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select paper stock" />
            </SelectTrigger>
            <SelectContent>
              {paperStocks.map(stock => (
                <SelectItem key={stock.id} value={stock.id}>
                  {stock.name} - {stock.weight}pt (${stock.pricePerSqInch}/sq in)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.selectedPaperStock && (
            <p className="text-sm text-muted-foreground mt-2">
              This will be the default paper stock. Customers can select different options on the frontend.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Size Options - Changed to radio */}
      <Card>
        <CardHeader>
          <CardTitle>Size Option (Choose One) *</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.selectedSize}
            onValueChange={(value) => setFormData({...formData, selectedSize: value})}
            className="grid grid-cols-4 gap-4"
          >
            {sizes.map(size => (
              <div key={size.id} className="flex items-center gap-2">
                <RadioGroupItem value={size.id} id={`size-${size.id}`} />
                <Label htmlFor={`size-${size.id}`} className="cursor-pointer font-normal">
                  {size.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Add-on Options - Keep as checkboxes */}
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