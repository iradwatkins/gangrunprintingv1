'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, AlertCircle, Smartphone, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

interface NotificationState {
  permission: NotificationPermission
  isSubscribed: boolean
  isPushSupported: boolean
  isServiceWorkerRegistered: boolean
}

const notificationTypes = [
  {
    id: 'order-updates',
    title: 'Order Updates',
    description: 'Get notified when your order status changes',
    icon: '📦',
    enabled: true,
  },
  {
    id: 'shipping-updates',
    title: 'Shipping Notifications',
    description: 'Track your package delivery status',
    icon: '🚚',
    enabled: true,
  },
  {
    id: 'promotional',
    title: 'Promotions & Deals',
    description: 'Special offers and discounts',
    icon: '🎯',
    enabled: false,
  },
  {
    id: 'design-ready',
    title: 'Design Approvals',
    description: 'When your custom designs are ready for review',
    icon: '🎨',
    enabled: true,
  },
]

export default function NotificationPreferences() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    isPushSupported: false,
    isServiceWorkerRegistered: false,
  })

  const [preferences, setPreferences] = useState(
    Object.fromEntries(notificationTypes.map((type) => [type.id, type.enabled]))
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkNotificationSupport()
    loadPreferences()
  }, [])

  const checkNotificationSupport = async () => {
    const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window
    const isServiceWorkerRegistered = !!navigator.serviceWorker?.controller

    setState((prev) => ({
      ...prev,
      permission: Notification.permission,
      isPushSupported,
      isServiceWorkerRegistered,
    }))

    if (isPushSupported && isServiceWorkerRegistered) {
      checkSubscriptionStatus()
    }
  }

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
      }))
    } catch (error) {}
  }

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences || preferences)
      }
    } catch (error) {}
  }

  const savePreferences = async (newPreferences: typeof preferences) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences }),
      })

      if (response.ok) {
        setSuccess('Preferences saved successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      setError('Failed to save preferences. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const enableNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Register service worker if not already registered
      let registration
      if (!state.isServiceWorkerRegistered) {
        registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
      } else {
        registration = await navigator.serviceWorker.ready
      }

      // Get VAPID public key
      const vapidResponse = await fetch('/api/notifications/vapid-public-key')
      const { publicKey } = await vapidResponse.json()

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      if (!subscribeResponse.ok) {
        throw new Error('Failed to register subscription')
      }

      setState((prev) => ({
        ...prev,
        permission: 'granted',
        isSubscribed: true,
        isServiceWorkerRegistered: true,
      }))

      setSuccess('Push notifications enabled successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setError(err.message || 'Failed to enable notifications')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const disableNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })

        // Unsubscribe locally
        await subscription.unsubscribe()
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
      }))

      setSuccess('Push notifications disabled')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Failed to disable notifications')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const testNotification = async () => {
    try {
      await fetch('/api/notifications/test', { method: 'POST' })
      setSuccess('Test notification sent!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Failed to send test notification')
      setTimeout(() => setError(null), 3000)
    }
  }

  const togglePreference = (typeId: string) => {
    const newPreferences = {
      ...preferences,
      [typeId]: !preferences[typeId],
    }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
  }

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const getStatusBadge = () => {
    if (!state.isPushSupported) {
      return <Badge variant="destructive">Not Supported</Badge>
    }

    if (state.permission === 'denied') {
      return <Badge variant="destructive">Blocked</Badge>
    }

    if (state.isSubscribed) {
      return (
        <Badge className="bg-green-500" variant="default">
          Enabled
        </Badge>
      )
    }

    return <Badge variant="secondary">Disabled</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Manage your notification preferences for order updates
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {!state.isPushSupported && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Push notifications are not supported in this browser. Try using Chrome, Firefox, or
                Safari.
              </AlertDescription>
            </Alert>
          )}

          {state.permission === 'denied' && (
            <Alert variant="destructive">
              <BellOff className="h-4 w-4" />
              <AlertDescription>
                Notifications are blocked. Please enable them in your browser settings and refresh
                the page.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Enable Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive order updates even when the website is closed
                </p>
              </div>
            </div>

            {state.isPushSupported && state.permission !== 'denied' && (
              <div className="flex items-center space-x-2">
                {state.isSubscribed && (
                  <Button
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    onClick={testNotification}
                  >
                    Test
                  </Button>
                )}
                <Button
                  disabled={isLoading}
                  variant={state.isSubscribed ? 'outline' : 'default'}
                  onClick={state.isSubscribed ? disableNotifications : enableNotifications}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      <span>Loading...</span>
                    </div>
                  ) : state.isSubscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Notification Types */}
          {state.isSubscribed && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-4 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Types
                </h4>
                <div className="space-y-3">
                  {notificationTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <div>
                          <p className="font-medium">{type.title}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[type.id]}
                        onCheckedChange={() => togglePreference(type.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Browser Compatibility Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Browser Support</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-blue-800">Chrome 50+</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-blue-800">Firefox 44+</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-blue-800">Safari 16+</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-blue-800">Edge 17+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
