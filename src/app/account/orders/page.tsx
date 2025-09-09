'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import Link from 'next/link'
import AccountWrapper from '@/components/account/account-wrapper'

export default function OrdersPage() {

  return (
    <AccountWrapper>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground mb-8">View and track all your orders</p>

        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">You haven't placed any orders yet</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountWrapper>
  )
}