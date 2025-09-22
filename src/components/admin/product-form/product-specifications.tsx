'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

interface SelectOption {
  id: string
  name: string
}

interface ProductSpecificationsProps {
  formData: {
    selectedQuantityGroup: string
    selectedSizeGroup: string
    selectedPaperStockSet: string
  }
  quantityGroups: SelectOption[]
  sizeGroups: SelectOption[]
  paperStockSets: SelectOption[]
  onUpdate: (data: Partial<ProductSpecificationsProps['formData']>) => void
}

export function ProductSpecifications({
  formData,
  quantityGroups,
  sizeGroups,
  paperStockSets,
  onUpdate
}: ProductSpecificationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Product Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Quantity Options *</Label>
          <Select
            value={formData.selectedQuantityGroup}
            onValueChange={(value) => onUpdate({ selectedQuantityGroup: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose quantity set..." />
            </SelectTrigger>
            <SelectContent>
              {quantityGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Size Options *</Label>
          <Select
            value={formData.selectedSizeGroup}
            onValueChange={(value) => onUpdate({ selectedSizeGroup: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose size set..." />
            </SelectTrigger>
            <SelectContent>
              {sizeGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Paper Stock *</Label>
          <Select
            value={formData.selectedPaperStockSet}
            onValueChange={(value) => onUpdate({ selectedPaperStockSet: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose paper stock set..." />
            </SelectTrigger>
            <SelectContent>
              {paperStockSets.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}