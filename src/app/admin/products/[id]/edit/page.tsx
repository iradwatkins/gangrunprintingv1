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
import { Badge } from '@/components/ui/badge'
import toast from '@/lib/toast'
import { ArrowLeft, Save, Loader2, Calculator, Eye } from 'lucide-react'
import Link from 'next/link'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  return <EditProductClient id={id} />
}

function EditProductClient({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [paperStocks, setPaperStocks] = useState<any[]>([])
  const [quantityGroups, setQuantityGroups] = useState<any[]>([])
  const [sizeGroups, setSizeGroups] = useState<any[]>([])
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

  useEffect(() => {
    fetchData()
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      const data = await res.json()

      // Map the product data to form data structure
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        categoryId: data.categoryId || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        images: data.ProductImage || [],

        // Map paper stocks
        selectedPaperStocks: data.productPaperStocks?.map((ps: any) => ps.paperStockId) || [],
        defaultPaperStock: data.productPaperStocks?.find((ps: any) => ps.isDefault)?.paperStockId || '',

        // Map quantity and size groups
        selectedQuantityGroup: data.productQuantityGroups?.[0]?.quantityGroupId || '',
        selectedSizeGroup: data.productSizeGroups?.[0]?.sizeGroupId || '',

        // Map add-ons
        selectedAddOns: data.productAddOns?.map((pa: any) => pa.addOnId) || [],

        // Turnaround times
        productionTime: data.productionTime || 3,
        rushAvailable: data.rushAvailable || false,
        rushDays: data.rushDays || 1,
        rushFee: data.rushFee || 0,

        // Pricing
        basePrice: data.basePrice || 0,
        setupFee: data.setupFee || 0,
      })
    } catch (error) {
      toast.error('Failed to load product')
      console.error(error)
    } finally {
      setLoadingProduct(false)
    }
  }

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
      if (qtyRes.ok) setQuantityGroups(await qtyRes.json())
      if (sizeRes.ok) setSizeGroups(await sizeRes.json())
      if (addOnRes.ok) setAddOns(await addOnRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

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
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Product updated successfully')
        router.push('/admin/products')
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/products/${formData.sku}`} target="_blank">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Product
            </Button>
          </Link>
          <Button variant="outline" onClick={testPrice} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            <span className="ml-2">Test Price</span>
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Save Changes</span>
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
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
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
          <CardTitle>Turnaround Times & Pricing</CardTitle>
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