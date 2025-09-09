'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'
import AccountWrapper from '@/components/account/account-wrapper'

export default function PaymentMethodsPage() {

  return (
    <AccountWrapper>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
        <p className="text-muted-foreground mb-8">Manage your saved payment methods</p>

        <div className="grid gap-4 mb-4">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">No payment methods saved</p>
              <p className="text-sm">Add payment methods for faster checkout</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountWrapper>
  )
}