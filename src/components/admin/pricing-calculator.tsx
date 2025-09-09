'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Plus,
  X,
  Info
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

interface PricingTier {
  id?: string
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
  discountPercentage: number
}

interface PricingCalculatorProps {
  basePrice: number
  setupFee: number
  paperStocks: any[]
  options: any[]
  pricingTiers: PricingTier[]
  onTiersChange: (tiers: PricingTier[]) => void
}

export function PricingCalculator({
  basePrice,
  setupFee,
  paperStocks,
  options,
  pricingTiers,
  onTiersChange
}: PricingCalculatorProps) {
  const [testQuantity, setTestQuantity] = useState(100)
  const [selectedPaperMultiplier, setSelectedPaperMultiplier] = useState(1)
  const [selectedOptionsPrice, setSelectedOptionsPrice] = useState(0)
  const [newTier, setNewTier] = useState<PricingTier>({
    minQuantity: 0,
    maxQuantity: null,
    pricePerUnit: basePrice,
    discountPercentage: 0
  })

  const standardQuantities = [100, 250, 500, 1000, 2500, 5000, 10000]

  useEffect(() => {
    // Calculate default pricing tiers if none exist
    if (pricingTiers.length === 0 && basePrice > 0) {
      const defaultTiers: PricingTier[] = [
        { minQuantity: 1, maxQuantity: 99, pricePerUnit: basePrice * 1.5, discountPercentage: 0 },
        { minQuantity: 100, maxQuantity: 249, pricePerUnit: basePrice * 1.3, discountPercentage: 5 },
        { minQuantity: 250, maxQuantity: 499, pricePerUnit: basePrice * 1.2, discountPercentage: 10 },
        { minQuantity: 500, maxQuantity: 999, pricePerUnit: basePrice * 1.1, discountPercentage: 15 },
        { minQuantity: 1000, maxQuantity: 2499, pricePerUnit: basePrice, discountPercentage: 20 },
        { minQuantity: 2500, maxQuantity: 4999, pricePerUnit: basePrice * 0.9, discountPercentage: 25 },
        { minQuantity: 5000, maxQuantity: null, pricePerUnit: basePrice * 0.8, discountPercentage: 30 },
      ]
      onTiersChange(defaultTiers)
    }
  }, [basePrice])

  const calculatePrice = (quantity: number) => {
    // Find applicable tier
    const tier = pricingTiers.find(t => 
      quantity >= t.minQuantity && (t.maxQuantity === null || quantity <= t.maxQuantity)
    )
    
    if (!tier) {
      return {
        unitPrice: basePrice,
        subtotal: basePrice * quantity,
        setupFee: setupFee,
        total: (basePrice * quantity) + setupFee,
        discountPercentage: 0
      }
    }

    const unitPrice = tier.pricePerUnit * selectedPaperMultiplier
    const optionsTotal = selectedOptionsPrice * quantity
    const subtotal = (unitPrice * quantity) + optionsTotal
    const total = subtotal + setupFee

    return {
      unitPrice,
      subtotal,
      setupFee,
      optionsTotal,
      total,
      discountPercentage: tier.discountPercentage,
      savings: (basePrice * 1.5 * quantity) - subtotal
    }
  }

  const handleAddTier = () => {
    if (newTier.minQuantity > 0) {
      const updatedTiers = [...pricingTiers, newTier].sort((a, b) => a.minQuantity - b.minQuantity)
      // Update maxQuantity of previous tier
      for (let i = 0; i < updatedTiers.length - 1; i++) {
        updatedTiers[i].maxQuantity = updatedTiers[i + 1].minQuantity - 1
      }
      onTiersChange(updatedTiers)
      setNewTier({
        minQuantity: 0,
        maxQuantity: null,
        pricePerUnit: basePrice,
        discountPercentage: 0
      })
    }
  }

  const handleRemoveTier = (index: number) => {
    const newTiers = pricingTiers.filter((_, i) => i !== index)
    onTiersChange(newTiers)
  }

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    const newTiers = [...pricingTiers]
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    }
    onTiersChange(newTiers)
  }

  const priceDetails = calculatePrice(testQuantity)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quantity-Based Pricing Tiers
          </CardTitle>
          <CardDescription>
            Configure pricing tiers based on order quantity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Min Qty</TableHead>
                  <TableHead>Max Qty</TableHead>
                  <TableHead>Price/Unit</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingTiers.map((tier, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        className="w-24"
                        type="number"
                        value={tier.minQuantity}
                        onChange={(e) => handleTierChange(index, 'minQuantity', parseInt(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-24"
                        placeholder="∞"
                        type="number"
                        value={tier.maxQuantity || ''}
                        onChange={(e) => handleTierChange(index, 'maxQuantity', e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>$</span>
                        <Input
                          className="w-24"
                          step="0.01"
                          type="number"
                          value={tier.pricePerUnit}
                          onChange={(e) => handleTierChange(index, 'pricePerUnit', parseFloat(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          className="w-20"
                          type="number"
                          value={tier.discountPercentage}
                          onChange={(e) => handleTierChange(index, 'discountPercentage', parseFloat(e.target.value))}
                        />
                        <span>%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTier(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      className="w-24"
                      placeholder="Min"
                      type="number"
                      value={newTier.minQuantity || ''}
                      onChange={(e) => setNewTier(prev => ({ ...prev, minQuantity: parseInt(e.target.value) }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-24"
                      placeholder="Max"
                      type="number"
                      value={newTier.maxQuantity || ''}
                      onChange={(e) => setNewTier(prev => ({ ...prev, maxQuantity: e.target.value ? parseInt(e.target.value) : null }))}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>$</span>
                      <Input
                        className="w-24"
                        placeholder="0.00"
                        step="0.01"
                        type="number"
                        value={newTier.pricePerUnit || ''}
                        onChange={(e) => setNewTier(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-20"
                        placeholder="0"
                        type="number"
                        value={newTier.discountPercentage || ''}
                        onChange={(e) => setNewTier(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) }))}
                      />
                      <span>%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddTier}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Calculator
          </CardTitle>
          <CardDescription>
            Test pricing with different quantities and options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Test Quantity</Label>
              <Input
                min="1"
                type="number"
                value={testQuantity}
                onChange={(e) => setTestQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Paper Stock Multiplier</Label>
              <Input
                max="3"
                min="0.5"
                step="0.1"
                type="number"
                value={selectedPaperMultiplier}
                onChange={(e) => setSelectedPaperMultiplier(parseFloat(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Options Price</Label>
              <div className="flex items-center gap-1">
                <span>$</span>
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={selectedOptionsPrice}
                  onChange={(e) => setSelectedOptionsPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {standardQuantities.map(qty => (
              <Button
                key={qty}
                size="sm"
                variant={testQuantity === qty ? 'default' : 'outline'}
                onClick={() => setTestQuantity(qty)}
              >
                {qty.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="text-2xl font-bold">
                  ${priceDetails.unitPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-2xl font-bold">
                  ${priceDetails.subtotal.toFixed(2)}
                </p>
              </div>
            </div>

            {priceDetails.optionsTotal && priceDetails.optionsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>Options Total</span>
                <span>+${priceDetails.optionsTotal.toFixed(2)}</span>
              </div>
            )}

            {setupFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Setup Fee (one-time)</span>
                <span>+${setupFee.toFixed(2)}</span>
              </div>
            )}

            {priceDetails.discountPercentage > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Volume Discount</span>
                <span>-{priceDetails.discountPercentage}%</span>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${priceDetails.total.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-right">
                ${(priceDetails.total / testQuantity).toFixed(2)} per unit
              </p>
            </div>

            {priceDetails.savings && priceDetails.savings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Saving ${priceDetails.savings.toFixed(2)} with bulk pricing!
                  </span>
                </div>
              </div>
            )}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 space-y-1">
                  <p className="font-medium">Pricing Formula:</p>
                  <p>Final Price = (Base Price × Paper Multiplier × Quantity) + Options + Setup Fee</p>
                  <p className="text-xs text-blue-700">
                    Volume discounts are automatically applied based on quantity tiers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}