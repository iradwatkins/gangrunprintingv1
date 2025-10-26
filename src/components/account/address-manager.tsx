'use client'

import { useState } from 'react'
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Address {
  id: string
  label: string | null
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

interface AddressManagerProps {
  addresses: Address[]
}

export function AddressManager({ addresses: initialAddresses }: AddressManagerProps) {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    company: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  })

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        label: address.label || '',
        name: address.name,
        company: address.company || '',
        street: address.street,
        street2: address.street2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        label: '',
        name: '',
        company: '',
        street: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
        isDefault: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveAddress = async () => {
    try {
      const url = editingAddress ? '/api/user/addresses' : '/api/user/addresses'
      const method = editingAddress ? 'PATCH' : 'POST'
      const body = editingAddress ? { id: editingAddress.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save address')

      const { address } = await response.json()

      if (editingAddress) {
        setAddresses(addresses.map((a) => (a.id === address.id ? address : a)))
        toast.success('Address updated successfully')
      } else {
        setAddresses([...addresses, address])
        toast.success('Address added successfully')
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to save address')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await fetch(`/api/user/addresses?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete address')

      setAddresses(addresses.filter((a) => a.id !== id))
      toast.success('Address deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete address')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      })

      if (!response.ok) throw new Error('Failed to set default address')

      const { address } = await response.json()
      setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === address.id })))
      toast.success('Default address updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update default address')
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">No addresses saved</p>
              <p className="text-sm">Add addresses for faster checkout</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{address.label}</h3>
                  </div>
                  {address.isDefault && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p className="font-medium text-foreground">{address.name}</p>
                  {address.company && <p>{address.company}</p>}
                  <p>{address.street}</p>
                  {address.street2 && <p>{address.street2}</p>}
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  {address.phone && <p>Phone: {address.phone}</p>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDialog(address)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    disabled={isDeleting === address.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your address information'
                : 'Add a new shipping or billing address'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Work, Office"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  required
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                required
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="street2">Apt, Suite, etc. (Optional)</Label>
              <Input
                id="street2"
                value={formData.street2}
                onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  required
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  required
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  required
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingAddress ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
