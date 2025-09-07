'use client'

import { useEffect, useState, useCallback } from 'react'

interface OrderUpdate {
  type: 'connected' | 'update' | 'error'
  order?: {
    id: string
    status: string
    trackingNumber?: string
    carrier?: string
    updatedAt: string
  }
  latestStatusChange?: any
  pendingNotifications?: number
  currentStatus?: string
  orderId?: string
}

export function useOrderUpdates(orderId: string | null) {
  const [updates, setUpdates] = useState<OrderUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestUpdate, setLatestUpdate] = useState<OrderUpdate | null>(null)

  const connect = useCallback(() => {
    if (!orderId) return

    const eventSource = new EventSource(`/api/sse/orders/${orderId}`)

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log('SSE connection established for order:', orderId)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: OrderUpdate = JSON.parse(event.data)
        
        if (data.type === 'connected') {
          console.log('Connected to order updates:', data)
        } else if (data.type === 'update') {
          setLatestUpdate(data)
          setUpdates(prev => [...prev, data])
          
          // Show notification for status changes
          if (data.order?.status && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Order Update', {
              body: `Your order status has changed to: ${data.order.status}`,
              icon: '/icon-192x192.png'
            })
          }
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setError('Connection lost. Retrying...')
      setIsConnected(false)
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        eventSource.close()
        connect()
      }, 5000)
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [orderId])

  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
    setLatestUpdate(null)
  }, [])

  return {
    updates,
    latestUpdate,
    isConnected,
    error,
    clearUpdates
  }
}