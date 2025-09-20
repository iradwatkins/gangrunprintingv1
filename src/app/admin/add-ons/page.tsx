'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  Package,
  Settings,
  Search,
  Save,
  X,
  Copy,
} from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import toast from '@/lib/toast'

interface AddOn {
  id: string
  name: string
  description: string | null
  tooltipText: string | null
  pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
  configuration: any
  additionalTurnaroundDays: number
  sortOrder: number
  isActive: boolean
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const pricingModelIcons = {
  FLAT: <DollarSign className="h-4 w-4" />,
  PERCENTAGE: <Percent className="h-4 w-4" />,
  PER_UNIT: <Package className="h-4 w-4" />,
  CUSTOM: <Settings className="h-4 w-4" />,
}

const pricingModelLabels = {
  FLAT: 'Flat Fee',
  PERCENTAGE: 'Percentage',
  PER_UNIT: 'Per Unit',
  CUSTOM: 'Custom',
}

export default function AddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addOnToDelete, setAddOnToDelete] = useState<AddOn | null>(null)
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tooltipText: '',
    pricingModel: 'FLAT' as AddOn['pricingModel'],
    additionalTurnaroundDays: 0,
    sortOrder: 0,
    isActive: true,
    adminNotes: '',
    // Pricing configuration fields
    flatPrice: 0,
    percentage: 0,
    percentageAppliesTo: 'base_price',
    pricePerUnit: 0,
    unitName: 'piece',
    customConfig: '{}',
  })

  useEffect(() => {
    fetchAddOns()
  }, [])

  const fetchAddOns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/add-ons')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      // Ensure data is always an array
      setAddOns(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching add-ons:', error)
      toast.error('Failed to fetch add-ons')
      setAddOns([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)

      // Build configuration based on pricing model
      let configuration = {}
      if (formData.pricingModel === 'FLAT') {
        configuration = { price: formData.flatPrice }
      } else if (formData.pricingModel === 'PERCENTAGE') {
        configuration = {
          percentage: formData.percentage,
          appliesTo: formData.percentageAppliesTo,
        }
      } else if (formData.pricingModel === 'PER_UNIT') {
        configuration = {
          pricePerUnit: formData.pricePerUnit,
          unitName: formData.unitName,
        }
      } else {
        // Custom - parse JSON
        try {
          configuration = JSON.parse(formData.customConfig)
        } catch (e) {
          toast.error('Invalid JSON in custom configuration')
          setSaving(false)
          return
        }
      }

      const url = editingAddOn ? `/api/add-ons/${editingAddOn.id}` : '/api/add-ons'

      const method = editingAddOn ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          tooltipText: formData.tooltipText || null,
          pricingModel: formData.pricingModel,
          configuration,
          additionalTurnaroundDays: formData.additionalTurnaroundDays,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          adminNotes: formData.adminNotes || null,
        }),
      })

      if (response.ok) {
        toast.success(editingAddOn ? 'Add-on updated successfully' : 'Add-on created successfully')
        setDialogOpen(false)
        resetForm()
        fetchAddOns()
      } else {
        const error = await response.json()
        throw new Error(error.details || 'Failed to save add-on')
      }
    } catch (error) {
      console.error('Error saving add-on:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save add-on')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!addOnToDelete) return

    try {
      const response = await fetch(`/api/add-ons/${addOnToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Add-on deleted successfully')
        setDeleteDialogOpen(false)
        setAddOnToDelete(null)
        fetchAddOns()
      } else {
        throw new Error('Failed to delete add-on')
      }
    } catch (error) {
      console.error('Error deleting add-on:', error)
      toast.error('Failed to delete add-on')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tooltipText: '',
      pricingModel: 'FLAT',
      additionalTurnaroundDays: 0,
      sortOrder: 0,
      isActive: true,
      adminNotes: '',
      flatPrice: 0,
      percentage: 0,
      percentageAppliesTo: 'base_price',
      pricePerUnit: 0,
      unitName: 'piece',
      customConfig: '{}',
    })
    setEditingAddOn(null)
  }

  const handleDuplicate = (addOn: AddOn) => {
    setEditingAddOn(null) // Important: clear editing addon so it creates a new item

    // Parse configuration based on pricing model
    let flatPrice = 0
    let percentage = 0
    let percentageAppliesTo = 'base_price'
    let pricePerUnit = 0
    let unitName = 'piece'
    let customConfig = '{}'

    if (addOn.pricingModel === 'FLAT') {
      flatPrice = addOn.configuration.price || 0
    } else if (addOn.pricingModel === 'PERCENTAGE') {
      percentage = addOn.configuration.percentage || 0
      percentageAppliesTo = addOn.configuration.appliesTo || 'base_price'
    } else if (addOn.pricingModel === 'PER_UNIT') {
      pricePerUnit = addOn.configuration.pricePerUnit || 0
      unitName = addOn.configuration.unitName || 'piece'
    } else {
      customConfig = JSON.stringify(addOn.configuration, null, 2)
    }

    setFormData({
      name: `${addOn.name} - Copy`,
      description: addOn.description || '',
      tooltipText: addOn.tooltipText || '',
      pricingModel: addOn.pricingModel,
      additionalTurnaroundDays: addOn.additionalTurnaroundDays,
      sortOrder: addOn.sortOrder,
      isActive: addOn.isActive,
      adminNotes: addOn.adminNotes || '',
      flatPrice,
      percentage,
      percentageAppliesTo,
      pricePerUnit,
      unitName,
      customConfig,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (addOn: AddOn) => {
    setEditingAddOn(addOn)

    // Parse configuration based on pricing model
    let flatPrice = 0
    let percentage = 0
    let percentageAppliesTo = 'base_price'
    let pricePerUnit = 0
    let unitName = 'piece'
    let customConfig = '{}'

    if (addOn.pricingModel === 'FLAT') {
      flatPrice = addOn.configuration.price || 0
    } else if (addOn.pricingModel === 'PERCENTAGE') {
      percentage = addOn.configuration.percentage || 0
      percentageAppliesTo = addOn.configuration.appliesTo || 'base_price'
    } else if (addOn.pricingModel === 'PER_UNIT') {
      pricePerUnit = addOn.configuration.pricePerUnit || 0
      unitName = addOn.configuration.unitName || 'piece'
    } else {
      customConfig = JSON.stringify(addOn.configuration, null, 2)
    }

    setFormData({
      name: addOn.name,
      description: addOn.description || '',
      tooltipText: addOn.tooltipText || '',
      pricingModel: addOn.pricingModel,
      additionalTurnaroundDays: addOn.additionalTurnaroundDays,
      sortOrder: addOn.sortOrder,
      isActive: addOn.isActive,
      adminNotes: addOn.adminNotes || '',
      flatPrice,
      percentage,
      percentageAppliesTo,
      pricePerUnit,
      unitName,
      customConfig,
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (addOn: AddOn) => {
    setAddOnToDelete(addOn)
    setDeleteDialogOpen(true)
  }

  const filteredAddOns = Array.isArray(addOns)
    ? addOns.filter(
        (addOn) =>
          addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addOn.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const formatPriceDisplay = (addOn: AddOn) => {
    const config = addOn.configuration as any
    switch (addOn.pricingModel) {
      case 'FLAT':
        return config.price ? `$${config.price.toFixed(2)}` : '-'
      case 'PERCENTAGE':
        return config.percentage ? `${config.percentage}%` : '-'
      case 'PER_UNIT':
        return config.pricePerUnit ? `$${config.pricePerUnit}/${config.unitName || 'unit'}` : '-'
      case 'CUSTOM':
        if (config.setupFee && config.pricePerPiece) {
          return `$${config.setupFee} + $${config.pricePerPiece}/pc`
        }
        return 'Variable'
      default:
        return '-'
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Add-ons Management</CardTitle>
              <CardDescription>Manage printing add-ons and their pricing models</CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Add-on
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="max-w-sm"
              placeholder="Search add-ons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading add-ons...</div>
          ) : filteredAddOns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'No add-ons found matching your search.'
                : 'No add-ons found. Create your first add-on to get started.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Pricing Model</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Turnaround</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAddOns.map((addOn) => (
                    <TableRow key={addOn.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{addOn.name}</div>
                          {addOn.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {addOn.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {pricingModelIcons[addOn.pricingModel]}
                          <span className="text-sm">{pricingModelLabels[addOn.pricingModel]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatPriceDisplay(addOn)}
                      </TableCell>
                      <TableCell>
                        {addOn.additionalTurnaroundDays > 0 ? (
                          <Badge variant="secondary">+{addOn.additionalTurnaroundDays} days</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{addOn.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={addOn.isActive ? 'default' : 'secondary'}>
                          {addOn.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            title="Duplicate"
                            variant="outline"
                            onClick={() => handleDuplicate(addOn)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(addOn)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteDialog(addOn)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddOn ? 'Edit Add-on' : 'Create New Add-on'}</DialogTitle>
            <DialogDescription>Configure the add-on details and pricing model</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                placeholder="e.g., Digital Proof"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="description"
                placeholder="Brief description of the add-on"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="tooltipText">
                Tooltip
              </Label>
              <Textarea
                className="col-span-3"
                id="tooltipText"
                placeholder="Help text shown to customers"
                value={formData.tooltipText}
                onChange={(e) => setFormData({ ...formData, tooltipText: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="pricingModel">
                Pricing Model
              </Label>
              <Select
                value={formData.pricingModel}
                onValueChange={(value) =>
                  setFormData({ ...formData, pricingModel: value as AddOn['pricingModel'] })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Fee</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="PER_UNIT">Per Unit</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Configuration based on model */}
            {formData.pricingModel === 'FLAT' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="flatPrice">
                  Price ($)
                </Label>
                <Input
                  className="col-span-3"
                  id="flatPrice"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.flatPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, flatPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            )}

            {formData.pricingModel === 'PERCENTAGE' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="percentage">
                    Percentage (%)
                  </Label>
                  <Input
                    className="col-span-3"
                    id="percentage"
                    placeholder="0.0"
                    step="0.1"
                    type="number"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="appliesTo">
                    Applies To
                  </Label>
                  <Select
                    value={formData.percentageAppliesTo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, percentageAppliesTo: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base_price">Base Price</SelectItem>
                      <SelectItem value="adjusted_base_price">Adjusted Base Price</SelectItem>
                      <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.pricingModel === 'PER_UNIT' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="pricePerUnit">
                    Price Per Unit ($)
                  </Label>
                  <Input
                    className="col-span-3"
                    id="pricePerUnit"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="unitName">
                    Unit Name
                  </Label>
                  <Input
                    className="col-span-3"
                    id="unitName"
                    placeholder="e.g., piece, bundle, box"
                    value={formData.unitName}
                    onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                  />
                </div>
              </>
            )}

            {formData.pricingModel === 'CUSTOM' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="customConfig">
                  Configuration
                </Label>
                <Textarea
                  className="col-span-3 font-mono text-sm"
                  id="customConfig"
                  placeholder='{"setupFee": 20, "pricePerPiece": 0.01}'
                  rows={6}
                  value={formData.customConfig}
                  onChange={(e) => setFormData({ ...formData, customConfig: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="turnaroundDays">
                Turnaround Days
              </Label>
              <Input
                className="col-span-3"
                id="turnaroundDays"
                placeholder="0"
                type="number"
                value={formData.additionalTurnaroundDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalTurnaroundDays: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="sortOrder">
                Sort Order
              </Label>
              <Input
                className="col-span-3"
                id="sortOrder"
                placeholder="0"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="adminNotes">
                Admin Notes
              </Label>
              <Textarea
                className="col-span-3"
                id="adminNotes"
                placeholder="Internal notes (not shown to customers)"
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="isActive">
                Active
              </Label>
              <div className="col-span-3">
                <Switch
                  checked={formData.isActive}
                  id="isActive"
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={saving}
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button disabled={saving} onClick={handleSubmit}>
              {saving ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingAddOn ? 'Update' : 'Create'} Add-on
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Add-on</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{addOnToDelete?.name}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setAddOnToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Add-on
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
