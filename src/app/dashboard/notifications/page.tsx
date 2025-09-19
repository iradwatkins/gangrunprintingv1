import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Bell,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

// Mock notification data (in a real app, this would come from a notifications table)
function getMockNotifications(userId: string) {
  return [
    {
      id: '1',
      type: 'order_shipped',
      title: 'Order Shipped',
      message: 'Your order #GR-12345 has been shipped and is on its way!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      icon: Package,
    },
    {
      id: '2',
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: 'Payment of $47.99 for order #GR-12344 has been processed successfully.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: CreditCard,
    },
    {
      id: '3',
      type: 'order_delivered',
      title: 'Order Delivered',
      message: 'Great news! Your order #GR-12343 has been delivered.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      icon: CheckCircle,
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Special Offer',
      message: '20% off your next business card order! Use code SAVE20.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      read: false,
      icon: AlertCircle,
    },
  ]
}

function getNotificationColor(type: string, read: boolean) {
  if (!read) {
    return 'bg-blue-50 border-blue-200'
  }
  return 'bg-gray-50 border-gray-200'
}

function formatTimestamp(timestamp: Date) {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return timestamp.toLocaleDateString()
  }
}

export default async function NotificationsPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  // Get user notification preferences
  const userSettings = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      marketingOptIn: true,
      smsOptIn: true,
    },
  })

  const notifications = getMockNotifications(user.id)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Stay updated with your orders and account activity
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800">{unreadCount} unread</Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive order updates and important account information
                  </div>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Get text messages for critical order updates
                  </div>
                </div>
                <Switch defaultChecked={userSettings?.smsOptIn} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Communications</Label>
                  <div className="text-sm text-muted-foreground">
                    Special offers, promotions, and product announcements
                  </div>
                </div>
                <Switch defaultChecked={userSettings?.marketingOptIn} />
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>Your latest updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const Icon = notification.icon
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${getNotificationColor(
                          notification.type,
                          notification.read
                        )}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full ${
                              notification.read ? 'bg-gray-200' : 'bg-blue-100'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                notification.read ? 'text-gray-600' : 'text-blue-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={`font-medium ${
                                  notification.read ? 'text-gray-800' : 'text-gray-900'
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                notification.read ? 'text-gray-600' : 'text-gray-700'
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline">
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground mb-4">
                    You're all caught up! We'll notify you when there's something new.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Actions</CardTitle>
              <CardDescription>Manage your notification history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline">Mark All as Read</Button>
                <Button variant="outline">Clear All</Button>
                <Link href="/dashboard/settings">
                  <Button variant="outline">Advanced Settings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
