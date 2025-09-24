/**
 * product-options - component definitions
 * Auto-refactored by BMAD
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProductOptions({ options, onOptionsChange }: ProductOptionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductOption>({
    name: '',
    type: 'SELECT',
    required: false,
    values: [],
    sortOrder: 0,
  })
  const [newValue, setNewValue] = useState({
    value: '',
    label: '',
    additionalPrice: 0,
    isDefault: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const predefinedOptions = [
    {
      name: 'Size',
      type: 'SELECT' as OptionType,
      values: [
        { label: '3.5" x 2" (Standard)', value: 'standard', additionalPrice: 0 },
        { label: '3.5" x 2" (Square Corners)', value: 'square', additionalPrice: 0 },
        { label: '2" x 3.5" (Vertical)', value: 'vertical', additionalPrice: 5 },
        { label: '3.5" x 3.5" (Square)', value: 'square-large', additionalPrice: 10 },
      ],
    },
    {
      name: 'Quantity',
      type: 'SELECT' as OptionType,
      values: [
        { label: '100', value: '100', additionalPrice: 0 },
        { label: '250', value: '250', additionalPrice: 0 },
        { label: '500', value: '500', additionalPrice: 0 },
        { label: '1000', value: '1000', additionalPrice: 0 },
        { label: '2500', value: '2500', additionalPrice: 0 },
        { label: '5000', value: '5000', additionalPrice: 0 },
      ],
    },
    {
      name: 'Finishing',
      type: 'CHECKBOX' as OptionType,
      values: [
        { label: 'Rounded Corners', value: 'rounded', additionalPrice: 15 },
        { label: 'Spot UV', value: 'spot-uv', additionalPrice: 35 },
        { label: 'Foil Stamping', value: 'foil', additionalPrice: 50 },
        { label: 'Embossing', value: 'emboss', additionalPrice: 40 },
        { label: 'Die Cutting', value: 'die-cut', additionalPrice: 60 },
      ],
    },
    {
      name: 'Binding',
      type: 'RADIO' as OptionType,
      values: [
        { label: 'Saddle Stitch', value: 'saddle', additionalPrice: 0 },
        { label: 'Perfect Bound', value: 'perfect', additionalPrice: 25 },
        { label: 'Wire-O', value: 'wire-o', additionalPrice: 35 },
        { label: 'Spiral', value: 'spiral', additionalPrice: 30 },
      ],
    },
  ]

  const handleDragEnd = (event: Record<string, unknown>) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = options.findIndex((opt) => opt.name === active.id)
      const newIndex = options.findIndex((opt) => opt.name === over.id)

      const newOptions = arrayMove(options, oldIndex, newIndex).map((opt, idx) => ({
        ...opt,
        sortOrder: idx,
      }))

      onOptionsChange(newOptions)
    }
  }

  const handleAddOption = () => {
    setEditingIndex(null)
    setFormData({
      name: '',
      type: 'SELECT',
      required: false,
      values: [],
      sortOrder: options.length,
    })
    setDialogOpen(true)
  }

  const handleEditOption = (index: number) => {
    setEditingIndex(index)
    setFormData({ ...options[index] })
    setDialogOpen(true)
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    onOptionsChange(newOptions)
  }

  const handleAddValue = () => {
    if (newValue.label && newValue.value) {
      const value: OptionValue = {
        ...newValue,
        sortOrder: formData.values.length,
        isDefault: formData.values.length === 0, // Make first value default
      }
      setFormData((prev) => ({
        ...prev,
        values: [...prev.values, value],
      }))
      setNewValue({
        value: '',
        label: '',
        additionalPrice: 0,
        isDefault: false,
      })
    }
  }

  const handleRemoveValue = (index: number) => {
    const newValues = formData.values.filter((_, i) => i !== index)
    // If removed value was default and there are other values, make first one default
    if (formData.values[index].isDefault && newValues.length > 0) {
      newValues[0].isDefault = true
    }
    setFormData((prev) => ({
      ...prev,
      values: newValues,
    }))
  }

  const handleSetDefaultValue = (index: number) => {
    const newValues = formData.values.map((val, i) => ({
      ...val,
      isDefault: i === index,
    }))
    setFormData((prev) => ({
      ...prev,
      values: newValues,
    }))
  }

  const handleSaveOption = () => {
    if (formData.name && formData.values.length > 0) {
      const newOptions = [...options]
      if (editingIndex !== null) {
        newOptions[editingIndex] = formData
      } else {
        newOptions.push(formData)
      }
      onOptionsChange(newOptions)
      setDialogOpen(false)
    }
  }

  const handleUsePredefined = (predefined: Record<string, unknown>) => {
    setFormData({
      ...predefined,
      required: false,
      values: predefined.values.map((v: Record<string, unknown>, i: number) => ({
        ...v,
        isDefault: i === 0,
        sortOrder: i,
      })),
      sortOrder: options.length,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Product Options</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add customizable options like size, quantity, and finishing
          </p>
        </div>
        <Button onClick={handleAddOption}>
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      {options.length > 0 ? (
        <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={options.map((opt) => opt.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">

              {options.map((option, index) => (
                <SortableOption
                  key={option.name}
                  id={option.name}
                  index={index}
                  option={option}
                  onDelete={handleDeleteOption}
                  onEdit={handleEditOption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No options added yet. Start by adding common options.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {predefinedOptions.map((opt) => (
                <Button
                  key={opt.name}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleUsePredefined(opt)
                    setDialogOpen(true)
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {opt.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Option' : 'Add Option'}</DialogTitle>
            <DialogDescription>Configure the option details and available values</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionName">Option Name</Label>
                <Input
                  id="optionName"
                  placeholder="e.g., Size, Quantity, Finishing"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionType">Option Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: OptionType) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELECT">Dropdown</SelectItem>
                    <SelectItem value="RADIO">Radio Buttons</SelectItem>
                    <SelectItem value="CHECKBOX">Checkboxes</SelectItem>
                    <SelectItem value="TEXT">Text Input</SelectItem>
                    <SelectItem value="NUMBER">Number Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="required">Required Option</Label>
              <Switch
                checked={formData.required}
                id="required"
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, required: checked }))
                }
              />
            </div>

            {(formData.type === 'SELECT' ||
              formData.type === 'RADIO' ||
              formData.type === 'CHECKBOX') && (
              <div className="space-y-4">
                <Label>Option Values</Label>

                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Value"
                    value={newValue.value}
                    onChange={(e) => setNewValue((prev) => ({ ...prev, value: e.target.value }))}
                  />
                  <Input
                    className="flex-1"
                    placeholder="Label"
                    value={newValue.label}
                    onChange={(e) => setNewValue((prev) => ({ ...prev, label: e.target.value }))}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm">+$</span>
                    <Input
                      className="w-24"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={newValue.additionalPrice}
                      onChange={(e) =>
                        setNewValue((prev) => ({
                          ...prev,
                          additionalPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <Button size="sm" onClick={handleAddValue}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.values.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-2">
                    {formData.values.map((value, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            className="h-6 w-6 p-0"
                            size="sm"
                            variant={value.isDefault ? 'default' : 'ghost'}
                            onClick={() => handleSetDefaultValue(index)}
                          >
                            •
                          </Button>
                          <span className="text-sm">{value.label}</span>
                          <span className="text-xs text-muted-foreground">({value.value})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {value.additionalPrice > 0 && (
                            <span className="text-sm text-muted-foreground">
                              +${value.additionalPrice.toFixed(2)}
                            </span>
                          )}
                          <Button
                            className="h-6 w-6 p-0"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveValue(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOption}>
              {editingIndex !== null ? 'Update' : 'Add'} Option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
