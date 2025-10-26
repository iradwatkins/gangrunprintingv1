'use client'

import type { ProductData } from '@/types/product-wizard'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductQuantities } from '../product-quantities'
import { Layers, Info } from 'lucide-react'


interface ProductQuantityStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ProductQuantityStep({
  formData,
  onUpdate,
  onValidationChange,
}: ProductQuantityStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateStep()
  }, [formData.useQuantityGroup, formData.quantityGroupId, formData.quantityIds])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (formData.useQuantityGroup) {
      // If using quantity group, must have a group selected
      if (!formData.quantityGroupId) {
        newErrors.quantityGroup = 'A quantity group must be selected'
      }
    } else {
      // If using individual quantities, must have at least one selected
      if (!formData.quantityIds || formData.quantityIds.length === 0) {
        newErrors.quantities = 'At least one quantity option must be selected'
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  const handleQuantityChange = (data: {
    useGroup: boolean
    quantityGroupId?: string
    quantityIds?: string[]
  }) => {
    onUpdate({
      useQuantityGroup: data.useGroup,
      quantityGroupId: data.quantityGroupId || '',
      quantityIds: data.quantityIds || [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Layers className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Quantity Configuration</CardTitle>
              <CardDescription>
                Set up the quantity options customers can choose from
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quantity Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Quantities</CardTitle>
          <CardDescription>
            Choose how customers will select quantities for this product
          </CardDescription>
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

          <ProductQuantities
            productId={undefined} // New product
            selectedQuantities={formData.quantityIds}
            selectedQuantityGroup={formData.quantityGroupId}
            onChange={handleQuantityChange}
          />
        </CardContent>
      </Card>

      {/* Configuration Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantity Configuration Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Best Practices</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>
                  • <strong>Quantity Groups:</strong> Use predefined groups for consistent pricing
                  across similar products
                </li>
                <li>
                  • <strong>Individual Selection:</strong> Choose specific quantities for unique
                  products or special pricing
                </li>
                <li>
                  • <strong>Minimum Orders:</strong> Consider your production minimums when setting
                  low quantities
                </li>
                <li>
                  • <strong>Bulk Pricing:</strong> Include higher quantities to encourage larger
                  orders
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Quantity Groups</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Consistent across products</p>
                  <p>✓ Easy to manage pricing</p>
                  <p>✓ Standard options</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Individual Selection</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Product-specific options</p>
                  <p>✓ Custom pricing tiers</p>
                  <p>✓ Flexible configuration</p>
                </div>
              </div>
            </div>

            {/* Current Selection Summary */}
            {(formData.quantityGroupId || formData.quantityIds.length > 0) && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
                <div className="text-sm space-y-1">
                  {formData.useQuantityGroup ? (
                    <div>
                      <span className="font-medium">Using Quantity Group:</span>{' '}
                      {formData.quantityGroupId}
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">Individual Quantities:</span>{' '}
                      {formData.quantityIds.length} selected
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact on Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Quantity selections will be used to create pricing tiers in step 7</li>
              <li>• Each quantity option can have different per-unit pricing</li>
              <li>• Higher quantities typically offer better per-unit rates</li>
              <li>• These options will appear in the product configuration calculator</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
