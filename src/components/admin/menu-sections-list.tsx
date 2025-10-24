'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

type MenuSection = any

interface MenuSectionsListProps {
  menuId: string
  sections: MenuSection[]
  onUpdate: () => void
}

export default function MenuSectionsList({ menuId, sections, onUpdate }: MenuSectionsListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    column: 1,
    showTitle: true,
    isActive: true,
    iconUrl: '',
  })

  const handleAddSection = async () => {
    try {
      const response = await fetch('/api/admin/menu-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSection,
          menuId,
          sortOrder: sections.length,
        }),
      })

      if (!response.ok) throw new Error('Failed to create section')

      setIsAddDialogOpen(false)
      setNewSection({
        title: '',
        description: '',
        column: 1,
        showTitle: true,
        isActive: true,
        iconUrl: '',
      })
      onUpdate()
    } catch (error) {
      console.error('Error creating section:', error)
      alert('Failed to create menu section')
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this section? Items in this section will not be deleted.'
      )
    )
      return

    try {
      await fetch(`/api/admin/menu-sections/${sectionId}`, {
        method: 'DELETE',
      })
      onUpdate()
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('Failed to delete menu section')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Menu Sections ({sections.length})</h3>
          <p className="text-sm text-muted-foreground">
            Organize your mega menu into custom sections
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Menu Section</DialogTitle>
              <DialogDescription>Create a new section for your mega menu</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Section Title *</Label>
                <Input
                  placeholder="e.g., Popular Products, By Category"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description"
                  rows={2}
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Column</Label>
                <Input
                  max="4"
                  min="1"
                  type="number"
                  value={newSection.column}
                  onChange={(e) =>
                    setNewSection({ ...newSection, column: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Which column to display this section in (1-4)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Icon URL (Optional)</Label>
                <Input
                  placeholder="https://..."
                  value={newSection.iconUrl}
                  onChange={(e) => setNewSection({ ...newSection, iconUrl: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Title</Label>
                <Switch
                  checked={newSection.showTitle}
                  onCheckedChange={(checked) =>
                    setNewSection({ ...newSection, showTitle: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={newSection.isActive}
                  onCheckedChange={(checked) => setNewSection({ ...newSection, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!newSection.title} onClick={handleAddSection}>
                Add Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No sections yet</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section: any) => (
            <div
              key={section.id}
              className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.title}</span>
                  {!section.isActive && <EyeOff className="h-4 w-4 text-gray-400" />}
                  <Badge className="text-xs" variant="outline">
                    Column {section.column}
                  </Badge>
                  <Badge className="text-xs" variant="outline">
                    {section.items?.length || 0} items
                  </Badge>
                </div>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteSection(section.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
