'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { UserPlus, Loader2 } from 'lucide-react'

interface Permission {
  id: string
  label: string
  description: string
  category: string
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: 'view_dashboard',
    label: 'View Dashboard',
    description: 'Access to main dashboard',
    category: 'Dashboard',
  },

  // Orders
  {
    id: 'view_orders',
    label: 'View Orders',
    description: 'View order list and details',
    category: 'Orders',
  },
  {
    id: 'manage_orders',
    label: 'Manage Orders',
    description: 'Create, edit, and update orders',
    category: 'Orders',
  },
  {
    id: 'delete_orders',
    label: 'Delete Orders',
    description: 'Delete orders from system',
    category: 'Orders',
  },

  // Customers
  {
    id: 'view_customers',
    label: 'View Customers',
    description: 'View customer list and profiles',
    category: 'Customers',
  },
  {
    id: 'manage_customers',
    label: 'Manage Customers',
    description: 'Create, edit customer accounts',
    category: 'Customers',
  },
  {
    id: 'delete_customers',
    label: 'Delete Customers',
    description: 'Delete customer accounts',
    category: 'Customers',
  },

  // Products
  {
    id: 'view_products',
    label: 'View Products',
    description: 'View product catalog',
    category: 'Products',
  },
  {
    id: 'manage_products',
    label: 'Manage Products',
    description: 'Create, edit products and pricing',
    category: 'Products',
  },
  {
    id: 'delete_products',
    label: 'Delete Products',
    description: 'Remove products from catalog',
    category: 'Products',
  },

  // Staff
  {
    id: 'view_staff',
    label: 'View Staff',
    description: 'View staff members list',
    category: 'Staff',
  },
  {
    id: 'manage_staff',
    label: 'Manage Staff',
    description: 'Create, edit staff accounts',
    category: 'Staff',
  },
  {
    id: 'delete_staff',
    label: 'Delete Staff',
    description: 'Remove staff members',
    category: 'Staff',
  },

  // Analytics & Reports
  {
    id: 'view_analytics',
    label: 'View Analytics',
    description: 'Access business analytics',
    category: 'Reports',
  },
  {
    id: 'view_reports',
    label: 'View Reports',
    description: 'Generate and view reports',
    category: 'Reports',
  },
  {
    id: 'export_data',
    label: 'Export Data',
    description: 'Export system data',
    category: 'Reports',
  },

  // Settings
  {
    id: 'view_settings',
    label: 'View Settings',
    description: 'View system settings',
    category: 'Settings',
  },
  {
    id: 'manage_settings',
    label: 'Manage Settings',
    description: 'Modify system configuration',
    category: 'Settings',
  },

  // Financial
  {
    id: 'view_payments',
    label: 'View Payments',
    description: 'View payment information',
    category: 'Financial',
  },
  {
    id: 'manage_payments',
    label: 'Manage Payments',
    description: 'Process refunds and payments',
    category: 'Financial',
  },
]

const ROLE_TEMPLATES: Record<string, string[]> = {
  ADMIN: [
    'view_dashboard',
    'manage_orders',
    'delete_orders',
    'manage_customers',
    'delete_customers',
    'manage_products',
    'delete_products',
    'manage_staff',
    'delete_staff',
    'view_analytics',
    'view_reports',
    'export_data',
    'manage_settings',
    'manage_payments',
  ],
  STAFF: [
    'view_dashboard',
    'view_orders',
    'manage_orders',
    'view_customers',
    'manage_customers',
    'view_products',
    'view_reports',
  ],
}

export function AddStaffDialog() : unknown {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[],
    sendInvitation: true,
  })

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: ROLE_TEMPLATES[role] || [],
    }))
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((id) => id !== permissionId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement staff creation API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock delay

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        role: '',
        permissions: [],
        sendInvitation: true,
      })
      setOpen(false)
    } catch (error) {
      } finally {
      setLoading(false)
    }
  }

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce(
    (groups, permission) => {
      if (!groups[permission.category]) {
        groups[permission.category] = []
      }
      groups[permission.category].push(permission)
      return groups
    },
    {} as Record<string, Permission[]>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Create a new staff account with custom permissions</DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  required
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  required
                  id="email"
                  placeholder="Enter email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select required value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="STAFF">Staff Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions */}
          {formData.role && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Permissions</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.permissions.length} selected
                </p>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto border rounded-md p-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="font-medium text-sm text-muted-foreground">{category}</h5>
                    <div className="space-y-2 pl-4">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            id={permission.id}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              htmlFor={permission.id}
                            >
                              {permission.label}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Options</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.sendInvitation}
                id="sendInvitation"
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendInvitation: checked as boolean }))
                }
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="sendInvitation"
              >
                Send invitation email
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
