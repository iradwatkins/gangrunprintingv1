'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, Upload } from 'lucide-react'
import toast from '@/lib/toast'

interface ProductRow {
  id: string
  name: string
  slug: string
  sku: string
  category: string
  basePrice: string
  productionTime: string
  quantityGroup: string
  sizeGroup: string
  paperStockSet: string
  turnaroundSet: string
  addonSet: string
  description: string
  featured: boolean
  active: boolean
}

interface Category {
  id: string
  name: string
}

interface QuantityGroup {
  id: string
  name: string
}

interface SizeGroup {
  id: string
  name: string
}

interface PaperStockSet {
  id: string
  name: string
}

interface TurnaroundSet {
  id: string
  name: string
}

interface AddonSet {
  id: string
  name: string
}

export default function BulkCreateProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      slug: '',
      sku: '',
      category: '',
      basePrice: '',
      productionTime: '5',
      quantityGroup: '',
      sizeGroup: '',
      paperStockSet: '',
      turnaroundSet: '',
      addonSet: '',
      description: '',
      featured: false,
      active: true,
    },
  ])

  const [categories, setCategories] = useState<Category[]>([])
  const [quantityGroups, setQuantityGroups] = useState<QuantityGroup[]>([])
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([])
  const [paperStockSets, setPaperStockSets] = useState<PaperStockSet[]>([])
  const [turnaroundSets, setTurnaroundSets] = useState<TurnaroundSet[]>([])
  const [addonSets, setAddonSets] = useState<AddonSet[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch all dropdowns data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [categoriesRes, quantitiesRes, sizesRes, paperRes, turnaroundRes, addonRes] =
          await Promise.all([
            fetch('/api/product-categories'),
            fetch('/api/quantity-groups'),
            fetch('/api/size-groups'),
            fetch('/api/paper-stock-sets'),
            fetch('/api/turnaround-time-sets'),
            fetch('/api/addon-sets'),
          ])

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories || data)
        }

        if (quantitiesRes.ok) {
          const data = await quantitiesRes.json()
          setQuantityGroups(data.quantityGroups || data)
        }

        if (sizesRes.ok) {
          const data = await sizesRes.json()
          setSizeGroups(data.sizeGroups || data)
        }

        if (paperRes.ok) {
          const data = await paperRes.json()
          setPaperStockSets(data.paperStockSets || data)
        }

        if (turnaroundRes.ok) {
          const data = await turnaroundRes.json()
          setTurnaroundSets(data.turnaroundTimeSets || data)
        }

        if (addonRes.ok) {
          const data = await addonRes.json()
          setAddonSets(data.addonSets || data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load product options')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Add new product row
  const addRow = () => {
    setProducts([
      ...products,
      {
        id: crypto.randomUUID(),
        name: '',
        slug: '',
        sku: '',
        category: '',
        basePrice: '',
        productionTime: '5',
        quantityGroup: '',
        sizeGroup: '',
        paperStockSet: '',
        turnaroundSet: '',
        addonSet: '',
        description: '',
        featured: false,
        active: true,
      },
    ])
  }

  // Remove product row
  const removeRow = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  // Calculate base price when configuration changes
  const calculateBasePrice = async (product: ProductRow): Promise<string> => {
    // Only calculate if we have the essential selections
    if (!product.sizeGroup || !product.quantityGroup || !product.paperStockSet) {
      return product.basePrice || ''
    }

    try {
      // Get the first size and quantity to calculate base price
      const sizeGroup = sizeGroups.find((s) => s.id === product.sizeGroup)
      const quantityGroup = quantityGroups.find((q) => q.id === product.quantityGroup)
      const paperSet = paperStockSets.find((p) => p.id === product.paperStockSet)

      if (!sizeGroup || !quantityGroup || !paperSet) return product.basePrice || ''

      // Simple calculation based on square inches and quantity
      // This is a placeholder - you may have a more complex pricing formula
      const basePrice = 19.99 // Default starting price
      return basePrice.toFixed(2)
    } catch (error) {
      console.error('Error calculating price:', error)
      return product.basePrice || ''
    }
  }

  // Update product field
  const updateProduct = async (id: string, field: keyof ProductRow, value: any) => {
    setProducts(
      await Promise.all(
        products.map(async (p) => {
          if (p.id === id) {
            const updated = { ...p, [field]: value }

            // Auto-generate slug from name
            if (field === 'name' && value) {
              updated.slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }

            // Auto-calculate base price when configuration changes
            if (['sizeGroup', 'quantityGroup', 'paperStockSet'].includes(field)) {
              updated.basePrice = await calculateBasePrice(updated)
            }

            return updated
          }
          return p
        })
      )
    )
  }

  // Bulk create products
  const handleBulkCreate = async () => {
    // Validate all products
    const errors: string[] = []
    products.forEach((product, index) => {
      if (!product.name) errors.push(`Row ${index + 1}: Name is required`)
      if (!product.category) errors.push(`Row ${index + 1}: Category is required`)
      if (!product.sizeGroup) errors.push(`Row ${index + 1}: Size options are required`)
      if (!product.quantityGroup) errors.push(`Row ${index + 1}: Quantity options are required`)
      if (!product.paperStockSet) errors.push(`Row ${index + 1}: Paper stock is required`)
    })

    if (errors.length > 0) {
      toast.error(`Please fix errors:\n${errors.join('\n')}`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/products/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`✅ Successfully created ${data.created} products!`)
        // Reset form
        setProducts([
          {
            id: crypto.randomUUID(),
            name: '',
            slug: '',
            sku: '',
            category: '',
            basePrice: '',
            productionTime: '5',
            quantityGroup: '',
            sizeGroup: '',
            paperStockSet: '',
            turnaroundSet: '',
            addonSet: '',
            description: '',
            featured: false,
            active: true,
          },
        ])
      } else {
        toast.error(data.error || 'Failed to create products')
      }
    } catch (error) {
      console.error('Error creating products:', error)
      toast.error('Failed to create products')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading product options...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Create Products</h1>
        <p className="text-gray-600 mt-2">
          Create multiple products at once using dropdown selections
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Grid</CardTitle>
          <CardDescription>
            Fill in the details for each product. Slugs will be auto-generated from names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Product Rows */}
            {products.map((product, index) => (
              <div key={product.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Product #{index + 1}</h3>
                  <Button
                    disabled={products.length === 1}
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRow(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1: Basic Info */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Name *</Label>
                    <Input
                      className="mt-1"
                      placeholder="Product name"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Category *</Label>
                    <Select
                      value={product.category}
                      onValueChange={(value) => updateProduct(product.id, 'category', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-xs font-semibold text-gray-700">
                      SKU (Auto-generated)
                    </Label>
                    <Input
                      disabled
                      readOnly
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                      placeholder="Auto-generated on save..."
                      type="text"
                      value={product.sku || ''}
                    />
                  </div>

                  {/* Row 2: Auto-Calculated Fields */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Base Price (Auto-calculated)
                    </Label>
                    <Input
                      disabled
                      readOnly
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                      placeholder="Select options to calculate..."
                      type="text"
                      value={product.basePrice ? `$${product.basePrice}` : ''}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Production Days (Auto-set)
                    </Label>
                    <Input
                      disabled
                      readOnly
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                      placeholder="5 days"
                      type="text"
                      value={product.productionTime ? `${product.productionTime} days` : '5 days'}
                    />
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={product.active}
                        id={`active-${product.id}`}
                        onCheckedChange={(checked) => updateProduct(product.id, 'active', checked)}
                      />
                      <label className="text-sm cursor-pointer" htmlFor={`active-${product.id}`}>
                        Active
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={product.featured}
                        id={`featured-${product.id}`}
                        onCheckedChange={(checked) =>
                          updateProduct(product.id, 'featured', checked)
                        }
                      />
                      <label className="text-sm cursor-pointer" htmlFor={`featured-${product.id}`}>
                        Featured
                      </label>
                    </div>
                  </div>

                  {/* Row 3: Configuration Sets */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Quantity Options *
                    </Label>
                    <Select
                      value={product.quantityGroup}
                      onValueChange={(value) => updateProduct(product.id, 'quantityGroup', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select quantity set" />
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
                    <Label className="text-xs font-semibold text-gray-700">Size Options *</Label>
                    <Select
                      value={product.sizeGroup}
                      onValueChange={(value) => updateProduct(product.id, 'sizeGroup', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select size set" />
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
                    <Label className="text-xs font-semibold text-gray-700">Paper Stock *</Label>
                    <Select
                      value={product.paperStockSet}
                      onValueChange={(value) => updateProduct(product.id, 'paperStockSet', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select paper set" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperStockSets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 4: Optional Configuration */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Turnaround Times (Optional)
                    </Label>
                    <Select
                      value={product.turnaroundSet}
                      onValueChange={(value) => updateProduct(product.id, 'turnaroundSet', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select turnaround set" />
                      </SelectTrigger>
                      <SelectContent>
                        {turnaroundSets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Add-on Options (Optional)
                    </Label>
                    <Select
                      value={product.addonSet}
                      onValueChange={(value) => updateProduct(product.id, 'addonSet', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select addon set" />
                      </SelectTrigger>
                      <SelectContent>
                        {addonSets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description spans 2 columns */}
                  <div className="col-span-3">
                    <Label className="text-xs font-semibold text-gray-700">Description</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="Short description of the product"
                      rows={2}
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    />
                  </div>
                </div>

                {/* Auto-generated slug preview */}
                <div className="mt-3 text-xs text-gray-500">
                  <strong>URL:</strong> /products/{product.slug || '(auto-generated)'}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <Button className="ml-auto" disabled={saving} onClick={handleBulkCreate}>
              <Save className="h-4 w-4 mr-2" />
              {saving
                ? 'Creating...'
                : `Create ${products.length} Product${products.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview (Auto-generated Slugs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            {products.map((product, index) => (
              <div key={product.id} className="flex gap-2">
                <span className="text-gray-500">{index + 1}.</span>
                <span className="font-semibold">{product.name || '(unnamed)'}</span>
                <span className="text-gray-400">→</span>
                <span className="text-blue-600">
                  /products/{product.slug || '(auto-generated)'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
