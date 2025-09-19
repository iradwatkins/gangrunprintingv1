'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from '@/lib/toast'

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission)

      // Check if user is already subscribed
      checkSubscription()

      // Show prompt after user has been on site for 1 minute
      const timer = setTimeout(() => {
        if (Notification.permission === 'default') {
          setShowPrompt(true)
        }
      }, 60000)

      return () => clearTimeout(timer)
    }
  }, [])

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }
  }

  const requestPermission = async () => {
    setLoading(true)

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await subscribeUser()
        toast.success("Notifications enabled! You'll receive updates about your orders.")
      } else if (result === 'denied') {
        toast.error('Notifications blocked. You can enable them in your browser settings.')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setLoading(false)
      setShowPrompt(false)
    }
  }

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Get the server's public VAPID key
      const response = await fetch('/api/notifications/vapid-public-key')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const { publicKey } = await response.json()

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      setIsSubscribed(true)
    } catch (error) {
      console.error('Failed to subscribe:', error)
      throw error
    }
  }

  const unsubscribeUser = async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        toast.success('Notifications disabled')
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Notification prompt card
  if (showPrompt && permission === 'default') {
    return (
      <Card className="fixed bottom-20 right-4 z-40 w-96 shadow-lg animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Stay Updated
            </CardTitle>
            <Button
              className="h-8 w-8"
              size="icon"
              variant="ghost"
              onClick={() => setShowPrompt(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Get real-time notifications about your print orders</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Order confirmation & tracking updates</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Production status changes</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Delivery notifications</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Special offers & discounts</span>
            </li>
          </ul>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={loading} onClick={requestPermission}>
              Enable Notifications
            </Button>
            <Button variant="outline" onClick={() => setShowPrompt(false)}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Settings component (for account page)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Manage your notification preferences for order updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? "You'll receive updates about your orders"
                  : 'Enable to receive order updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permission === 'denied' && <Badge variant="destructive">Blocked</Badge>}
            <Button
              disabled={loading || permission === 'denied'}
              size="sm"
              variant={isSubscribed ? 'outline' : 'default'}
              onClick={isSubscribed ? unsubscribeUser : requestPermission}
            >
              {loading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        {permission === 'denied' && (
          <p className="text-sm text-destructive mt-4">
            Notifications are blocked in your browser. Please enable them in your browser settings
            to receive order updates.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Standalone notification trigger for testing
export function TestNotificationButton() {
  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported')
      return
    }

    if (Notification.permission !== 'granted') {
      toast.error('Please enable notifications first')
      return
    }

    // Send test notification via API
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Test notification sent!')
      } else {
        toast.error('Failed to send test notification')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={sendTestNotification}>
      Send Test Notification
    </Button>
  )
}
