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
import { Check, X } from 'lucide-react'

interface Role {
  name: string
  count: number
  permissions: string[]
}

interface RolePermissionsTableProps {
  roles: Role[]
}

const ALL_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard', category: 'Dashboard' },
  { id: 'manage_orders', label: 'Manage Orders', category: 'Orders' },
  { id: 'view_customers', label: 'View Customers', category: 'Customers' },
  { id: 'manage_customers', label: 'Manage Customers', category: 'Customers' },
  { id: 'view_products', label: 'View Products', category: 'Products' },
  { id: 'manage_products', label: 'Manage Products', category: 'Products' },
  { id: 'manage_staff', label: 'Manage Staff', category: 'Staff' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
  { id: 'view_reports', label: 'View Reports', category: 'Reports' },
  { id: 'manage_settings', label: 'Manage Settings', category: 'Settings' },
  { id: 'manage_payments', label: 'Manage Payments', category: 'Financial' },
]

export function RolePermissionsTable({ roles }: RolePermissionsTableProps) {
  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes(permissionId)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permission</TableHead>
            <TableHead>Category</TableHead>
            {roles.map((role) => (
              <TableHead key={role.name} className="text-center">
                <div className="space-y-1">
                  <Badge variant={role.name === 'ADMIN' ? 'default' : 'secondary'}>
                    {role.name}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{role.count} members</p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ALL_PERMISSIONS.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell className="font-medium">{permission.label}</TableCell>
              <TableCell>
                <Badge className="text-xs" variant="outline">
                  {permission.category}
                </Badge>
              </TableCell>
              {roles.map((role) => (
                <TableCell key={`${role.name}-${permission.id}`} className="text-center">
                  {hasPermission(role, permission.id) ? (
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
