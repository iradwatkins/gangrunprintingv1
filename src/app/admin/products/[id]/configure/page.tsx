'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import toast from '@/lib/toast'

interface MaterialType {
  id: string
  name: string
  basePrice: number
  shippingWeight: number
  isActive: boolean
  coatings: Array<{
    id: string
    label: string
    enabled: boolean
  }>
  sidesOptions: Array<{
    id: string
    label: string
    enabled: boolean
    multiplier: number
  }>
  defaultCoating: string
  defaultSides: string
}

interface Size {
  id: string
  displayName: string
  width: number
  height: number
  squareInches: number
}

interface Quantity {
  id: string
  value: number
  isDefault: boolean
}

interface ProductConfig {
  id: string
  name: string
  sku: string
  selectedMaterialTypes: string[]
  selectedSizes: string[]
  selectedQuantities: string[]
  defaultMaterialType: string
  defaultSize: string
  defaultQuantity: string
}

export default function ConfigureProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [product, setProduct] = useState<ProductConfig | null>(null)
  const [availableMaterialTypes, setAvailableMaterialTypes] = useState<MaterialType[]>([])
  const [availableSizes, setAvailableSizes] = useState<Size[]>([])
  const [availableQuantities, setAvailableQuantities] = useState<Quantity[]>([])

  useEffect(() => {
    fetchProductData()
  }, [id])

  const fetchProductData = async () => {
    try {
      // Mock data - would come from API
      const mockProduct: ProductConfig = {
        id: id,
        name: 'Standard Flyers',
        sku: 'FLY-001',
        selectedMaterialTypes: [],
        selectedSizes: ['1', '2', '3'],
        selectedQuantities: ['1', '2', '3', '4'],
        defaultMaterialType: '',
        defaultSize: '1',
        defaultQuantity: '3'
      }

      // Load material types from localStorage (central management)
      const storedMaterials = localStorage.getItem('materialTypes')
      const materials: MaterialType[] = storedMaterials ? JSON.parse(storedMaterials) : []
      
      // Only show active materials
      const activeMaterials = materials.filter(m => m.isActive)
      setAvailableMaterialTypes(activeMaterials)
      
      // Set selected materials if any
      if (activeMaterials.length > 0) {
        mockProduct.selectedMaterialTypes = activeMaterials.map(m => m.id)
        mockProduct.defaultMaterialType = activeMaterials[0].id
      }

      const mockSizes: Size[] = [
        { id: '1', displayName: '4x6', width: 4, height: 6, squareInches: 24 },
        { id: '2', displayName: '5x7', width: 5, height: 7, squareInches: 35 },
        { id: '3', displayName: '8.5x11', width: 8.5, height: 11, squareInches: 93.5 },
        { id: '4', displayName: '8.5x14', width: 8.5, height: 14, squareInches: 119 },
        { id: '5', displayName: '11x17', width: 11, height: 17, squareInches: 187 }
      ]

      const mockQuantities: Quantity[] = [
        { id: '1', value: 100, isDefault: false },
        { id: '2', value: 250, isDefault: false },
        { id: '3', value: 500, isDefault: true },
        { id: '4', value: 1000, isDefault: false },
        { id: '5', value: 2500, isDefault: false },
        { id: '6', value: 5000, isDefault: false }
      ]

      setProduct(mockProduct)
      setAvailableSizes(mockSizes)
      setAvailableQuantities(mockQuantities)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialToggle = (materialId: string) => {
    if (!product) return
    
    const isSelected = product.selectedMaterialTypes.includes(materialId)
    if (isSelected) {
      // Remove if it's not the only one selected
      if (product.selectedMaterialTypes.length > 1) {
        setProduct({
          ...product,
          selectedMaterialTypes: product.selectedMaterialTypes.filter(id => id !== materialId),
          defaultMaterialType: product.defaultMaterialType === materialId ? product.selectedMaterialTypes.find(id => id !== materialId) || '' : product.defaultMaterialType
        })
      } else {
        toast.error('At least one material type must be selected')
      }
    } else {
      // Add
      setProduct({
        ...product,
        selectedMaterialTypes: [...product.selectedMaterialTypes, materialId],
        defaultMaterialType: product.selectedMaterialTypes.length === 0 ? materialId : product.defaultMaterialType
      })
    }
  }

  const handleSizeToggle = (sizeId: string) => {
    if (!product) return
    
    const isSelected = product.selectedSizes.includes(sizeId)
    if (isSelected) {
      if (product.selectedSizes.length > 1) {
        setProduct({
          ...product,
          selectedSizes: product.selectedSizes.filter(id => id !== sizeId),
          defaultSize: product.defaultSize === sizeId ? product.selectedSizes.find(id => id !== sizeId) || '' : product.defaultSize
        })
      } else {
        toast.error('At least one size must be selected')
      }
    } else {
      setProduct({
        ...product,
        selectedSizes: [...product.selectedSizes, sizeId],
        defaultSize: product.selectedSizes.length === 0 ? sizeId : product.defaultSize
      })
    }
  }

  const handleQuantityToggle = (qtyId: string) => {
    if (!product) return
    
    const isSelected = product.selectedQuantities.includes(qtyId)
    if (isSelected) {
      if (product.selectedQuantities.length > 1) {
        setProduct({
          ...product,
          selectedQuantities: product.selectedQuantities.filter(id => id !== qtyId),
          defaultQuantity: product.defaultQuantity === qtyId ? product.selectedQuantities.find(id => id !== qtyId) || '' : product.defaultQuantity
        })
      } else {
        toast.error('At least one quantity must be selected')
      }
    } else {
      setProduct({
        ...product,
        selectedQuantities: [...product.selectedQuantities, qtyId],
        defaultQuantity: product.selectedQuantities.length === 0 ? qtyId : product.defaultQuantity
      })
    }
  }

  const handleSetDefault = (type: 'material' | 'size' | 'quantity', id: string) => {
    if (!product) return
    
    if (type === 'material') {
      setProduct({ ...product, defaultMaterialType: id })
    } else if (type === 'size') {
      setProduct({ ...product, defaultSize: id })
    } else {
      setProduct({ ...product, defaultQuantity: id })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Would save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Product configuration saved')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading product configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Configure {product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <Button disabled={saving} onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <Tabs className="space-y-4" defaultValue="material">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="material">
            Material Types ({product.selectedMaterialTypes.length})
          </TabsTrigger>
          <TabsTrigger value="sizes">
            Sizes ({product.selectedSizes.length})
          </TabsTrigger>
          <TabsTrigger value="quantities">
            Quantities ({product.selectedQuantities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="material">
          <Card>
            <CardHeader>
              <CardTitle>Material Type Configuration</CardTitle>
              <CardDescription>
                Select which material types are available for this product.
                Material types are managed centrally in the Material Types section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableMaterialTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No material types found. Please create material types first.
                  </p>
                  <Button asChild>
                    <Link href="/admin/paper-stocks">
                      Go to Material Management
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Active</TableHead>
                      <TableHead>Material Type</TableHead>
                      <TableHead>Base Price/sq in</TableHead>
                      <TableHead>Available Options</TableHead>
                      <TableHead>Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableMaterialTypes.map((material) => {
                      const isSelected = product.selectedMaterialTypes.includes(material.id)
                      const isDefault = product.defaultMaterialType === material.id
                      const samplePrice = (material.basePrice * 24 * 500).toFixed(2)
                      
                      return (
                        <TableRow key={material.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleMaterialToggle(material.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{material.name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            ${material.basePrice.toFixed(8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge className="text-xs" variant="outline">
                                {material.coatings.length} coatings
                              </Badge>
                              <Badge className="text-xs" variant="outline">
                                {material.sidesOptions.length} sides
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSelected && (
                              isDefault ? (
                                <Badge className="bg-green-100 text-green-800">Default</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetDefault('material', material.id)}
                                >
                                  Set Default
                                </Button>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes">
          <Card>
            <CardHeader>
              <CardTitle>Size Configuration</CardTitle>
              <CardDescription>
                Select which sizes are available for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Active</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Square Inches</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSizes.map((size) => {
                    const isSelected = product.selectedSizes.includes(size.id)
                    const isDefault = product.defaultSize === size.id
                    
                    return (
                      <TableRow key={size.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSizeToggle(size.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{size.displayName}</TableCell>
                        <TableCell>{size.width}" × {size.height}"</TableCell>
                        <TableCell>{size.squareInches} sq in</TableCell>
                        <TableCell>
                          {isSelected && (
                            isDefault ? (
                              <Badge className="bg-green-100 text-green-800">Default</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetDefault('size', size.id)}
                              >
                                Set Default
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantities">
          <Card>
            <CardHeader>
              <CardTitle>Quantity Configuration</CardTitle>
              <CardDescription>
                Select which quantities are available for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Active</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableQuantities.map((qty) => {
                    const isSelected = product.selectedQuantities.includes(qty.id)
                    const isDefault = product.defaultQuantity === qty.id
                    
                    return (
                      <TableRow key={qty.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleQuantityToggle(qty.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {qty.value.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {isSelected && (
                            isDefault ? (
                              <Badge className="bg-green-100 text-green-800">Default</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetDefault('quantity', qty.id)}
                              >
                                Set Default
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Selected Material Types:</p>
            <div className="flex flex-wrap gap-2">
              {product.selectedMaterialTypes.map(id => {
                const material = availableMaterialTypes.find(m => m.id === id)
                return material ? (
                  <Badge key={id} variant={id === product.defaultMaterialType ? 'default' : 'secondary'}>
                    {material.name}
                    {id === product.defaultMaterialType && ' (Default)'}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Selected Sizes:</p>
            <div className="flex flex-wrap gap-2">
              {product.selectedSizes.map(id => {
                const size = availableSizes.find(s => s.id === id)
                return size ? (
                  <Badge key={id} variant={id === product.defaultSize ? 'default' : 'secondary'}>
                    {size.displayName}
                    {id === product.defaultSize && ' (Default)'}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Selected Quantities:</p>
            <div className="flex flex-wrap gap-2">
              {product.selectedQuantities.map(id => {
                const qty = availableQuantities.find(q => q.id === id)
                return qty ? (
                  <Badge key={id} variant={id === product.defaultQuantity ? 'default' : 'secondary'}>
                    {qty.value.toLocaleString()}
                    {id === product.defaultQuantity && ' (Default)'}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}