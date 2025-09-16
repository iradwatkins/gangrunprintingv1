'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductOptions } from '../product-options'
import { Settings, Info, Plus } from 'lucide-react'

interface ProductData {
  options: any[]
}

interface ProductOptionsStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ProductOptionsStep({
  formData,
  onUpdate,
  onValidationChange,
}: ProductOptionsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateStep()
  }, [formData.options])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    // Options are optional, but if they exist, they should be valid
    if (formData.options && formData.options.length > 0) {
      formData.options.forEach((option, index) => {
        if (!option.name || !option.name.trim()) {
          newErrors[`option_${index}_name`] = `Option ${index + 1} name is required`
        }
        if (!option.type) {
          newErrors[`option_${index}_type`] = `Option ${index + 1} type is required`
        }
        if (option.type === 'select' && (!option.values || option.values.length === 0)) {
          newErrors[`option_${index}_values`] = `Option ${index + 1} must have at least one value`
        }
      })
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  const handleOptionsChange = (options: any[]) => {
    onUpdate({ options })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Add-on Options Configuration</CardTitle>
              <CardDescription>
                Set up additional options and services customers can choose from
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Options Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Add-ons & Options</CardTitle>
          <CardDescription>
            Create customizable options like finishes, binding types, or additional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
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

          <ProductOptions
            options={formData.options}
            onOptionsChange={handleOptionsChange}
          />
        </CardContent>
      </Card>

      {/* Option Types Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option Types Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Select Options
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Dropdown menus for choosing from predefined values
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Examples:</strong></p>
                  <p>• Finish: Gloss, Matte, Satin</p>
                  <p>• Binding: Saddle Stitch, Perfect Bound</p>
                  <p>• Coating: UV, Aqueous, None</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Checkbox Options
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Yes/No choices for additional services
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Examples:</strong></p>
                  <p>• Rush Production (+$50)</p>
                  <p>• Folding Service (+$0.05/piece)</p>
                  <p>• Design Review (+$25)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Text Input Options</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Free text fields for custom requirements
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Examples:</strong></p>
                  <p>• Special Instructions</p>
                  <p>• Custom Text/Names</p>
                  <p>• Color Specifications</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Number Input Options</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Numeric fields for quantities or measurements
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Examples:</strong></p>
                  <p>• Number of Colors</p>
                  <p>• Custom Dimensions</p>
                  <p>• Additional Copies</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Option Strategy</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• <strong>Keep it Simple:</strong> Don't overwhelm customers with too many options</li>
                <li>• <strong>Clear Pricing:</strong> Always specify additional costs for paid options</li>
                <li>• <strong>Logical Order:</strong> Arrange options in the order customers would consider them</li>
                <li>• <strong>Required vs Optional:</strong> Mark essential choices as required</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✓ Good Examples</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• "Finish: Gloss (+$0)" </p>
                  <p>• "Rush Production (+$50)"</p>
                  <p>• "Binding Type (Required)"</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">✗ Avoid</h4>
                <div className="text-sm text-red-800 space-y-1">
                  <p>• Unclear option names</p>
                  <p>• Hidden pricing</p>
                  <p>• Too many similar choices</p>
                </div>
              </div>
            </div>

            {/* Current Options Summary */}
            {formData.options.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Options Summary</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Total Options:</span> {formData.options.length}
                  </div>
                  {formData.options.map((option, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span>• {option.name || `Option ${index + 1}`}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {option.type || 'No Type'}
                      </span>
                      {option.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No Options Notice */}
      {formData.options.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Add-on Options Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add-on options are optional but can help increase order value and provide customers with more choices.
              </p>
              <p className="text-xs text-gray-500">
                You can always add options later from the product management page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}