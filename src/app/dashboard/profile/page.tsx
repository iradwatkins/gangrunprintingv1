import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Save, Edit } from 'lucide-react'
import Link from 'next/link'

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      marketingOptIn: true,
      smsOptIn: true,
    },
  })

  // Get user's order statistics
  const orderStats = await prisma.order.aggregate({
    where: {
      userId,
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _count: true,
    _sum: {
      total: true,
    },
  })

  return {
    user,
    orderStats,
  }
}

function getInitials(name: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function ProfilePage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const { user: userProfile, orderStats } = await getUserProfile(user.id)

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your personal information and account details
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your account information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage alt={userProfile?.name || 'User'} src={userProfile?.image || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold">{userProfile?.name || 'No name set'}</h2>
                    <Badge className="capitalize" variant="secondary">
                      {userProfile?.role.toLowerCase()}
                    </Badge>
                    {userProfile?.emailVerified && (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{userProfile?.email}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold">{orderStats._count || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold">
                        ${((orderStats._sum.total || 0) / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold">
                        {Math.floor(
                          (new Date().getTime() - new Date(userProfile?.createdAt || 0).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Days Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    defaultValue={userProfile?.name?.split(' ')[0] || ''}
                    id="firstName"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    defaultValue={userProfile?.name?.split(' ').slice(1).join(' ') || ''}
                    id="lastName"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  defaultValue={userProfile?.email || ''}
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {userProfile?.emailVerified ? (
                    <span className="text-green-600">✓ Email verified</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Email not verified</span>
                  )}
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  defaultValue={userProfile?.phoneNumber || ''}
                  id="phone"
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and membership information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userProfile?.createdAt || 0).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userProfile?.updatedAt || 0).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {userProfile?.role.toLowerCase()} Account
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Actions</CardTitle>
              <CardDescription>Manage your profile and account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/settings">
                  <Button className="w-full justify-start h-auto p-4" variant="outline">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit className="h-4 w-4" />
                        <span className="font-medium">Account Settings</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Update your preferences and security settings
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/account/addresses">
                  <Button className="w-full justify-start h-auto p-4" variant="outline">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Manage Addresses</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add or update your shipping and billing addresses
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/orders">
                  <Button className="w-full justify-start h-auto p-4" variant="outline">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Order History</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        View all your past orders and downloads
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/payments">
                  <Button className="w-full justify-start h-auto p-4" variant="outline">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">Payment Methods</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Manage your payment methods and billing
                      </p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
