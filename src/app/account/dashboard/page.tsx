'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Download, MapPin, CreditCard, User, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/account/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  const accountLinks = [
    {
      title: 'Orders',
      description: 'View and track your orders',
      href: '/account/orders',
      icon: Package,
    },
    {
      title: 'Downloads',
      description: 'Access your digital downloads',
      href: '/account/downloads',
      icon: Download,
    },
    {
      title: 'Addresses',
      description: 'Manage shipping and billing addresses',
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      title: 'Payment Methods',
      description: 'Manage your payment methods',
      href: '/account/payment-methods',
      icon: CreditCard,
    },
    {
      title: 'Account Details',
      description: 'Update your account information',
      href: '/account/details',
      icon: User,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {session.user?.name || session.user?.email}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {accountLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <link.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

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
      </div>
    </div>
  )
}