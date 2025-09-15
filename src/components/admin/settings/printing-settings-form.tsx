'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Printer, Save } from 'lucide-react'

export function PrintingSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Printing Configuration
        </CardTitle>
        <CardDescription>
          Configure printing equipment and production settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Default Print Quality</Label>
          <Input defaultValue="300 DPI" />
        </div>

        <div className="space-y-2">
          <Label>Production Capacity</Label>
          <Input defaultValue="500 orders/day" />
        </div>

        <div className="flex items-center justify-between">
          <Label>Auto-assign print jobs</Label>
          <Switch defaultChecked />
        </div>

        <Button className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Printing Settings
        </Button>
      </CardContent>
    </Card>
  )
}