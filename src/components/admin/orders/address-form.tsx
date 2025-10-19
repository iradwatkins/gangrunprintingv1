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
            required
            id={`${title}-name`}
            placeholder="John Doe"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-company`}>Company (Optional)</Label>
          <Input
            id={`${title}-company`}
            placeholder="Company Name"
            value={data.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${title}-street`}>
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          required
          id={`${title}-street`}
          placeholder="123 Main St"
          value={data.street}
          onChange={(e) => handleChange('street', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`${title}-street2`}>Apt, Suite, etc. (Optional)</Label>
        <Input
          id={`${title}-street2`}
          placeholder="Apt 4B"
          value={data.street2 || ''}
          onChange={(e) => handleChange('street2', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${title}-city`}>
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            required
            id={`${title}-city`}
            placeholder="New York"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-state`}>
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            required
            id={`${title}-state`}
            maxLength={2}
            placeholder="NY"
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-zipCode`}>
            ZIP Code <span className="text-destructive">*</span>
          </Label>
          <Input
            required
            id={`${title}-zipCode`}
            placeholder="10001"
            value={data.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${title}-country`}>
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            required
            id={`${title}-country`}
            placeholder="United States"
            value={data.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-phone`}>Phone (Optional)</Label>
          <Input
            id={`${title}-phone`}
            placeholder="(555) 123-4567"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
