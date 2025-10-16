'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, Plus, Zap, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  onUpdate,
}: ProductAdditionalOptionsProps) {
  // Debug logging
  // console.log('ProductAdditionalOptions loaded:', {
    addOnSets: addOnSets?.length || 0,
    turnaroundTimeSets: turnaroundTimeSets?.length || 0,
    currentSelections: formData,
  })

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Additional Options
        </CardTitle>
        <CardDescription>
          Configure optional features like add-ons and turnaround times. These settings are optional
          but recommended.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add-on Options
              <Badge className="text-xs ml-2" variant="secondary">
                Optional
              </Badge>
            </Label>
            <Badge className="text-xs" variant="outline">
              {addOnSets.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedAddOnSet || 'none'}
            onValueChange={(value) => {
              // console.log('Add-on set selected:', value)
              onUpdate({ selectedAddOnSet: value === 'none' ? '' : value })
            }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Choose add-on set..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-500">No add-ons</span>
              </SelectItem>
              {addOnSets.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No add-on sets available</div>
              ) : (
                addOnSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.selectedAddOnSet && formData.selectedAddOnSet !== 'none' && (
            <p className="text-xs text-purple-600">
              ✓ Selected: {addOnSets.find((s) => s.id === formData.selectedAddOnSet)?.name}
            </p>
          )}
          {(!formData.selectedAddOnSet || formData.selectedAddOnSet === 'none') && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              No add-ons selected (product will have basic options only)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Turnaround Times
              <Badge className="text-xs ml-2" variant="secondary">
                Optional
              </Badge>
            </Label>
            <Badge className="text-xs" variant="outline">
              {turnaroundTimeSets.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedTurnaroundTimeSet || 'none'}
            onValueChange={(value) => {
              // console.log('Turnaround time set selected:', value)
              onUpdate({ selectedTurnaroundTimeSet: value === 'none' ? '' : value })
            }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Choose turnaround time set..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-500">No turnaround options</span>
              </SelectItem>
              {turnaroundTimeSets.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No turnaround sets available</div>
              ) : (
                turnaroundTimeSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.selectedTurnaroundTimeSet && formData.selectedTurnaroundTimeSet !== 'none' && (
            <p className="text-xs text-purple-600">
              ✓ Selected:{' '}
              {turnaroundTimeSets.find((s) => s.id === formData.selectedTurnaroundTimeSet)?.name}
            </p>
          )}
          {(!formData.selectedTurnaroundTimeSet ||
            formData.selectedTurnaroundTimeSet === 'none') && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              No rush options selected (standard production time only)
            </p>
          )}
        </div>

        {/* Summary of optional selections */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-700 mb-2">Optional Features:</p>
          <div className="space-y-1 text-xs text-purple-600">
            <div className="flex items-center gap-2">
              <span>
                {formData.selectedAddOnSet && formData.selectedAddOnSet !== 'none' ? '✓' : '−'}
              </span>
              Add-ons:{' '}
              {formData.selectedAddOnSet && formData.selectedAddOnSet !== 'none'
                ? addOnSets.find((s) => s.id === formData.selectedAddOnSet)?.name
                : 'Not configured'}
            </div>
            <div className="flex items-center gap-2">
              <span>
                {formData.selectedTurnaroundTimeSet && formData.selectedTurnaroundTimeSet !== 'none'
                  ? '✓'
                  : '−'}
              </span>
              Turnaround Times:{' '}
              {formData.selectedTurnaroundTimeSet && formData.selectedTurnaroundTimeSet !== 'none'
                ? turnaroundTimeSets.find((s) => s.id === formData.selectedTurnaroundTimeSet)?.name
                : 'Not configured'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
