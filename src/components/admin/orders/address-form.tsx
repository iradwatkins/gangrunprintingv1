'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface AddressFormData {
  name: string
  company?: string
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

interface AddressFormProps {
  data: AddressFormData
  onChange: (data: AddressFormData) => void
  title?: string
}

export function AddressForm({ data, onChange, title }: AddressFormProps) {
  const handleChange = (field: keyof AddressFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-lg">{title}</h3>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${title}-name`}>
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${title}-name`}
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${title}-company`}>Company (Optional)</Label>
          <Input
            id={`${title}-company`}
            value={data.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Company Name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${title}-street`}>
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${title}-street`}
          value={data.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="123 Main St"
          required
        />
      </div>

      <div>
        <Label htmlFor={`${title}-street2`}>Apt, Suite, etc. (Optional)</Label>
        <Input
          id={`${title}-street2`}
          value={data.street2 || ''}
          onChange={(e) => handleChange('street2', e.target.value)}
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${title}-city`}>
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${title}-city`}
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${title}-state`}>
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${title}-state`}
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="NY"
            required
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-zipCode`}>
            ZIP Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${title}-zipCode`}
            value={data.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="10001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${title}-country`}>
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${title}-country`}
            value={data.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="United States"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${title}-phone`}>Phone (Optional)</Label>
          <Input
            id={`${title}-phone`}
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  )
}
