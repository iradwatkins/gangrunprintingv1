'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Webhook, Save, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from '@/lib/toast'

export function IntegrationSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showResendKey, setShowResendKey] = useState(false)
  const [settings, setSettings] = useState({
    googleAnalyticsId: '',
    resendApiKey: '',
    enableApiAccess: true,
    webhookNotifications: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings?category=integrations')
      if (response.ok) {
        const data = await response.json()
        const settingsMap: any = {}
        data.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value
        })
        setSettings({
          googleAnalyticsId: settingsMap.google_analytics_id || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
          resendApiKey: settingsMap.resend_api_key || process.env.RESEND_API_KEY || '',
          enableApiAccess: settingsMap.enable_api_access === 'true',
          webhookNotifications: settingsMap.webhook_notifications === 'true',
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            {
              key: 'google_analytics_id',
              value: settings.googleAnalyticsId,
              category: 'integrations',
              description: 'Google Analytics Measurement ID',
              isEncrypted: false,
            },
            {
              key: 'resend_api_key',
              value: settings.resendApiKey,
              category: 'integrations',
              description: 'Resend Email API Key',
              isEncrypted: true,
            },
            {
              key: 'enable_api_access',
              value: String(settings.enableApiAccess),
              category: 'integrations',
              description: 'Enable public API access',
              isEncrypted: false,
            },
            {
              key: 'webhook_notifications',
              value: String(settings.webhookNotifications),
              category: 'integrations',
              description: 'Enable webhook notifications',
              isEncrypted: false,
            },
          ],
        }),
      })

      if (response.ok) {
        toast.success('Integration settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Integration Settings
        </CardTitle>
        <CardDescription>Configure third-party integrations and API connections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Google Analytics ID</Label>
          <Input
            placeholder="G-XXXXXXXXXX"
            value={settings.googleAnalyticsId}
            onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Your Google Analytics 4 Measurement ID (starts with G-)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Resend API Key</Label>
          <div className="flex gap-2">
            <Input
              placeholder="re_xxxxxxxxxxxxx"
              type={showResendKey ? 'text' : 'password'}
              value={settings.resendApiKey}
              onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowResendKey(!showResendKey)}
            >
              {showResendKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your Resend API key for transactional emails
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Enable API Access</Label>
            <p className="text-xs text-muted-foreground">Allow external API access to your data</p>
          </div>
          <Switch
            checked={settings.enableApiAccess}
            onCheckedChange={(checked) => setSettings({ ...settings, enableApiAccess: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Webhook Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Send webhook notifications for order events
            </p>
          </div>
          <Switch
            checked={settings.webhookNotifications}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, webhookNotifications: checked })
            }
          />
        </div>

        <Button className="mt-4" disabled={saving} onClick={saveSettings}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Integration Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
