'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
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

type QuickLink = any
type Category = { id: string; name: string; slug: string }
type Product = { id: string; name: string; slug: string; Category: { name: string } | null }

interface QuickLinksManagerProps {
  quickLinks: QuickLink[]
  categories: Category[]
  products: Product[]
}

function SortableQuickLink({ link, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:bg-gray-50"
      style={style}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{link.label}</span>
          {!link.isActive && <EyeOff className="h-4 w-4 text-gray-400" />}
          <Badge className="text-xs" variant="outline">
            {link.linkType}
          </Badge>
          {link.badgeText && (
            <Badge className="text-xs" style={{ backgroundColor: link.badgeColor || undefined }}>
              {link.badgeText}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{link.linkValue}</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(link)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(link.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function QuickLinksManager({
  quickLinks: initialLinks,
  categories,
  products,
}: QuickLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    label: '',
    linkType: 'CATEGORY',
    linkValue: '',
    iconUrl: '',
    badgeText: '',
    badgeColor: '',
    isActive: true,
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
      const oldIndex = links.findIndex((link: any) => link.id === active.id)
      const newIndex = links.findIndex((link: any) => link.id === over.id)

      const newLinks = arrayMove(links, oldIndex, newIndex)
      setLinks(newLinks)

      const updates = newLinks.map((link: any, index: number) => ({
        id: link.id,
        sortOrder: index,
      }))

      try {
        await fetch('/api/admin/quick-links/bulk-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        })
      } catch (error) {
        console.error('Error updating sort order:', error)
      }
    }
  }

  const handleAddLink = async () => {
    try {
      const response = await fetch('/api/admin/quick-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLink,
          sortOrder: links.length,
        }),
      })

      if (!response.ok) throw new Error('Failed to create quick link')

      const createdLink = await response.json()
      setLinks([...links, createdLink])
      setIsAddDialogOpen(false)
      setNewLink({
        label: '',
        linkType: 'CATEGORY',
        linkValue: '',
        iconUrl: '',
        badgeText: '',
        badgeColor: '',
        isActive: true,
      })
    } catch (error) {
      console.error('Error creating quick link:', error)
      alert('Failed to create quick link')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this quick link?')) return

    try {
      await fetch(`/api/admin/quick-links/${linkId}`, {
        method: 'DELETE',
      })
      setLinks(links.filter((link: any) => link.id !== linkId))
    } catch (error) {
      console.error('Error deleting quick link:', error)
      alert('Failed to delete quick link')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quick Links ({links.length})</CardTitle>
            <CardDescription>
              Drag and drop to reorder. These links appear in your header navigation.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Quick Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Quick Link</DialogTitle>
                <DialogDescription>
                  Create a new quick access link for your header
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    placeholder="Quick link text"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link Type *</Label>
                    <Select
                      value={newLink.linkType}
                      onValueChange={(value) =>
                        setNewLink({ ...newLink, linkType: value, linkValue: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CATEGORY">Category</SelectItem>
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="PAGE">Page</SelectItem>
                        <SelectItem value="EXTERNAL">External URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Link To *</Label>
                    {newLink.linkType === 'CATEGORY' && (
                      <Select
                        value={newLink.linkValue}
                        onValueChange={(value) => setNewLink({ ...newLink, linkValue: value })}
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
                    {newLink.linkType === 'PRODUCT' && (
                      <Select
                        value={newLink.linkValue}
                        onValueChange={(value) => setNewLink({ ...newLink, linkValue: value })}
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
                    {(newLink.linkType === 'PAGE' || newLink.linkType === 'EXTERNAL') && (
                      <Input
                        placeholder={
                          newLink.linkType === 'EXTERNAL' ? 'https://example.com' : '/page-path'
                        }
                        value={newLink.linkValue}
                        onChange={(e) => setNewLink({ ...newLink, linkValue: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Badge Text (Optional)</Label>
                    <Input
                      placeholder="e.g., NEW, SALE"
                      value={newLink.badgeText}
                      onChange={(e) => setNewLink({ ...newLink, badgeText: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Badge Color (Optional)</Label>
                    <Input
                      type="color"
                      value={newLink.badgeColor}
                      onChange={(e) => setNewLink({ ...newLink, badgeColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon URL (Optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newLink.iconUrl}
                    onChange={(e) => setNewLink({ ...newLink, iconUrl: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={newLink.isActive}
                    onCheckedChange={(checked) => setNewLink({ ...newLink, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={!newLink.label || !newLink.linkValue} onClick={handleAddLink}>
                  Add Quick Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No quick links yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Quick Link
            </Button>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((link: any) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {links.map((link: any) => (
                  <SortableQuickLink
                    key={link.id}
                    link={link}
                    onDelete={handleDeleteLink}
                    onEdit={(link: any) => console.log('Edit', link)}
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
