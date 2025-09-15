'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AccountWrapper from '@/components/account/account-wrapper'

export default function AccountDetailsPage() {
  // TODO: Replace with Lucia auth when implemented
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    // TODO: Fetch user data from Lucia auth
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      phone: '',
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Update user profile with Lucia auth
    console.log('Updating profile:', formData)
  }

  return (
    <AccountWrapper>
      <div className="w-full max-w-2xl mx-auto lg:mx-0">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Account Details</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 text-base"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="sm:w-auto w-full h-11 text-base">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" className="sm:w-auto w-full h-11 text-base">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AccountWrapper>
  )
}