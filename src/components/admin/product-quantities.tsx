'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

import { Badge } from '@/components/ui/badge'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Hash, Layers, Plus } from 'lucide-react'
import toast from '@/lib/toast'

interface Quantity {
  id: string
  name: string
  value: number | null
  isCustom: boolean
  minValue: number | null
  maxValue: number | null
}

interface QuantityGroup {
  id: string
  name: string
  description: string | null
  quantities: {
    quantity: Quantity
    sortOrder: number
  }[]
}

interface ProductQuantitiesProps {
  productId?: string
  selectedQuantities?: string[]
  selectedQuantityGroup?: string
  onChange: (data: { useGroup: boolean; quantityGroupId?: string; quantityIds?: string[] }) => void
}

export function ProductQuantities({
  productId,
  selectedQuantities = [],
  selectedQuantityGroup,
  onChange,
}: ProductQuantitiesProps) {
  const [useGroup, setUseGroup] = useState(!!selectedQuantityGroup)
  const [quantityGroups, setQuantityGroups] = useState<QuantityGroup[]>([])
  const [availableQuantities, setAvailableQuantities] = useState<Quantity[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>(selectedQuantityGroup || '')
  const [individualQuantities, setIndividualQuantities] = useState<string[]>(selectedQuantities)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch quantity groups
      const groupsResponse = await fetch('/api/quantity-groups?include=quantities&active=true')
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setQuantityGroups(groupsData)
      }

      // Fetch individual quantities
      const quantitiesResponse = await fetch('/api/quantities?active=true')
      if (quantitiesResponse.ok) {
        const quantitiesData = await quantitiesResponse.json()
        setAvailableQuantities(quantitiesData)
      }
    } catch (error) {
      toast.error('Failed to load quantities')
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (value: string) => {
    const newUseGroup = value === 'group'
    setUseGroup(newUseGroup)

    if (newUseGroup) {
      onChange({
        useGroup: true,
        quantityGroupId: selectedGroupId || undefined,
      })
    } else {
      onChange({
        useGroup: false,
        quantityIds: individualQuantities.length > 0 ? individualQuantities : undefined,
      })
    }
  }

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
    onChange({
      useGroup: true,
      quantityGroupId: groupId,
    })
  }

  const handleQuantityToggle = (quantityId: string) => {
    const newQuantities = individualQuantities.includes(quantityId)
      ? individualQuantities.filter((id) => id !== quantityId)
      : [...individualQuantities, quantityId]

    setIndividualQuantities(newQuantities)
    onChange({
      useGroup: false,
      quantityIds: newQuantities.length > 0 ? newQuantities : undefined,
    })
  }

  const getSelectedGroup = () => {
    return quantityGroups.find((g) => g.id === selectedGroupId)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading quantities...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Quantity Options
        </CardTitle>
        <CardDescription>Configure available quantities for this product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label>Quantity Selection Mode</Label>
          <RadioGroup value={useGroup ? 'group' : 'individual'} onValueChange={handleModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="group" value="group" />
              <Label className="font-normal cursor-pointer" htmlFor="group">
                Use a predefined quantity group
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="individual" value="individual" />
              <Label className="font-normal cursor-pointer" htmlFor="individual">
                Select individual quantities
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Group Selection */}
        {useGroup && (
          <div className="space-y-3">
            <Label htmlFor="quantityGroup">Select Quantity Group</Label>
            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
              <SelectTrigger id="quantityGroup">
                <SelectValue placeholder="Choose a quantity group..." />
              </SelectTrigger>
              <SelectContent>
                {quantityGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>{group.name}</span>
                      <Badge className="ml-2" variant="outline">
                        {group.quantities.length} quantities
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Preview selected group */}
            {selectedGroupId && getSelectedGroup() && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Group Quantities:</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedGroup()!
                    .quantities.sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(({ quantity }) => (
                      <Badge key={quantity.id} variant="secondary">
                        {quantity.isCustom ? (
                          <span>
                            Custom ({quantity.minValue?.toLocaleString() || '0'} -{' '}
                            {quantity.maxValue?.toLocaleString() || '∞'})
                          </span>
                        ) : (
                          <span>{quantity.value?.toLocaleString()}</span>
                        )}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Individual Selection */}
        {!useGroup && (
          <div className="space-y-3">
            <Label>Select Individual Quantities</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
              {availableQuantities.map((quantity) => (
                <div key={quantity.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={individualQuantities.includes(quantity.id)}
                    id={`quantity-${quantity.id}`}
                    onCheckedChange={() => handleQuantityToggle(quantity.id)}
                  />
                  <Label
                    className="flex-1 cursor-pointer flex items-center justify-between"
                    htmlFor={`quantity-${quantity.id}`}
                  >
                    <span>{quantity.name}</span>
                    <div className="flex items-center gap-2">
                      {quantity.isCustom ? (
                        <Badge variant="outline">
                          Custom ({quantity.minValue?.toLocaleString() || '0'} -{' '}
                          {quantity.maxValue?.toLocaleString() || '∞'})
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{quantity.value?.toLocaleString()} units</Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>

            {individualQuantities.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {individualQuantities.length} quantities selected
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
