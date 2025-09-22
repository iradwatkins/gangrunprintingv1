'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PricingCalculator } from '../pricing-calculator'
import { Calculator, DollarSign, Info, TestTube, Loader2 } from 'lucide-react'

interface ProductData {
  basePrice: number
  setupFee: number
  paperStocks: any[]
  options: any[]
  pricingTiers: any[]
  quantityIds: string[]
  sizeIds: string[]
  useQuantityGroup: boolean
  quantityGroupId: string
  useSizeGroup: boolean
  sizeGroupId: string
}

interface ProductPriceTestStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
  onPublish: () => Promise<void>
}

export function ProductPriceTestStep({
  formData,
  onUpdate,
  onValidationChange,
  onPublish,
}: ProductPriceTestStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [testConfiguration, setTestConfiguration] = useState({
    quantity: '',
    size: '',
    paperStock: '',
    selectedOptions: {} as Record<string, any>,
  })
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [quantities, setQuantities] = useState([])
  const [sizes, setSizes] = useState([])
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    validateStep()
    fetchQuantitiesAndSizes()
  }, [formData])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    // Base price validation
    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0'
    }

    // Setup fee validation (can be 0)
    if (formData.setupFee < 0) {
      newErrors.setupFee = 'Setup fee cannot be negative'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  const fetchQuantitiesAndSizes = async () => {
    try {
      // Fetch quantities
      if (formData.useQuantityGroup && formData.quantityGroupId) {
        const res = await fetch(`/api/quantity-groups/${formData.quantityGroupId}`)
        if (res.ok) {
          const group = await res.json()
          setQuantities(group.quantities || [])
        }
      } else if (formData.quantityIds.length > 0) {
        const res = await fetch('/api/quantities')
        if (res.ok) {
          const allQuantities = await res.json()
          setQuantities(allQuantities.filter((q: any) => formData.quantityIds.includes(q.id)))
        }
      }

      // Fetch sizes
      if (formData.useSizeGroup && formData.sizeGroupId) {
        const res = await fetch(`/api/size-groups/${formData.sizeGroupId}`)
        if (res.ok) {
          const group = await res.json()
          setSizes(group.sizes || [])
        }
      } else if (formData.sizeIds.length > 0) {
        const res = await fetch('/api/sizes')
        if (res.ok) {
          const allSizes = await res.json()
          setSizes(allSizes.filter((s: any) => formData.sizeIds.includes(s.id)))
        }
      }
    } catch (error) {
      }
  }

  const calculateTestPrice = async () => {
    if (!testConfiguration.quantity || !testConfiguration.size) {
      return
    }

    setIsCalculating(true)
    try {
      // This would integrate with your existing pricing engine
      // For now, we'll do a simple calculation
      const basePrice = formData.basePrice
      const setupFee = formData.setupFee
      const quantity = parseInt(testConfiguration.quantity)

      // Find quantity pricing tier
      let pricePerUnit = basePrice
      if (formData.pricingTiers.length > 0) {
        const tier = formData.pricingTiers.find(
          (t) => quantity >= t.minQuantity && (t.maxQuantity === null || quantity <= t.maxQuantity)
        )
        if (tier) {
          pricePerUnit = tier.pricePerUnit
        }
      }

      // Calculate total
      let total = pricePerUnit * quantity + setupFee

      // Add option costs
      Object.entries(testConfiguration.selectedOptions).forEach(([optionId, value]) => {
        const option = formData.options.find((o) => o.id === optionId)
        if (option && option.pricing) {
          if (option.type === 'checkbox' && value) {
            total += option.pricing.fee || 0
          } else if (option.type === 'select' && option.values) {
            const selectedValue = option.values.find((v: any) => v.value === value)
            if (selectedValue && selectedValue.additionalCost) {
              total += selectedValue.additionalCost
            }
          }
        }
      })

      setCalculatedPrice(total)
    } catch (error) {
      } finally {
      setIsCalculating(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await onPublish()
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Price Testing & Final Review</CardTitle>
              <CardDescription>
                Test your pricing configuration and publish your product
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Base Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base Pricing</CardTitle>
          <CardDescription>Set your base price and any setup fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price ($) *</Label>
              <Input
                className={errors.basePrice ? 'border-red-500' : ''}
                id="basePrice"
                min="0"
                step="0.01"
                type="number"
                value={formData.basePrice}
                onChange={(e) => onUpdate({ basePrice: parseFloat(e.target.value) || 0 })}
              />
              {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupFee">Setup Fee ($)</Label>
              <Input
                className={errors.setupFee ? 'border-red-500' : ''}
                id="setupFee"
                min="0"
                step="0.01"
                type="number"
                value={formData.setupFee}
                onChange={(e) => onUpdate({ setupFee: parseFloat(e.target.value) || 0 })}
              />
              {errors.setupFee && <p className="text-sm text-red-500">{errors.setupFee}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Pricing Configuration</CardTitle>
          <CardDescription>
            Set up quantity-based pricing tiers and volume discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingCalculator
            basePrice={formData.basePrice}
            options={formData.options}
            paperStocks={formData.paperStocks}
            pricingTiers={formData.pricingTiers}
            setupFee={formData.setupFee}
            onTiersChange={(tiers) => onUpdate({ pricingTiers: tiers })}
          />
        </CardContent>
      </Card>

      {/* Live Price Testing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TestTube className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Price Testing</CardTitle>
              <CardDescription>
                Test different configurations to verify your pricing
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Select
                value={testConfiguration.quantity}
                onValueChange={(value) =>
                  setTestConfiguration((prev) => ({ ...prev, quantity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {quantities.map((qty: any) => (
                    <SelectItem key={qty.id} value={qty.value.toString()}>
                      {qty.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={testConfiguration.size}
                onValueChange={(value) =>
                  setTestConfiguration((prev) => ({ ...prev, size: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size: any) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paper Stock</Label>
              <Select
                value={testConfiguration.paperStock}
                onValueChange={(value) =>
                  setTestConfiguration((prev) => ({ ...prev, paperStock: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select paper" />
                </SelectTrigger>
                <SelectContent>
                  {formData.paperStocks.map((paper: any) => (
                    <SelectItem key={paper.id} value={paper.id}>
                      {paper.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                className="w-full"
                disabled={!testConfiguration.quantity || !testConfiguration.size || isCalculating}
                onClick={calculateTestPrice}
              >
                {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Calculate Price
              </Button>
            </div>
          </div>

          {/* Price Result */}
          {calculatedPrice !== null && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Calculated Price</h4>
              </div>
              <div className="text-2xl font-bold text-green-600">${calculatedPrice.toFixed(2)}</div>
              <p className="text-sm text-green-700 mt-1">For {testConfiguration.quantity} units</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Review</CardTitle>
          <CardDescription>Review your product configuration before publishing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm text-gray-500">Paper Options</div>
                <div className="font-bold">{formData.paperStocks.length}</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm text-gray-500">Quantities</div>
                <div className="font-bold">
                  {formData.useQuantityGroup ? 'Group' : formData.quantityIds.length}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm text-gray-500">Sizes</div>
                <div className="font-bold">
                  {formData.useSizeGroup ? 'Group' : formData.sizeIds.length}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm text-gray-500">Add-ons</div>
                <div className="font-bold">{formData.options.length}</div>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please fix the following issues before publishing:
                  <ul className="mt-2 space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ready to Publish?</h4>
              <p className="text-sm text-blue-800 mb-4">
                Your product configuration is complete! Click the button below to make this product
                available to customers.
              </p>
              <Button
                className="w-full"
                disabled={Object.keys(errors).length > 0 || publishing}
                size="lg"
                onClick={handlePublish}
              >
                {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
