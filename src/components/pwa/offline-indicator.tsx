'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)

      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2">
          <Alert className="rounded-none border-0 bg-orange-500 text-white">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="font-medium">
              You're offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showReconnected && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2">
          <Alert className="rounded-none border-0 bg-green-500 text-white">
            <Wifi className="h-4 w-4" />
            <AlertDescription className="font-medium">You're back online!</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}
