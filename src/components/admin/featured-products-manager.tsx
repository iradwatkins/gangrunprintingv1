'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type FeaturedProduct = any
type Product = any

interface FeaturedProductsManagerProps {
  featuredProducts: FeaturedProduct[]
  allProducts: Product[]
}

function SortableFeaturedProduct({ featured, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: featured.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const imageUrl =
    featured.customImageUrl || featured.Product.images[0]?.imageUrl || '/placeholder.png'

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:bg-gray-50"
      style={style}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
        <Image
          fill
          alt={featured.customTitle || featured.Product.name}
          className="object-cover"
          src={imageUrl}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{featured.customTitle || featured.Product.name}</span>
          {!featured.isActive && <EyeOff className="h-4 w-4 text-gray-400" />}
          {featured.showBadge && featured.badgeText && (
            <Badge
              className="text-xs"
              style={{ backgroundColor: featured.badgeColor || undefined }}
            >
              {featured.badgeText}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {featured.customDescription ||
            featured.Product.description ||
            featured.Product.Category?.name}
        </p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(featured)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(featured.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function FeaturedProductsManager({
  featuredProducts: initialFeatured,
  allProducts,
}: FeaturedProductsManagerProps) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customization, setCustomization] = useState({
    customTitle: '',
    customDescription: '',
    customImageUrl: '',
    showBadge: false,
    badgeText: '',
    badgeColor: '#000000',
    isActive: true,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredProducts = allProducts.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = featured.findIndex((item: any) => item.id === active.id)
      const newIndex = featured.findIndex((item: any) => item.id === over.id)

      const newFeatured = arrayMove(featured, oldIndex, newIndex)
      setFeatured(newFeatured)

      const updates = newFeatured.map((item: any, index: number) => ({
        id: item.id,
        sortOrder: index,
      }))

      try {
        await fetch('/api/admin/featured-products/bulk-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        })
      } catch (error) {
        console.error('Error updating sort order:', error)
      }
    }
  }

  const handleAddFeatured = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch('/api/admin/featured-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          sortOrder: featured.length,
          ...customization,
        }),
      })

      if (!response.ok) throw new Error('Failed to add featured product')

      const createdFeatured = await response.json()
      setFeatured([...featured, createdFeatured])
      setIsAddDialogOpen(false)
      setSelectedProduct(null)
      setCustomization({
        customTitle: '',
        customDescription: '',
        customImageUrl: '',
        showBadge: false,
        badgeText: '',
        badgeColor: '#000000',
        isActive: true,
      })
    } catch (error) {
      console.error('Error adding featured product:', error)
      alert('Failed to add featured product')
    }
  }

  const handleDeleteFeatured = async (featuredId: string) => {
    if (!confirm('Are you sure you want to remove this from featured products?')) return

    try {
      await fetch(`/api/admin/featured-products/${featuredId}`, {
        method: 'DELETE',
      })
      setFeatured(featured.filter((item: any) => item.id !== featuredId))
    } catch (error) {
      console.error('Error deleting featured product:', error)
      alert('Failed to remove featured product')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Featured Products ({featured.length})</CardTitle>
            <CardDescription>
              Drag and drop to reorder. These products will be highlighted on your homepage.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Featured Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Featured Product</DialogTitle>
                <DialogDescription>
                  Select a product and optionally customize how it appears
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search by product name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredProducts.map((product: Product) => {
                    const imageUrl = product.images[0]?.imageUrl || '/placeholder.png'
                    const isSelected = selectedProduct?.id === product.id

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                          <Image fill alt={product.name} className="object-cover" src={imageUrl} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.Category?.name}
                          </div>
                        </div>
                        {isSelected && <Badge variant="default">Selected</Badge>}
                      </div>
                    )
                  })}
                </div>

                {selectedProduct && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Customize Appearance (Optional)</h4>

                    <div className="space-y-2">
                      <Label>Custom Title</Label>
                      <Input
                        placeholder={selectedProduct.name}
                        value={customization.customTitle}
                        onChange={(e) =>
                          setCustomization({ ...customization, customTitle: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Description</Label>
                      <Textarea
                        placeholder="Custom description for featured display"
                        rows={2}
                        value={customization.customDescription}
                        onChange={(e) =>
                          setCustomization({ ...customization, customDescription: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Image URL</Label>
                      <Input
                        placeholder="https://... (leave empty to use product image)"
                        value={customization.customImageUrl}
                        onChange={(e) =>
                          setCustomization({ ...customization, customImageUrl: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Badge</Label>
                      <Switch
                        checked={customization.showBadge}
                        onCheckedChange={(checked) =>
                          setCustomization({ ...customization, showBadge: checked })
                        }
                      />
                    </div>

                    {customization.showBadge && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Badge Text</Label>
                          <Input
                            placeholder="NEW, SALE, etc."
                            value={customization.badgeText}
                            onChange={(e) =>
                              setCustomization({ ...customization, badgeText: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Badge Color</Label>
                          <Input
                            type="color"
                            value={customization.badgeColor}
                            onChange={(e) =>
                              setCustomization({ ...customization, badgeColor: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={!selectedProduct} onClick={handleAddFeatured}>
                  Add to Featured
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {featured.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No featured products yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Featured Product
            </Button>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={featured.map((item: any) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {featured.map((item: any) => (
                  <SortableFeaturedProduct
                    key={item.id}
                    featured={item}
                    onDelete={handleDeleteFeatured}
                    onEdit={(item: any) => console.log('Edit', item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}
