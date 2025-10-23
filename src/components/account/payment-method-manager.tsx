'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Edit, Trash2, Star, MapPin } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Address {
  id: string
  label: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
}

interface SavedPaymentMethod {
  id: string
  nickname: string
  maskedNumber: string
  cardBrand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  BillingAddress?: Address | null
}

interface PaymentMethodManagerProps {
  paymentMethods: SavedPaymentMethod[]
  addresses: Address[]
}

export function PaymentMethodManager({
  paymentMethods: initialPaymentMethods,
  addresses,
}: PaymentMethodManagerProps) {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(initialPaymentMethods)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<SavedPaymentMethod | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    billingAddressId: '',
    isDefault: false,
  })

  // Square Web Payments SDK state
  const [squarePayments, setSquarePayments] = useState<any>(null)
  const [card, setCard] = useState<any>(null)

  useEffect(() => {
    // Load Square Web Payments SDK
    const loadSquareSDK = async () => {
      if (typeof window !== 'undefined' && !window.Square) {
        const script = document.createElement('script')
        script.src = 'https://sandbox-web.squarecdn.com/v1/square.js' // Use production URL for production
        script.onload = initializeSquare
        document.head.appendChild(script)
      } else if (window.Square) {
        initializeSquare()
      }
    }

    const initializeSquare = async () => {
      try {
        const payments = window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        )
        setSquarePayments(payments)
      } catch (error) {
        console.error('Failed to initialize Square payments:', error)
        toast.error('Payment system unavailable')
      }
    }

    loadSquareSDK()
  }, [])

  const initializeCard = async () => {
    if (!squarePayments) return

    try {
      const cardElement = await squarePayments.card()
      await cardElement.attach('#card-container')
      setCard(cardElement)
    } catch (error) {
      console.error('Failed to initialize card element:', error)
      toast.error('Failed to load payment form')
    }
  }

  const handleOpenDialog = (paymentMethod?: SavedPaymentMethod) => {
    if (paymentMethod) {
      setEditingPaymentMethod(paymentMethod)
      setIsAddingNew(false)
      setFormData({
        nickname: paymentMethod.nickname,
        billingAddressId: paymentMethod.BillingAddress?.id || '',
        isDefault: paymentMethod.isDefault,
      })
    } else {
      setEditingPaymentMethod(null)
      setIsAddingNew(true)
      setFormData({
        nickname: '',
        billingAddressId: '',
        isDefault: false,
      })
      // Initialize card form for new payment methods
      setTimeout(initializeCard, 100)
    }
    setIsDialogOpen(true)
  }

  const handleSavePaymentMethod = async () => {
    setIsLoading(true)
    try {
      if (isAddingNew) {
        // Tokenize card with Square
        if (!card) {
          throw new Error('Payment form not initialized')
        }

        const tokenResult = await card.tokenize()
        if (tokenResult.status !== 'OK') {
          throw new Error(tokenResult.errors?.[0]?.message || 'Card tokenization failed')
        }

        const response = await fetch('/api/user/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            nickname: formData.nickname,
            billingAddressId: formData.billingAddressId || null,
            isDefault: formData.isDefault,
          }),
        })

        if (!response.ok) throw new Error('Failed to save payment method')

        const { paymentMethod } = await response.json()
        setPaymentMethods([...paymentMethods, paymentMethod])
        toast.success('Payment method added successfully')
      } else {
        // Update existing payment method
        const response = await fetch('/api/user/payment-methods', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPaymentMethod!.id,
            nickname: formData.nickname,
            billingAddressId: formData.billingAddressId || null,
            isDefault: formData.isDefault,
          }),
        })

        if (!response.ok) throw new Error('Failed to update payment method')

        const { paymentMethod } = await response.json()
        setPaymentMethods(
          paymentMethods.map((pm) => (pm.id === paymentMethod.id ? paymentMethod : pm))
        )
        toast.success('Payment method updated successfully')
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment method')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await fetch(`/api/user/payment-methods?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
      toast.success('Payment method deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete payment method')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch('/api/user/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      })

      if (!response.ok) throw new Error('Failed to set default payment method')

      const { paymentMethod } = await response.json()
      setPaymentMethods(
        paymentMethods.map((pm) => ({ ...pm, isDefault: pm.id === paymentMethod.id }))
      )
      toast.success('Default payment method updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update default payment method')
    }
  }

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toUpperCase()) {
      case 'VISA':
        return '💳'
      case 'MASTERCARD':
        return '💳'
      case 'AMERICAN_EXPRESS':
        return '💳'
      case 'DISCOVER':
        return '💳'
      default:
        return '💳'
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">No payment methods saved</p>
              <p className="text-sm">Add payment methods for faster checkout</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((paymentMethod) => (
            <Card key={paymentMethod.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCardBrandIcon(paymentMethod.cardBrand)}</span>
                    <h3 className="font-semibold">{paymentMethod.nickname}</h3>
                  </div>
                  {paymentMethod.isDefault && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p className="font-mono text-base">{paymentMethod.maskedNumber}</p>
                  <p>
                    Expires {paymentMethod.expiryMonth.toString().padStart(2, '0')}/
                    {paymentMethod.expiryYear.toString().slice(-2)}
                  </p>
                  <p className="capitalize">
                    {paymentMethod.cardBrand.replace('_', ' ').toLowerCase()}
                  </p>
                  {paymentMethod.BillingAddress && (
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{paymentMethod.BillingAddress.label}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(paymentMethod)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!paymentMethod.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(paymentMethod.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    disabled={isDeleting === paymentMethod.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
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
            <DialogTitle>{isAddingNew ? 'Add Payment Method' : 'Edit Payment Method'}</DialogTitle>
            <DialogDescription>
              {isAddingNew
                ? 'Add a new payment method for faster checkout'
                : 'Update your payment method information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input
                id="nickname"
                placeholder="e.g., Personal Card, Business Visa"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>

            {isAddingNew && (
              <div>
                <Label>Card Information</Label>
                <div
                  id="card-container"
                  className="border rounded-md p-3 min-h-[60px] bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your card information is securely processed by Square and never stored on our
                  servers.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="billingAddress">Billing Address (Optional)</Label>
              <Select
                value={formData.billingAddressId}
                onValueChange={(value) => setFormData({ ...formData, billingAddressId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No billing address</SelectItem>
                  {addresses.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.label} - {address.street}, {address.city}, {address.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePaymentMethod} disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isAddingNew
                  ? 'Add Payment Method'
                  : 'Update Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
