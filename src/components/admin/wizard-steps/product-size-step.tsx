'use client'

import type { ProductData } from '@/types/product-wizard'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductSizes } from '../product-sizes'
import { Ruler, Info } from 'lucide-react'


interface ProductSizeStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ProductSizeStep({ formData, onUpdate, onValidationChange }: ProductSizeStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateStep()
  }, [formData.useSizeGroup, formData.sizeGroupId, formData.sizeIds])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (formData.useSizeGroup) {
      // If using size group, must have a group selected
      if (!formData.sizeGroupId) {
        newErrors.sizeGroup = 'A size group must be selected'
      }
    } else {
      // If using individual sizes, must have at least one selected
      if (!formData.sizeIds || formData.sizeIds.length === 0) {
        newErrors.sizes = 'At least one size option must be selected'
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  const handleSizeChange = (data: {
    useGroup: boolean
    sizeGroupId?: string
    sizeIds?: string[]
  }) => {
    onUpdate({
      useSizeGroup: data.useGroup,
      sizeGroupId: data.sizeGroupId || '',
      sizeIds: data.sizeIds || [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ruler className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Size Configuration</CardTitle>
              <CardDescription>Set up the size options customers can choose from</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Sizes</CardTitle>
          <CardDescription>Choose how customers will select sizes for this product</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(errors).length > 0 && (
            <Alert className="mb-4" variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <ProductSizes
            productId={undefined} // New product
            selectedSizeGroup={formData.sizeGroupId}
            selectedSizes={formData.sizeIds}
            onChange={handleSizeChange}
          />
        </CardContent>
      </Card>

      {/* Configuration Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Size Configuration Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Best Practices</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>
                  • <strong>Size Groups:</strong> Use predefined groups for standard product
                  categories
                </li>
                <li>
                  • <strong>Individual Selection:</strong> Choose specific sizes for specialized
                  products
                </li>
                <li>
                  • <strong>Popular Sizes:</strong> Include the most commonly requested sizes
                </li>
                <li>
                  • <strong>Production Capability:</strong> Only offer sizes you can reliably
                  produce
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Size Groups</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Standard industry sizes</p>
                  <p>✓ Consistent across similar products</p>
                  <p>✓ Easy to manage and update</p>
                  <p>✓ Pre-configured pricing</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Individual Selection</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Product-specific sizes</p>
                  <p>✓ Custom dimensions</p>
                  <p>✓ Specialized pricing</p>
                  <p>✓ Unique offerings</p>
                </div>
              </div>
            </div>

            {/* Current Selection Summary */}
            {(formData.sizeGroupId || formData.sizeIds.length > 0) && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
                <div className="text-sm space-y-1">
                  {formData.useSizeGroup ? (
                    <div>
                      <span className="font-medium">Using Size Group:</span> {formData.sizeGroupId}
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">Individual Sizes:</span>{' '}
                      {formData.sizeIds.length} selected
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Common Size Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Size Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Business Cards</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 3.5" × 2"</li>
                <li>• 3.5" × 2.5"</li>
                <li>• Square (2.5" × 2.5")</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Flyers</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 5.5" × 8.5"</li>
                <li>• 8.5" × 11"</li>
                <li>• 11" × 17"</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Banners</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 2' × 4'</li>
                <li>• 3' × 6'</li>
                <li>• 4' × 8'</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Different sizes may have different base pricing multipliers</li>
              <li>• Size pricing is typically configured in the size management section</li>
              <li>• Larger sizes generally cost more due to material usage</li>
              <li>• Consider setup costs for non-standard sizes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
