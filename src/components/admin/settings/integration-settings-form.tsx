'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Webhook, Save } from 'lucide-react'

export function IntegrationSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Integration Settings
        </CardTitle>
        <CardDescription>
          Configure third-party integrations and API connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Google Analytics ID</Label>
          <Input defaultValue="GA-XXXXXXXXX" />
        </div>

        <div className="space-y-2">
          <Label>Mailchimp API Key</Label>
          <Input defaultValue="mc_api_..." type="password" />
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable API Access</Label>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <Label>Webhook Notifications</Label>
          <Switch />
        </div>

        <Button className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Integration Settings
        </Button>
      </CardContent>
    </Card>
  )
}