'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'
import AccountWrapper from '@/components/account/account-wrapper'

export default function AddressesPage() {

  return (
    <AccountWrapper>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Addresses</h1>
        <p className="text-muted-foreground mb-8">Manage your shipping and billing addresses</p>

        <div className="grid gap-4 mb-4">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">No addresses saved</p>
              <p className="text-sm">Add addresses for faster checkout</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountWrapper>
  )
}