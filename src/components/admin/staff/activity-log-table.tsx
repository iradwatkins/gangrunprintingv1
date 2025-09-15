'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  User,
  ShoppingCart,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

interface ActivityLogItem {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: Date
  details: string
}

interface ActivityLogTableProps {
  activities: ActivityLogItem[]
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  LOGIN: {
    icon: LogIn,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    label: 'Login'
  },
  LOGOUT: {
    icon: LogOut,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    label: 'Logout'
  },
  ORDER_CREATE: {
    icon: Plus,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    label: 'Order Created'
  },
  ORDER_UPDATE: {
    icon: Edit,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    label: 'Order Updated'
  },
  ORDER_DELETE: {
    icon: Trash2,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    label: 'Order Deleted'
  },
  CUSTOMER_CREATE: {
    icon: User,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    label: 'Customer Created'
  },
  CUSTOMER_UPDATE: {
    icon: Edit,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    label: 'Customer Updated'
  },
  PRODUCT_CREATE: {
    icon: Plus,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    label: 'Product Created'
  },
  PRODUCT_UPDATE: {
    icon: Edit,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    label: 'Product Updated'
  },
  SETTINGS_UPDATE: {
    icon: Settings,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    label: 'Settings Updated'
  },
  REPORT_GENERATE: {
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    label: 'Report Generated'
  }
}

export function ActivityLogTable({ activities }: ActivityLogTableProps) {
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || {
      icon: Activity,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      label: action
    }
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No activity logged yet
        </p>
        <p className="text-xs text-muted-foreground">
          Staff actions will appear here as they happen
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const config = getActionConfig(activity.action)
            const ActionIcon = config.icon

            return (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge className={`${config.color} gap-1`}>
                    <ActionIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{activity.userName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {activity.details}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDateTime(activity.timestamp)}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}