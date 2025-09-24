'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface SelectOption {
  id: string
  name: string
}

interface ProductAdditionalOptionsProps {
  formData: {
    selectedAddOnSet: string
    selectedTurnaroundTimeSet: string
  }
  addOnSets: SelectOption[]
  turnaroundTimeSets: SelectOption[]
  onUpdate: (data: Partial<ProductAdditionalOptionsProps['formData']>) => void
}

export function ProductAdditionalOptions({
  formData,
  addOnSets,
  turnaroundTimeSets,
  onUpdate
}: ProductAdditionalOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Additional Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Add-on Options (Optional)</Label>
          <Select
            value={formData.selectedAddOnSet || "none"}
            onValueChange={(value) =>
              onUpdate({ selectedAddOnSet: value === "none" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose add-on set..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No add-ons</SelectItem>
              {addOnSets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Turnaround Times (Optional)</Label>
          <Select
            value={formData.selectedTurnaroundTimeSet || "none"}
            onValueChange={(value) =>
              onUpdate({ selectedTurnaroundTimeSet: value === "none" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose turnaround time set..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No turnaround options</SelectItem>
              {turnaroundTimeSets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
