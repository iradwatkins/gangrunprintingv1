'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import AccountWrapper from '@/components/account/account-wrapper'

export default function AccountDetailsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredLanguage: 'en',
  })

  useEffect(() => {
    // Fetch user data from API
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/me')
        const data = await response.json()

        if (data.user) {
          const nameParts = data.user.name?.split(' ') || ['', '']
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: data.user.email || '',
            phone: data.user.phoneNumber || '',
            preferredLanguage: data.user.preferredLanguage || 'en',
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Update user preferences (language)
      const prefResponse = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage: formData.preferredLanguage,
        }),
      })

      if (!prefResponse.ok) {
        throw new Error('Failed to update preferences')
      }

      toast({
        title: 'Success',
        description: 'Your preferences have been updated',
      })

      // Reload the page to apply language preference
      window.location.reload()
    } catch (error) {
      console.error('Failed to update user data:', error)
      toast({
        title: 'Error',
        description: 'Failed to update your information',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    className="h-11 text-base"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    className="h-11 text-base"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  className="h-11 text-base"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  className="h-11 text-base"
                  id="phone"
                  placeholder="(555) 123-4567"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Preferred Language</Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredLanguage: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This will be the default language for your account
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="sm:w-auto w-full h-11 text-base"
                  type="submit"
                  disabled={isLoading || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  className="sm:w-auto w-full h-11 text-base"
                  type="button"
                  variant="outline"
                  disabled={isLoading || isSaving}
                >
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
