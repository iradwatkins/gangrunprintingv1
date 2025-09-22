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
import { Ruler, Layers, Plus } from 'lucide-react'
import toast from '@/lib/toast'

interface Size {
  id: string
  name: string
  width: number | null
  height: number | null
  displayName: string | null
  isCustom: boolean
  minWidth: number | null
  maxWidth: number | null
  minHeight: number | null
  maxHeight: number | null
  unit: string
}

interface SizeGroup {
  id: string
  name: string
  description: string | null
  sizes: {
    size: Size
    sortOrder: number
  }[]
}

interface ProductSizesProps {
  productId?: string
  selectedSizes?: string[]
  selectedSizeGroup?: string
  onChange: (data: { useGroup: boolean; sizeGroupId?: string; sizeIds?: string[] }) => void
}

export function ProductSizes({
  productId,
  selectedSizes = [],
  selectedSizeGroup,
  onChange,
}: ProductSizesProps) {
  const [useGroup, setUseGroup] = useState(!!selectedSizeGroup)
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([])
  const [availableSizes, setAvailableSizes] = useState<Size[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>(selectedSizeGroup || '')
  const [individualSizes, setIndividualSizes] = useState<string[]>(selectedSizes)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch size groups
      const groupsResponse = await fetch('/api/size-groups?include=sizes&active=true')
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setSizeGroups(groupsData)
      }

      // Fetch individual sizes
      const sizesResponse = await fetch('/api/sizes?active=true')
      if (sizesResponse.ok) {
        const sizesData = await sizesResponse.json()
        setAvailableSizes(sizesData)
      }
    } catch (error) {
      toast.error('Failed to load sizes')
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
        sizeGroupId: selectedGroupId || undefined,
      })
    } else {
      onChange({
        useGroup: false,
        sizeIds: individualSizes.length > 0 ? individualSizes : undefined,
      })
    }
  }

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
    onChange({
      useGroup: true,
      sizeGroupId: groupId,
    })
  }

  const handleSizeToggle = (sizeId: string) => {
    const newSizes = individualSizes.includes(sizeId)
      ? individualSizes.filter((id) => id !== sizeId)
      : [...individualSizes, sizeId]

    setIndividualSizes(newSizes)
    onChange({
      useGroup: false,
      sizeIds: newSizes.length > 0 ? newSizes : undefined,
    })
  }

  const getSelectedGroup = () => {
    return sizeGroups.find((g) => g.id === selectedGroupId)
  }

  const formatSizeDimensions = (size: Size) => {
    if (size.isCustom) {
      return `Custom (${size.minWidth || 0}" - ${size.maxWidth || '∞'}" × ${size.minHeight || 0}" - ${size.maxHeight || '∞'}")`
    }
    if (size.width && size.height) {
      return `${size.width}" × ${size.height}"`
    }
    return ''
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading sizes...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Size Options
        </CardTitle>
        <CardDescription>Configure available sizes for this product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label>Size Selection Mode</Label>
          <RadioGroup value={useGroup ? 'group' : 'individual'} onValueChange={handleModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="size-group" value="group" />
              <Label className="font-normal cursor-pointer" htmlFor="size-group">
                Use a predefined size group
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="size-individual" value="individual" />
              <Label className="font-normal cursor-pointer" htmlFor="size-individual">
                Select individual sizes
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Group Selection */}
        {useGroup && (
          <div className="space-y-3">
            <Label htmlFor="sizeGroup">Select Size Group</Label>
            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
              <SelectTrigger id="sizeGroup">
                <SelectValue placeholder="Choose a size group..." />
              </SelectTrigger>
              <SelectContent>
                {sizeGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>{group.name}</span>
                      <Badge className="ml-2" variant="outline">
                        {group.sizes.length} sizes
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Preview selected group */}
            {selectedGroupId && getSelectedGroup() && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Group Sizes:</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedGroup()!
                    .sizes.sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(({ size }) => (
                      <Badge key={size.id} variant="secondary">
                        <span className="font-medium">{size.name}</span>
                        {size.displayName && (
                          <span className="ml-1 text-xs">({size.displayName})</span>
                        )}
                        {!size.isCustom && size.width && size.height && (
                          <span className="ml-1 text-xs font-mono">
                            {size.width}" × {size.height}"
                          </span>
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
            <Label>Select Individual Sizes</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
              {availableSizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={individualSizes.includes(size.id)}
                    id={`size-${size.id}`}
                    onCheckedChange={() => handleSizeToggle(size.id)}
                  />
                  <Label
                    className="flex-1 cursor-pointer flex items-center justify-between"
                    htmlFor={`size-${size.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{size.name}</span>
                      {size.displayName && (
                        <span className="text-sm text-muted-foreground">({size.displayName})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {size.isCustom ? (
                        <Badge variant="outline">
                          Custom ({size.minWidth || 0}" - {size.maxWidth || '∞'}" ×{' '}
                          {size.minHeight || 0}" - {size.maxHeight || '∞'}")
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {size.width}" × {size.height}"
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>

            {individualSizes.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {individualSizes.length} sizes selected
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
