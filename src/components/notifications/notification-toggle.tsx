'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface NotificationState {
  permission: NotificationPermission
  isSubscribed: boolean
  isPushSupported: boolean
}

export default function NotificationToggle() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    isPushSupported: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkNotificationSupport()
  }, [])

  const checkNotificationSupport = async () => {
    const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window

    setState((prev) => ({
      ...prev,
      permission: Notification.permission,
      isPushSupported,
    }))

    if (isPushSupported && navigator.serviceWorker?.controller) {
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
    } catch (error) {
      }
  }

  const toggleNotifications = async () => {
    if (!state.isPushSupported) return

    setIsLoading(true)

    try {
      if (state.isSubscribed) {
        // Disable notifications
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          })
          await subscription.unsubscribe()
        }

        setState((prev) => ({ ...prev, isSubscribed: false }))
      } else {
        // Enable notifications
        const permission = await Notification.requestPermission()

        if (permission !== 'granted') {
          return
        }

        const registration = await navigator.serviceWorker.ready

        // Get VAPID public key
        const vapidResponse = await fetch('/api/notifications/vapid-public-key')
        const { publicKey } = await vapidResponse.json()

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })

        setState((prev) => ({
          ...prev,
          permission: 'granted',
          isSubscribed: true,
        }))
      }
    } catch (error) {
      } finally {
      setIsLoading(false)
    }
  }

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
    if (!state.isPushSupported) return null

    if (state.permission === 'denied') {
      return (
        <Badge className="text-xs" variant="destructive">
          Blocked
        </Badge>
      )
    }

    if (state.isSubscribed) {
      return <Badge className="bg-green-500 text-xs">On</Badge>
    }

    return (
      <Badge className="text-xs" variant="secondary">
        Off
      </Badge>
    )
  }

  if (!state.isPushSupported) {
    return null
  }

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          {getStatusBadge()}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Get order updates via push notifications
        </p>

        {state.permission === 'denied' ? (
          <p className="text-xs text-red-600">Enable in browser settings</p>
        ) : (
          <Button
            className="w-full h-8 text-xs"
            disabled={isLoading}
            size="sm"
            variant={state.isSubscribed ? 'outline' : 'default'}
            onClick={toggleNotifications}
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                <span>Loading</span>
              </div>
            ) : state.isSubscribed ? (
              <>
                <BellOff className="h-3 w-3 mr-1" />
                Turn Off
              </>
            ) : (
              <>
                <Bell className="h-3 w-3 mr-1" />
                Turn On
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
