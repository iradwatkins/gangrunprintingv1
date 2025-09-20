'use client'

import { useState, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Zap, Layers, Info, AlertTriangle } from 'lucide-react'

interface ProductData {
  productionTime: number
  rushAvailable: boolean
  rushDays: number
  rushFee: number
  gangRunEligible: boolean
  minGangQuantity: number
  maxGangQuantity: number
}

interface ProductTurnaroundStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ProductTurnaroundStep({
  formData,
  onUpdate,
  onValidationChange,
}: ProductTurnaroundStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateStep()
  }, [formData])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    // Production time validation
    if (!formData.productionTime || formData.productionTime < 1) {
      newErrors.productionTime = 'Production time must be at least 1 business day'
    }

    // Rush production validation
    if (formData.rushAvailable) {
      if (!formData.rushDays || formData.rushDays < 1) {
        newErrors.rushDays = 'Rush production time must be at least 1 day'
      }
      if (formData.rushDays >= formData.productionTime) {
        newErrors.rushDays = 'Rush time must be less than standard production time'
      }
      if (formData.rushFee < 0) {
        newErrors.rushFee = 'Rush fee cannot be negative'
      }
    }

    // Gang run validation
    if (formData.gangRunEligible) {
      if (!formData.minGangQuantity || formData.minGangQuantity < 1) {
        newErrors.minGangQuantity = 'Minimum gang quantity must be at least 1'
      }
      if (!formData.maxGangQuantity || formData.maxGangQuantity < 1) {
        newErrors.maxGangQuantity = 'Maximum gang quantity must be at least 1'
      }
      if (formData.maxGangQuantity <= formData.minGangQuantity) {
        newErrors.maxGangQuantity = 'Maximum gang quantity must be greater than minimum'
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Turnaround Times & Production</CardTitle>
              <CardDescription>
                Configure production schedules and special production options
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Standard Production Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Production Time</CardTitle>
          <CardDescription>Set the normal production time for this product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productionTime">Production Time (Business Days) *</Label>
            <Input
              className={errors.productionTime ? 'border-red-500' : ''}
              id="productionTime"
              max="30"
              min="1"
              type="number"
              value={formData.productionTime}
              onChange={(e) => onUpdate({ productionTime: parseInt(e.target.value) || 1 })}
            />
            {errors.productionTime && (
              <p className="text-sm text-red-500">{errors.productionTime}</p>
            )}
            <p className="text-sm text-muted-foreground">
              This excludes weekends and holidays. Customers will see an estimated delivery date
              based on this time.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Production Time Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>1-2 days:</strong> Simple digital products (business cards, flyers)
              </li>
              <li>
                • <strong>3-5 days:</strong> Standard printing with finishing (booklets, brochures)
              </li>
              <li>
                • <strong>5-10 days:</strong> Complex products requiring special materials or
                processes
              </li>
              <li>
                • <strong>10+ days:</strong> Large format, custom, or specialty items
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Rush Production */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Rush Production Options
          </CardTitle>
          <CardDescription>Offer expedited production for urgent orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Rush Production</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay extra for faster production
              </p>
            </div>
            <Switch
              checked={formData.rushAvailable}
              onCheckedChange={(checked) => onUpdate({ rushAvailable: checked })}
            />
          </div>

          {formData.rushAvailable && (
            <div className="space-y-4 pl-4 border-l-2 border-yellow-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rushDays">Rush Production Time (Days) *</Label>
                  <Input
                    className={errors.rushDays ? 'border-red-500' : ''}
                    id="rushDays"
                    min="1"
                    type="number"
                    value={formData.rushDays}
                    onChange={(e) => onUpdate({ rushDays: parseInt(e.target.value) || 1 })}
                  />
                  {errors.rushDays && <p className="text-sm text-red-500">{errors.rushDays}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rushFee">Rush Fee ($)</Label>
                  <Input
                    className={errors.rushFee ? 'border-red-500' : ''}
                    id="rushFee"
                    min="0"
                    step="0.01"
                    type="number"
                    value={formData.rushFee}
                    onChange={(e) => onUpdate({ rushFee: parseFloat(e.target.value) || 0 })}
                  />
                  {errors.rushFee && <p className="text-sm text-red-500">{errors.rushFee}</p>}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rush production requires careful capacity planning. Ensure you can consistently
                  deliver within the rush timeframe.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gang Run Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            Gang Run Eligibility
          </CardTitle>
          <CardDescription>
            Allow this product to be combined with others for cost savings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Gang Run Eligible</Label>
              <p className="text-sm text-muted-foreground">
                This product can be combined with others for efficiency and cost savings
              </p>
            </div>
            <Switch
              checked={formData.gangRunEligible}
              onCheckedChange={(checked) => onUpdate({ gangRunEligible: checked })}
            />
          </div>

          {formData.gangRunEligible && (
            <div className="space-y-4 pl-4 border-l-2 border-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minGangQuantity">Minimum Gang Quantity *</Label>
                  <Input
                    className={errors.minGangQuantity ? 'border-red-500' : ''}
                    id="minGangQuantity"
                    min="1"
                    type="number"
                    value={formData.minGangQuantity}
                    onChange={(e) => onUpdate({ minGangQuantity: parseInt(e.target.value) || 100 })}
                  />
                  {errors.minGangQuantity && (
                    <p className="text-sm text-red-500">{errors.minGangQuantity}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGangQuantity">Maximum Gang Quantity *</Label>
                  <Input
                    className={errors.maxGangQuantity ? 'border-red-500' : ''}
                    id="maxGangQuantity"
                    min="1"
                    type="number"
                    value={formData.maxGangQuantity}
                    onChange={(e) =>
                      onUpdate({ maxGangQuantity: parseInt(e.target.value) || 1000 })
                    }
                  />
                  {errors.maxGangQuantity && (
                    <p className="text-sm text-red-500">{errors.maxGangQuantity}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Gang Run Benefits</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>
                    • <strong>Cost Savings:</strong> Customers save money by sharing setup costs
                  </li>
                  <li>
                    • <strong>Efficiency:</strong> Better use of press time and materials
                  </li>
                  <li>
                    • <strong>Environmental:</strong> Reduced waste and resource usage
                  </li>
                  <li>
                    • <strong>Competitive:</strong> Offer lower prices than individual runs
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Production Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Standard Production</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formData.productionTime}</p>
              <p className="text-sm text-gray-600">Business days</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium">Rush Production</h4>
              </div>
              {formData.rushAvailable ? (
                <>
                  <p className="text-2xl font-bold text-yellow-600">{formData.rushDays}</p>
                  <p className="text-sm text-gray-600">Days (+${formData.rushFee})</p>
                </>
              ) : (
                <p className="text-gray-500">Not available</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">Gang Run</h4>
              </div>
              {formData.gangRunEligible ? (
                <>
                  <p className="text-sm font-medium text-green-600">Eligible</p>
                  <p className="text-sm text-gray-600">
                    {formData.minGangQuantity}-{formData.maxGangQuantity} qty
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Not eligible</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please fix the following issues before proceeding:
            <ul className="mt-2 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
