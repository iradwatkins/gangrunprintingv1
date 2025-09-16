'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreditCard, Save } from 'lucide-react'

export function PaymentSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Configuration
        </CardTitle>
        <CardDescription>
          Configure payment methods and processing settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Stripe Public Key</Label>
          <Input defaultValue="pk_test_..." type="password" />
        </div>

        <div className="space-y-2">
          <Label>Payment Methods</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Credit Cards</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>PayPal</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bank Transfer</Label>
              <Switch />
            </div>
          </div>
        </div>

        <Button className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Payment Settings
        </Button>
      </CardContent>
    </Card>
  )
}