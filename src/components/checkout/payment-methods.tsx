'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, DollarSign, ChevronRight, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface PaymentMethodsProps {
  total: number
  isProcessing: boolean
  onPaymentMethodSelect: (method: string) => Promise<void>
}

export function PaymentMethods({
  total,
  isProcessing,
  onPaymentMethodSelect,
}: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('test_cash')

  const paymentMethods = [
    {
      id: 'test_cash',
      name: 'Test Cash Payment',
      description: '🧪 Testing only - simulates successful payment',
      icon: Banknote,
      popular: false,
      testOnly: true,
    },
    {
      id: 'square',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your credit or debit card',
      icon: CreditCard,
      popular: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: DollarSign,
      popular: false,
      comingSoon: false,
    },
    {
      id: 'cashapp',
      name: 'Cash App Pay',
      description: 'Pay instantly with Cash App',
      icon: Smartphone,
      popular: false,
      comingSoon: true,
    },
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handlePayment = async () => {
    await onPaymentMethodSelect(selectedMethod)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">Choose how you'd like to pay for your order</p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <div key={method.id} className="relative">
                <Label
                  className={`cursor-pointer block ${method.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                  htmlFor={method.id}
                >
                  <Card
                    className={`border transition-all ${
                      selectedMethod === method.id && !method.comingSoon
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    } ${method.comingSoon ? 'bg-muted/50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          className="mt-0.5"
                          disabled={method.comingSoon}
                          id={method.id}
                          value={method.id}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedMethod === method.id && !method.comingSoon
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{method.name}</p>
                              {method.popular && (
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                  Recommended
                                </span>
                              )}
                              {method.testOnly && (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                  Test Mode
                                </span>
                              )}
                              {method.comingSoon && (
                                <span className="bg-muted-foreground text-muted text-xs px-2 py-1 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                        {!method.comingSoon && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-semibold">${total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full"
          disabled={isProcessing || paymentMethods.find((m) => m.id === selectedMethod)?.comingSoon}
          size="lg"
          onClick={handlePayment}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              {selectedMethod === 'test_cash'
                ? '🧪 Complete Test Order'
                : selectedMethod === 'square'
                  ? 'Continue to Payment'
                  : selectedMethod === 'cashapp'
                    ? 'Pay with Cash App'
                    : 'Pay with PayPal'}
            </>
          )}
        </Button>

        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
