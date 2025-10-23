'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type MenuItem = any
type MenuSection = any
type Category = { id: string; name: string; slug: string }
type Product = { id: string; name: string; slug: string; Category: { name: string } | null }

interface MenuItemsListProps {
  menuId: string
  items: MenuItem[]
  sections: MenuSection[]
  categories: Category[]
  products: Product[]
  onUpdate: () => void
}

function SortableMenuItem({ item, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:bg-gray-50"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.label}</span>
          {!item.isActive && <EyeOff className="h-4 w-4 text-gray-400" />}
          <Badge variant="outline" className="text-xs">
            {item.linkType}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.linkValue}</p>
        {item.Children && item.Children.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.Children.length} sub-items
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function MenuItemsList({
  menuId,
  items: initialItems,
  sections,
  categories,
  products,
  onUpdate,
}: MenuItemsListProps) {
  const [items, setItems] = useState(initialItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    label: '',
    linkType: 'CATEGORY',
    linkValue: '',
    iconUrl: '',
    sectionId: '',
    parentId: '',
    isActive: true,
    openInNewTab: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item: any) => item.id === active.id)
      const newIndex = items.findIndex((item: any) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Update sort orders in database
      const updates = newItems.map((item: any, index: number) => ({
        id: item.id,
        sortOrder: index,
      }))

      try {
        await fetch('/api/admin/menu-items/bulk-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        })
        onUpdate()
      } catch (error) {
        console.error('Error updating sort order:', error)
      }
    }
  }

  const handleAddItem = async () => {
    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          menuId,
          sortOrder: items.length,
        }),
      })

      if (!response.ok) throw new Error('Failed to create item')

      setIsAddDialogOpen(false)
      setNewItem({
        label: '',
        linkType: 'CATEGORY',
        linkValue: '',
        iconUrl: '',
        sectionId: '',
        parentId: '',
        isActive: true,
        openInNewTab: false,
      })
      onUpdate()
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create menu item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await fetch(`/api/admin/menu-items/${itemId}`, {
        method: 'DELETE',
      })
      onUpdate()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete menu item')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Menu Items ({items.length})</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
              <DialogDescription>
                Create a new menu item with a link to a category, product, or custom page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="Menu item text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Type *</Label>
                  <Select
                    value={newItem.linkType}
                    onValueChange={(value) => setNewItem({ ...newItem, linkType: value, linkValue: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CATEGORY">Category</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="PAGE">Page</SelectItem>
                      <SelectItem value="EXTERNAL">External URL</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Link To *</Label>
                  {newItem.linkType === 'CATEGORY' && (
                    <Select
                      value={newItem.linkValue}
                      onValueChange={(value) => setNewItem({ ...newItem, linkValue: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {newItem.linkType === 'PRODUCT' && (
                    <Select
                      value={newItem.linkValue}
                      onValueChange={(value) => setNewItem({ ...newItem, linkValue: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((prod) => (
                          <SelectItem key={prod.id} value={prod.slug}>
                            {prod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {(newItem.linkType === 'PAGE' || newItem.linkType === 'EXTERNAL' || newItem.linkType === 'CUSTOM') && (
                    <Input
                      value={newItem.linkValue}
                      onChange={(e) => setNewItem({ ...newItem, linkValue: e.target.value })}
                      placeholder={
                        newItem.linkType === 'EXTERNAL'
                          ? 'https://example.com'
                          : newItem.linkType === 'PAGE'
                          ? '/about'
                          : 'Custom path or URL'
                      }
                    />
                  )}
                </div>
              </div>

              {sections.length > 0 && (
                <div className="space-y-2">
                  <Label>Section (Optional)</Label>
                  <Select
                    value={newItem.sectionId}
                    onValueChange={(value) => setNewItem({ ...newItem, sectionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No section</SelectItem>
                      {sections.map((section: any) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Icon URL (Optional)</Label>
                <Input
                  value={newItem.iconUrl}
                  onChange={(e) => setNewItem({ ...newItem, iconUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.label || !newItem.linkValue}>
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No menu items yet</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item: any) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onEdit={(item: any) => console.log('Edit', item)}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
