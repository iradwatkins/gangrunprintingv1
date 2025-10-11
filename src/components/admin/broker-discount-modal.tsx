'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Percent, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BrokerDiscountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  categories: Array<{ id: string; name: string }>
  currentDiscounts: Record<string, number>
}

export function BrokerDiscountModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  categories,
  currentDiscounts,
}: BrokerDiscountModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [discounts, setDiscounts] = useState<Record<string, number>>(currentDiscounts || {})
  const [globalDiscount, setGlobalDiscount] = useState('')

  // Reset discounts when modal opens with new data
  useEffect(() => {
    if (open) {
      setDiscounts(currentDiscounts || {})
      setGlobalDiscount('')
      setError(null)
      setSuccess(false)
    }
  }, [open, currentDiscounts])

  // Apply global discount to all categories
  const handleGlobalDiscount = () => {
    const value = parseFloat(globalDiscount)
    if (isNaN(value) || value < 0 || value > 100) {
      setError('Please enter a valid percentage between 0 and 100')
      return
    }

    const newDiscounts: Record<string, number> = {}
    categories.forEach((category) => {
      newDiscounts[category.name] = value
    })
    setDiscounts(newDiscounts)
    setGlobalDiscount('')
  }

  // Update individual category discount
  const handleCategoryDiscount = (categoryName: string, value: string) => {
    const numValue = parseFloat(value)

    if (value === '' || value === null) {
      // Remove discount if cleared
      const newDiscounts = { ...discounts }
      delete newDiscounts[categoryName]
      setDiscounts(newDiscounts)
      return
    }

    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return // Don't update with invalid values
    }

    setDiscounts({
      ...discounts,
      [categoryName]: numValue,
    })
  }

  // Save broker discounts
  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/broker-discounts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discounts }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update broker discounts')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        router.refresh() // Refresh the page to show updated discounts
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save discounts')
    } finally {
      setLoading(false)
    }
  }

  const activeDiscountCount = Object.keys(discounts).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Broker Discounts</DialogTitle>
          <DialogDescription>Set category-specific discounts for {customerName}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Broker discounts updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Global Discount */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Apply Global Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  max="100"
                  min="0"
                  placeholder="e.g., 15"
                  step="0.5"
                  type="number"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleGlobalDiscount}>
                Apply to All
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Set the same discount percentage for all product categories
            </p>
          </CardContent>
        </Card>

        {/* Category Discounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Category Discounts</h4>
            <span className="text-sm text-muted-foreground">
              {activeDiscountCount} of {categories.length} categories configured
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium" htmlFor={category.id}>
                    {category.name}
                  </Label>
                </div>
                <div className="flex items-center gap-2 w-32">
                  <Input
                    className="text-right"
                    id={category.id}
                    max="100"
                    min="0"
                    placeholder="0"
                    step="0.5"
                    type="number"
                    value={discounts[category.name] ?? ''}
                    onChange={(e) => handleCategoryDiscount(category.name, e.target.value)}
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button disabled={loading} variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={loading || success} onClick={handleSave}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Discounts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
