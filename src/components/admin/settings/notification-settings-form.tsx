'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, MessageSquare, Zap, Save, Loader2, TestTube } from 'lucide-react'

export function NotificationSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Email notifications
    emailEnabled: true,
    emailNewOrders: true,
    emailOrderUpdates: true,
    emailPaymentReceived: true,
    emailLowStock: true,
    emailCustomerMessages: true,

    // Push notifications
    pushEnabled: false,
    pushNewOrders: true,
    pushOrderUpdates: false,
    pushPaymentReceived: true,
    pushLowStock: true,

    // SMS notifications
    smsEnabled: false,
    smsNumber: '',
    smsNewOrders: false,
    smsUrgentOnly: true,

    // Webhook notifications
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    webhookOrderEvents: true,
    webhookPaymentEvents: true,

    // Notification timing
    digestFrequency: 'daily',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement notification settings update API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      console.log('Notification settings updated:', formData)
    } catch (error) {
      console.error('Failed to update notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async (type: string) => {
    try {
      // TODO: Implement test notification API
      console.log('Testing notification:', type)
    } catch (error) {
      console.error('Failed to send test notification:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure email notifications for order and system events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all email notifications
              </p>
            </div>
            <Switch
              checked={formData.emailEnabled}
              onCheckedChange={(checked) => handleInputChange('emailEnabled', checked)}
            />
          </div>

          {formData.emailEnabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Email Types</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>New Orders</Label>
                    <Switch
                      checked={formData.emailNewOrders}
                      onCheckedChange={(checked) => handleInputChange('emailNewOrders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Order Status Updates</Label>
                    <Switch
                      checked={formData.emailOrderUpdates}
                      onCheckedChange={(checked) => handleInputChange('emailOrderUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Payment Received</Label>
                    <Switch
                      checked={formData.emailPaymentReceived}
                      onCheckedChange={(checked) => handleInputChange('emailPaymentReceived', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Low Stock Alerts</Label>
                    <Switch
                      checked={formData.emailLowStock}
                      onCheckedChange={(checked) => handleInputChange('emailLowStock', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Customer Messages</Label>
                    <Switch
                      checked={formData.emailCustomerMessages}
                      onCheckedChange={(checked) => handleInputChange('emailCustomerMessages', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestNotification('email')}
              >
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Browser push notifications for real-time alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser notifications for important events
              </p>
            </div>
            <Switch
              checked={formData.pushEnabled}
              onCheckedChange={(checked) => handleInputChange('pushEnabled', checked)}
            />
          </div>

          {formData.pushEnabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Push Notification Types</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>New Orders</Label>
                    <Switch
                      checked={formData.pushNewOrders}
                      onCheckedChange={(checked) => handleInputChange('pushNewOrders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Order Updates</Label>
                    <Switch
                      checked={formData.pushOrderUpdates}
                      onCheckedChange={(checked) => handleInputChange('pushOrderUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Payment Received</Label>
                    <Switch
                      checked={formData.pushPaymentReceived}
                      onCheckedChange={(checked) => handleInputChange('pushPaymentReceived', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Low Stock Alerts</Label>
                    <Switch
                      checked={formData.pushLowStock}
                      onCheckedChange={(checked) => handleInputChange('pushLowStock', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestNotification('push')}
              >
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Push
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Text message alerts for critical events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive text messages for urgent alerts
              </p>
            </div>
            <Switch
              checked={formData.smsEnabled}
              onCheckedChange={(checked) => handleInputChange('smsEnabled', checked)}
            />
          </div>

          {formData.smsEnabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="smsNumber">Phone Number</Label>
                  <Input
                    id="smsNumber"
                    type="tel"
                    value={formData.smsNumber}
                    onChange={(e) => handleInputChange('smsNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>New Orders</Label>
                  <Switch
                    checked={formData.smsNewOrders}
                    onCheckedChange={(checked) => handleInputChange('smsNewOrders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Urgent Events Only</Label>
                  <Switch
                    checked={formData.smsUrgentOnly}
                    onCheckedChange={(checked) => handleInputChange('smsUrgentOnly', checked)}
                  />
                </div>
              </div>

              <Separator />

              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestNotification('sms')}
              >
                <TestTube className="mr-2 h-4 w-4" />
                Send Test SMS
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Webhook Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Webhook Notifications
          </CardTitle>
          <CardDescription>
            Send HTTP notifications to external systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Send HTTP POST requests for system events
              </p>
            </div>
            <Switch
              checked={formData.webhookEnabled}
              onCheckedChange={(checked) => handleInputChange('webhookEnabled', checked)}
            />
          </div>

          {formData.webhookEnabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Secret Key (Optional)</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={formData.webhookSecret}
                    onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                    placeholder="Secret for webhook verification"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Order Events</Label>
                  <Switch
                    checked={formData.webhookOrderEvents}
                    onCheckedChange={(checked) => handleInputChange('webhookOrderEvents', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Payment Events</Label>
                  <Switch
                    checked={formData.webhookPaymentEvents}
                    onCheckedChange={(checked) => handleInputChange('webhookPaymentEvents', checked)}
                  />
                </div>
              </div>

              <Separator />

              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestNotification('webhook')}
              >
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Webhook
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Notification Settings
        </Button>
      </div>
    </form>
  )
}