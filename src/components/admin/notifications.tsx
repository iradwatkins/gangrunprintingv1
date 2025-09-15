'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  Check,
  X,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  Settings
} from 'lucide-react'

interface Notification {
  id: string
  type: 'order' | 'payment' | 'customer' | 'inventory' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

const NOTIFICATION_ICONS = {
  order: ShoppingCart,
  payment: DollarSign,
  customer: Users,
  inventory: Package,
  system: AlertTriangle
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        priority: 'high',
        title: 'New Order Received',
        message: 'Order #ORD-001 from John Doe - Business Cards',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionUrl: '/admin/orders/ord-001',
        actionLabel: 'View Order'
      },
      {
        id: '2',
        type: 'payment',
        priority: 'medium',
        title: 'Payment Received',
        message: '$250.00 payment confirmed for Order #ORD-002',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        actionUrl: '/admin/orders/ord-002',
        actionLabel: 'View Payment'
      },
      {
        id: '3',
        type: 'inventory',
        priority: 'urgent',
        title: 'Low Stock Alert',
        message: 'Premium cardstock running low (5 units remaining)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        actionUrl: '/admin/inventory',
        actionLabel: 'Manage Inventory'
      },
      {
        id: '4',
        type: 'customer',
        priority: 'low',
        title: 'New Customer Registration',
        message: 'Sarah Johnson created a new account',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        actionUrl: '/admin/customers',
        actionLabel: 'View Customer'
      },
      {
        id: '5',
        type: 'system',
        priority: 'medium',
        title: 'System Backup Complete',
        message: 'Daily backup completed successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'order',
        priority: 'high',
        title: 'New Order Received',
        message: `Order #ORD-${Math.floor(Math.random() * 1000)} - Random Product`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/admin/orders',
        actionLabel: 'View Order'
      }

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep latest 10
      setUnreadCount(prev => prev + 1)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id)
      const deletedNotification = prev.find(n => n.id === id)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return filtered
    })
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Configure Alerts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type]

                return (
                  <div
                    key={notification.id}
                    className={`group relative p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {notification.actionUrl && notification.actionLabel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={() => {
                              // Navigate to action URL
                              window.location.href = notification.actionUrl!
                              markAsRead(notification.id)
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                // Navigate to notifications page
                window.location.href = '/admin/notifications'
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Notification Toast Component for individual notifications
export function NotificationToast({
  notification,
  onDismiss
}: {
  notification: Notification
  onDismiss: () => void
}) {
  const IconComponent = NOTIFICATION_ICONS[notification.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000) // Auto dismiss after 5 seconds

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-4 right-4 w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className={`p-1 rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
          <IconComponent className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-medium mb-1">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>

          {notification.actionUrl && notification.actionLabel && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                window.location.href = notification.actionUrl!
                onDismiss()
              }}
            >
              {notification.actionLabel}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}