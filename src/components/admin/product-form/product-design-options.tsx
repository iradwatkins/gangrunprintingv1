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
import { Palette, Info, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SelectOption {
  id: string
  name: string
}

interface ProductDesignOptionsProps {
  formData: {
    selectedDesignSet: string
  }
  designSets: SelectOption[]
  onUpdate: (data: Partial<ProductDesignOptionsProps['formData']>) => void
}

export function ProductDesignOptions({
  formData,
  designSets,
  onUpdate,
}: ProductDesignOptionsProps) {
  const hasDesignSet = Boolean(formData.selectedDesignSet)

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Design Services
          <Badge className="text-xs ml-2" variant="secondary">
            Optional
          </Badge>
        </CardTitle>
        <CardDescription>
          Optionally assign a design set to this product. Customers will be able to select from
          design options like "Upload Your Own Artwork" or professional design services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Design Set
              <Badge className="text-xs ml-2" variant="outline">
                Optional
              </Badge>
            </Label>
            <Badge className="text-xs" variant="outline">
              {designSets.length} available
            </Badge>
          </div>
          <Select
            value={formData.selectedDesignSet || 'none'}
            onValueChange={(value) => {
              // console.log('Design set selected:', value)
              // If "none" is selected, set to empty string
              onUpdate({ selectedDesignSet: value === 'none' ? '' : value })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose design set (optional)..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-500">None (No design services)</span>
              </SelectItem>
              {designSets.length === 0 ? (
                <div className="px-2 py-1 text-sm text-gray-500">No design sets available</div>
              ) : (
                designSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {hasDesignSet && (
            <p className="text-xs text-green-600">
              ✓ Selected: {designSets.find((s) => s.id === formData.selectedDesignSet)?.name}
            </p>
          )}
          {!hasDesignSet && (
            <p className="text-xs text-gray-500">
              No design set selected - customers cannot select design services
            </p>
          )}
        </div>

        {/* Info box explaining design options */}
        {hasDesignSet && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
              <CheckCircle2 className="h-4 w-4" />
              Design set enabled for this product
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 list-disc list-inside ml-2">
                  <li>Customers see a Design dropdown on the product page</li>
                  <li>
                    Default option: "Upload Your Own Artwork" (FREE) - shows file upload zone
                  </li>
                  <li>Other options: Professional design services - hide upload, show email</li>
                  <li>Design prices are calculated and added to cart total</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Disabled State Message */}
        {!hasDesignSet && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              Select a design set above to enable design services. Customers will see design
              options in a dropdown and can choose to upload their own files or request
              professional design assistance.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-700 mb-2">Design Services Status:</p>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            {hasDesignSet ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Enabled - Design dropdown will appear on product page</span>
              </>
            ) : (
              <>
                <span>−</span>
                <span>Disabled - No design services for this product</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
