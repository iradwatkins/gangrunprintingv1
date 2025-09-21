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
      quantity: 1000,
      width: 8.5, // inches
      height: 11, // inches
      paperStockWeight: 0.002, // 100lb text paper
    },
    {
      quantity: 500,
      width: 5,
      height: 7,
      paperStockWeight: 0.003, // 14pt card stock
    },
  ])

  const [selectedRate, setSelectedRate] = useState<any>(null)

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRateSelected = (rate: any) => {
    setSelectedRate(rate)
    toast.success(`Selected: ${rate.serviceName} - $${rate.rateAmount.toFixed(2)}`)
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
                1. <strong>1000 Flyers</strong> - 8.5" × 11" on 100lb text (0.002 lbs/sq inch)
              </div>
              <div>
                2. <strong>500 Business Cards</strong> - 5" × 7" on 14pt card stock (0.003 lbs/sq
                inch)
              </div>
              <div className="mt-4 rounded bg-muted p-3">
                <strong>Weight Calculation:</strong>
                <br />
                Flyers: 0.002 × 8.5 × 11 × 1000 = 187 lbs
                <br />
                Cards: 0.003 × 5 × 7 × 500 = 52.5 lbs
                <br />
                <strong>Total: 239.5 lbs</strong>
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
