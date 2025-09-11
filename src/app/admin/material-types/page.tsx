'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import toast from '@/lib/toast'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'

interface MaterialType {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  _count?: {
    products: number
  }
}

export default function MaterialTypesPage() {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<MaterialType | null>(null)
  const [deletingType, setDeletingType] = useState<MaterialType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true
  })

  useEffect(() => {
    fetchMaterialTypes()
  }, [])

  const fetchMaterialTypes = async () => {
    try {
      const response = await fetch('/api/material-types')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setMaterialTypes(data)
    } catch (error) {
      toast.error('Failed to load material types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingType 
        ? `/api/material-types/${editingType.id}`
        : '/api/material-types'
      
      const response = await fetch(url, {
        method: editingType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingType ? 'Material type updated' : 'Material type created')
      setIsDialogOpen(false)
      resetForm()
      fetchMaterialTypes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (type: MaterialType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      sortOrder: type.sortOrder,
      isActive: type.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingType) return

    try {
      const response = await fetch(`/api/material-types/${deletingType.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success('Material type deleted')
      setIsDeleteDialogOpen(false)
      setDeletingType(null)
      fetchMaterialTypes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setEditingType(null)
    setFormData({
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true
    })
  }

  const openDeleteDialog = (type: MaterialType) => {
    setDeletingType(type)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Material Types</h1>
        <p className="text-gray-600 mt-2">
          Manage custom material types for your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Material Types</CardTitle>
              <CardDescription>
                Create and manage material categories for products
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? 'Edit Material Type' : 'Create Material Type'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingType 
                        ? 'Update the material type details'
                        : 'Add a new material type for categorizing products'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        required
                        id="name"
                        placeholder="e.g., Paper, Vinyl, Canvas"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Optional description of this material type"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        placeholder="0"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-sm text-gray-500">
                        Lower numbers appear first in lists
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        id="isActive"
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingType ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {materialTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No material types created yet. Click "Add Material Type" to create your first one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {type._count?.products || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        type.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          disabled={(type._count?.products ?? 0) > 0}
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingType?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}