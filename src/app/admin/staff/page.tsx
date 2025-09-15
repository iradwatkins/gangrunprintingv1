import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'
import { StaffTable } from '@/components/admin/staff/staff-table'
import { RolePermissionsTable } from '@/components/admin/staff/role-permissions-table'
import { ActivityLogTable } from '@/components/admin/staff/activity-log-table'
import { AddStaffDialog } from '@/components/admin/staff/add-staff-dialog'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface StaffMember {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: Date | null
  createdAt: Date
  lastLoginAt: Date | null
  isActive: boolean
  permissions: string[]
}

interface StaffData {
  staff: StaffMember[]
  roles: Array<{
    name: string
    count: number
    permissions: string[]
  }>
  stats: {
    total: number
    active: number
    pending: number
    admins: number
  }
  recentActivity: Array<{
    id: string
    userId: string
    userName: string
    action: string
    timestamp: Date
    details: string
  }>
}

async function getStaffData(): Promise<StaffData> {
  // Get all staff members (ADMIN and STAFF roles)
  const staffMembers = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'STAFF']
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform staff data
  const staff: StaffMember[] = staffMembers.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    emailVerified: member.emailVerified,
    createdAt: member.createdAt,
    lastLoginAt: member.updatedAt, // Using updatedAt as proxy for lastLoginAt
    isActive: !!member.emailVerified,
    permissions: getPermissionsForRole(member.role)
  }))

  // Calculate role statistics
  const roles = [
    {
      name: 'ADMIN',
      count: staff.filter(s => s.role === 'ADMIN').length,
      permissions: getPermissionsForRole('ADMIN')
    },
    {
      name: 'STAFF',
      count: staff.filter(s => s.role === 'STAFF').length,
      permissions: getPermissionsForRole('STAFF')
    }
  ]

  // Calculate stats
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.isActive).length,
    pending: staff.filter(s => !s.isActive).length,
    admins: staff.filter(s => s.role === 'ADMIN').length
  }

  // Mock recent activity data
  const recentActivity = [
    {
      id: '1',
      userId: staff[0]?.id || '',
      userName: staff[0]?.name || 'Admin User',
      action: 'LOGIN',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      details: 'Logged in to admin dashboard'
    },
    {
      id: '2',
      userId: staff[0]?.id || '',
      userName: staff[0]?.name || 'Admin User',
      action: 'ORDER_UPDATE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      details: 'Updated order #ORD-001 status to PROCESSING'
    },
    {
      id: '3',
      userId: staff[0]?.id || '',
      userName: staff[0]?.name || 'Admin User',
      action: 'CUSTOMER_CREATE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      details: 'Created new customer account'
    }
  ]

  return {
    staff,
    roles,
    stats,
    recentActivity
  }
}

function getPermissionsForRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    ADMIN: [
      'view_dashboard',
      'manage_orders',
      'manage_customers',
      'manage_products',
      'manage_staff',
      'view_analytics',
      'manage_settings',
      'view_reports',
      'manage_payments',
      'manage_inventory'
    ],
    STAFF: [
      'view_dashboard',
      'manage_orders',
      'view_customers',
      'view_products',
      'view_reports'
    ],
    CUSTOMER: [],
    BROKER: []
  }

  return permissions[role] || []
}

export default async function StaffPage() {
  const data = await getStaffData()

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Role Settings
          </Button>
          <AddStaffDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.admins} administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Verified accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Full access members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Staff Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Staff Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Manage team members and their access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffTable staff={data.staff} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Role Overview</CardTitle>
                <CardDescription>
                  Current role distribution and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.roles.map((role) => (
                  <div key={role.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={role.name === 'ADMIN' ? 'default' : 'secondary'}>
                          {role.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {role.count} members
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Permissions
                      </Button>
                    </div>
                    <div className="pl-4 space-y-1">
                      <p className="text-sm font-medium">Permissions ({role.permissions.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of role permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RolePermissionsTable roles={data.roles} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Staff member actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLogTable activities={data.recentActivity} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}