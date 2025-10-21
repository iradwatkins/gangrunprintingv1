'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin } from 'lucide-react'

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface ShippingAddressFormProps {
  address: Partial<ShippingAddress>
  onChange: (address: Partial<ShippingAddress>) => void
  errors?: Record<string, string>
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

export function ShippingAddressForm({
  address,
  onChange,
  errors = {},
}: ShippingAddressFormProps) {
  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...address, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.firstName ? 'border-destructive' : ''}
              id="firstName"
              placeholder="John"
              value={address.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.lastName ? 'border-destructive' : ''}
              id="lastName"
              placeholder="Doe"
              value={address.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.email ? 'border-destructive' : ''}
              id="email"
              placeholder="john@example.com"
              type="email"
              value={address.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.phone ? 'border-destructive' : ''}
              id="phone"
              placeholder="(555) 123-4567"
              type="tel"
              value={address.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-2">
          <Label htmlFor="street">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            className={errors.street ? 'border-destructive' : ''}
            id="street"
            placeholder="123 Main Street"
            value={address.street || ''}
            onChange={(e) => handleChange('street', e.target.value)}
          />
          {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="street2">Apartment, Suite, etc. (Optional)</Label>
          <Input
            id="street2"
            placeholder="Apt 4B"
            value={address.street2 || ''}
            onChange={(e) => handleChange('street2', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.city ? 'border-destructive' : ''}
              id="city"
              placeholder="Chicago"
              value={address.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Select value={address.state || ''} onValueChange={(value) => handleChange('state', value)}>
              <SelectTrigger
                className={errors.state ? 'border-destructive' : ''}
                id="state"
              >
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">
              ZIP Code <span className="text-destructive">*</span>
            </Label>
            <Input
              className={errors.zipCode ? 'border-destructive' : ''}
              id="zipCode"
              maxLength={10}
              placeholder="60173"
              value={address.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
            {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
          </div>
        </div>

        <input type="hidden" value="US" />
      </CardContent>
    </Card>
  )
}
