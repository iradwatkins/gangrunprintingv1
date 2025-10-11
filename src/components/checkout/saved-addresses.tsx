'use client'

import { useEffect, useState } from 'react'
import { MapPin, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Address {
  id: string
  label: string
  name: string
  company?: string | null
  street: string
  street2?: string | null
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

interface SavedAddressesProps {
  userId?: string
  onSelectAddress: (address: Address) => void
  onNewAddress: () => void
  selectedAddressId?: string
}

export function SavedAddresses({
  userId,
  onSelectAddress,
  onNewAddress,
  selectedAddressId,
}: SavedAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedAddressId)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchAddresses() {
      try {
        const response = await fetch('/api/user/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data.addresses || [])

          // Auto-select default address if none selected
          if (!selectedId && data.addresses.length > 0) {
            const defaultAddr =
              data.addresses.find((a: Address) => a.isDefault) || data.addresses[0]
            setSelectedId(defaultAddr.id)
            onSelectAddress(defaultAddr)
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [userId])

  const handleSelectAddress = (addressId: string) => {
    const address = addresses.find((a) => a.id === addressId)
    if (address) {
      setSelectedId(addressId)
      onSelectAddress(address)
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading saved addresses...</div>
  }

  if (!userId || addresses.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Saved Addresses</Label>
        <Button size="sm" type="button" variant="outline" onClick={onNewAddress}>
          <Plus className="h-4 w-4 mr-2" />
          New Address
        </Button>
      </div>

      <RadioGroup value={selectedId} onValueChange={handleSelectAddress}>
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedId === address.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectAddress(address.id)}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem className="mt-1" id={address.id} value={address.id} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-semibold cursor-pointer" htmlFor={address.id}>
                      {address.label}
                    </Label>
                    {address.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    <p className="font-medium text-foreground">{address.name}</p>
                    {address.company && <p>{address.company}</p>}
                    <p>{address.street}</p>
                    {address.street2 && <p>{address.street2}</p>}
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && <p className="mt-1">Phone: {address.phone}</p>}
                  </div>
                </div>
                {selectedId === address.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
