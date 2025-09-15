'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Truck, Save } from 'lucide-react'

export function ShippingSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Configuration
        </CardTitle>
        <CardDescription>
          Configure shipping methods and delivery options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Standard Shipping Cost</Label>
          <Input defaultValue="$9.99" />
        </div>

        <div className="space-y-2">
          <Label>Express Shipping Cost</Label>
          <Input defaultValue="$19.99" />
        </div>

        <div className="space-y-2">
          <Label>Free Shipping Threshold</Label>
          <Input defaultValue="$50.00" />
        </div>

        <div className="flex items-center justify-between">
          <Label>Local Pickup Available</Label>
          <Switch defaultChecked />
        </div>

        <Button className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Shipping Settings
        </Button>
      </CardContent>
    </Card>
  )
}