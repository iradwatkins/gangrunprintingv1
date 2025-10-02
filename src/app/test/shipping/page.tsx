'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShippingRates } from '@/components/checkout/shipping-rates'
import toast from '@/lib/toast'

export default function ShippingTestPage() {
  const [address, setAddress] = useState({
    street: '456 Customer Ave',
    street2: '',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    country: 'US',
    isResidential: true,
  })

  const [items] = useState([
    {
      quantity: 5000,
      width: 4, // inches
      height: 6, // inches
      paperStockWeight: 0.0004, // 9pt C2S Cardstock (actual weight from database)
    },
  ])

  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRateSelected = (rate: Record<string, unknown>) => {
    setSelectedRate(rate)
    setDebugInfo(
      `API Response: ${rate.serviceName} - $${(rate.rateAmount as number).toFixed(2)} (${
        rate.estimatedDays
      } days) | Weight sent: 0.0004 lbs/sq in × 4 × 6 × 5000 = 48 lbs`
    )
    toast.success(`Selected: ${rate.serviceName} - $${(rate.rateAmount as number).toFixed(2)}`)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Shipping Integration Test</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>5,000 Postcards</strong> - 4" × 6" on 9pt C2S Cardstock
              </div>
              <div className="mt-4 rounded bg-muted p-3">
                <strong>Weight Calculation:</strong>
                <br />
                Paper Weight: 0.0004 lbs/sq inch (9pt C2S Cardstock)
                <br />
                Total: 0.0004 × 4 × 6 × 5000 = <strong>48 lbs</strong>
                <br />
                <span className="text-sm font-medium text-primary">
                  Split into 2 boxes: Box 1 = 36 lbs, Box 2 = 12 lbs (max 36 lbs per box)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    maxLength={2}
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ShippingRates items={items} toAddress={address} onRateSelected={handleRateSelected} />

        {debugInfo && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info (Real API Response)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            </CardContent>
          </Card>
        )}

        {selectedRate && (
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Selected Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Carrier:</strong> {selectedRate.carrier}
                </div>
                <div>
                  <strong>Service:</strong> {selectedRate.serviceName}
                </div>
                <div>
                  <strong>Cost:</strong> ${selectedRate.rateAmount.toFixed(2)}
                </div>
                <div>
                  <strong>Delivery Time:</strong> {selectedRate.estimatedDays} business days
                </div>
              </div>
              <Button className="mt-4" onClick={() => toast.success('Order would be placed!')}>
                Place Test Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
