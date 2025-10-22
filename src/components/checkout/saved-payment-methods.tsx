'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Check, Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Address {
  id: string
  label: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
}

interface SavedPaymentMethod {
  id: string
  nickname: string
  maskedNumber: string
  cardBrand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  squareCardId: string
  BillingAddress?: Address | null
}

interface SavedPaymentMethodsProps {
  userId?: string
  onSelectPaymentMethod: (paymentMethod: SavedPaymentMethod) => void
  onNewPaymentMethod: () => void
  selectedPaymentMethodId?: string
}

export function SavedPaymentMethods({
  userId,
  onSelectPaymentMethod,
  onNewPaymentMethod,
  selectedPaymentMethodId,
}: SavedPaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedPaymentMethodId)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchPaymentMethods() {
      try {
        const response = await fetch('/api/user/payment-methods')
        if (response.ok) {
          const data = await response.json()
          setPaymentMethods(data.paymentMethods || [])

          // Auto-select default payment method if none selected
          if (!selectedId && data.paymentMethods.length > 0) {
            const defaultPM =
              data.paymentMethods.find((pm: SavedPaymentMethod) => pm.isDefault) || 
              data.paymentMethods[0]
            setSelectedId(defaultPM.id)
            onSelectPaymentMethod(defaultPM)
          }
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [userId])

  const handleSelectPaymentMethod = (paymentMethodId: string) => {
    const paymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId)
    if (paymentMethod) {
      setSelectedId(paymentMethodId)
      onSelectPaymentMethod(paymentMethod)
    }
  }

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toUpperCase()) {
      case 'VISA':
        return '💳'
      case 'MASTERCARD':
        return '💳'
      case 'AMERICAN_EXPRESS':
        return '💳'
      case 'DISCOVER':
        return '💳'
      default:
        return '💳'
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading saved payment methods...</div>
  }

  if (!userId || paymentMethods.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Saved Payment Methods</Label>
        <Button size="sm" type="button" variant="outline" onClick={onNewPaymentMethod}>
          <Plus className="h-4 w-4 mr-2" />
          New Payment Method
        </Button>
      </div>

      <RadioGroup value={selectedId} onValueChange={handleSelectPaymentMethod}>
        <div className="space-y-3">
          {paymentMethods.map((paymentMethod) => (
            <Card
              key={paymentMethod.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedId === paymentMethod.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectPaymentMethod(paymentMethod.id)}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem className="mt-1" id={paymentMethod.id} value={paymentMethod.id} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCardBrandIcon(paymentMethod.cardBrand)}</span>
                    <Label className="font-semibold cursor-pointer" htmlFor={paymentMethod.id}>
                      {paymentMethod.nickname}
                    </Label>
                    {paymentMethod.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    <p className="font-mono text-base">{paymentMethod.maskedNumber}</p>
                    <p>
                      Expires {paymentMethod.expiryMonth.toString().padStart(2, '0')}/
                      {paymentMethod.expiryYear.toString().slice(-2)}
                    </p>
                    <p className="capitalize">
                      {paymentMethod.cardBrand.replace('_', ' ').toLowerCase()}
                    </p>
                    {paymentMethod.BillingAddress && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">
                          {paymentMethod.BillingAddress.label} - {paymentMethod.BillingAddress.street}, {paymentMethod.BillingAddress.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedId === paymentMethod.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}