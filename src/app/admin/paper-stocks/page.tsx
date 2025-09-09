'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, Package, Droplets, Layers, Copy, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface CoatingOption {
  id: string
  label: string
  enabled: boolean
}

interface SidesOption {
  id: string
  label: string
  enabled: boolean
  multiplier: number
}

interface MaterialType {
  id: string
  name: string
  basePrice: number // Price per square inch
  shippingWeight: number // Weight per 1000 sheets
  isActive: boolean
  
  // Available coatings for this paper stock
  coatings: CoatingOption[]
  
  // Available sides options with multipliers
  sidesOptions: SidesOption[]
  
  // Defaults
  defaultCoating: string
  defaultSides: string
}

// These will be fetched from API
interface ApiCoatingOption {
  id: string
  name: string
  description: string | null
  additionalCost: number | null
}

interface ApiSidesOption {
  id: string
  name: string
  code: string
  description: string | null
  isDefault: boolean
}

export default function MaterialTypesPage() {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<MaterialType | null>(null)
  const [coatingOptions, setCoatingOptions] = useState<ApiCoatingOption[]>([])
  const [sidesOptions, setSidesOptions] = useState<ApiSidesOption[]>([])
  
  // States for adding new options inline
  const [addingCoating, setAddingCoating] = useState(false)
  const [newCoating, setNewCoating] = useState({ name: '', additionalCost: '' })
  const [addingSides, setAddingSides] = useState(false)
  const [newSides, setNewSides] = useState({ name: '', code: '', multiplier: '1.0' })
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string
    basePrice: number
    shippingWeight: number
    coatings: CoatingOption[]
    sidesOptions: SidesOption[]
    defaultCoating: string
    defaultSides: string
    isActive: boolean
  }>({
    name: '',
    basePrice: 0.00001234,
    shippingWeight: 0.5,
    coatings: coatingOptions.map(c => ({ 
      id: c.id, 
      label: c.name, 
      enabled: true 
    })),
    sidesOptions: sidesOptions.map(s => ({ 
      id: s.id,
      label: s.name,
      enabled: true, 
      multiplier: 1.0
    })),
    defaultCoating: coatingOptions[0]?.id || '',
    defaultSides: sidesOptions.find(s => s.isDefault)?.id || sidesOptions[0]?.id || '',
    isActive: true
  })

  useEffect(() => {
    fetchMaterialTypes()
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const [coatingsRes, sidesRes] = await Promise.all([
        fetch('/api/coating-options'),
        fetch('/api/sides-options')
      ])
      
      if (coatingsRes.ok) {
        const coatingsData = await coatingsRes.json()
        setCoatingOptions(coatingsData)
      }
      
      if (sidesRes.ok) {
        const sidesData = await sidesRes.json()
        setSidesOptions(sidesData)
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const fetchMaterialTypes = async () => {
    try {
      const response = await fetch('/api/paper-stocks')
      if (!response.ok) throw new Error('Failed to fetch paper stocks')
      
      const data = await response.json()
      setMaterialTypes(data)
    } catch (error) {
      console.error('Error fetching paper stocks:', error)
      toast.error('Failed to load paper stocks')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (material?: MaterialType) => {
    if (material) {
      setEditingMaterial(material)
      setFormData({
        name: material.name,
        basePrice: material.basePrice,
        shippingWeight: material.shippingWeight,
        coatings: coatingOptions.map(c => {
          const materialCoating = material.coatings.find(mc => mc.id === c.id)
          return {
            id: c.id,
            label: c.name,
            enabled: materialCoating?.enabled || false
          }
        }),
        sidesOptions: sidesOptions.map(s => {
          const materialSide = material.sidesOptions.find(ms => ms.id === s.id)
          return {
            id: s.id,
            label: s.name,
            enabled: materialSide?.enabled || false,
            multiplier: materialSide?.multiplier || 1.0
          }
        }),
        defaultCoating: material.defaultCoating,
        defaultSides: material.defaultSides,
        isActive: material.isActive
      })
    } else {
      setEditingMaterial(null)
      setFormData({
        name: '',
        basePrice: 0.00001234,
        shippingWeight: 0.5,
        coatings: coatingOptions.map(c => ({ 
          id: c.id, 
          label: c.name, 
          enabled: true 
        })),
        sidesOptions: sidesOptions.map(s => ({ 
          id: s.id,
          label: s.name,
          enabled: true, 
          multiplier: 1.0
        })),
        defaultCoating: coatingOptions[0]?.id || '',
        defaultSides: sidesOptions.find(s => s.isDefault)?.id || sidesOptions[0]?.id || '',
        isActive: true
      })
    }
    setDialogOpen(true)
  }

  const handleCoatingToggle = (coatingId: string) => {
    setFormData(prev => ({
      ...prev,
      coatings: prev.coatings.map(c => 
        c.id === coatingId ? { ...c, enabled: !c.enabled } : c
      )
    }))
  }

  const handleSidesToggle = (sidesId: string) => {
    setFormData(prev => ({
      ...prev,
      sidesOptions: prev.sidesOptions.map(s => 
        s.id === sidesId ? { ...s, enabled: !s.enabled } : s
      )
    }))
  }

  const handleSidesMultiplier = (sidesId: string, multiplier: number) => {
    setFormData(prev => ({
      ...prev,
      sidesOptions: prev.sidesOptions.map(s => 
        s.id === sidesId ? { ...s, multiplier } : s
      )
    }))
  }

  const handleSubmit = async () => {
    try {
      // Validate at least one coating and sides option is selected
      const hasCoating = formData.coatings.some(c => c.enabled)
      const hasSides = formData.sidesOptions.some(s => s.enabled)
      
      if (!hasCoating) {
        toast.error('Please select at least one coating option')
        return
      }
      
      if (!hasSides) {
        toast.error('Please select at least one sides option')
        return
      }

      const paperStockData = {
        name: formData.name,
        basePrice: formData.basePrice,
        shippingWeight: formData.shippingWeight,
        isActive: formData.isActive,
        coatings: formData.coatings.filter(c => c.enabled),
        sidesOptions: formData.sidesOptions.filter(s => s.enabled),
        defaultCoating: formData.defaultCoating,
        defaultSides: formData.defaultSides
      }

      const url = editingMaterial 
        ? `/api/paper-stocks/${editingMaterial.id}`
        : '/api/paper-stocks'
      
      const response = await fetch(url, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paperStockData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save paper stock')
      }

      toast.success(editingMaterial ? 'Paper stock updated' : 'Paper stock created')
      setDialogOpen(false)
      fetchMaterialTypes() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to save paper stock')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this paper stock?')) {
      try {
        const response = await fetch(`/api/paper-stocks/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete paper stock')
        }

        toast.success('Paper stock deleted')
        fetchMaterialTypes() // Refresh the list
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete paper stock')
      }
    }
  }

  const handleDuplicate = (material: MaterialType) => {
    // Open the dialog with duplicated data for editing as a new paper stock
    setEditingMaterial(null) // This is a new material, not editing
    setFormData({
      name: `${material.name} (Copy)`,
      basePrice: material.basePrice,
      shippingWeight: material.shippingWeight,
      coatings: material.coatings,
      sidesOptions: material.sidesOptions,
      defaultCoating: material.defaultCoating,
      defaultSides: material.defaultSides,
      isActive: material.isActive
    })
    setDialogOpen(true)
    toast.success('Paper stock duplicated. Please review and save.')
  }

  const calculateSamplePrice = (basePrice: number, multiplier: number = 1.0) => {
    // 4x6 = 24 sq inches, 500 quantity
    return (basePrice * 24 * 500 * multiplier).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Material Type Management</h1>
          <p className="text-muted-foreground">
            Configure material types with coatings and sides options
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material Type
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading material types...
            </CardContent>
          </Card>
        ) : materialTypes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No material types configured. Click "Add Material Type" to get started.
            </CardContent>
          </Card>
        ) : (
          materialTypes.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-xl">{material.name}</CardTitle>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Base: ${material.basePrice.toFixed(8)}/sq in</span>
                        <span>•</span>
                        <span>Shipping: {material.shippingWeight} lbs/1000</span>
                        <span>•</span>
                        <span>Sample (4x6, 500qty): ${calculateSamplePrice(material.basePrice)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={material.isActive ? 'default' : 'secondary'}>
                      {material.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      title="Edit"
                      variant="ghost"
                      onClick={() => handleOpenDialog(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      title="Duplicate"
                      variant="ghost"
                      onClick={() => handleDuplicate(material)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      title="Delete"
                      variant="ghost"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Coatings */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-sm">Available Coatings</h4>
                    </div>
                    <div className="space-y-1">
                      {material.coatings.map((coating) => (
                        <div key={coating.id} className="flex items-center gap-2">
                          <Badge 
                            className="text-xs"
                            variant={material.defaultCoating === coating.id ? 'default' : 'outline'}
                          >
                            {coating.label}
                            {material.defaultCoating === coating.id && ' (Default)'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sides Options */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-sm">Sides Options</h4>
                    </div>
                    <div className="space-y-1">
                      {material.sidesOptions.map((side) => (
                        <div key={side.id} className="flex items-center justify-between">
                          <Badge 
                            className="text-xs"
                            variant={material.defaultSides === side.id ? 'default' : 'outline'}
                          >
                            {side.label}
                            {material.defaultSides === side.id && ' (Default)'}
                          </Badge>
                          {side.multiplier !== 1.0 && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {side.multiplier}x
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Edit Material Type' : 'Create Material Type'}
            </DialogTitle>
            <DialogDescription>
              Configure the material type details, available coatings, and sides options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Material Type Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., 12pt Card Stock"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingWeight">Shipping Weight (lbs/1000)</Label>
                  <Input
                    id="shippingWeight"
                    step="0.01"
                    type="number"
                    value={formData.shippingWeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingWeight: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (per square inch)</Label>
                <Input
                  id="basePrice"
                  step="0.00000001"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                  Sample: 4x6 @ 500qty = ${calculateSamplePrice(formData.basePrice)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Coating Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Coating Options
                </h3>
                <Button
                  disabled={addingCoating}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingCoating(true)
                    setNewCoating({ name: '', additionalCost: '' })
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {formData.coatings.map((coating) => (
                  <div key={coating.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={coating.enabled}
                        id={`coating-${coating.id}`}
                        onCheckedChange={() => handleCoatingToggle(coating.id)}
                      />
                      <Label 
                        className="cursor-pointer"
                        htmlFor={`coating-${coating.id}`}
                      >
                        {coating.label}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (confirm(`Delete coating option "${coating.label}"?`)) {
                          try {
                            const response = await fetch(`/api/coating-options/${coating.id}`, {
                              method: 'DELETE'
                            })
                            if (response.ok) {
                              setCoatingOptions(prev => prev.filter(c => c.id !== coating.id))
                              setFormData(prev => ({
                                ...prev,
                                coatings: prev.coatings.filter(c => c.id !== coating.id)
                              }))
                              toast.success('Coating option deleted')
                            } else {
                              const error = await response.json()
                              toast.error(error.error || 'Cannot delete coating option')
                            }
                          } catch (error) {
                            toast.error('Failed to delete coating option')
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {/* New Coating Input */}
                {addingCoating && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox disabled checked={true} />
                    <Input
                      className="flex-1"
                      placeholder="Coating name"
                      value={newCoating.name}
                      onChange={(e) => setNewCoating(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      className="w-24"
                      placeholder="Cost"
                      step="0.01"
                      type="number"
                      value={newCoating.additionalCost}
                      onChange={(e) => setNewCoating(prev => ({ ...prev, additionalCost: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (newCoating.name.trim()) {
                          try {
                            const response = await fetch('/api/coating-options', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: newCoating.name.trim(),
                                additionalCost: newCoating.additionalCost ? parseFloat(newCoating.additionalCost) : null
                              })
                            })
                            if (response.ok) {
                              const created = await response.json()
                              setCoatingOptions(prev => [...prev, created])
                              setFormData(prev => ({
                                ...prev,
                                coatings: [...prev.coatings, { id: created.id, label: created.name, enabled: true }]
                              }))
                              setAddingCoating(false)
                              toast.success('Coating option added')
                            }
                          } catch (error) {
                            toast.error('Failed to add coating option')
                          }
                        }
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAddingCoating(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCoating">Default Coating</Label>
                <Select
                  value={formData.defaultCoating}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, defaultCoating: value }))}
                >
                  <SelectTrigger id="defaultCoating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.coatings.filter(c => c.enabled).map((coating) => (
                      <SelectItem key={coating.id} value={coating.id}>
                        {coating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Sides Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Sides Options
                </h3>
                <Button
                  disabled={addingSides}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingSides(true)
                    setNewSides({ name: '', code: '', multiplier: '1.0' })
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {formData.sidesOptions.map((side) => (
                  <div key={side.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={side.enabled}
                        id={`sides-${side.id}`}
                        onCheckedChange={() => handleSidesToggle(side.id)}
                      />
                      <Label 
                        className="cursor-pointer"
                        htmlFor={`sides-${side.id}`}
                      >
                        {side.label}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Multiplier:</Label>
                      <Input
                        className="w-20"
                        disabled={!side.enabled}
                        step="0.05"
                        type="number"
                        value={side.multiplier}
                        onChange={(e) => handleSidesMultiplier(side.id, parseFloat(e.target.value) || 1.0)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm(`Delete sides option "${side.label}"?`)) {
                            try {
                              const response = await fetch(`/api/sides-options/${side.id}`, {
                                method: 'DELETE'
                              })
                              if (response.ok) {
                                setSidesOptions(prev => prev.filter(s => s.id !== side.id))
                                setFormData(prev => ({
                                  ...prev,
                                  sidesOptions: prev.sidesOptions.filter(s => s.id !== side.id)
                                }))
                                toast.success('Sides option deleted')
                              } else {
                                const error = await response.json()
                                toast.error(error.error || 'Cannot delete sides option')
                              }
                            } catch (error) {
                              toast.error('Failed to delete sides option')
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* New Sides Input */}
                {addingSides && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox disabled checked={true} />
                    <Input
                      className="flex-1"
                      placeholder="Sides name"
                      value={newSides.name}
                      onChange={(e) => setNewSides(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      className="w-24"
                      placeholder="Code"
                      value={newSides.code}
                      onChange={(e) => setNewSides(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <Input
                      className="w-24"
                      placeholder="Multiplier"
                      step="0.05"
                      type="number"
                      value={newSides.multiplier}
                      onChange={(e) => setNewSides(prev => ({ ...prev, multiplier: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (newSides.name.trim() && newSides.code.trim()) {
                          try {
                            const response = await fetch('/api/sides-options', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: newSides.name.trim(),
                                code: newSides.code.trim(),
                                isDefault: false
                              })
                            })
                            if (response.ok) {
                              const created = await response.json()
                              setSidesOptions(prev => [...prev, created])
                              setFormData(prev => ({
                                ...prev,
                                sidesOptions: [...prev.sidesOptions, { 
                                  id: created.id, 
                                  label: created.name, 
                                  enabled: true,
                                  multiplier: parseFloat(newSides.multiplier) || 1.0
                                }]
                              }))
                              setAddingSides(false)
                              toast.success('Sides option added')
                            }
                          } catch (error) {
                            toast.error('Failed to add sides option')
                          }
                        }
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAddingSides(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultSides">Default Sides Option</Label>
                <Select
                  value={formData.defaultSides}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, defaultSides: value }))}
                >
                  <SelectTrigger id="defaultSides">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.sidesOptions.filter(s => s.enabled).map((side) => (
                      <SelectItem key={side.id} value={side.id}>
                        {side.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                checked={formData.isActive}
                id="isActive"
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {editingMaterial ? 'Update' : 'Create'} Material Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}