'use client'

import { useState } from 'react'
import {
  type FunnelStep,
  type Product,
  type ProductImage,
  type ProductCategory,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'

type StepWithDetails = FunnelStep & {
  OrderBump: any[]
}

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface OrderBumpEditorProps {
  step: StepWithDetails
  funnelId: string
  products: ProductWithDetails[]
  onSuccess: () => void
}

export function OrderBumpEditor({ step, funnelId, products, onSuccess }: OrderBumpEditorProps) {
  const [formData, setFormData] = useState({
    productId: '',
    headline: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    position: 'ABOVE_PAYMENT' as 'ABOVE_PAYMENT' | 'BELOW_PAYMENT' | 'SIDEBAR',
  })

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps/${step.id}/order-bumps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        }),
      })

      if (res.ok) {
        setFormData({
          productId: '',
          headline: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          position: 'ABOVE_PAYMENT',
        })
        onSuccess()
      }
    } catch (error) {
      alert('Failed to create order bump')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/funnels/${funnelId}/steps/${step.id}/order-bumps/${id}`, {
        method: 'DELETE',
      })
      onSuccess()
    } catch (error) {
      alert('Failed to delete order bump')
    }
  }

  return (
    <div className="space-y-6">
      {step.OrderBump.map((bump) => {
        const product = products.find((p) => p.id === bump.productId)
        return (
          <Card key={bump.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{bump.headline}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product?.name} • {bump.position}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(bump.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Order Bump</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(v) => setFormData({ ...formData, productId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Headline</Label>
            <Input
              placeholder="Add this to your order!"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Limited time offer..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(v: any) => setFormData({ ...formData, discountType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Discount Value</Label>
              <Input
                placeholder="10"
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Position</Label>
            <Select
              value={formData.position}
              onValueChange={(v: any) => setFormData({ ...formData, position: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABOVE_PAYMENT">Above Payment</SelectItem>
                <SelectItem value="BELOW_PAYMENT">Below Payment</SelectItem>
                <SelectItem value="SIDEBAR">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            disabled={!formData.productId || !formData.headline}
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Order Bump
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
