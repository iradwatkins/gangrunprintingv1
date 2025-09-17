import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, User, Bell, Shield, CreditCard } from 'lucide-react'
import Link from 'next/link'

async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      marketingOptIn: true,
      smsOptIn: true,
      phoneNumber: true,
      createdAt: true,
      role: true
    }
  })

  return user
}

export default async function SettingsPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const userSettings = await getUserSettings(user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={userSettings?.name || ''}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userSettings?.email || ''}
                    placeholder="Enter your email"
                  />
                  {userSettings?.emailVerified && (
                    <p className="text-sm text-green-600 mt-1">✓ Email verified</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={userSettings?.phoneNumber || ''}
                  placeholder="Enter your phone number"
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates about your orders and account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive order updates and marketing emails
                  </div>
                </div>
                <Switch defaultChecked={userSettings?.marketingOptIn} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Get text messages for important order updates
                  </div>
                </div>
                <Switch defaultChecked={userSettings?.smsOptIn} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Order Status Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Notifications when your order status changes
                  </div>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Communications</Label>
                  <div className="text-sm text-muted-foreground">
                    Special offers, new products, and company news
                  </div>
                </div>
                <Switch defaultChecked={userSettings?.marketingOptIn} />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Account Active</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(userSettings?.createdAt || new Date()).toLocaleDateString()}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Account Type</Label>
                <p className="text-sm font-medium capitalize">
                  {userSettings?.role.toLowerCase()} Account
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Password</Label>
                <Button variant="outline">Change Password</Button>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Billing
              </CardTitle>
              <CardDescription>
                Manage your payment methods and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No payment methods saved
                  </p>
                  <Button variant="outline" className="mt-2">
                    Add Payment Method
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Billing Address</Label>
                <Button variant="outline">Manage Addresses</Button>
                <p className="text-sm text-muted-foreground">
                  Set your default billing and shipping addresses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}