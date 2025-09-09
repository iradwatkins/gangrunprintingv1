'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import Link from 'next/link'
import AccountWrapper from '@/components/account/account-wrapper'

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <AccountWrapper>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest print orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No recent orders</p>
              <Link href="/products">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Account Active</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Get assistance with your orders or account
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountWrapper>
  )
}