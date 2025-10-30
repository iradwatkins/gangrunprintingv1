'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Separator } from '@/components/ui/separator'
import toast from '@/lib/toast'
import { generateSlug } from '@/lib/utils'
import {
  Package,
  DollarSign,
  Clock,
  Layers,
  FileText,
  Image as ImageIcon,
  Settings,
  Zap,
  Save,
  Loader2,
  Ruler,
} from 'lucide-react'
import { ProductImageUpload } from './product-image-upload'
import { ProductPaperStocks } from './product-paper-stocks'
import { ProductOptions } from './product-options'
import { PricingCalculator } from './pricing-calculator'
import { ProductQuantities } from './product-quantities'
import { ProductSizes } from './product-sizes'

interface ProductFormProps {
  product?: any
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [paperStocks, setPaperStocks] = useState([])
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    basePrice: product?.basePrice || 0,
    setupFee: product?.setupFee || 0,
    productionTime: product?.productionTime || 3,
    rushAvailable: product?.rushAvailable || false,
    rushDays: product?.rushDays || 1,
    rushFee: product?.rushFee || 0,
    gangRunEligible: product?.gangRunEligible || false,
    minGangQuantity: product?.minGangQuantity || 100,
    maxGangQuantity: product?.maxGangQuantity || 1000,
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured || false,
    images: product?.images || [],
    paperStocks: product?.paperStocks || [],
    options: product?.options || [],
    pricingTiers: product?.pricingTiers || [],
    useQuantityGroup: product?.quantityGroupId ? true : false,
    quantityGroupId: product?.quantityGroupId || '',
    quantityIds: product?.quantityIds || [],
    useSizeGroup: product?.sizeGroupId ? true : false,
    sizeGroupId: product?.sizeGroupId || '',
    sizeIds: product?.sizeIds || [],
  })

  useEffect(() => {
    fetchCategories()
    fetchPaperStocks()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/product-categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {}
  }

  const fetchPaperStocks = async () => {
    try {
      const res = await fetch('/api/paper-stocks')
      if (res.ok) {
        const data = await res.json()
        setPaperStocks(data.filter((ps: any) => ps.isActive))
      }
    } catch (error) {}
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'

      const method = product ? 'PUT' : 'POST'

      // Clean up the data before sending
      const dataToSend = {
        ...formData,
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save product')
      }

      toast.success(product ? 'Product updated successfully' : 'Product created successfully')
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs className="space-y-6" defaultValue="basic">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger className="flex items-center gap-2" value="basic">
            <Package className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="images">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="quantities">
            <Layers className="h-4 w-4" />
            Quantities
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="sizes">
            <Ruler className="h-4 w-4" />
            Sizes
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="pricing">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="paper">
            <FileText className="h-4 w-4" />
            Paper Stock
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="options">
            <Settings className="h-4 w-4" />
            Options
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="production">
            <Clock className="h-4 w-4" />
            Production
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential product details and descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    required
                    id="name"
                    placeholder="e.g., Business Cards - Premium"
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="business-cards-premium"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    required
                    id="sku"
                    placeholder="BC-PREM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief product description for listings"
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this product available for purchase
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Product</Label>
                  <p className="text-sm text-muted-foreground">Display prominently on homepage</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload and manage product images</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="quantities">
          <ProductQuantities
            productId={product?.id}
            selectedQuantities={formData.quantityIds}
            selectedQuantityGroup={formData.quantityGroupId}
            onChange={(data) => {
              setFormData((prev) => ({
                ...prev,
                useQuantityGroup: data.useGroup,
                quantityGroupId: data.quantityGroupId || '',
                quantityIds: data.quantityIds || [],
              }))
            }}
          />
        </TabsContent>

        <TabsContent className="space-y-6" value="sizes">
          <ProductSizes
            productId={product?.id}
            selectedSizeGroup={formData.sizeGroupId}
            selectedSizes={formData.sizeIds}
            onChange={(data) => {
              setFormData((prev) => ({
                ...prev,
                useSizeGroup: data.useGroup,
                sizeGroupId: data.sizeGroupId || '',
                sizeIds: data.sizeIds || [],
              }))
            }}
          />
        </TabsContent>

        <TabsContent className="space-y-6" value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Set base prices and quantity tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($) *</Label>
                  <Input
                    required
                    id="basePrice"
                    step="0.01"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, basePrice: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupFee">Setup Fee ($)</Label>
                  <Input
                    id="setupFee"
                    step="0.01"
                    type="number"
                    value={formData.setupFee}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, setupFee: parseFloat(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <PricingCalculator
                basePrice={formData.basePrice}
                options={formData.options}
                paperStocks={formData.paperStocks}
                pricingTiers={formData.pricingTiers}
                setupFee={formData.setupFee}
                onTiersChange={(tiers) => setFormData((prev) => ({ ...prev, pricingTiers: tiers }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="paper">
          <Card>
            <CardHeader>
              <CardTitle>Paper Stock Options</CardTitle>
              <CardDescription>Configure available paper stocks for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPaperStocks
                selectedStocks={formData.paperStocks}
                onStocksChange={(stocks) =>
                  setFormData((prev) => ({ ...prev, paperStocks: stocks }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="options">
          <Card>
            <CardHeader>
              <CardTitle>Product Options</CardTitle>
              <CardDescription>
                Add customizable options like size, finish, and binding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductOptions
                options={formData.options}
                onOptionsChange={(options) => setFormData((prev) => ({ ...prev, options }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="production">
          <Card>
            <CardHeader>
              <CardTitle>Production Settings</CardTitle>
              <CardDescription>Configure production time and gang run settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productionTime">Standard Production Time (Business Days) *</Label>
                  <Input
                    required
                    id="productionTime"
                    min="1"
                    type="number"
                    value={formData.productionTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, productionTime: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Rush Production Available
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Offer expedited production for urgent orders
                      </p>
                    </div>
                    <Switch
                      checked={formData.rushAvailable}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, rushAvailable: checked }))
                      }
                    />
                  </div>

                  {formData.rushAvailable && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="rushDays">Rush Production Time (Days)</Label>
                        <Input
                          id="rushDays"
                          min="1"
                          type="number"
                          value={formData.rushDays}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, rushDays: parseInt(e.target.value) }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rushFee">Rush Fee ($)</Label>
                        <Input
                          id="rushFee"
                          step="0.01"
                          type="number"
                          value={formData.rushFee}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              rushFee: parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Gang Run Eligible
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow this product to be combined with others for cost savings
                      </p>
                    </div>
                    <Switch
                      checked={formData.gangRunEligible}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, gangRunEligible: checked }))
                      }
                    />
                  </div>

                  {formData.gangRunEligible && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="minGangQuantity">Minimum Gang Quantity</Label>
                        <Input
                          id="minGangQuantity"
                          min="1"
                          type="number"
                          value={formData.minGangQuantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minGangQuantity: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxGangQuantity">Maximum Gang Quantity</Label>
                        <Input
                          id="maxGangQuantity"
                          min="1"
                          type="number"
                          value={formData.maxGangQuantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxGangQuantity: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
        <Button disabled={loading} type="submit">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
