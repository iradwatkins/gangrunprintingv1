'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Package, Ruler, FileText, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  // Debug logging to track data
  console.log('ProductSpecifications loaded:', {
    quantityGroups: quantityGroups?.length || 0,
    sizeGroups: sizeGroups?.length || 0,
    paperStockSets: paperStockSets?.length || 0,
    currentSelections: formData
  })

  const hasData = quantityGroups.length > 0 && sizeGroups.length > 0 && paperStockSets.length > 0

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Product Specifications
        </CardTitle>
        <CardDescription>
          Configure the core printing specifications for this product.
          All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Loading configuration options... If this persists, check that configuration data exists.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity Options
              <span className="text-red-500">*</span>
            </Label>
            <Badge variant="outline" className="text-xs">
              {quantityGroups.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedQuantityGroup || ''}
            onValueChange={(value) => {
              console.log('Quantity selected:', value)
              onUpdate({ selectedQuantityGroup: value })
            }}
          >
            <SelectTrigger className={!formData.selectedQuantityGroup ? 'border-red-300' : ''}>
              <SelectValue placeholder="Choose quantity set..." />
            </SelectTrigger>
            <SelectContent>
              {quantityGroups.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No quantity groups available</div>
              ) : (
                quantityGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.selectedQuantityGroup && (
            <p className="text-xs text-green-600">✓ Selected: {quantityGroups.find(g => g.id === formData.selectedQuantityGroup)?.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Size Options
              <span className="text-red-500">*</span>
            </Label>
            <Badge variant="outline" className="text-xs">
              {sizeGroups.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedSizeGroup || ''}
            onValueChange={(value) => {
              console.log('Size selected:', value)
              onUpdate({ selectedSizeGroup: value })
            }}
          >
            <SelectTrigger className={!formData.selectedSizeGroup ? 'border-red-300' : ''}>
              <SelectValue placeholder="Choose size set..." />
            </SelectTrigger>
            <SelectContent>
              {sizeGroups.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No size groups available</div>
              ) : (
                sizeGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.selectedSizeGroup && (
            <p className="text-xs text-green-600">✓ Selected: {sizeGroups.find(g => g.id === formData.selectedSizeGroup)?.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Paper Stock
              <span className="text-red-500">*</span>
            </Label>
            <Badge variant="outline" className="text-xs">
              {paperStockSets.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedPaperStockSet || ''}
            onValueChange={(value) => {
              console.log('Paper stock selected:', value)
              onUpdate({ selectedPaperStockSet: value })
            }}
          >
            <SelectTrigger className={!formData.selectedPaperStockSet ? 'border-red-300' : ''}>
              <SelectValue placeholder="Choose paper stock set..." />
            </SelectTrigger>
            <SelectContent>
              {paperStockSets.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No paper stock sets available</div>
              ) : (
                paperStockSets.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.selectedPaperStockSet && (
            <p className="text-xs text-green-600">✓ Selected: {paperStockSets.find(g => g.id === formData.selectedPaperStockSet)?.name}</p>
          )}
        </div>

        {/* Summary of selections */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Configuration Summary:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className={formData.selectedQuantityGroup ? 'text-green-600' : 'text-red-600'}>
                {formData.selectedQuantityGroup ? '✓' : '✗'}
              </span>
              Quantity Group: {formData.selectedQuantityGroup ? 'Selected' : 'Not selected'}
            </div>
            <div className="flex items-center gap-2">
              <span className={formData.selectedSizeGroup ? 'text-green-600' : 'text-red-600'}>
                {formData.selectedSizeGroup ? '✓' : '✗'}
              </span>
              Size Group: {formData.selectedSizeGroup ? 'Selected' : 'Not selected'}
            </div>
            <div className="flex items-center gap-2">
              <span className={formData.selectedPaperStockSet ? 'text-green-600' : 'text-red-600'}>
                {formData.selectedPaperStockSet ? '✓' : '✗'}
              </span>
              Paper Stock Set: {formData.selectedPaperStockSet ? 'Selected' : 'Not selected'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
